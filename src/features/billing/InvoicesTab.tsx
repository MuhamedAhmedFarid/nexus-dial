import { useEffect, useState } from 'react'
import { Plus, Search, Send, CheckCircle, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDate } from '@/utils/timezone'
import { formatUSD } from '@/utils/currency'
import type { Invoice, InvoiceStatus } from '@/types/database'
import { InvoiceForm } from './InvoiceForm'
import { toast } from 'sonner'

interface InvoiceWithCustomer extends Invoice {
  customers: { name: string } | null
}

const STATUS_VARIANTS: Record<InvoiceStatus, 'secondary' | 'info' | 'success' | 'destructive' | 'warning'> = {
  DRAFT: 'secondary', SENT: 'info', PAID: 'success', OVERDUE: 'destructive', CANCELLED: 'warning',
}

export function InvoicesTab() {
  const { tenantId } = useAuth()
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)

  useEffect(() => { if (tenantId) fetchInvoices() }, [tenantId])

  async function fetchInvoices() {
    setLoading(true)
    const { data } = await supabase.from('invoices').select('*, customers(name)').eq('tenant_id', tenantId!).order('created_at', { ascending: false })
    setInvoices((data ?? []) as InvoiceWithCustomer[])
    setLoading(false)
  }

  async function markSent(inv: Invoice) {
    const { error } = await supabase.from('invoices').update({ status: 'SENT', sent_at: new Date().toISOString() }).eq('id', inv.id)
    if (error) toast.error(error.message)
    else { toast.success('Invoice marked as sent'); fetchInvoices() }
  }

  async function markPaid(inv: Invoice) {
    const { error } = await supabase.from('invoices').update({ status: 'PAID', paid_at: new Date().toISOString() }).eq('id', inv.id)
    if (error) toast.error(error.message)
    else { toast.success('Invoice marked as paid'); fetchInvoices() }
  }

  const filtered = invoices
    .filter(inv => statusFilter === 'ALL' || inv.status === statusFilter)
    .filter(inv => inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || inv.customers?.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] as InvoiceStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }}><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No invoices found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <Card key={inv.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium text-foreground">{inv.invoice_number}</span>
                    <Badge variant={STATUS_VARIANTS[inv.status]}>{inv.status}</Badge>
                    <span className="text-sm text-muted-foreground">{inv.customers?.name ?? '—'}</span>
                  </div>
                  <div className="flex gap-4 mt-0.5 text-xs text-muted-foreground">
                    {inv.due_date && <span>Due {formatPortalDate(inv.due_date)}</span>}
                    {inv.paid_at && <span>Paid {formatPortalDate(inv.paid_at)}</span>}
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground shrink-0">{formatUSD(inv.amount_usd)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(inv); setFormOpen(true) }}>Edit</DropdownMenuItem>
                    {inv.status === 'DRAFT' && <DropdownMenuItem onClick={() => markSent(inv)}><Send className="h-4 w-4 mr-2" />Mark as Sent</DropdownMenuItem>}
                    {(inv.status === 'SENT' || inv.status === 'OVERDUE') && <DropdownMenuItem onClick={() => markPaid(inv)}><CheckCircle className="h-4 w-4 mr-2" />Mark as Paid</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <InvoiceForm open={formOpen} onClose={() => setFormOpen(false)} invoice={editing} onSaved={fetchInvoices} />
    </div>
  )
}
