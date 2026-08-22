import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { useProgramme } from '../../context/ProgrammeContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { Save, RefreshCw } from 'lucide-react'
import ExportMenu from '../../components/ExportMenu'

const clauses = [
  { id: 'cl4', clause: '4', title: 'Context of the organisation',
    items: [
      { id: 'cl4.1', ref: '4.1', text: 'Internal and external issues identified and documented (SWOT/PESTLE)' },
      { id: 'cl4.2', ref: '4.2', text: 'Interested parties and their requirements identified and reviewed' },
      { id: 'cl4.3', ref: '4.3', text: 'QMS scope formally defined, documented and approved' },
      { id: 'cl4.4', ref: '4.4', text: 'QMS processes identified with owners, inputs, outputs and interactions documented' },
    ]},
  { id: 'cl5', clause: '5', title: 'Leadership',
    items: [
      { id: 'cl5.1', ref: '5.1', text: 'Top management demonstrates leadership and commitment to QMS' },
      { id: 'cl5.2', ref: '5.2', text: 'Quality policy established, communicated and available' },
      { id: 'cl5.3', ref: '5.3', text: 'Roles, responsibilities and authorities defined and communicated' },
    ]},
  { id: 'cl6', clause: '6', title: 'Planning',
    items: [
      { id: 'cl6.1', ref: '6.1', text: 'Risks and opportunities identified and actions planned (risk-based thinking)' },
      { id: 'cl6.2', ref: '6.2', text: 'Quality objectives established — SMART, monitored and communicated' },
      { id: 'cl6.3', ref: '6.3', text: 'QMS changes planned and implemented in a controlled manner' },
    ]},
  { id: 'cl7', clause: '7', title: 'Support',
    items: [
      { id: 'cl7.1', ref: '7.1', text: 'Resources (people, infrastructure, environment, monitoring) determined and provided' },
      { id: 'cl7.2', ref: '7.2', text: 'Personnel competence determined, evidenced and maintained' },
      { id: 'cl7.3', ref: '7.3', text: 'Awareness of quality policy, objectives and QMS contribution' },
      { id: 'cl7.4', ref: '7.4', text: 'Internal and external communication plan in place' },
      { id: 'cl7.5', ref: '7.5', text: 'Documented information controlled — creation, update, retention and disposal' },
    ]},
  { id: 'cl8', clause: '8', title: 'Operations',
    items: [
      { id: 'cl8.1', ref: '8.1', text: 'Operational processes planned, implemented and controlled' },
      { id: 'cl8.2', ref: '8.2', text: 'Customer requirements and communications managed' },
      { id: 'cl8.3', ref: '8.3', text: 'Design and development process controlled (if applicable)' },
      { id: 'cl8.4', ref: '8.4', text: 'External providers controlled — approved supplier list and performance monitoring' },
      { id: 'cl8.5', ref: '8.5', text: 'Production/service provision controlled — identification, traceability, preservation' },
      { id: 'cl8.6', ref: '8.6', text: 'Release of products/services — verification and authorisation' },
      { id: 'cl8.7', ref: '8.7', text: 'Nonconforming outputs identified, controlled and reviewed' },
    ]},
  { id: 'cl9', clause: '9', title: 'Performance evaluation',
    items: [
      { id: 'cl9.1', ref: '9.1', text: 'Customer satisfaction monitored and analysed' },
      { id: 'cl9.1b', ref: '9.1', text: 'Analysis and evaluation of QMS data and performance conducted' },
      { id: 'cl9.2', ref: '9.2', text: 'Internal audit programme established and implemented' },
      { id: 'cl9.3', ref: '9.3', text: 'Management review conducted — all inputs covered, outputs actioned' },
    ]},
  { id: 'cl10', clause: '10', title: 'Improvement',
    items: [
      { id: 'cl10.1', ref: '10.1', text: 'Improvement opportunities identified and acted upon' },
      { id: 'cl10.2', ref: '10.2', text: 'Nonconformities and corrective actions managed through root cause analysis' },
      { id: 'cl10.3', ref: '10.3', text: 'Continual improvement of QMS suitability, adequacy and effectiveness' },
    ]},
]

const STATUS = {
  green:  { label: 'Conforms',     color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700', dot: 'bg-emerald-400' },
  amber:  { label: 'Partial',      color: 'bg-amber-900/40 text-amber-300 border-amber-700',       dot: 'bg-amber-400'   },
  red:    { label: 'Not in place', color: 'bg-red-900/40 text-red-300 border-red-700',             dot: 'bg-red-400'     },
  na:     { label: 'N/A',          color: 'bg-navy-700 text-steel-400 border-navy-600',            dot: 'bg-steel-600'   },
}

function score(ratings) {
  const vals = Object.values(ratings)
  if (!vals.length) return 0
  const applicable = vals.filter(v => v !== 'na')
  if (!applicable.length) return 100
  const green = applicable.filter(v => v === 'green').length
  const amber = applicable.filter(v => v === 'amber').length
  return Math.round(((green + amber * 0.5) / applicable.length) * 100)
}

function ScoreBadge({ pct }) {
  const color = pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-2xl font-bold ${color}`}>{pct}%</span>
}

export default function GapAnalysis() {
  const { activeProgramme } = useProgramme()
  const { user } = useAuth()
  const { toast } = useToast()
  const [ratings, setRatings] = useState({})
  const [notes, setNotes] = useState({})
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const storageKey = activeProgramme ? `gap_${activeProgramme.id}` : null

  useEffect(() => {
    if (!storageKey) return
    const load = async () => {
      const { data } = await supabase.from('gap_analysis')
        .select('ratings, notes')
        .eq('programme_id', activeProgramme.id)
        .maybeSingle()
      if (data) { setRatings(data.ratings || {}); setNotes(data.notes || {}) }
      setLoaded(true)
    }
    load().catch(() => {
      // Table may not exist yet — use localStorage fallback
      const saved = localStorage.getItem(storageKey)
      if (saved) { const p = JSON.parse(saved); setRatings(p.ratings||{}); setNotes(p.notes||{}) }
      setLoaded(true)
    })
  }, [storageKey])

  const save = async () => {
    setSaving(true)
    try {
      await supabase.from('gap_analysis').upsert({
        programme_id: activeProgramme.id,
        user_id: user.id,
        ratings, notes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'programme_id' })
      toast('Gap analysis saved')
    } catch {
      localStorage.setItem(storageKey, JSON.stringify({ ratings, notes }))
      toast('Saved locally')
    }
    setSaving(false)
  }

  const setRating = (id, val) => setRatings(p => ({ ...p, [id]: val }))
  const setNote = (id, val) => setNotes(p => ({ ...p, [id]: val }))
  const reset = () => { setRatings({}); setNotes({}) }

  const pct = score(ratings)
  const total = clauses.reduce((a, c) => a + c.items.length, 0)
  const done = Object.keys(ratings).length

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Gap Analysis"
        title="ISO 9001:2015 Readiness Assessment"
        description="Clause-by-clause gap analysis — assess conformity against all ISO 9001:2015 requirements. Use before Stage 1 or surveillance audits to identify gaps and prioritise remediation. Each item rated Green (conforms), Amber (partial), Red (not in place), or N/A."
        badges={[activeProgramme?.name || activeProgramme?.programme_id || 'No programme', `${done}/${total} assessed`]} />

      {/* Score card */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="text-center">
            <ScoreBadge pct={pct} />
            <div className="text-xs text-steel-400 mt-1">Readiness score</div>
          </div>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(STATUS).map(([k, v]) => {
              const count = Object.values(ratings).filter(r => r === k).length
              return (
                <div key={k} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                  <span className="text-xs text-steel-300">{v.label}: <span className="text-white font-semibold">{count}</span></span>
                </div>
              )
            })}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-steel-600" />
              <span className="text-xs text-steel-300">Not assessed: <span className="text-white font-semibold">{total - done}</span></span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <ExportMenu type="gap" gapRatings={ratings} gapNotes={notes} programme={activeProgramme} />
            <button onClick={reset} className="btn-secondary text-xs py-1.5">
              <RefreshCw size={12} /> Reset
            </button>
            <button onClick={save} disabled={saving || !activeProgramme}
              className="btn-primary text-xs py-1.5">
              <Save size={12} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-navy-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? '#1D9E75' : pct >= 50 ? '#BA7517' : '#E24B4A'
            }} />
        </div>
      </div>

      {/* Clause sections */}
      <div className="space-y-4 mb-6">
        {clauses.map(section => {
          const sectionRatings = section.items.map(i => ratings[i.id]).filter(Boolean)
          const sectionPct = sectionRatings.length ? score(
            Object.fromEntries(section.items.map(i => [i.id, ratings[i.id] || 'unset']).filter(([,v]) => v !== 'unset'))
          ) : null

          return (
            <div key={section.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="clause-tag">Cl. {section.clause}</span>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                {sectionPct !== null && (
                  <span className={`text-sm font-bold ${sectionPct >= 80 ? 'text-emerald-400' : sectionPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {sectionPct}%
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.id} className="bg-navy-800 rounded-xl p-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-amber-audit">{item.ref}</span>
                          <span className="text-xs text-steel-300 leading-snug">{item.text}</span>
                        </div>
                        <input
                          className="input-field text-xs py-1 w-full"
                          placeholder="Notes / evidence observed..."
                          value={notes[item.id] || ''}
                          onChange={e => setNote(item.id, e.target.value)}
                        />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {Object.entries(STATUS).map(([k, v]) => (
                          <button key={k}
                            onClick={() => setRating(item.id, k)}
                            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                              ratings[item.id] === k ? v.color : 'bg-navy-700 border-navy-600 text-steel-500 hover:border-steel-500'
                            }`}>
                            {k === 'green' ? 'G' : k === 'amber' ? 'A' : k === 'red' ? 'R' : 'N/A'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <AIPanel title="Generate Gap Analysis Report"
        systemPrompt="You are an ISO 9001:2015 gap analysis specialist. Generate professional gap analysis reports, remediation plans, and readiness assessments. Structure output with executive summary, clause-by-clause findings, priority actions, and realistic timelines. Use 4Cs format for significant gaps."
        placeholder="e.g. Generate a gap analysis executive summary for a manufacturing company at 65% readiness, with major gaps in Cl.7.2 competence and Cl.8.4 supplier control"
        contextFields={[
          { id: 'org', label: 'Organisation', type: 'text', placeholder: 'e.g. UK manufacturer, 150 staff, targeting ISO 9001 by Q4' },
          { id: 'score', label: 'Current readiness score', type: 'text', placeholder: 'e.g. 65% — 12 green, 8 amber, 5 red' },
          { id: 'artifact', label: 'Artifact required', type: 'select', options: ['Executive summary', 'Full gap analysis report', 'Remediation action plan', 'Stage 1 readiness brief', 'Board presentation', 'Clause 8 deep-dive'] },
        ]} />
    </div>
  )
}
