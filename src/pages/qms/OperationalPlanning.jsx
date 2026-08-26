import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { useQMSContext, NEXT_MODULE } from '../../hooks/useQMSContext'
import { getOperational, createOperational, updateOperational, deleteOperational } from '../../lib/supabase'
import { Plus, Save, X, Download, ArrowRight } from 'lucide-react'

const CLAUSE = 'ISO 9001:2015 Cl.8.1'
const SYSTEM_PROMPT = '[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the organisation context and prior context provided. [DETERMINISM] Return INSUFFICIENT_DATA if context is too vague. [OUTPUT RULES] Respond with a valid JSON array ONLY. Start with [ end with ]. No markdown. No preamble. Each object: {"process_name":"name of the key operational process","description":"what the process does","inputs":"what triggers or feeds this process","outputs":"what this process produces","controls":"quality controls applied","owner":"responsible role","risk":"key risk if process fails","sector_note":"why this process is critical for this industry"} Generate 5-7 key operational processes relevant to the described organisation. [FABRICATION GUARD] No invented process names. Base on described products and industry only.'

const COLUMNS = [
  { key: 'process_name', label: 'Process' },
  { key: 'description', label: 'Description' },
  { key: 'owner', label: 'Owner' },
  { key: 'controls', label: 'Controls' },
  { key: 'risk', label: 'Key risk' },
  { key: 'status', label: 'Status' },
]

const EMPTY = { process_name: '', description: '', inputs: '', outputs: '', controls: '', owner: '', risk: '', sector_note: '', status: 'Draft' }

export default function OperationalPlanning() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { priorContext, priorLoading, orgProfile } = useQMSContext(CLAUSE, activeProgramme?.id)
  const nextModule = NEXT_MODULE[CLAUSE]
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer
  const hasPending = rows.some(r => r._pending)

  useEffect(() => {
    const onUnload = (e) => { if (hasPending) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [hasPending])

  useEffect(() => {
    if (!activeProgramme) return
    getOperational(activeProgramme.id).then(setRows).catch(() => setRows([]))
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme || !form.process_name.trim()) { toast('Process name is required', 'error'); return }
    try {
      if (editing) {
        const { id: _id, programme_id: _p, user_id: _u, created_at: _c, ...clean } = form
        const updated = await updateOperational(editing, clean)
        setRows(r => r.map(x => x.id === editing ? updated : x))
      } else {
        const { id: _id, programme_id: _p, user_id: _u, created_at: _c, ...clean } = form
        const created = await createOperational(activeProgramme.id, user.id, clean)
        setRows(r => [...r, created])
      }
      toast(editing ? 'Process updated' : 'Process saved'); cancel()
    } catch (e) { toast(e.message, 'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete this process?')) return
    try { await deleteOperational(r.id); setRows(rs => rs.filter(x => x.id !== r.id)); toast('Deleted') }
    catch (e) { toast(e.message, 'error') }
  }

  const saveAllPending = async () => {
    const pending = rows.filter(r => r._pending)
    let saved = 0, failed = 0
    const updates = [...rows]
    for (const r of pending) {
      try {
        const { _pending, id: _id, ...data } = r
        const created = await createOperational(activeProgramme.id, user.id, data)
        const idx = updates.findIndex(x => x.id === r.id)
        if (idx !== -1) updates[idx] = created
        saved++
      } catch { failed++ }
    }
    setRows([...updates])
    toast(failed ? `Saved ${saved}, ${failed} failed` : `${saved} draft${saved > 1 ? 's' : ''} saved`)
  }

  const onGenerated = (records) => {
    setRows(existing => [...existing, ...records.map(r => ({ ...r, id: crypto.randomUUID(), _pending: true }))])
  }

  const exportXLSX = async () => {
    const { exportOperationalXLSX } = await import('../../lib/exportXLSX')
    exportOperationalXLSX(rows, activeProgramme?.name || activeProgramme?.programme_id)
  }

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-4xl">
      <PageHeader title="Operational Planning" subtitle="ISO 9001:2015 Cl.8.1 — Key process register" />

      {canEdit && <QMSAIGenerator clause={CLAUSE} systemPrompt={SYSTEM_PROMPT} requiredFields={['process_name', 'description']} onGenerated={onGenerated} priorContext={priorContext} orgProfile={orgProfile} />}

      {hasPending && (
        <div className="flex items-center justify-between bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3 mb-3">
          <span className="text-xs text-amber-400">{rows.filter(r => r._pending).length} unsaved drafts</span>
          <button onClick={saveAllPending} className="btn-primary text-xs flex items-center gap-1.5"><Save size={12} /> Save all drafts</button>
        </div>
      )}

      {nextModule && (
        <div className="flex justify-end mb-2">
          <button onClick={() => navigate(nextModule.path)} className="btn-secondary text-sm flex items-center gap-1.5">
            Next: {nextModule.label} <ArrowRight size={13} />
          </button>
        </div>
      )}

      {rows.filter(r => !r._pending).length > 0 && (
        <div className="flex justify-end mb-2">
          <button onClick={exportXLSX} className="btn-secondary text-xs flex items-center gap-1.5"><Download size={12} /> Export XLSX</button>
        </div>
      )}

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">{editing ? 'Edit process' : 'New process'}</span>
            <button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Process name *</label><input maxLength={200} value={form.process_name} onChange={e => set('process_name', e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Owner (role)</label><input maxLength={200} value={form.owner} onChange={e => set('owner', e.target.value)} className="input-field w-full text-sm" /></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Description</label><textarea maxLength={500} value={form.description} onChange={e => set('description', e.target.value)} className="input-field w-full h-16 text-sm resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Inputs</label><textarea maxLength={300} value={form.inputs} onChange={e => set('inputs', e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Outputs</label><textarea maxLength={300} value={form.outputs} onChange={e => set('outputs', e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Quality controls</label><textarea maxLength={300} value={form.controls} onChange={e => set('controls', e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Key risk if process fails</label><textarea maxLength={300} value={form.risk} onChange={e => set('risk', e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field text-sm">
              <option>Draft</option><option>Active</option><option>Under Review</option><option>Retired</option>
            </select>
          </div>
          <button onClick={save} className="btn-primary text-sm"><Save size={13} /> Save</button>
        </div>
      )}

      {canEdit && !showForm && (
        <button onClick={() => setShowForm(true)} className="btn-secondary text-sm mb-4"><Plus size={13} /> Add process</button>
      )}

      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isOwner || !isReviewer} />
    </div>
  )
}
