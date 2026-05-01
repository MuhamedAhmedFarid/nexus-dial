import { useEffect, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDateTime } from '@/utils/timezone'
import { formatUSD } from '@/utils/currency'
import type { PaymentBatch } from '@/types/database'
import { toast } from 'sonner'

export function BatchesTab() {
  const { tenantId } = useAuth()
  const [batches, setBatches] = useState<PaymentBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => { if (tenantId) fetchBatches() }, [tenantId])

  async function fetchBatches() {
    setLoading(true)
    const { data } = await supabase.from('payment_batches').select('*').eq('tenant_id', tenantId!).order('created_at', { ascending: false })
    setBatches(data ?? [])
    setLoading(false)
  }

  async function markPaid(batch: PaymentBatch) {
    setMarking(batch.id)
    const paidAt = new Date().toISOString()
    const { error: batchErr } = await supabase.from('payment_batches').update({ status: 'PAID', paid_at: paidAt }).eq('id', batch.id)
    if (batchErr) { toast.error(batchErr.message); setMarking(null); return }
    const { error: entryErr } = await supabase.from('payroll_entries').update({ is_paid: true, paid_at: paidAt }).eq('batch_id', batch.id)
    setMarking(null)
    if (entryErr) { toast.error(entryErr.message); return }
    toast.success(`Batch "${batch.batch_name}" marked as paid`)
    fetchBatches()
  }

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
  if (batches.length === 0) return <Card><CardContent className="py-12 text-center text-muted-foreground">No payment batches yet. Create one in the Batcher tab.</CardContent></Card>

  return (
    <div className="space-y-2">
      {batches.map(batch => (
        <Card key={batch.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{batch.batch_name}</p>
                <Badge variant={batch.status === 'PAID' ? 'success' : batch.status === 'CANCELLED' ? 'destructive' : 'warning'}>{batch.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Created {formatPortalDateTime(batch.created_at)}
                {batch.paid_at && ` · Paid ${formatPortalDateTime(batch.paid_at)}`}
              </p>
              {batch.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{batch.notes}"</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-foreground">{formatUSD(batch.total_amount ?? 0)}</p>
              {batch.egp_rate && <p className="text-xs text-muted-foreground">Rate: {batch.egp_rate} EGP/USD</p>}
            </div>
            {batch.status === 'PENDING' && (
              <Button size="sm" onClick={() => markPaid(batch)} disabled={marking === batch.id}>
                {marking === batch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Mark Paid
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
