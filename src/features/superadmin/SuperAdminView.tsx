import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Building2, Users, Plus, Pause, Play, Trash2, Loader2,
  MoreHorizontal, SlidersHorizontal, LogOut, Pencil, KeyRound,
  Search, ChevronRight, AlertTriangle, ScrollText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { formatPortalDateTime } from '@/utils/timezone'
import type { Tenant, User, UserRole, TenantFeatures, AuditLog } from '@/types/database'
import { ALL_FEATURES_ON } from '@/types/database'
import { toast } from 'sonner'

// ─── types ────────────────────────────────────────────────────────────────────
type TenantWithUsers = Tenant & { userCount?: number }

type AuditWithMeta = AuditLog & {
  actor_name?: string
  tenant_name?: string
}

const ALL_ROLES: UserRole[] = ['OWNER', 'ADMIN', 'HR', 'BILLING', 'PAYROLL', 'AGENT', 'RECRUITER']

const FEATURE_META: { key: keyof TenantFeatures; label: string; description: string }[] = [
  { key: 'hr',          label: 'HR & Employees',  description: 'Employee management, time-off requests' },
  { key: 'billing',     label: 'Billing',          description: 'Invoices, customers, payment tracking' },
  { key: 'payroll',     label: 'Payroll',          description: 'Payroll ledger, batcher, payment batches' },
  { key: 'dialer',      label: 'Dialer',           description: 'Call center dialer integration & stats' },
  { key: 'recruitment', label: 'Recruitment',      description: 'Candidate submissions and client ratings' },
]

const ROLE_COLORS: Record<UserRole, string> = {
  OWNER:     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ADMIN:     'bg-blue-500/20   text-blue-400   border-blue-500/30',
  HR:        'bg-purple-500/20 text-purple-400 border-purple-500/30',
  BILLING:   'bg-cyan-500/20   text-cyan-400   border-cyan-500/30',
  PAYROLL:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  AGENT:     'bg-green-500/20  text-green-400  border-green-500/30',
  RECRUITER: 'bg-pink-500/20   text-pink-400   border-pink-500/30',
}

// ─── helpers ──────────────────────────────────────────────────────────────────
async function adminAction(action: string, payload: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase.functions.invoke('admin-actions', {
    body: { action, payload },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })
  return { data, error }
}

// ─── component ────────────────────────────────────────────────────────────────
export function SuperAdminView() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  // ── data ──────────────────────────────────────────────────────────────────
  const [tenants, setTenants]               = useState<TenantWithUsers[]>([])
  const [users, setUsers]                   = useState<User[]>([])
  const [auditLogs, setAuditLogs]           = useState<AuditWithMeta[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(true)
  const [usersLoading, setUsersLoading]     = useState(true)
  const [auditLoading, setAuditLoading]     = useState(false)

  // ── search / filter ───────────────────────────────────────────────────────
  const [tenantSearch, setTenantSearch]   = useState('')
  const [userSearch, setUserSearch]       = useState('')
  const [userTenantFilter, setUserTenantFilter] = useState('ALL')
  const [auditTenantFilter, setAuditTenantFilter] = useState('ALL')

  // ── New Tenant ────────────────────────────────────────────────────────────
  const [newTenantOpen, setNewTenantOpen]   = useState(false)
  const [newTenantName, setNewTenantName]   = useState('')
  const [newTenantSlug, setNewTenantSlug]   = useState('')
  const [newTenantSaving, setNewTenantSaving] = useState(false)

  // ── Edit Tenant ───────────────────────────────────────────────────────────
  const [editTenant, setEditTenant]         = useState<TenantWithUsers | null>(null)
  const [editTenantForm, setEditTenantForm] = useState({ name: '', slug: '', notes: '' })
  const [editTenantSaving, setEditTenantSaving] = useState(false)

  // ── Delete Tenant ─────────────────────────────────────────────────────────
  const [deleteTenant, setDeleteTenant]     = useState<TenantWithUsers | null>(null)
  const [deleteTenantBusy, setDeleteTenantBusy] = useState(false)

  // ── Manage Features ───────────────────────────────────────────────────────
  const [featureTenant, setFeatureTenant]   = useState<TenantWithUsers | null>(null)
  const [draftFeatures, setDraftFeatures]   = useState<TenantFeatures>(ALL_FEATURES_ON)
  const [featureSaving, setFeatureSaving]   = useState(false)

  // ── Tenant Users modal ────────────────────────────────────────────────────
  const [viewTenant, setViewTenant]         = useState<TenantWithUsers | null>(null)
  const [tenantUsersList, setTenantUsersList] = useState<User[]>([])
  const [tenantUsersLoading, setTenantUsersLoading] = useState(false)

  // ── Create User ───────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen]         = useState(false)
  const [createForm, setCreateForm]         = useState({ name: '', email: '', password: '', role: 'AGENT' as UserRole, tenant_id: '', phone: '' })
  const [createSaving, setCreateSaving]     = useState(false)

  // ── Set Password ──────────────────────────────────────────────────────────
  const [setPwdUser, setSetPwdUser]         = useState<User | null>(null)
  const [setPwdValue, setSetPwdValue]       = useState('')
  const [setPwdBusy, setSetPwdBusy]         = useState(false)

  // ── Edit User ─────────────────────────────────────────────────────────────
  const [editUser, setEditUser]             = useState<User | null>(null)
  const [editUserForm, setEditUserForm]     = useState({ name: '', email: '', phone: '', role: 'AGENT' as UserRole })
  const [editUserSaving, setEditUserSaving] = useState(false)

  // ── Delete User ───────────────────────────────────────────────────────────
  const [deleteUser, setDeleteUser]         = useState<User | null>(null)
  const [deleteUserBusy, setDeleteUserBusy] = useState(false)

  // ── active tab (for lazy loading audit) ──────────────────────────────────
  const [activeTab, setActiveTab] = useState('tenants')

  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchTenants(); fetchUsers() }, [])

  useEffect(() => {
    if (activeTab === 'audit' && auditLogs.length === 0) fetchAuditLog()
  }, [activeTab])

  // ─── fetch ────────────────────────────────────────────────────────────────
  async function fetchTenants() {
    setTenantsLoading(true)
    const { data: td } = await supabase.from('tenants').select('*').order('name')
    if (!td) { setTenantsLoading(false); return }
    const counts = await Promise.all(
      td.map(t => supabase.from('users').select('*', { count: 'exact', head: true }).eq('tenant_id', t.id))
    )
    setTenants(td.map((t, i) => ({ ...t, userCount: counts[i].count ?? 0 })))
    setTenantsLoading(false)
  }

  async function fetchUsers() {
    setUsersLoading(true)
    const { data } = await supabase.from('users').select('*').order('name')
    setUsers(data ?? [])
    setUsersLoading(false)
  }

  async function fetchAuditLog() {
    setAuditLoading(true)
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (!data) { setAuditLoading(false); return }

    // Enrich with actor name + tenant name from already-loaded data
    const enriched: AuditWithMeta[] = data.map(log => ({
      ...log,
      actor_name: users.find(u => u.id === log.actor_id)?.name,
      tenant_name: tenants.find(t => t.id === log.tenant_id)?.name,
    }))
    setAuditLogs(enriched)
    setAuditLoading(false)
  }

  async function fetchTenantUsers(tenantId: string) {
    setTenantUsersLoading(true)
    const { data } = await supabase.from('users').select('*').eq('tenant_id', tenantId).order('name')
    setTenantUsersList(data ?? [])
    setTenantUsersLoading(false)
  }

  // ─── tenant actions ───────────────────────────────────────────────────────
  async function createTenant() {
    if (!newTenantName.trim() || !newTenantSlug.trim()) { toast.error('Name and slug required'); return }
    setNewTenantSaving(true)
    const { error } = await supabase.from('tenants').insert({
      name: newTenantName.trim(),
      slug: newTenantSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      is_active: true,
      features: ALL_FEATURES_ON,
    })
    setNewTenantSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Tenant created')
    setNewTenantName(''); setNewTenantSlug(''); setNewTenantOpen(false)
    fetchTenants()
  }

  function openEditTenant(t: TenantWithUsers) {
    setEditTenant(t)
    setEditTenantForm({ name: t.name, slug: t.slug, notes: t.notes ?? '' })
  }

  async function saveEditTenant() {
    if (!editTenant) return
    setEditTenantSaving(true)
    const { data, error } = await adminAction('update_tenant', {
      tenant_id: editTenant.id,
      name: editTenantForm.name.trim(),
      slug: editTenantForm.slug.trim().toLowerCase(),
      notes: editTenantForm.notes || null,
    })
    setEditTenantSaving(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message); return }
    toast.success('Tenant updated')
    setEditTenant(null); fetchTenants()
  }

  async function toggleTenant(t: TenantWithUsers) {
    const { error } = await supabase.from('tenants').update({
      is_active: !t.is_active,
      suspended_at: t.is_active ? new Date().toISOString() : null,
    }).eq('id', t.id)
    if (error) toast.error(error.message)
    else { toast.success(t.is_active ? 'Tenant suspended' : 'Tenant reactivated'); fetchTenants() }
  }

  async function confirmDeleteTenant() {
    if (!deleteTenant) return
    setDeleteTenantBusy(true)
    const { data, error } = await adminAction('delete_tenant', { tenant_id: deleteTenant.id })
    setDeleteTenantBusy(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message); return }
    toast.success('Tenant deleted')
    setDeleteTenant(null); fetchTenants(); fetchUsers()
  }

  function openFeatureDialog(t: TenantWithUsers) {
    setFeatureTenant(t)
    setDraftFeatures({ ...ALL_FEATURES_ON, ...(t.features ?? {}) })
  }

  async function saveFeatures() {
    if (!featureTenant) return
    setFeatureSaving(true)
    const { error } = await supabase.from('tenants').update({ features: draftFeatures }).eq('id', featureTenant.id)
    setFeatureSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(`Features updated for ${featureTenant.name}`)
    setFeatureTenant(null); fetchTenants()
  }

  function openTenantUsers(t: TenantWithUsers) {
    setViewTenant(t)
    fetchTenantUsers(t.id)
  }

  // ─── user actions ─────────────────────────────────────────────────────────
  async function createUser() {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Name, email, and password are required'); return
    }
    if (createForm.role !== 'RECRUITER' && !createForm.tenant_id) {
      toast.error('Tenant is required for this role'); return
    }
    setCreateSaving(true)
    const { data, error } = await adminAction('create_user', {
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
      tenant_id: createForm.tenant_id || null,
      phone: createForm.phone || null,
    })
    setCreateSaving(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message ?? 'Create failed'); return }
    toast.success(`User ${createForm.name} created`)
    setCreateForm({ name: '', email: '', password: '', role: 'AGENT', tenant_id: '', phone: '' })
    setCreateOpen(false); fetchUsers()
  }

  async function setPassword() {
    if (!setPwdUser || !setPwdValue.trim()) return
    setSetPwdBusy(true)
    const { data, error } = await adminAction('set_password', { user_id: setPwdUser.id, password: setPwdValue.trim() })
    setSetPwdBusy(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message); return }
    toast.success(`Password updated for ${setPwdUser.name}`)
    setSetPwdUser(null); setSetPwdValue('')
  }

  function openEditUser(u: User) {
    setEditUser(u)
    setEditUserForm({ name: u.name, email: u.email ?? '', phone: u.phone ?? '', role: u.role })
  }

  async function saveEditUser() {
    if (!editUser) return
    setEditUserSaving(true)
    const { data, error } = await adminAction('update_user_profile', {
      user_id: editUser.id,
      name: editUserForm.name.trim(),
      email: editUserForm.email.trim() || undefined,
      phone: editUserForm.phone.trim() || undefined,
      role: editUserForm.role,
    })
    setEditUserSaving(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message); return }
    toast.success('User updated')
    setEditUser(null); fetchUsers()
    if (viewTenant) fetchTenantUsers(viewTenant.id)
  }

  async function toggleUserActive(u: User) {
    const { data, error } = await adminAction('toggle_user_active', { user_id: u.id, is_active: !u.is_active })
    if (error || data?.error) toast.error(data?.error ?? error?.message)
    else { toast.success(u.is_active ? 'User suspended' : 'User reactivated'); fetchUsers(); if (viewTenant) fetchTenantUsers(viewTenant.id) }
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return
    setDeleteUserBusy(true)
    const { data, error } = await adminAction('delete_user', { user_id: deleteUser.id })
    setDeleteUserBusy(false)
    if (error || data?.error) { toast.error(data?.error ?? error?.message); return }
    toast.success('User deleted')
    setDeleteUser(null); fetchUsers(); if (viewTenant) fetchTenantUsers(viewTenant.id)
  }

  async function handleSignOut() {
    await signOut(); navigate('/login'); toast.success('Signed out')
  }

  // ─── derived ──────────────────────────────────────────────────────────────
  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.slug.toLowerCase().includes(tenantSearch.toLowerCase())
  )

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(userSearch.toLowerCase())
    const matchTenant = userTenantFilter === 'ALL' || u.tenant_id === userTenantFilter
    return matchSearch && matchTenant
  })

  const filteredAudit = auditTenantFilter === 'ALL'
    ? auditLogs
    : auditLogs.filter(l => l.tenant_id === auditTenantFilter)

  // ─── shared sub-components ────────────────────────────────────────────────
  function UserActionMenu({ u, onEdit }: { u: User; onEdit: () => void }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSetPwdUser(u); setSetPwdValue('') }}>
            <KeyRound className="h-4 w-4 mr-2" />Set Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toggleUserActive(u)} className={u.is_active ? 'text-yellow-400' : ''}>
            {u.is_active ? <><Pause className="h-4 w-4 mr-2" />Suspend</> : <><Play className="h-4 w-4 mr-2" />Reactivate</>}
          </DropdownMenuItem>
          {!u.is_superadmin && (
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteUser(u)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  function UserCard({ u, showTenant = true }: { u: User; showTenant?: boolean }) {
    const tenant = tenants.find(t => t.id === u.tenant_id)
    return (
      <Card className={!u.is_active ? 'opacity-60' : ''}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-medium">
            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground text-sm">{u.name}</p>
              <span className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold ${ROLE_COLORS[u.role]}`}>{u.role}</span>
              <Badge variant={u.is_active ? 'success' : 'destructive'} className="text-[10px]">{u.is_active ? 'Active' : 'Suspended'}</Badge>
              {u.is_superadmin && <Badge variant="destructive" className="text-[10px]">GOD</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {u.email ?? '—'}
              {showTenant && tenant && <> · {tenant.name}</>}
              {u.phone && <> · {u.phone}</>}
            </p>
          </div>
          <UserActionMenu u={u} onEdit={() => openEditUser(u)} />
        </CardContent>
      </Card>
    )
  }

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* God Mode Header */}
      <div className="bg-red-950/40 border-b border-red-500/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">SuperAdmin Portal</h1>
            <p className="text-xs text-red-400">God Mode — Full cross-tenant access · {profile?.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground shrink-0">
            <LogOut className="h-4 w-4 mr-1.5" />Sign out
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tenants',          value: tenants.length,                        sub: `${tenants.filter(t => t.is_active).length} active`,    subColor: 'text-green-400' },
            { label: 'Total Users',      value: users.length,                          sub: `${users.filter(u => u.is_active).length} active`,       subColor: 'text-green-400' },
            { label: 'Suspended Tenants',value: tenants.filter(t => !t.is_active).length, sub: 'need attention',                                       subColor: 'text-red-400' },
            { label: 'Suspended Users',  value: users.filter(u => !u.is_active).length,  sub: 'need attention',                                       subColor: 'text-red-400' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tenants"><Building2 className="h-3.5 w-3.5 mr-1.5" />Tenants</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />All Users</TabsTrigger>
            <TabsTrigger value="audit"><ScrollText className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
          </TabsList>

          {/* ── Tenants ── */}
          <TabsContent value="tenants" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tenants…" className="pl-9" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)} />
              </div>
              <Button onClick={() => setNewTenantOpen(true)}><Plus className="h-4 w-4" />New Tenant</Button>
            </div>

            {tenantsLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
            ) : filteredTenants.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No tenants found</CardContent></Card>
            ) : filteredTenants.map(t => (
              <Card key={t.id} className={!t.is_active ? 'opacity-60 border-red-500/20' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{t.name}</p>
                      <Badge variant={t.is_active ? 'success' : 'destructive'}>{t.is_active ? 'Active' : 'Suspended'}</Badge>
                      <Badge variant="outline" className="font-mono text-[10px]">{t.slug}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.userCount ?? 0} users · {formatPortalDateTime(t.created_at)}</p>
                    {/* Feature chips */}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {FEATURE_META.map(f => (
                        <span key={f.key} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${(t.features?.[f.key] ?? true) ? 'border-primary/30 text-primary bg-primary/10' : 'border-white/10 text-muted-foreground/40 line-through'}`}>
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openTenantUsers(t)} className="text-xs text-muted-foreground hover:text-foreground">
                      Users <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditTenant(t)}>
                          <Pencil className="h-4 w-4 mr-2" />Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openFeatureDialog(t)}>
                          <SlidersHorizontal className="h-4 w-4 mr-2" />Manage Features
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openTenantUsers(t)}>
                          <Users className="h-4 w-4 mr-2" />View Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleTenant(t)} className={t.is_active ? 'text-yellow-400' : ''}>
                          {t.is_active ? <><Pause className="h-4 w-4 mr-2" />Suspend</> : <><Play className="h-4 w-4 mr-2" />Reactivate</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTenant(t)}>
                          <Trash2 className="h-4 w-4 mr-2" />Delete Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── All Users ── */}
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email…" className="pl-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <Select value={userTenantFilter} onValueChange={setUserTenantFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="All tenants" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All tenants</SelectItem>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create User</Button>
            </div>

            {usersLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : filteredUsers.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No users found</CardContent></Card>
            ) : filteredUsers.map(u => <UserCard key={u.id} u={u} />)}
          </TabsContent>

          {/* ── Audit Log ── */}
          <TabsContent value="audit" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Select value={auditTenantFilter} onValueChange={setAuditTenantFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="All tenants" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All tenants</SelectItem>
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchAuditLog} disabled={auditLoading}>
                {auditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
              <p className="text-xs text-muted-foreground ml-auto">Last 200 entries</p>
            </div>

            {auditLoading ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : filteredAudit.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-muted-foreground">No audit entries</CardContent></Card>
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-white/5">
                  {filteredAudit.map(log => (
                    <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-primary">{log.action}</span>
                          {log.tenant_name && <span className="text-xs text-muted-foreground">{log.tenant_name}</span>}
                          {log.actor_name && <span className="text-xs text-foreground/70">by {log.actor_name}</span>}
                        </div>
                        {log.payload && Object.keys(log.payload).length > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                            {JSON.stringify(log.payload)}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatPortalDateTime(log.created_at)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ══ Dialogs ══════════════════════════════════════════════════════════ */}

      {/* New Tenant */}
      <Dialog open={newTenantOpen} onOpenChange={v => !v && setNewTenantOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Tenant</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Company Name *</Label>
              <Input value={newTenantName} onChange={e => { setNewTenantName(e.target.value); setNewTenantSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={newTenantSlug} onChange={e => setNewTenantSlug(e.target.value)} placeholder="acme-corp" className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTenantOpen(false)}>Cancel</Button>
            <Button onClick={createTenant} disabled={newTenantSaving}>{newTenantSaving && <Loader2 className="h-4 w-4 animate-spin" />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant */}
      <Dialog open={!!editTenant} onOpenChange={v => !v && setEditTenant(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Tenant — {editTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={editTenantForm.name} onChange={e => setEditTenantForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Slug</Label><Input value={editTenantForm.slug} onChange={e => setEditTenantForm(f => ({ ...f, slug: e.target.value }))} className="font-mono" /></div>
            <div className="space-y-1.5"><Label>Internal Notes</Label><Textarea value={editTenantForm.notes} onChange={e => setEditTenantForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Private notes visible only to SuperAdmin…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTenant(null)}>Cancel</Button>
            <Button onClick={saveEditTenant} disabled={editTenantSaving}>{editTenantSaving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant confirm */}
      <Dialog open={!!deleteTenant} onOpenChange={v => !v && setDeleteTenant(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Delete Tenant</DialogTitle>
            <DialogDescription>This permanently deletes <strong>{deleteTenant?.name}</strong> and all its users, employees, invoices, and payroll data. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTenant(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteTenant} disabled={deleteTenantBusy}>
              {deleteTenantBusy && <Loader2 className="h-4 w-4 animate-spin" />}Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Features */}
      <Dialog open={!!featureTenant} onOpenChange={v => !v && setFeatureTenant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" />Feature Access — {featureTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {FEATURE_META.map((f, i) => (
              <div key={f.key}>
                <div className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                  </div>
                  <Switch checked={draftFeatures[f.key]} onCheckedChange={val => setDraftFeatures(p => ({ ...p, [f.key]: val }))} />
                </div>
                {i < FEATURE_META.length - 1 && <Separator />}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureTenant(null)}>Cancel</Button>
            <Button onClick={saveFeatures} disabled={featureSaving}>{featureSaving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Users modal */}
      <Dialog open={!!viewTenant} onOpenChange={v => !v && setViewTenant(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" />{viewTenant?.name} — Users</DialogTitle>
          </DialogHeader>
          {tenantUsersLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : tenantUsersList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users in this tenant</p>
          ) : (
            <div className="space-y-2">
              {tenantUsersList.map(u => <UserCard key={u.id} u={u} showTenant={false} />)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateForm(f => ({ ...f, tenant_id: viewTenant?.id ?? '' })); setCreateOpen(true) }}>
              <Plus className="h-4 w-4 mr-1.5" />Add User to Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User */}
      <Dialog open={createOpen} onOpenChange={v => !v && setCreateOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Account is created immediately — no email sent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Full Name *</Label><Input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Password *</Label><Input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v as UserRole, tenant_id: '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tenant {createForm.role !== 'RECRUITER' && '*'}</Label>
              <Select value={createForm.tenant_id} onValueChange={v => setCreateForm(f => ({ ...f, tenant_id: v }))}>
                <SelectTrigger><SelectValue placeholder={createForm.role === 'RECRUITER' ? 'None (cross-tenant)' : 'Select tenant…'} /></SelectTrigger>
                <SelectContent>
                  {createForm.role === 'RECRUITER' && <SelectItem value="">None (cross-tenant)</SelectItem>}
                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createUser} disabled={createSaving}>{createSaving && <Loader2 className="h-4 w-4 animate-spin" />}Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password */}
      <Dialog open={!!setPwdUser} onOpenChange={v => !v && setSetPwdUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Set Password — {setPwdUser?.name}</DialogTitle>
            <DialogDescription>Directly sets the password. The user can log in immediately with the new credentials.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Min 6 characters"
              value={setPwdValue}
              onChange={e => setSetPwdValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPassword()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetPwdUser(null)}>Cancel</Button>
            <Button onClick={setPassword} disabled={setPwdBusy || !setPwdValue.trim()}>
              {setPwdBusy && <Loader2 className="h-4 w-4 animate-spin" />}Set Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User */}
      <Dialog open={!!editUser} onOpenChange={v => !v && setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit User — {editUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Full Name</Label><Input value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={editUserForm.email} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={editUserForm.phone} onChange={e => setEditUserForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editUserForm.role} onValueChange={v => setEditUserForm(f => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEditUser} disabled={editUserSaving}>{editUserSaving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User confirm */}
      <Dialog open={!!deleteUser} onOpenChange={v => !v && setDeleteUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Delete User</DialogTitle>
            <DialogDescription>This permanently deletes <strong>{deleteUser?.name}</strong> and revokes their portal access. Cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={deleteUserBusy}>
              {deleteUserBusy && <Loader2 className="h-4 w-4 animate-spin" />}Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
