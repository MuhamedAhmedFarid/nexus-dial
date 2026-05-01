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

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
  )
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { data: profile } = await adminClient
    .from('users')
    .select('id, role, is_active, tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !profile.is_active) return json({ error: 'Forbidden' }, 403)
  if (!['OWNER', 'ADMIN', 'BILLING'].includes(profile.role)) return json({ error: 'Insufficient role' }, 403)

  const { invoice_id } = await req.json()

  const { data: invoice, error: invErr } = await adminClient
    .from('invoices')
    .select('*, customers(name, billing_email, email)')
    .eq('id', invoice_id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (invErr || !invoice) return json({ error: 'Invoice not found' }, 404)
  if (invoice.status !== 'DRAFT') return json({ error: 'Only DRAFT invoices can be sent' }, 400)

  // Mark as SENT (PDF + email delivery is a future sprint)
  const { error: updateErr } = await adminClient
    .from('invoices')
    .update({ status: 'SENT', sent_at: new Date().toISOString() })
    .eq('id', invoice_id)

  if (updateErr) return json({ error: updateErr.message }, 500)

  await adminClient.from('audit_log').insert({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: 'invoice.send',
    target_type: 'invoice',
    target_id: invoice_id,
    payload: { invoice_number: invoice.invoice_number, amount: invoice.amount_usd },
  })

  return json({ ok: true, invoice_number: invoice.invoice_number, status: 'SENT' })
})
