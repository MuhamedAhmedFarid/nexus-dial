import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, User, Lock } from 'lucide-react'

export function SettingsView() {
  const { profile, supabaseUser } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('users').update({ name: name.trim(), phone: phone || null }).eq('id', profile.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setNewPassword('') }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and account</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="space-y-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-secondary rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{profile?.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{supabaseUser?.email}</p>
                  {profile?.role && <Badge variant="secondary" className="text-[10px]">{profile.role}</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Display Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" /></div>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1.5"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" /></div>
            <Button type="submit" variant="outline" disabled={pwLoading}>{pwLoading && <Loader2 className="h-4 w-4 animate-spin" />}Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
