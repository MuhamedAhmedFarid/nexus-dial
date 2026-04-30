import { useEffect, useState } from 'react'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import type { Customer } from '@/types/database'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function CustomersTab() {
  const { tenantId } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', billing_email: '', address: '', notes: '', is_active: true })

  useEffect(() => { if (tenantId) fetchCustomers() }, [tenantId])

  async function fetchCustomers() {
    setLoading(true)
    const { data } = await supabase.from('customers').select('*').eq('tenant_id', tenantId!).order('name')
    setCustomers(data ?? [])
    setLoading(false)
  }

  function openForm(c?: Customer) {
    setEditing(c ?? null)
    setForm(c ? { name: c.name, email: c.email ?? '', phone: c.phone ?? '', billing_email: c.billing_email ?? '', address: c.address ?? '', notes: c.notes ?? '', is_active: c.is_active } : { name: '', email: '', phone: '', billing_email: '', address: '', notes: '', is_active: true })
    setFormOpen(true)
  }

  function set(field: string, value: string | boolean) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    const payload = { tenant_id: tenantId!, name: form.name.trim(), email: form.email || null, phone: form.phone || null, billing_email: form.billing_email || null, address: form.address || null, notes: form.notes || null, is_active: form.is_active }
    const { error } = editing ? await supabase.from('customers').update(payload).eq('id', editing.id) : await supabase.from('customers').insert(payload)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Customer updated' : 'Customer added')
    fetchCustomers(); setFormOpen(false)
  }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => openForm()}><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No customers found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-medium text-primary">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <Badge variant={c.is_active ? 'success' : 'secondary'} className="text-[10px]">{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.email ?? '—'} {c.phone ? `· ${c.phone}` : ''}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openForm(c)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={v => !v && setFormOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Billing Email</Label><Input type="email" value={form.billing_email} onChange={e => set('billing_email', e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Address</Label><Textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} /></div>
              <div className="col-span-2 flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} /><Label>Active</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? 'Save' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
