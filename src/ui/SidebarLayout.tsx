import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, DollarSign, Phone,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu,
  Shield, UserCheck, Briefcase,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { NexusDialLogo } from '@/components/NexusDialLogo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { UserRole, FeatureKey } from '@/types/database'
import { toast } from 'sonner'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  roles: UserRole[] | 'all'
  feature?: FeatureKey
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Candidates',  to: '/candidates', icon: UserCheck,       roles: ['OWNER', 'ADMIN', 'HR'],       feature: 'recruitment' },
  { label: 'Settings',    to: '/settings',   icon: Settings,        roles: ['OWNER', 'ADMIN'] },
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

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, isSuperAdmin, features, signOut } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
    toast.success('Signed out')
  }

  function canSeeNav(item: NavItem) {
    // Superadmin always sees everything
    if (isSuperAdmin) return true
    // Feature disabled for this tenant → hide
    if (item.feature && !features[item.feature]) return false
    if (item.roles === 'all') return true
    if (!role) return false
    return (item.roles as UserRole[]).includes(role)
  }

  const initials = profile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??'

  const sidebar = (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-white/10 transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-3 border-b border-white/10', collapsed && 'justify-center')}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">N</span>
          </div>
        ) : (
          <NexusDialLogo size="sm" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(canSeeNav).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                collapsed && 'justify-center px-2',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isSuperAdmin && (
          <>
            <Separator className="my-2" />
            <NavLink
              to="/superadmin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              <Shield className="h-4 w-4 shrink-0" />
              {!collapsed && <span>God Mode</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-2 border-t border-white/10">
        <div className={cn('flex items-center gap-2 px-2 py-2 rounded-md', collapsed && 'justify-center')}>
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile?.name ?? 'Loading…'}</p>
              {role && (
                <span className={cn('inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold mt-0.5', ROLE_COLORS[role])}>
                  {role}
                </span>
              )}
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button variant="ghost" size="icon" className="w-full h-8 mt-1" onClick={handleSignOut}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col relative">
        {sidebar}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-16 z-30 h-6 w-6 rounded-full bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 flex flex-col">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-white/10 bg-card">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <NexusDialLogo size="sm" />
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
