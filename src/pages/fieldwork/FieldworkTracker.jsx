import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle2, Circle, AlertTriangle, Clock, Loader2, Save } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import AIPanel from '../../components/AIPanel'
import { useProgramme } from '../../context/ProgrammeContext'
import { supabase } from '../../lib/supabase'

const statusColors = { 'Complete': 'text-emerald-400', 'In Progress': 'text-amber-audit', 'Not Started': 'text-steel-500', 'Exception': 'text-red-400', 'N/A': 'text-steel-600' }
const phaseConfig = {
  TOD: { color: 'bg-blue-900/40 text-blue-300 border-blue-800', label: 'Test of Design' },
  TOI: { color: 'bg-purple-900/40 text-purple-300 border-purple-800', label: 'Test of Implementation' },
  TOE: { color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800', label: 'Test of Effectiveness' },
}

async function getTrackerItems(programmeId) {
  const { data, error } = await supabase.from('workpapers').select('*').eq('programme_id', programmeId).order('created_at', { ascending: true })
  if (error) throw error
  return data
}
async function createTrackerItem(item) {
  const { data, error } = await supabase.from('workpapers').insert(item).select().single()
  if (error) throw error
  return data
}
async function updateTrackerItem(id, updates) {
  const { data, error } = await supabase.from('workpapers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

function NewControlModal({ programmeId, userId, onCreated, onClose }) {
  const [form, setForm] = useState({ title: '', standard: 'ISO 27001', clause_control: '', phase: 'TOD', auditor: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!form.title) return
    setSaving(true)
    try { const item = await createTrackerItem({ ...form, user_id: userId, programme_id: programmeId, status: 'Not Started' }); onCreated(item); onClose() }
    catch (e) { console.error(e) }
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Add Control to Tracker</h2>
          <button onClick={onClose} className="text-steel-400 text-lg">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="block text-xs text-steel-400 mb-1">Control / Workpaper Title *</label><input className="input-field" placeholder="e.g. A.8.8 — Vulnerability Management" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Standard</label><select className="input-field" value={form.standard} onChange={e => setForm(p => ({ ...p, standard: e.target.value }))}>{['ISO 27001', 'ISO 27002', 'ISO 27005', 'ISO 19011'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Clause / Control</label><input className="input-field" placeholder="e.g. A.8.8" value={form.clause_control} onChange={e => setForm(p => ({ ...p, clause_control: e.target.value }))} /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Phase</label><select className="input-field" value={form.phase} onChange={e => setForm(p => ({ ...p, phase: e.target.value }))}><option>TOD</option><option>TOI</option><option>TOE</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Assigned Auditor</label><input className="input-field" placeholder="e.g. Lead Auditor" value={form.auditor} onChange={e => setForm(p => ({ ...p, auditor: e.target.value }))} /></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Notes</label><textarea className="textarea-field" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-2 pt-1"><button onClick={save} disabled={saving || !form.title} className="btn-primary flex-1 justify-center">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Add Control</>}</button><button onClick={onClose} className="btn-secondary">Cancel</button></div>
        </div>
      </div>
    </div>
  )
}

export default function FieldworkTracker() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { activeProgramme } = useProgramme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterPhase, setFilterPhase] = useState('All')
  const [filterStandard, setFilterStandard] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setItems(await getTrackerItems(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try { const updated = await updateTrackerItem(id, { status }); setItems(prev => prev.map(i => i.id === id ? updated : i)); toast('Status updated to ' + status) }
    catch (e) { console.error(e) }
    setUpdatingId(null)
  }

  const filtered = items.filter(i =>
    (filterPhase === 'All' || i.phase === filterPhase) &&
    (filterStandard === 'All' || i.standard === filterStandard)
  )

  const stats = {
    total: items.length,
    complete: items.filter(i => i.status === 'Complete').length,
    inProgress: items.filter(i => i.status === 'In Progress').length,
    exceptions: items.filter(i => i.status === 'Exception').length,
  }
  const pct = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0
  const standards = ['All', ...new Set(items.map(i => i.standard).filter(Boolean))]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="Fieldwork" clause="Tracker" title="Fieldwork Tracker ⭐ Live" description="Track TOD, TOI, and TOE progress per control across all standards. All entries saved to Supabase." badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[{ label: 'Total Controls', value: stats.total, color: 'text-white' }, { label: 'Complete', value: stats.complete, color: 'text-emerald-400' }, { label: 'In Progress', value: stats.inProgress, color: 'text-amber-audit' }, { label: 'Exceptions', value: stats.exceptions, color: 'text-red-400' }].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      {stats.total > 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-steel-400">Overall Completion</span>
            <span className="text-xs font-bold text-white">{pct}%</span>
          </div>
          <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 mt-2">
            {Object.entries(phaseConfig).map(([phase, cfg]) => {
              const phaseItems = items.filter(i => i.phase === phase)
              const phasePct = phaseItems.length > 0 ? Math.round((phaseItems.filter(i => i.status === 'Complete').length / phaseItems.length) * 100) : 0
              return <div key={phase} className="text-xs"><span className={`badge ${cfg.color} mr-1`}>{phase}</span><span className="text-steel-400">{phasePct}%</span></div>
            })}
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: 'Phase', value: filterPhase, setter: setFilterPhase, options: ['All', 'TOD', 'TOI', 'TOE'] },
            { label: 'Standard', value: filterStandard, setter: setFilterStandard, options: standards },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-xs text-steel-400">{f.label}:</span>
              <select className="input-field py-1 text-xs" value={f.value} onChange={e => f.setter(e.target.value)}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <span className="text-xs text-steel-400 ml-auto">{filtered.length} controls</span>
          <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs py-1.5"><Plus size={12} /> Add Control</button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><div className="text-white font-medium mb-1">No programme selected</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-navy-700 bg-navy-800/50">
                {['Ref', 'Control', 'Standard', 'Clause', 'Phase', 'Auditor', 'Status'].map(h => <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-steel-400">{items.length === 0 ? 'No controls tracked yet — click Add Control' : 'No controls match filter'}</td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={item.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                    <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold whitespace-nowrap">{item.workpaper_ref}</td>
                    <td className="py-2.5 px-3 text-white max-w-xs">{item.title}</td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">{item.standard}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-mono whitespace-nowrap">{item.clause_control}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><span className={`badge ${phaseConfig[item.phase]?.color || 'badge-steel'}`}>{item.phase}</span></td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">{item.auditor}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <select className="input-field py-0.5 text-xs w-28" value={item.status} disabled={updatingId === item.id} onChange={e => updateStatus(item.id, e.target.value)}>
                        <option>Not Started</option><option>In Progress</option><option>Complete</option><option>Exception</option><option>N/A</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">{filtered.length} of {items.length} controls — {activeProgramme?.programme_id}</div>
        </div>
      )}
      <div className="mt-6">
        <AIPanel
          title="AI — Generate Workpaper & Test Steps"
          systemPrompt="You are an ISO 19011:2018 audit fieldwork specialist. Generate structured workpaper titles, TOD/TOI/TOE test steps, and evidence checklists for specific ISO 27001/27002 controls. Include: workpaper reference naming, testing objective, testing approach per phase, population definition for TOE, sample size justification, and expected evidence."
          placeholder="e.g. Generate a complete TOE workpaper for A.8.8 Vulnerability Management — monthly scan results for 6-month period"
          contextFields={[
            { id: 'control', label: 'Control / Clause', type: 'text', placeholder: 'e.g. ISO 27002 A.8.8 — Vulnerability Management' },
            { id: 'phase', label: 'Phase', type: 'select', options: ['TOD — Test of Design', 'TOI — Test of Implementation', 'TOE — Test of Effectiveness', 'All phases'] },
            { id: 'stack', label: 'Technology / Tool', type: 'text', placeholder: 'e.g. Qualys, Nessus, AWS Inspector, CrowdStrike' },
          ]}
        />
      </div>

      {showModal && <NewControlModal programmeId={activeProgramme?.id} userId={user?.id} onCreated={item => setItems(prev => [...prev, item])} onClose={() => setShowModal(false)} />}
    </div>
  )
}
