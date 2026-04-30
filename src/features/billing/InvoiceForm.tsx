import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatUSD } from '@/utils/currency'
import type { Customer, Invoice, InvoiceLineItem } from '@/types/database'
import { toast } from 'sonner'

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  invoice: Invoice | null
  onSaved: () => void
}

function newLine(): InvoiceLineItem { return { description: '', qty: 1, unit_price: 0, total: 0 } }

export function InvoiceForm({ open, onClose, invoice, onSaved }: InvoiceFormProps) {
  const { tenantId } = useAuth()
  const [customers, setCustomers] = useState<Pick<Customer, 'id' | 'name'>[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ customer_id: '', due_date: '', notes: '', currency: 'USD' })
  const [lines, setLines] = useState<InvoiceLineItem[]>([newLine()])

  useEffect(() => {
    if (tenantId) {
      supabase.from('customers').select('id, name').eq('tenant_id', tenantId).eq('is_active', true).order('name')
        .then(({ data }) => setCustomers(data ?? []))
    }
  }, [tenantId])

  useEffect(() => {
    if (invoice) {
      setForm({ customer_id: invoice.customer_id, due_date: invoice.due_date ?? '', notes: invoice.notes ?? '', currency: invoice.currency })
      setLines(invoice.line_items?.length ? invoice.line_items : [newLine()])
    } else {
      setForm({ customer_id: '', due_date: '', notes: '', currency: 'USD' })
      setLines([newLine()])
    }
  }, [invoice, open])

  function setField(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  function setLine(idx: number, field: keyof InvoiceLineItem, value: string | number) {
    setLines(prev => {
      const next = [...prev]
      const line = { ...next[idx], [field]: value }
      if (field === 'qty' || field === 'unit_price') {
        line.total = Math.round(Number(line.qty) * Number(line.unit_price) * 100) / 100
      }
      next[idx] = line
      return next
    })
  }

  const total = lines.reduce((s, l) => s + (l.total || 0), 0)

  async function generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).like('invoice_number', `INV-${year}-%`)
    return `INV-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_id) { toast.error('Select a customer'); return }
    if (lines.some(l => !l.description.trim())) { toast.error('All line items need a description'); return }
    setLoading(true)

    const invoiceNumber = invoice?.invoice_number ?? await generateInvoiceNumber()
    const payload = {
      tenant_id: tenantId!,
      customer_id: form.customer_id,
      invoice_number: invoiceNumber,
      amount_usd: total,
      currency: form.currency,
      due_date: form.due_date || null,
      notes: form.notes || null,
      line_items: lines,
      status: invoice?.status ?? 'DRAFT',
    }

    const { error } = invoice
      ? await supabase.from('invoices').update(payload).eq('id', invoice.id)
      : await supabase.from('invoices').insert(payload)

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(invoice ? 'Invoice updated' : 'Invoice created')
    onSaved(); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{invoice ? `Edit ${invoice.invoice_number}` : 'New Invoice'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Customer *</Label>
              <Select value={form.customer_id} onValueChange={v => setField('customer_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setField('due_date', e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={v => setField('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EGP">EGP</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Line Items</Label>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-5" placeholder="Description" value={line.description} onChange={e => setLine(idx, 'description', e.target.value)} />
                  <Input className="col-span-2" type="number" placeholder="Qty" value={line.qty} onChange={e => setLine(idx, 'qty', parseFloat(e.target.value) || 0)} />
                  <Input className="col-span-3" type="number" placeholder="Unit Price" value={line.unit_price} onChange={e => setLine(idx, 'unit_price', parseFloat(e.target.value) || 0)} />
                  <div className="col-span-1 text-xs text-muted-foreground text-right">{formatUSD(line.total)}</div>
                  <Button type="button" variant="ghost" size="icon" className="col-span-1 h-7 w-7" onClick={() => setLines(l => l.filter((_, i) => i !== idx))} disabled={lines.length === 1}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setLines(l => [...l, newLine()])}>
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </div>

          <Separator />
          <div className="flex justify-end items-center gap-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{formatUSD(total)}</span>
          </div>

          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={2} /></div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}{invoice ? 'Save Changes' : 'Create Invoice'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
