import { useEffect, useState } from 'react'
import { Mic2, FileText, Star, Loader2, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Candidate, CandidateStatus } from '@/types/database'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, CheckCircle2, UserPlus, GraduationCap, XCircle, Clock, Search } from 'lucide-react'

const STATUS: Record<CandidateStatus, { label: string; cls: string; icon: any }> = {
  pending:     { label: 'Pending',     cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20', icon: Clock },
  good:        { label: 'Good',        cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',     icon: CheckCircle2 },
  interviewed: { label: 'Interviewed', cls: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20', icon: Search },
  training:    { label: 'Training',    cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20', icon: GraduationCap },
  hired:       { label: 'Hired',       cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20', icon: UserPlus },
  rejected:    { label: 'Rejected',    cls: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',         icon: XCircle },
}

// ── Rating widget ──────────────────────────────────────────────────────────────
function RatingPicker({ value, onChange, disabled }: {
  value: number | null
  onChange: (n: number | null) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const filled = value !== null && n <= value
        return (
          <button
            key={n}
            disabled={disabled}
            onClick={() => onChange(n === value ? null : n)}
            className={cn(
              'w-8 h-8 rounded text-xs font-bold transition-all border',
              filled
                ? n >= 8 ? 'bg-green-500 border-green-500 text-white'
                  : n >= 5 ? 'bg-yellow-500 border-yellow-500 text-white'
                  : 'bg-red-500 border-red-500 text-white'
                : 'bg-transparent border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground',
            )}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

// ── Candidate card ─────────────────────────────────────────────────────────────
function CandidateCard({ candidate, onSave, onStatusUpdate }: {
  candidate: Candidate
  onSave: (id: string, rating: number | null, notes: string) => Promise<void>
  onStatusUpdate: (id: string, status: CandidateStatus) => Promise<void>
}) {
  const [rating, setRating]   = useState<number | null>(candidate.rating)
  const [notes, setNotes]     = useState(candidate.rating_notes ?? '')
  const [saving, setSaving]   = useState(false)
  const [notesDirty, setNotesDirty] = useState(false)

  const initials = candidate.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const s = candidate.status
  const StatusIcon = STATUS[s]?.icon || Clock

  async function handleStatusChange(newStatus: CandidateStatus) {
    setSaving(true)
    await onStatusUpdate(candidate.id, newStatus)
    setSaving(false)
  }

  async function handleRate(n: number | null) {
    setRating(n)
    setSaving(true)
    await onSave(candidate.id, n, notes)
    setSaving(false)
  }

  async function handleSaveNotes() {
    setSaving(true)
    await onSave(candidate.id, rating, notes)
    setSaving(false)
    setNotesDirty(false)
  }

  return (
    <Card className="bg-card border-white/10 flex flex-col">
      <CardContent className="p-5 flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">{candidate.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{candidate.position}</p>
            </div>
          </div>
          <Select value={s} onValueChange={handleStatusChange} disabled={saving}>
            <SelectTrigger 
              className={cn(
                'h-8 w-fit min-w-[110px] text-[11px] px-2.5 gap-2 border transition-all shadow-sm font-semibold rounded-full',
                STATUS[s]?.cls
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <SelectValue>{STATUS[s]?.label ?? s}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="w-[140px] p-1 bg-popover/95 backdrop-blur-sm border-white/10">
              {(Object.keys(STATUS) as CandidateStatus[]).map(statusKey => {
                const ItemIcon = STATUS[statusKey].icon
                return (
                  <SelectItem key={statusKey} value={statusKey} className="text-xs rounded-sm focus:bg-primary/10 focus:text-primary py-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ItemIcon className="h-3.5 w-3.5" />
                      {STATUS[statusKey].label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {candidate.vocaroo_url ? (
            <a
              href={candidate.vocaroo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-medium transition-colors"
            >
              <Mic2 className="h-3 w-3" /> Voice Recording
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-secondary/40 text-muted-foreground/40 border border-white/5">
              <Mic2 className="h-3 w-3" /> No recording
            </span>
          )}
          {candidate.resume_url ? (
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-secondary/70 border border-white/10 font-medium transition-colors"
            >
              <FileText className="h-3 w-3" /> Resume
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-secondary/40 text-muted-foreground/40 border border-white/5">
              <FileText className="h-3 w-3" /> No resume
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Star className="h-3 w-3" /> Your rating
            </p>
            {rating !== null && (
              <span className="text-xs font-bold">
                <span className="text-foreground">{rating}</span>
                <span className="text-muted-foreground">/10</span>
                {saving && <Loader2 className="h-3 w-3 animate-spin inline ml-1.5 text-muted-foreground" />}
              </span>
            )}
          </div>
          <RatingPicker value={rating} onChange={handleRate} disabled={saving} />
        </div>

        {/* Notes */}
        <div className="space-y-2 mt-auto">
          <Textarea
            placeholder="Add notes about this candidate…"
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesDirty(true) }}
            className="text-xs min-h-[64px] bg-secondary/50 border-white/10 resize-none"
          />
          {notesDirty && (
            <Button size="sm" className="h-7 text-xs w-full" onClick={handleSaveNotes} disabled={saving}>
              {saving && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              Save Notes
            </Button>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────
export function ClientCandidatesView() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('all')

  useEffect(() => {
    supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCandidates(data ?? []); setLoading(false) })
  }, [])

  async function handleSave(id: string, rating: number | null, notes: string) {
    const { error } = await supabase
      .from('candidates')
      .update({ rating, rating_notes: notes || null })
      .eq('id', id)
    if (error) { toast.error('Failed to save'); return }
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, rating, rating_notes: notes || null } : c))
    toast.success('Saved')
  }

  async function handleStatusUpdate(id: string, status: CandidateStatus) {
    const { error } = await supabase
      .from('candidates')
      .update({ status })
      .eq('id', id)
    if (error) { toast.error('Failed to update status'); return }
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    toast.success(`Status updated to ${STATUS[status].label}`)
  }

  const counts = {
    all:         candidates.length,
    pending:     candidates.filter(c => c.status === 'pending').length,
    good:        candidates.filter(c => c.status === 'good').length,
    interviewed: candidates.filter(c => c.status === 'interviewed').length,
    training:    candidates.filter(c => c.status === 'training').length,
    hired:       candidates.filter(c => c.status === 'hired').length,
    rejected:    candidates.filter(c => c.status === 'rejected').length,
  }

  const visible = tab === 'all' ? candidates : candidates.filter(c => c.status === tab)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review candidates submitted for your team, update their status, and rate them out of 10.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 p-1">
          {(['all', 'pending', 'good', 'interviewed', 'training', 'hired', 'rejected'] as const).map(s => (
            <TabsTrigger key={s} value={s} className="text-[11px] px-3">
              {s === 'all' ? 'All' : STATUS[s].label}
              <span className="ml-1.5 text-[10px] opacity-40 font-mono">({counts[s]})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Card key={i} className="h-72 animate-pulse bg-secondary border-white/5" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <UserCheck className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">No candidates yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Your recruiter will add candidates here for your review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(c => (
            <CandidateCard key={c.id} candidate={c} onSave={handleSave} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}

    </div>
  )
}