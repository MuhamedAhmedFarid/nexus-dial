import { useEffect, useState } from 'react'
import { Check, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDate } from '@/utils/timezone'
import type { TimeOffRequest } from '@/types/database'
import { toast } from 'sonner'

interface TimeOffWithEmployee extends TimeOffRequest {
  employees: { full_name: string } | null
}

export function TimeOffTab() {
  const { tenantId, profile } = useAuth()
  const [requests, setRequests] = useState<TimeOffWithEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tenantId) fetch()
  }, [tenantId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('time_off_requests')
      .select('*, employees(full_name)')
      .eq('tenant_id', tenantId!)
      .order('created_at', { ascending: false })
    setRequests((data ?? []) as TimeOffWithEmployee[])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'APPROVED' | 'DENIED') {
    const { error } = await supabase
      .from('time_off_requests')
      .update({ status, approved_by: profile?.id, approved_at: new Date().toISOString() })
      .eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Request ${status.toLowerCase()}`); fetch() }
  }

  function renderList(items: TimeOffWithEmployee[]) {
    if (loading) return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    )
    if (items.length === 0) return (
      <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No requests</CardContent></Card>
    )
    return (
      <div className="space-y-2">
        {items.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{r.employees?.full_name ?? 'Unknown'}</p>
                  <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'DENIED' ? 'destructive' : 'warning'}>
                    {r.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatPortalDate(r.start_date)} → {formatPortalDate(r.end_date)}
                </p>
                {r.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{r.reason}"</p>}
              </div>
              {r.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => updateStatus(r.id, 'APPROVED')}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => updateStatus(r.id, 'DENIED')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const pending = requests.filter(r => r.status === 'PENDING')
  const resolved = requests.filter(r => r.status !== 'PENDING')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium">Time Off Requests</h2>
        {pending.length > 0 && <Badge variant="warning">{pending.length} pending</Badge>}
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{renderList(pending)}</TabsContent>
        <TabsContent value="resolved" className="mt-4">{renderList(resolved)}</TabsContent>
      </Tabs>
    </div>
  )
}
