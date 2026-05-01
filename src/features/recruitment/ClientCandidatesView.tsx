import { useEffect, useState } from 'react'
import { Mic2, FileText, Star, Loader2, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Candidate, CandidateStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS: Record<CandidateStatus, { label: string; cls: string }> = {
  pending:     { label: 'Pending',     cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  reviewed:    { label: 'Reviewed',    cls: 'bg-blue-500/20   text-blue-400   border-blue-500/30'   },
  shortlisted: { label: 'Shortlisted', cls: 'bg-green-500/20  text-green-400  border-green-500/30'  },
  rejected:    { label: 'Rejected',    cls: 'bg-red-500/20    text-red-400    border-red-500/30'     },
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
function CandidateCard({ candidate, onSave }: {
  candidate: Candidate
  onSave: (id: string, rating: number | null, notes: string) => Promise<void>
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
          <Badge variant="outline" className={cn('text-[10px] shrink-0', STATUS[s]?.cls)}>
            {STATUS[s]?.label ?? s}
          </Badge>
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

  const counts = {
    all:         candidates.length,
    pending:     candidates.filter(c => c.status === 'pending').length,
    good:        candidates.filter(c => c.status === 'good').length,
    interviewed: candidates.filter(c => c.status === 'interviewed').length,
    training:    candidates.filter(c => c.status === 'training').length,
    hired:       candidates.filter(c => c.status === 'hired').length,
    rejected:    candidates.filter(c => c.status === 'rejected').length,
    hired:       candidates.filter(c => c.status === 'hired').length,
    training:    candidates.filter(c => c.status === 'training').length,
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
        <TabsList className="bg-secondary">
          {(['all', 'pending', 'reviewed', 'shortlisted', 'rejected'] as const).map(s => (
            <TabsTrigger key={s} value={s} className="text-xs">
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
            <CandidateCard key={c.id} candidate={c} onSave={handleSave} />
          ))}
        </div>
      )}

    </div>
  )
}