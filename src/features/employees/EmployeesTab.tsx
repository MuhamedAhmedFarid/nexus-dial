import { useEffect, useState } from 'react'
import { Plus, Search, UserCheck, UserX, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDate } from '@/utils/timezone'
import type { Employee } from '@/types/database'
import { EmployeeForm } from './EmployeeForm'
import { toast } from 'sonner'

export function EmployeesTab() {
  const { tenantId } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  useEffect(() => {
    if (tenantId) fetchEmployees()
  }, [tenantId])

  async function fetchEmployees() {
    setLoading(true)
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', tenantId!)
      .order('full_name')
    setEmployees(data ?? [])
    setLoading(false)
  }

  async function handleTerminate(emp: Employee) {
    const { error } = await supabase
      .from('employees')
      .update({ termination_date: new Date().toISOString().split('T')[0] })
      .eq('id', emp.id)
    if (error) toast.error(error.message)
    else { toast.success(`${emp.full_name} terminated`); fetchEmployees() }
  }

  async function handleReactivate(emp: Employee) {
    const { error } = await supabase
      .from('employees')
      .update({ termination_date: null })
      .eq('id', emp.id)
    if (error) toast.error(error.message)
    else { toast.success(`${emp.full_name} reactivated`); fetchEmployees() }
  }

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No employees found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(emp => {
            const active = !emp.termination_date
            return (
              <Card key={emp.id} className={!active ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-medium">
                    {emp.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{emp.full_name}</p>
                      <Badge variant={active ? 'success' : 'secondary'} className="text-[10px]">
                        {active ? 'Active' : 'Terminated'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {emp.position && <span>{emp.position}</span>}
                      {emp.department && <span>· {emp.department}</span>}
                      {emp.hire_date && <span>· Hired {formatPortalDate(emp.hire_date)}</span>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(emp); setFormOpen(true) }}>Edit</DropdownMenuItem>
                      {active ? (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleTerminate(emp)}>
                          <UserX className="h-4 w-4 mr-2" /> Terminate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReactivate(emp)}>
                          <UserCheck className="h-4 w-4 mr-2" /> Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employee={editing}
        onSaved={fetchEmployees}
      />
    </div>
  )
}
