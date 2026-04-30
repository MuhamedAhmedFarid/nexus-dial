import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, x-webhook-secret',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Tenant identified via header (set when configuring the dialer webhook URL)
  const tenantId = req.headers.get('x-tenant-id')
  if (!tenantId) return json({ error: 'Missing x-tenant-id header' }, 400)

  const body = await req.json()
  const { agent_id, calls, talk_seconds, wait_seconds, meetings_booked, dispos } = body

  if (!agent_id) return json({ error: 'agent_id required' }, 400)

  const today = new Date().toISOString().split('T')[0]

  const { data: userRow } = await adminClient
    .from('users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('agent_id', agent_id)
    .single()

  const { error } = await adminClient.from('agent_performance_daily').upsert({
    tenant_id: tenantId,
    user_id: userRow?.id ?? null,
    agent_id,
    sync_date: today,
    calls: calls ?? 0,
    talk_seconds: talk_seconds ?? 0,
    wait_seconds: wait_seconds ?? 0,
    meetings_booked: meetings_booked ?? 0,
    dispos: dispos ?? null,
  }, { onConflict: 'tenant_id,agent_id,sync_date' })

  if (error) {
    await adminClient.from('sync_failures').insert({
      tenant_id: tenantId,
      source: 'dialer_webhook',
      error_text: error.message,
      payload: body,
    })
    return json({ error: error.message }, 500)
  }

  return json({ ok: true, agent_id, sync_date: today })
})
