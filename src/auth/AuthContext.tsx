import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User, UserRole, TenantFeatures } from '@/types/database'
import { ALL_FEATURES_ON } from '@/types/database'

interface AuthContextValue {
  supabaseUser: SupabaseUser | null
  profile: User | null
  session: Session | null
  loading: boolean
  role: UserRole | null
  isSuperAdmin: boolean
  tenantId: string | null
  features: TenantFeatures
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [features, setFeatures] = useState<TenantFeatures>(ALL_FEATURES_ON)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    setProfile(data ?? null)

    // Superadmin has no tenant — all features always on
    if (!data?.tenant_id) { setFeatures(ALL_FEATURES_ON); return }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('features')
      .eq('id', data.tenant_id)
      .single()
    setFeatures((tenant?.features as TenantFeatures | null) ?? ALL_FEATURES_ON)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setFeatures(ALL_FEATURES_ON)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        profile,
        session,
        loading,
        role: profile?.role ?? null,
        isSuperAdmin: profile?.is_superadmin ?? false,
        tenantId: profile?.tenant_id ?? null,
        features,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
