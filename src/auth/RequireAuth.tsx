import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Loader2 } from 'lucide-react'
import type { UserRole, FeatureKey } from '@/types/database'

interface RequireAuthProps {
  children: React.ReactNode
  roles?: UserRole[]
  requireSuperAdmin?: boolean
  feature?: FeatureKey
}

export function RequireAuth({ children, roles, requireSuperAdmin, feature }: RequireAuthProps) {
  const { supabaseUser, profile, loading, isSuperAdmin, features } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!supabaseUser) return <Navigate to="/login" replace />
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/candidates" replace />
  if (roles && profile && !isSuperAdmin && !roles.includes(profile.role)) return <Navigate to="/candidates" replace />

  // Feature gate: superadmin bypasses; disabled feature → back to candidates
  if (feature && !isSuperAdmin && !features[feature]) return <Navigate to="/candidates" replace />

  return <>{children}</>
}
