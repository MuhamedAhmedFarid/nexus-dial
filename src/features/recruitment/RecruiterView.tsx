import { useEffect, useState } from 'react'
import {
  Briefcase, Plus, Trash2, Loader2, Mic2, FileText,
  Building2, Search, Star, MoreHorizontal, Pencil, AlertTriangle,
  Clock, CheckCircle2, GraduationCap, UserPlus, XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'
import type { Candidate, CandidateStatus, Tenant } from '@/types/database'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────
type CandidateWithTenant = Candidate & { tenant?: { id: string; name: string } | null }

const STATUS: Record<CandidateStatus, { label: string; cls: string; icon: any }> = {
  pending:     { label: 'Pending',     cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  good:        { label: 'Good',        cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20',     icon: CheckCircle2 },
  interviewed: { label: 'Interviewed', cls: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Search },
  training:    { label: 'Training',    cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: GraduationCap },
  hired:       { label: 'Hired',       cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: UserPlus },
  rejected:    { label: 'Rejected',    cls: 'bg-red-500/10 text-red-500 border-red-500/20',         icon: XCircle },
}

const BLANK: FormState = {
  tenant_id: '', name: '', position: '',
  email: '', phone: '', vocaroo_url: '', resume_url: '', notes: '',
}

type FormState = {
  tenant_id: string; name: string; position: string
  email: string; phone: string; vocaroo_url: string; resume_url: string; notes: string
}

// ── Candidate card (recruiter) ─────────────────────────────────────────────────
function RecruiterCandidateCard({ c, onEdit, onDelete, onStatus }: {
  c: CandidateWithTenant
  onEdit: (c: CandidateWithTenant) => void
  onDelete: (c: CandidateWithTenant) => void
  onStatus: (id: string, s: CandidateStatus) => void
}) {
  const initials = c.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const s = c.status

  return (
    <Card className="bg-card border-white/10">
      <CardContent className="p-5 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.position}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(c)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS) as CandidateStatus[]).filter(k => k !== s).map(k => (
                <DropdownMenuItem key={k} onClick={() => onStatus(c.id, k)}>
                  Set: {STATUS[k].label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(c)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{c.tenant?.name ?? '—'}</span>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {c.vocaroo_url && (
            <a href={c.vocaroo_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors font-medium">
              <Mic2 className="h-3 w-3" /> Voice
            </a>
          )}
          {c.resume_url && (
            <a href={c.resume_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded bg-secondary text-foreground hover:bg-secondary/70 border border-white/10 transition-colors font-medium">
              <FileText className="h-3 w-3" /> Resume
            </a>
          )}
          {!c.vocaroo_url && !c.resume_url && (
            <p className="text-xs text-muted-foreground/50 italic">No links added</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <Badge variant="outline" className={cn('text-[10px] flex items-center gap-1', STATUS[s].cls)}>
            {STATUS[s].icon && <STATUS.icon className="h-3 w-3" />}
            {STATUS[s].label}
          </Badge>
          {c.rating !== null ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{c.rating}</span>/10
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground/40 italic">Not rated</span>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

// ── Candidate form dialog (shared for add/edit) ────────────────────────────────
function CandidateFormDialog({ open, onOpenChange, title, form, setForm, tenants, showTenant, saving, onSubmit }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  tenants: Tenant[]
  showTenant: boolean
  saving: boolean
  onSubmit: () => void
}) {
  function f(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">

          {showTenant && (
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select value={form.tenant_id} onValueChange={v => setForm(p => ({ ...p, tenant_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a client…" /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={f('name')} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Position *</Label>
              <Input value={form.position} onChange={f('position')} placeholder="Senior Developer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} onChange={f('email')} type="email" placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={f('phone')} placeholder="+1 555 000 0000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Mic2 className="h-3.5 w-3.5 text-primary" /> Vocaroo Recording URL
            </Label>
            <Input value={form.vocaroo_url} onChange={f('vocaroo_url')} placeholder="https://vocaroo.com/…" />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Resume URL
            </Label>
            <Input value={form.resume_url} onChange={f('resume_url')} placeholder="https://drive.google.com/… or PDF link" />
          </div>

          <div className="space-y-1.5">
            <Label>Internal Notes</Label>
            <Textarea
              value={form.notes}
              onChange={f('notes')}
              placeholder="Notes visible only to recruiters…"
              className="min-h-[72px] resize-none"
            />
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            {title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────
export function RecruiterView() {
  const { profile } = useAuth()

  const [candidates, setCandidates] = useState<CandidateWithTenant[]>([])
  const [tenants, setTenants]       = useState<Tenant[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [tenantFilter, setTenantFilter]   = useState('all')

  const [addOpen, setAddOpen]           = useState(false)
  const [editTarget, setEditTarget]     = useState<CandidateWithTenant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CandidateWithTenant | null>(null)
  const [form, setForm]   = useState<FormState>({ ...BLANK })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    const [{ data: cands }, { data: tens }] = await Promise.all([
      supabase.from('candidates').select('*, tenant:tenants(id,name)').order('created_at', { ascending: false }),
      supabase.from('tenants').select('*').order('name'),
    ])
    setCandidates((cands as CandidateWithTenant[]) ?? [])
    setTenants(tens ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm({ ...BLANK }); setAddOpen(true) }

  function openEdit(c: CandidateWithTenant) {
    setForm({
      tenant_id:   c.tenant_id,
      name:        c.name,
      position:    c.position,
      email:       c.email ?? '',
      phone:       c.phone ?? '',
      vocaroo_url: c.vocaroo_url ?? '',
      resume_url:  c.resume_url ?? '',
      notes:       c.notes ?? '',
    })
    setEditTarget(c)
  }

  async function handleAdd() {
    if (!form.tenant_id || !form.name.trim() || !form.position.trim()) {
      toast.error('Client, name and position are required')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('candidates').insert({
      tenant_id:   form.tenant_id,
      created_by:  profile?.id ?? null,
      name:        form.name.trim(),
      position:    form.position.trim(),
      email:       form.email || null,
      phone:       form.phone || null,
      vocaroo_url: form.vocaroo_url || null,
      resume_url:  form.resume_url || null,
      notes:       form.notes || null,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Candidate added')
    setAddOpen(false)
    load()
  }

  async function handleEdit() {
    if (!editTarget) return
    setSaving(true)
    const { error } = await supabase.from('candidates').update({
      name:        form.name.trim(),
      position:    form.position.trim(),
      email:       form.email || null,
      phone:       form.phone || null,
      vocaroo_url: form.vocaroo_url || null,
      resume_url:  form.resume_url || null,
      notes:       form.notes || null,
    }).eq('id', editTarget.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Candidate updated')
    setEditTarget(null)
    load()
  }

  async function handleStatusChange(id: string, status: CandidateStatus) {
    const { error } = await supabase.from('candidates').update({ status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    toast.success(`Marked as ${STATUS[status].label}`)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('candidates').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Candidate removed')
    setDeleteTarget(null)
    setCandidates(prev => prev.filter(c => c.id !== deleteTarget.id))
  }

  const visible = candidates.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (tenantFilter !== 'all' && c.tenant_id !== tenantFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (![c.name, c.position, c.email ?? ''].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  })

  const stats = [
    { label: 'Total',          value: candidates.length },
    { label: 'Awaiting Rating', value: candidates.filter(c => c.rating === null).length },
    { label: 'Hired',          value: candidates.filter(c => c.status === 'hired').length },
    { label: 'Rated by Client', value: candidates.filter(c => c.rating !== null).length },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Recruitment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add candidates and submit them to clients for review and rating.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Add Candidate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="bg-card border-white/10">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, position…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS) as CandidateStatus[]).map(k => (
              <SelectItem key={k} value={k}>{STATUS[k].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="h-52 animate-pulse bg-secondary border-white/5" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">No candidates found</p>
          {candidates.length === 0 && (
            <p className="text-muted-foreground/60 text-sm mt-1">Add your first candidate to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(c => (
            <RecruiterCandidateCard
              key={c.id}
              c={c}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatus={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <CandidateFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Candidate"
        form={form}
        setForm={setForm}
        tenants={tenants}
        showTenant
        saving={saving}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      <CandidateFormDialog
        open={!!editTarget}
        onOpenChange={v => !v && setEditTarget(null)}
        title="Edit Candidate"
        form={form}
        setForm={setForm}
        tenants={tenants}
        showTenant={false}
        saving={saving}
        onSubmit={handleEdit}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Delete Candidate
            </DialogTitle>
            <DialogDescription>
              Permanently remove <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
