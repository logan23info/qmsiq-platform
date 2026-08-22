import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2, CheckCircle2, Clock, Edit2, Save, X, Trash2, FileDown } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useProgramme } from '../../context/ProgrammeContext'
import { useToast } from '../../components/Toast'
import { exportToCSV, WORKPAPER_COLUMNS } from '../../utils/exportCSV'
import ConfirmModal from '../../components/ConfirmModal'
import { getWorkpapers, updateWorkpaper, deleteWorkpaperRecord } from '../../lib/supabase'

const statusColors = {
  'Signed Off': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  'In Review': 'bg-amber-900/40 text-amber-300 border-amber-700',
  'Draft': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'Not Started': 'bg-navy-700 text-steel-400 border-navy-600',
}
const phaseColors = { TOD: 'bg-blue-900/40 text-blue-300', TOI: 'bg-purple-900/40 text-purple-300', TOE: 'bg-emerald-900/40 text-emerald-300' }


function SignOffModal({ wp, onSignOff, onClose }) {
  const { toast } = useToast()
  const [auditor, setAuditor] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!auditor) return
    setSaving(true)
    try {
      const updated = await updateWorkpaper(wp.id, {
        status: 'Signed Off',
        auditor,
        notes: wp.notes ? `${wp.notes} | Signed off by ${auditor} on ${date}` : `Signed off by ${auditor} on ${date}`,
      })
      onSignOff(updated)
      toast(`${wp.workpaper_ref} signed off by ${auditor}`)
      onClose()
    } catch (e) { toast('Sign-off failed', 'error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-sm">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Sign Off {wp.workpaper_ref}</h2>
          <button onClick={onClose} className="text-steel-400 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-navy-800 rounded-lg p-3 text-xs text-steel-300">{wp.title}</div>
          <div>
            <label className="block text-xs text-steel-400 mb-1">Auditor Name *</label>
            <input className="input-field" placeholder="e.g. Logan — Lead Auditor" value={auditor} onChange={e => setAuditor(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-steel-400 mb-1">Sign-Off Date</label>
            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !auditor} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : '✓ Sign Off'}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkpaperIndex() {
  const { activeProgramme } = useProgramme()
  const [workpapers, setWorkpapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterPhase, setFilterPhase] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [signoffModal, setSignoffModal] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setWorkpapers(await getWorkpapers(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const startEdit = (wp) => { setEditingId(wp.id); setEditForm({ status: wp.status, auditor: wp.auditor || '', notes: wp.notes || '' }) }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      const updated = await updateWorkpaper(id, editForm)
      setWorkpapers(prev => prev.map(w => w.id === id ? updated : w))
      setEditingId(null)
      toast('Workpaper updated')
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const filtered = workpapers.filter(w =>
    (filterPhase === 'All' || w.phase === filterPhase) &&
    (filterStatus === 'All' || w.status === filterStatus)
  )

  const stats = {
    total: workpapers.length,
    signedOff: workpapers.filter(w => w.status === 'Signed Off').length,
    inReview: workpapers.filter(w => w.status === 'In Review').length,
    draft: workpapers.filter(w => w.status === 'Draft').length,
  }
  const pct = stats.total > 0 ? Math.round((stats.signedOff / stats.total) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="Fieldwork" clause="Workpaper Index" title="Workpaper Index ⭐ Live" description="Complete index of all workpapers in your active audit programme — live from Supabase. Update status and auditor inline." badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[{ label: 'Total', value: stats.total, color: 'text-white' }, { label: 'Signed Off', value: stats.signedOff, color: 'text-emerald-400' }, { label: 'In Review', value: stats.inReview, color: 'text-amber-audit' }, { label: 'Draft', value: stats.draft, color: 'text-blue-400' }].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      {stats.total > 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-steel-400">Sign-Off Completion</span><span className="text-xs font-bold text-white">{pct}%</span></div>
          <div className="h-2 bg-navy-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {[
            { label: 'Phase', value: filterPhase, setter: setFilterPhase, options: ['All', 'Pre-Audit', 'TOD', 'TOI', 'TOE', 'Finding', 'Meeting', 'Report'] },
            { label: 'Status', value: filterStatus, setter: setFilterStatus, options: ['All', 'Signed Off', 'In Review', 'Draft', 'Not Started'] },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-xs text-steel-400">{f.label}:</span>
              <select className="input-field py-1 text-xs" value={f.value} onChange={e => f.setter(e.target.value)}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <span className="text-xs text-steel-400 ml-auto">{filtered.length} workpapers</span>
          <button onClick={() => exportToCSV(filtered, `Workpapers_${activeProgramme?.programme_id}`, WORKPAPER_COLUMNS)} disabled={filtered.length === 0} className="btn-secondary text-xs py-1.5"><FileDown size={12} /> Export CSV</button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><FileText size={28} className="text-steel-500 mx-auto mb-3" /><div className="text-white font-medium mb-1">No programme selected</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-navy-700 bg-navy-800/50">
                {['Ref', 'Title', 'Standard', 'Clause', 'Phase', 'Auditor', 'Status', ''].map(h => <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-steel-400">No workpapers yet — upload files in Workpaper Library or generate AI artifacts</td></tr>
                ) : filtered.map((wp, i) => (
                  <tr key={wp.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                    <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold whitespace-nowrap">{wp.workpaper_ref}</td>
                    <td className="py-2.5 px-3 text-white max-w-xs truncate">{wp.title}</td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">{wp.standard}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-mono whitespace-nowrap">{wp.clause_control}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><span className={`badge text-xs ${phaseColors[wp.phase] || 'badge-steel'}`}>{wp.phase}</span></td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">
                      {editingId === wp.id ? <input className="input-field py-0.5 text-xs w-28" value={editForm.auditor} onChange={e => setEditForm(p => ({ ...p, auditor: e.target.value }))} /> : wp.auditor || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {editingId === wp.id
                        ? <select className="input-field py-0.5 text-xs w-28" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                          <option>Draft</option><option>In Review</option><option>Signed Off</option><option>Not Started</option>
                        </select>
                        : <span className={`badge border text-xs ${statusColors[wp.status] || 'badge-steel'}`}>{wp.status}</span>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {editingId === wp.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(wp.id)} disabled={saving} className="text-emerald-400 hover:text-emerald-300"><Save size={13} /></button>
                          <button onClick={() => setEditingId(null)} className="text-steel-400 hover:text-steel-200"><X size={13} /></button>
                        </div>
                      ) : <button onClick={() => startEdit(wp)} className="text-steel-400 hover:text-amber-audit transition-colors"><Edit2 size={13} /></button>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button onClick={() => setConfirmDel({ title: `Delete ${wp.workpaper_ref}?`, message: `"${wp.title}" will be permanently deleted.`, onConfirm: async () => { await deleteWorkpaperRecord(wp.id); setWorkpapers(prev => prev.filter(w => w.id !== wp.id)); toast(`${wp.workpaper_ref} deleted`, 'info') } })} className="text-steel-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">{filtered.length} of {workpapers.length} workpapers — {activeProgramme?.programme_id}</div>
        </div>
      )}
      {signoffModal && <SignOffModal wp={signoffModal} onSignOff={u => setWorkpapers(prev => prev.map(w => w.id === u.id ? u : w))} onClose={() => setSignoffModal(null)} />
      }{confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
    </div>
  )
}
