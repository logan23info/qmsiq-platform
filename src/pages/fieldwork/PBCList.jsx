import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle2, Circle, Clock, Loader2, Save, Trash2, Search, X, Filter, FileDown } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { getPBCItems, createPBCItem, updatePBCItem, deletePBCItem } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import AIPanel from '../../components/AIPanel'
import { exportToCSV, PBC_COLUMNS } from '../../utils/exportCSV'
import ConfirmModal from '../../components/ConfirmModal'

const phaseColors = { TOD: 'bg-blue-900/40 text-blue-300', TOI: 'bg-purple-900/40 text-purple-300', TOE: 'bg-emerald-900/40 text-emerald-300', 'PBC Evidence': 'bg-pink-900/40 text-pink-300' }

function NewPBCModal({ programmeId, userId, onCreated, onClose }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ description: '', control_ref: '', phase: 'TOD', domain: 'Governance', priority: 'High', notes: '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!form.description) return
    setSaving(true)
    try { const item = await createPBCItem({ ...form, user_id: userId, programme_id: programmeId, status: 'Not Started' }); onCreated(item); onClose(); toast('PBC item added — ' + item.pbc_ref) }
    catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between"><h2 className="font-semibold text-white">New PBC Evidence Request</h2><button onClick={onClose} className="text-steel-400 text-lg">×</button></div>
        <div className="p-5 space-y-3">
          <div><label className="block text-xs text-steel-400 mb-1">Evidence Required *</label><input className="input-field" placeholder="e.g. IS Awareness Training completion records" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Control Reference</label><input className="input-field" placeholder="e.g. A.6.3" value={form.control_ref} onChange={e => setForm(p => ({ ...p, control_ref: e.target.value }))} /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Phase</label><select className="input-field" value={form.phase} onChange={e => setForm(p => ({ ...p, phase: e.target.value }))}><option>TOD</option><option>TOI</option><option>TOE</option><option>PBC Evidence</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Domain</label><select className="input-field" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}>{['Governance','Planning','Risk','Organizational','People','Physical','Technological','Quality','Improvement'].map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Priority</label><select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Notes</label><textarea className="textarea-field" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex gap-2"><button onClick={save} disabled={saving || !form.description} className="btn-primary flex-1 justify-center">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Add PBC Item</>}</button><button onClick={onClose} className="btn-secondary">Cancel</button></div>
        </div>
      </div>
    </div>
  )
}

export default function PBCList() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterPhase, setFilterPhase] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setItems(await getPBCItems(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      const updated = await updatePBCItem(id, { status, received_date: status === 'Received' ? new Date().toISOString().split('T')[0] : null })
      setItems(prev => prev.map(i => i.id === id ? updated : i))
      toast(status === 'Received' ? 'Evidence marked received ✓' : 'Status updated', 'success')
    } catch (e) { toast('Update failed', 'error') }
    setUpdatingId(null)
  }

  const handleDelete = (id, ref) => {
    setConfirmDel({
      title: `Delete ${ref}?`,
      message: 'This PBC item will be permanently removed.',
      onConfirm: async () => {
        try { await deletePBCItem(id); setItems(p => p.filter(i => i.id !== id)); toast(`${ref} deleted`, 'info') }
        catch (e) { toast('Delete failed', 'error') }
      }
    })
  }

  const filtered = items.filter(i =>
    (filterPhase === 'All' || i.phase === filterPhase) &&
    (filterStatus === 'All' || i.status === filterStatus) &&
    (!search || i.description?.toLowerCase().includes(search.toLowerCase()) || i.control_ref?.toLowerCase().includes(search.toLowerCase()) || i.pbc_ref?.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = { total: items.length, received: items.filter(i => i.status === 'Received').length, pending: items.filter(i => i.status === 'Pending').length, notStarted: items.filter(i => i.status === 'Not Started').length }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="Fieldwork" clause="PBC Master List" title="PBC Master List ⭐ Live" description="Provided By Client evidence tracker — saved to Supabase. Track evidence receipt per phase and domain in real time." badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[{ label: 'Total', value: stats.total, color: 'text-white' }, { label: 'Received', value: stats.received, color: 'text-emerald-400' }, { label: 'Pending', value: stats.pending, color: 'text-amber-audit' }, { label: 'Not Started', value: stats.notStarted, color: 'text-steel-400' }].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input className="input-field pl-8 text-xs py-1.5" placeholder="Search evidence, controls, refs..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-200"><X size={12} /></button>}
          </div>
          {[{ label: 'Phase', value: filterPhase, setter: setFilterPhase, options: ['All','TOD','TOI','TOE','PBC Evidence'] }, { label: 'Status', value: filterStatus, setter: setFilterStatus, options: ['All','Received','Pending','Not Started'] }].map(f => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-xs text-steel-400">{f.label}:</span>
              <select className="input-field py-1 text-xs" value={f.value} onChange={e => f.setter(e.target.value)}>{f.options.map(o => <option key={o}>{o}</option>)}</select>
            </div>
          ))}
          <button onClick={() => exportToCSV(filtered, `PBC_${activeProgramme?.programme_id}`, PBC_COLUMNS)} disabled={filtered.length === 0} className="btn-secondary text-xs py-1.5"><FileDown size={12} /> Export CSV</button>
          <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs py-1.5"><Plus size={12} /> Add PBC Item</button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><div className="text-white font-medium">No programme selected</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-navy-700 bg-navy-800/50">{['Ref','Control','Evidence Required','Phase','Priority','Status',''].map(h => <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-steel-400">{items.length === 0 ? 'No PBC items yet' : 'No items match filter'}</td></tr>
                ) : filtered.map((item, i) => (
                  <tr key={item.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                    <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold">{item.pbc_ref}</td>
                    <td className="py-2.5 px-3 text-steel-300 font-mono">{item.control_ref}</td>
                    <td className="py-2.5 px-3 text-white max-w-xs truncate">{item.description}</td>
                    <td className="py-2.5 px-3"><span className={`badge ${phaseColors[item.phase] || 'badge-steel'}`}>{item.phase}</span></td>
                    <td className="py-2.5 px-3"><span className={`badge ${item.priority === 'High' ? 'bg-red-900/30 text-red-300' : item.priority === 'Medium' ? 'bg-amber-900/30 text-amber-300' : 'badge-steel'}`}>{item.priority}</span></td>
                    <td className="py-2.5 px-3"><select className="input-field py-0.5 text-xs w-28" value={item.status} disabled={updatingId === item.id} onChange={e => updateStatus(item.id, e.target.value)}><option>Not Started</option><option>Pending</option><option>Received</option></select></td>
                    <td className="py-2.5 px-3"><button onClick={() => handleDelete(item.id, item.pbc_ref)} className="text-steel-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">{filtered.length} of {items.length} items</div>
        </div>
      )}
      {confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
      {showModal && <NewPBCModal programmeId={activeProgramme?.id} userId={user?.id} onCreated={item => setItems(p => [...p, item])} onClose={() => setShowModal(false)} />}

      <div className="mt-6">
        <AIPanel
          title="AI — Generate PBC Evidence List"
          systemPrompt="You are an ISO 19011:2018 audit fieldwork specialist. Generate comprehensive PBC (Provided By Client) evidence lists for specific controls, clauses, or audit phases. Include evidence type, format, period covered, and responsible party. Organised by TOD, TOI, and TOE phases."
          placeholder="e.g. Generate a PBC evidence list for ISO 27001 Clause 8 — Operations covering A.8.7, A.8.8, A.8.13 for a 12-month audit period"
          contextFields={[
            { id: 'scope', label: 'Audit Scope / Controls', type: 'text', placeholder: 'e.g. ISO 27002 A.8.1–A.8.8, Technological controls' },
            { id: 'phase', label: 'Phase', type: 'select', options: ['TOD only', 'TOI only', 'TOE only', 'All phases (TOD + TOI + TOE)'] },
            { id: 'period', label: 'Audit Period', type: 'text', placeholder: 'e.g. 1 January – 31 December 2025' },
          ]}
        />
      </div>
    </div>
  )
}
