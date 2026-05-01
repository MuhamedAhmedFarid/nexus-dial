import { useEffect, useState } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDate } from '@/utils/timezone'
import { formatUSD } from '@/utils/currency'
import type { PayrollEntry, Employee } from '@/types/database'
import { toast } from 'sonner'

interface EntryWithEmployee extends PayrollEntry {
  employees: { full_name: string } | null
}

interface PayrollLedgerProps {
  viewMode: 'LEDGER' | 'BATCHER'
}

export function PayrollLedger({ viewMode }: PayrollLedgerProps) {
  const { tenantId } = useAuth()
  const [entries, setEntries] = useState<EntryWithEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchName, setBatchName] = useState('')
  const [batchNotes, setBatchNotes] = useState('')
  const [batching, setBatching] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [addForm, setAddForm] = useState({ employee_id: '', period_start: '', period_end: '', hours_worked: '', hourly_rate: '', bonus: '0', deduction: '0', notes: '' })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => { if (tenantId) { fetchEntries(); fetchEmployees() } }, [tenantId])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('payroll_entries').select('*, employees(full_name)').eq('tenant_id', tenantId!).order('created_at', { ascending: false })
    setEntries((data ?? []) as EntryWithEmployee[])
    setLoading(false)
  }

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('id, full_name, hourly_rate').eq('tenant_id', tenantId!).is('termination_date', null).order('full_name')
    setEmployees((data ?? []) as Employee[])
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    const unpaid = filtered.filter(e => !e.is_paid)
    if (selected.size === unpaid.length) setSelected(new Set())
    else setSelected(new Set(unpaid.map(e => e.id)))
  }

  async function createBatch() {
    if (!batchName.trim()) { toast.error('Batch name required'); return }
    if (selected.size === 0) { toast.error('Select at least one entry'); return }
    setBatching(true)
    const batchId = crypto.randomUUID()
    const selectedEntries = entries.filter(e => selected.has(e.id))
    const total = selectedEntries.reduce((s, e) => s + (e.net_owed ?? 0), 0)

    const { error: batchErr } = await supabase.from('payment_batches').insert({
      id: batchId, tenant_id: tenantId!, batch_name: batchName.trim(),
      total_amount: total, notes: batchNotes || null, status: 'PENDING',
    })
    if (batchErr) { toast.error(batchErr.message); setBatching(false); return }

    const { error: entryErr } = await supabase.from('payroll_entries').update({ batch_id: batchId }).in('id', [...selected])
    setBatching(false)
    if (entryErr) { toast.error(entryErr.message); return }
    toast.success(`Batch "${batchName}" created with ${selected.size} entries`)
    setSelected(new Set()); setBatchName(''); setBatchNotes(''); fetchEntries()
  }

  function setAddField(field: string, value: string) { setAddForm(f => ({ ...f, [field]: value })) }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.employee_id || !addForm.period_start || !addForm.period_end) { toast.error('Employee and period required'); return }
    setAddLoading(true)
    const hours = parseFloat(addForm.hours_worked) || null
    const rate = parseFloat(addForm.hourly_rate) || null
    const basePay = hours && rate ? Math.round(hours * rate * 100) / 100 : null
    const bonus = parseFloat(addForm.bonus) || 0
    const deduction = parseFloat(addForm.deduction) || 0
    const netOwed = basePay !== null ? basePay + bonus - deduction : null

    const { error } = await supabase.from('payroll_entries').insert({
      tenant_id: tenantId!, employee_id: addForm.employee_id,
      period_start: addForm.period_start, period_end: addForm.period_end,
      hours_worked: hours, hourly_rate: rate, base_pay: basePay,
      bonus, deduction, net_owed: netOwed, notes: addForm.notes || null,
    })
    setAddLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Payroll entry added')
    fetchEntries(); setAddOpen(false)
    setAddForm({ employee_id: '', period_start: '', period_end: '', hours_worked: '', hourly_rate: '', bonus: '0', deduction: '0', notes: '' })
  }

  const filtered = entries.filter(e =>
    e.employees?.full_name.toLowerCase().includes(search.toLowerCase()),
  )
  const unpaidSelected = filtered.filter(e => !e.is_paid && selected.has(e.id))
  const selectedTotal = unpaidSelected.reduce((s, e) => s + (e.net_owed ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by employee…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {viewMode === 'BATCHER' && filtered.filter(e => !e.is_paid).length > 0 && (
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {selected.size === filtered.filter(e => !e.is_paid).length ? 'Deselect All' : 'Select All Unpaid'}
          </Button>
        )}
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Entry</Button>
      </div>

      {/* Batcher panel */}
      {viewMode === 'BATCHER' && selected.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{selected.size} entries selected</p>
                <p className="text-sm text-primary font-bold">{formatUSD(selectedTotal)} total</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Batch Name *</Label><Input value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="May 2026 Payroll" /></div>
              <div className="space-y-1.5"><Label>Notes</Label><Input value={batchNotes} onChange={e => setBatchNotes(e.target.value)} placeholder="Optional" /></div>
            </div>
            <Button onClick={createBatch} disabled={batching} className="w-full">
              {batching && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Batch
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No payroll entries</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <Card key={entry.id} className={entry.is_paid ? 'opacity-60' : selected.has(entry.id) ? 'border-primary/40' : ''}>
              <CardContent className="p-4 flex items-center gap-3">
                {viewMode === 'BATCHER' && !entry.is_paid && (
                  <Checkbox checked={selected.has(entry.id)} onCheckedChange={() => toggleSelect(entry.id)} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{entry.employees?.full_name ?? 'Unknown'}</p>
                    <Badge variant={entry.is_paid ? 'success' : entry.batch_id ? 'info' : 'secondary'}>
                      {entry.is_paid ? 'Paid' : entry.batch_id ? 'Batched' : 'Unpaid'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatPortalDate(entry.period_start)} → {formatPortalDate(entry.period_end)}
                    {entry.hours_worked != null && ` · ${entry.hours_worked}h`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">{formatUSD(entry.net_owed ?? 0)}</p>
                  {entry.bonus > 0 && <p className="text-xs text-green-400">+{formatUSD(entry.bonus)} bonus</p>}
                  {entry.deduction > 0 && <p className="text-xs text-red-400">-{formatUSD(entry.deduction)} deduction</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={addOpen} onOpenChange={v => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Payroll Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee *</Label>
              <select className="flex h-9 w-full rounded-md border border-white/10 bg-secondary px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" value={addForm.employee_id} onChange={e => setAddField('employee_id', e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Period Start *</Label><Input type="date" value={addForm.period_start} onChange={e => setAddField('period_start', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Period End *</Label><Input type="date" value={addForm.period_end} onChange={e => setAddField('period_end', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Hours Worked</Label><Input type="number" step="0.5" value={addForm.hours_worked} onChange={e => setAddField('hours_worked', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Hourly Rate (USD)</Label><Input type="number" step="0.01" value={addForm.hourly_rate} onChange={e => setAddField('hourly_rate', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Bonus (USD)</Label><Input type="number" step="0.01" value={addForm.bonus} onChange={e => setAddField('bonus', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Deduction (USD)</Label><Input type="number" step="0.01" value={addForm.deduction} onChange={e => setAddField('deduction', e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={addForm.notes} onChange={e => setAddField('notes', e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addLoading}>{addLoading && <Loader2 className="h-4 w-4 animate-spin" />}Add Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
