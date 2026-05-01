import { useEffect, useState } from 'react'
import { Phone, Wifi, WifiOff, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import type { AgentPerformanceDaily } from '@/types/database'

function secondsToTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function DialerView() {
  const { tenantId } = useAuth()
  const [performance, setPerformance] = useState<AgentPerformanceDaily[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    const today = new Date().toISOString().split('T')[0]
    supabase.from('agent_performance_daily').select('*').eq('tenant_id', tenantId).eq('sync_date', today).order('calls', { ascending: false })
      .then(({ data }) => { setPerformance(data ?? []); setLoading(false) })
  }, [tenantId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dialer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Agent performance and dialer integration</p>
      </div>

      {/* Connection status */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <WifiOff className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Dialer not connected</p>
            <p className="text-sm text-muted-foreground">Vendor is TBD. Once configured, live agent status and call data will appear here.</p>
          </div>
          <Badge variant="warning">Pending Setup</Badge>
        </CardContent>
      </Card>

      {/* Webhook info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            Webhook Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Once you pick a dialer vendor, configure it to POST performance data to:</p>
          <div className="bg-secondary rounded-md p-3 font-mono text-sm text-primary break-all">
            {'[SUPABASE_URL]/functions/v1/dialer-webhook'}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Expected payload:</p>
            <pre className="bg-secondary rounded p-3 text-xs overflow-x-auto text-muted-foreground">{`{
  "agent_id": "string",
  "calls": number,
  "talk_seconds": number,
  "wait_seconds": number,
  "meetings_booked": number,
  "dispos": { "NI": 5, "CB": 3 }
}`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Today's performance */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-foreground">Today's Agent Performance</h2>
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
        ) : performance.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <Phone className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No performance data yet today.</p>
              <p className="text-xs text-muted-foreground">Data will appear here once the dialer webhook is configured and sending events.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {performance.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.agent_id}</p>
                      <Badge variant="success" className="text-[10px] mt-0.5">Active Today</Badge>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-lg font-bold text-foreground">{p.calls}</p>
                      <p className="text-[10px] text-muted-foreground">Calls</p>
                    </div>
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-lg font-bold text-foreground">{secondsToTime(p.talk_seconds)}</p>
                      <p className="text-[10px] text-muted-foreground">Talk</p>
                    </div>
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-lg font-bold text-primary">{p.meetings_booked}</p>
                      <p className="text-[10px] text-muted-foreground">Booked</p>
                    </div>
                  </div>
                  {p.dispos && Object.keys(p.dispos).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(p.dispos).map(([code, count]) => (
                        <Badge key={code} variant="outline" className="text-[10px]">{code}: {count}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
