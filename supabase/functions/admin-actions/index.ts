import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('Missing environment variables')
      return json({ error: 'Internal server error: Missing configuration' }, 500)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return json({ error: 'Unauthorized' }, 401)
    }

    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('id, role, is_active, is_superadmin, tenant_id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return json({ error: 'Forbidden: Profile not found' }, 403)
    }

    if (!profile.is_active) {
      return json({ error: 'Forbidden: Account suspended' }, 403)
    }

    let body;
    try {
      body = await req.json()
    } catch (e) {
      console.error('JSON parse error:', e)
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const { action, payload } = body
    if (!action || !payload) {
      return json({ error: 'Missing action or payload' }, 400)
    }

    const isPrivileged = profile.is_superadmin || ['OWNER', 'ADMIN'].includes(profile.role)

    async function logAudit(actionName: string, targetType: string, targetId: string, extra?: Record<string, unknown>) {
      try {
        await adminClient.from('audit_log').insert({
          tenant_id: profile.tenant_id,
          actor_id: profile.id,
          action: actionName,
          target_type: targetType,
          target_id: targetId,
          payload: extra ?? null,
        })
      } catch (e) {
        console.error('Audit log failed:', e)
      }
    }

    switch (action) {
      // ── User: create with password (no email sent) ──────────────────────────
      case 'create_user': {
        if (!isPrivileged) return json({ error: 'Insufficient role' }, 403)
        const { email, name, role, tenant_id, phone, password } = payload
        
        if (!email || !password || !name) {
          return json({ error: 'Missing required fields: email, password, and name are required' }, 400)
        }

        const tenantId = profile.is_superadmin ? (tenant_id || null) : profile.tenant_id

        const { data: authData, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
        if (createErr) {
          console.error('Error creating auth user:', createErr)
          return json({ error: createErr.message }, 400)
        }

        const { data: newUser, error: insertErr } = await adminClient.from('users').insert({
          auth_user_id: authData.user.id,
          tenant_id: tenantId,
          email,
          name,
          role: role ?? 'AGENT',
          phone: phone ?? null,
          is_active: true,
          is_superadmin: false,
          hourly_rate: 0,
        }).select().single()

        if (insertErr) {
          console.error('Error inserting user profile:', insertErr)
          await adminClient.auth.admin.deleteUser(authData.user.id)
          return json({ error: insertErr.message }, 400)
        }
        await logAudit('user.create', 'user', newUser.id, { email, role })
        return json({ user: newUser })
      }

    // ── User: update profile (name / email / phone / role) ──────────────────
    case 'update_user_profile': {
      if (!isPrivileged) return json({ error: 'Insufficient role' }, 403)
      const { user_id, name, email, phone, role } = payload
      if (!user_id) return json({ error: 'Missing user_id' }, 400)

      const updates: Record<string, unknown> = {}
      if (name  !== undefined) updates.name  = name
      if (email !== undefined) updates.email = email
      if (phone !== undefined) updates.phone = phone
      if (role  !== undefined) updates.role  = role

      // Sync email to auth.users if changed
      if (email) {
        const { data: targetUser, error: fetchErr } = await adminClient
          .from('users').select('auth_user_id').eq('id', user_id).single()
        
        if (fetchErr || !targetUser) {
          console.error('Error fetching target user for email sync:', fetchErr)
          return json({ error: 'User not found' }, 404)
        }

        if (targetUser?.auth_user_id) {
          const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(targetUser.auth_user_id, { email })
          if (authUpdateErr) {
            console.error('Error updating auth user email:', authUpdateErr)
            return json({ error: `Auth update failed: ${authUpdateErr.message}` }, 400)
          }
        }
      }

      const { error } = await adminClient.from('users').update(updates).eq('id', user_id)
      if (error) {
        console.error('Error updating user profile:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit('user.profile_update', 'user', user_id, updates)
      return json({ ok: true })
    }

    // ── User: set password directly (no email) ───────────────────────────────
    case 'set_password': {
      if (!isPrivileged) return json({ error: 'Insufficient role' }, 403)
      const { user_id, password } = payload
      if (!user_id || !password) return json({ error: 'Missing user_id or password' }, 400)

      const { data: target, error: fetchErr } = await adminClient
        .from('users').select('auth_user_id').eq('id', user_id).single()
      
      if (fetchErr || !target) {
        console.error('Error fetching target user for password set:', fetchErr)
        return json({ error: 'User not found' }, 404)
      }

      if (!target?.auth_user_id) return json({ error: 'User not linked to auth account' }, 404)
      
      const { error } = await adminClient.auth.admin.updateUserById(target.auth_user_id, { password })
      if (error) {
        console.error('Error setting user password:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit('user.password_set', 'user', user_id, {})
      return json({ ok: true })
    }

    // ── User: toggle active ──────────────────────────────────────────────────
    case 'toggle_user_active': {
      if (!isPrivileged) return json({ error: 'Insufficient role' }, 403)
      const { user_id, is_active } = payload
      if (user_id === undefined || is_active === undefined) return json({ error: 'Missing user_id or is_active' }, 400)

      const { error } = await adminClient.from('users').update({ is_active }).eq('id', user_id)
      if (error) {
        console.error('Error toggling user active state:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit(is_active ? 'user.activate' : 'user.suspend', 'user', user_id)
      return json({ ok: true })
    }

    // ── User: update role only ───────────────────────────────────────────────
    case 'update_user_role': {
      if (!isPrivileged) return json({ error: 'Insufficient role' }, 403)
      const { user_id, role } = payload
      if (!user_id || !role) return json({ error: 'Missing user_id or role' }, 400)

      const { error } = await adminClient.from('users').update({ role }).eq('id', user_id)
      if (error) {
        console.error('Error updating user role:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit('user.role_change', 'user', user_id, { role })
      return json({ ok: true })
    }

    // ── User: delete entirely ────────────────────────────────────────────────
    case 'delete_user': {
      if (!profile.is_superadmin) return json({ error: 'Superadmin only' }, 403)
      const { user_id } = payload
      if (!user_id) return json({ error: 'Missing user_id' }, 400)

      const { data: target, error: fetchErr } = await adminClient
        .from('users').select('auth_user_id, name').eq('id', user_id).single()
      
      if (fetchErr || !target) {
        console.error('Error fetching target user for deletion:', fetchErr)
        return json({ error: 'User not found' }, 404)
      }

      const { error } = await adminClient.from('users').delete().eq('id', user_id)
      if (error) {
        console.error('Error deleting user profile:', error)
        return json({ error: error.message }, 400)
      }

      // Also remove from auth if linked
      if (target?.auth_user_id) {
        const { error: authDeleteErr } = await adminClient.auth.admin.deleteUser(target.auth_user_id)
        if (authDeleteErr) {
          console.error('Error deleting auth user:', authDeleteErr)
          // We don't return 400 here because the profile is already gone, but we log it
        }
      }

      await logAudit('user.delete', 'user', user_id, { name: target?.name })
      return json({ ok: true })
    }

    // ── Tenant: update details ───────────────────────────────────────────────
    case 'update_tenant': {
      if (!profile.is_superadmin) return json({ error: 'Superadmin only' }, 403)
      const { tenant_id, name, notes, slug } = payload
      if (!tenant_id) return json({ error: 'Missing tenant_id' }, 400)

      const updates: Record<string, unknown> = {}
      if (name  !== undefined) updates.name  = name
      if (notes !== undefined) updates.notes = notes
      if (slug  !== undefined) updates.slug  = slug
      const { error } = await adminClient.from('tenants').update(updates).eq('id', tenant_id)
      if (error) {
        console.error('Error updating tenant:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit('tenant.update', 'tenant', tenant_id, updates)
      return json({ ok: true })
    }

    // ── Tenant: delete ───────────────────────────────────────────────────────
    case 'delete_tenant': {
      if (!profile.is_superadmin) return json({ error: 'Superadmin only' }, 403)
      const { tenant_id } = payload
      if (!tenant_id) return json({ error: 'Missing tenant_id' }, 400)

      // Cascade handled by DB ON DELETE CASCADE on child tables
      const { error } = await adminClient.from('tenants').delete().eq('id', tenant_id)
      if (error) {
        console.error('Error deleting tenant:', error)
        return json({ error: error.message }, 400)
      }
      await logAudit('tenant.delete', 'tenant', tenant_id, {})
      return json({ ok: true })
    }

    default:
      return json({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (err: any) {
    console.error('Function error:', err)
    return json({ error: err.message || 'Internal server error' }, 500)
  }
})
