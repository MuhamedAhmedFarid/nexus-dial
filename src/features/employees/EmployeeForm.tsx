import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import type { Employee } from '@/types/database'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EmployeeFormProps {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onSaved: () => void
}

const DEPARTMENTS = ['Sales', 'Support', 'Operations', 'Management', 'Finance', 'HR', 'Tech']
const PAYMENT_METHODS = ['BANK', 'WIRE', 'PAYPAL', 'CASH', 'OTHER']

export function EmployeeForm({ open, onClose, employee, onSaved }: EmployeeFormProps) {
  const { tenantId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', position: '',
    department: '', hire_date: '', hourly_rate: '',
    payment_method: '', notes: '',
  })

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name,
        email: employee.email ?? '',
        phone: employee.phone ?? '',
        position: employee.position ?? '',
        department: employee.department ?? '',
        hire_date: employee.hire_date ?? '',
        hourly_rate: employee.hourly_rate?.toString() ?? '',
        payment_method: employee.payment_method ?? '',
        notes: employee.notes ?? '',
      })
    } else {
      setForm({ full_name: '', email: '', phone: '', position: '', department: '', hire_date: '', hourly_rate: '', payment_method: '', notes: '' })
    }
  }, [employee, open])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error('Name is required'); return }
    setLoading(true)

    const payload = {
      tenant_id: tenantId!,
      full_name: form.full_name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      position: form.position || null,
      department: form.department || null,
      hire_date: form.hire_date || null,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      payment_method: form.payment_method || null,
      notes: form.notes || null,
    }

    const { error } = employee
      ? await supabase.from('employees').update(payload).eq('id', employee.id)
      : await supabase.from('employees').insert(payload)

    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(employee ? 'Employee updated' : 'Employee added')
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input value={form.position} onChange={e => set('position', e.target.value)} placeholder="Virtual Assistant" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={v => set('department', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hire Date</Label>
              <Input type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hourly Rate (USD)</Label>
              <Input type="number" step="0.01" value={form.hourly_rate} onChange={e => set('hourly_rate', e.target.value)} placeholder="0.00" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => set('payment_method', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {employee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
