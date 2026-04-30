import { useEffect, useState } from 'react'
import { Users, FileText, DollarSign, Phone, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDateTime } from '@/utils/timezone'
import { formatUSD } from '@/utils/currency'
import type { AuditLog } from '@/types/database'

interface KpiData {
  employees: number
  activeInvoices: number
  pendingPayroll: number
  callsToday: number
  pendingPayrollAmount: number
}

export function DashboardView() {
  const { tenantId } = useAuth()
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [kpiLoading, setKpiLoading] = useState(true)
  const [auditLoading, setAuditLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchKpi()
    fetchAuditLog()
  }, [tenantId])

  async function fetchKpi() {
    setKpiLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [empRes, invRes, payRes, callRes, payAmtRes] = await Promise.all([
      supabase.from('employees').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).is('termination_date', null),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).in('status', ['DRAFT', 'SENT', 'OVERDUE']),
      supabase.from('payroll_entries').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).eq('is_paid', false),
      supabase.from('agent_performance_daily').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).eq('sync_date', today),
      supabase.from('payroll_entries').select('net_owed').eq('tenant_id', tenantId!).eq('is_paid', false),
    ])

    const pendingAmount = (payAmtRes.data ?? []).reduce((sum, r) => sum + (r.net_owed ?? 0), 0)

    setKpi({
      employees: empRes.count ?? 0,
      activeInvoices: invRes.count ?? 0,
      pendingPayroll: payRes.count ?? 0,
      callsToday: callRes.count ?? 0,
      pendingPayrollAmount: pendingAmount,
    })
    setKpiLoading(false)
  }

  async function fetchAuditLog() {
    setAuditLoading(true)
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .eq('tenant_id', tenantId!)
      .order('created_at', { ascending: false })
      .limit(10)
    setAuditLog(data ?? [])
    setAuditLoading(false)
  }

  const kpiCards = [
    { label: 'Active Employees', value: kpi?.employees, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Invoices', value: kpi?.activeInvoices, icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending Payroll', value: kpi?.pendingPayroll, sub: kpi ? formatUSD(kpi.pendingPayrollAmount) : null, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Agents Today', value: kpi?.callsToday, icon: Phone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your operations</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-5">
              {kpiLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{card.value ?? 0}</p>
                    {card.sub && <p className="text-xs text-muted-foreground mt-0.5">{card.sub} owed</p>}
                  </div>
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-1">
              {auditLog.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 py-2 rounded-md hover:bg-secondary/50 px-2 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{entry.action}</span>
                      {entry.target_type && (
                        <span className="text-muted-foreground"> · {entry.target_type}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatPortalDateTime(entry.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{entry.action.split('.')[0]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
