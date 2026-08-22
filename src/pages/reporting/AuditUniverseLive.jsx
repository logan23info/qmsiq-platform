import { useState, useEffect, useCallback } from 'react'
import { Plus, Globe, Loader2, Save, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { supabase } from '../../lib/supabase'
import AIPanel from '../../components/AIPanel'
import { useToast } from '../../components/Toast'

const riskColors = { High: 'bg-red-900/30 text-red-300', Medium: 'bg-amber-900/30 text-amber-300', Low: 'bg-navy-700 text-steel-400' }

async function getUniverseEntries(programmeId) {
  const { data, error } = await supabase.from('pbc_items').select('*').eq('programme_id', programmeId).eq('domain', 'AuditUniverse').order('created_at', { ascending: true })
  if (error) throw error
  return data
}
async function createUniverseEntry(entry) {
  const { data, error } = await supabase.from('pbc_items').insert({ ...entry, domain: 'AuditUniverse' }).select().single()
  if (error) throw error
  return data
}
async function updateUniverseEntry(id, updates) {
  const { data, error } = await supabase.from('pbc_items').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

function NewEntryModal({ programmeId, userId, onCreated, onClose }) {
  const [form, setForm] = useState({ description: '', control_ref: '', priority: 'High', status: 'Not Started', notes: '', received_date: '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!form.description) return
    setSaving(true)
    try { const e = await createUniverseEntry({ user_id: userId, programme_id: programmeId, description: form.description, control_ref: form.control_ref, priority: form.priority, status: form.status, notes: form.notes, received_date: form.received_date || null, pbc_ref: 'AU-TMP', phase: form.status }); onCreated(e); onClose() }
    catch (e) { console.error(e) }
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Add Audit Area</h2>
          <button onClick={onClose} className="text-steel-400 hover:text-steel-200 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="block text-xs text-steel-400 mb-1">Audit Area *</label><input className="input-field" placeholder="e.g. ISO 27001 — Full ISMS" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Standards / Scope</label><input className="input-field" placeholder="e.g. ISO 27001" value={form.control_ref} onChange={e => setForm(p => ({ ...p, control_ref: e.target.value }))} /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Risk Level</label><select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}><option>High</option><option>Medium</option><option>Low</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Status</label><select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option>Not Started</option><option>Scheduled</option><option>In Progress</option><option>Complete</option><option>Overdue</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Next Audit Date</label><input className="input-field" type="date" value={form.received_date} onChange={e => setForm(p => ({ ...p, received_date: e.target.value }))} /></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Notes</label><textarea className="textarea-field" rows={2} placeholder="e.g. Annual, 2 auditors, 5 days" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-2"><button onClick={save} disabled={saving || !form.description} className="btn-primary flex-1 justify-center">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Add</>}</button><button onClick={onClose} className="btn-secondary">Cancel</button></div>
        </div>
      </div>
    </div>
  )
}

export default function AuditUniverseLive() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setEntries(await getUniverseEntries(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try { const updated = await updateUniverseEntry(id, { status }); setEntries(prev => prev.map(e => e.id === id ? updated : e)); toast('Status updated to ' + status) }
    catch (e) { console.error(e) }
    setUpdatingId(null)
  }

  const stats = { total: entries.length, high: entries.filter(e => e.priority === 'High').length, overdue: entries.filter(e => e.status === 'Overdue').length, complete: entries.filter(e => e.status === 'Complete').length }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="Audit Governance" clause="Audit Universe" title="Audit Universe & Annual Plan ⭐ Live" description="Risk-ranked audit universe permanently saved to your audit programme. Track audit areas, risk levels, schedules, and completion status." badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[{ label: 'Audit Areas', value: stats.total, color: 'text-white' }, { label: 'High Risk', value: stats.high, color: 'text-red-400' }, { label: 'Overdue', value: stats.overdue, color: 'text-red-400' }, { label: 'Complete', value: stats.complete, color: 'text-emerald-400' }].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs"><Plus size={13} /> Add Audit Area</button>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><Globe size={28} className="text-steel-500 mx-auto mb-3" /><div className="text-white font-medium mb-1">No programme selected</div><div className="text-xs text-steel-400">Select a programme from the header</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto mb-2" /></div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12"><Globe size={28} className="text-steel-500 mx-auto mb-3" /><div className="text-white font-medium mb-1">No audit areas yet</div><button onClick={() => setShowModal(true)} className="btn-primary text-xs mt-3"><Plus size={12} /> Add First</button></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-navy-700 bg-navy-800/50">{['Audit Area', 'Standards', 'Risk', 'Next Audit', 'Notes', 'Status'].map(h => <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                    <td className="py-2.5 px-3 text-white font-medium">{e.description}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-mono">{e.control_ref}</td>
                    <td className="py-2.5 px-3"><span className={`badge text-xs ${riskColors[e.priority]}`}>{e.priority}</span></td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">{e.received_date || '—'}</td>
                    <td className="py-2.5 px-3 text-steel-400 max-w-xs truncate">{e.notes}</td>
                    <td className="py-2.5 px-3"><select className="input-field py-0.5 text-xs w-28" value={e.status} disabled={updatingId === e.id} onChange={ev => updateStatus(e.id, ev.target.value)}><option>Not Started</option><option>Scheduled</option><option>In Progress</option><option>Complete</option><option>Overdue</option></select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">{entries.length} area{entries.length !== 1 ? 's' : ''} — {activeProgramme?.programme_id}</div>
        </div>
      )}
      {showModal && <NewEntryModal programmeId={activeProgramme?.id} userId={user?.id} onCreated={e => setEntries(prev => [...prev, e])} onClose={() => setShowModal(false)} />}

      <div className="mt-6">
        <AIPanel
          title="AI — Generate Annual Audit Plan"
          systemPrompt="You are an ISO 19011:2018 audit programme specialist. Generate detailed annual audit plans, audit schedules, resource plans, and individual audit mandates. Align to ISO 19011 Clause 5 programme management requirements. Include risk-based prioritisation."
          placeholder="e.g. Generate a 12-month risk-based audit schedule for an ISO 27001 certified fintech with 8 audit areas"
          contextFields={[
            { id: 'areas', label: 'Audit Areas', type: 'textarea', placeholder: 'List your audit areas from the universe above...' },
            { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Annual Audit Schedule', 'Risk-Based Audit Plan', 'Individual Audit Mandate', 'Resource Allocation Plan', 'Audit Programme Objectives'] },
            { id: 'resources', label: 'Available Resources', type: 'text', placeholder: 'e.g. 2 auditors, 60 audit days per year' },
          ]}
        />
      </div>
    </div>
  )
}
