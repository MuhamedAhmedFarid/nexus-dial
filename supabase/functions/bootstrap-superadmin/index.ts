import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// One-time bootstrap function — delete after use
const SECRET = 'nx-boot-R7mK2pQ9'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const body = await req.json()
  if (body.secret !== SECRET) return json({ error: 'Forbidden' }, 403)

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── send_recovery: generate + email a password-reset link ─────────────────
  if (body.action === 'send_recovery') {
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: body.email,
    })
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true, link: (data as any).properties?.action_link })
  }

  // ── set_password: directly set a password for an existing user ─────────────
  if (body.action === 'set_password') {
    const { data: u } = await adminClient.from('users').select('auth_user_id').eq('email', body.email).single()
    if (!u?.auth_user_id) return json({ error: 'User not found' }, 404)
    const { error } = await adminClient.auth.admin.updateUserById(u.auth_user_id, { password: body.password })
    if (error) return json({ error: error.message }, 400)
    return json({ ok: true })
  }

  // ── invite: create auth user + public.users as superadmin ─────────────────
  const { email, name } = body

  const { data: authData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name },
  })
  if (inviteErr) return json({ error: inviteErr.message }, 400)

  const { data: newUser, error: insertErr } = await adminClient
    .from('users')
    .insert({
      auth_user_id: authData.user.id,
      tenant_id: null,
      email,
      name,
      role: 'OWNER',
      is_active: true,
      is_superadmin: true,
      hourly_rate: 0,
    })
    .select()
    .single()

  if (insertErr) return json({ error: insertErr.message }, 400)
  return json({ ok: true, user: newUser })
})
