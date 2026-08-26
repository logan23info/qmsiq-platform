import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useNavigate } from 'react-router-dom'
import { useQMSContext, NEXT_MODULE } from '../../hooks/useQMSContext'
import { ArrowRight } from 'lucide-react'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getObjectives, createObjective, updateObjective, deleteObjective } from '../../lib/supabase'
import { Plus, Save, X, Download } from 'lucide-react'

const COLUMNS = [{'key': 'objective', 'label': 'Objective'}, {'key': 'measure', 'label': 'Measure'}, {'key': 'target', 'label': 'Target'}, {'key': 'owner', 'label': 'Owner'}, {'key': 'due_date', 'label': 'Due date'}, {'key': 'status', 'label': 'Status'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON array only — each object: {"objective":"SMART objective statement","measure":"how it will be measured","target":"[SAMPLE X%] — never invent real numbers","owner":"responsible role title","due_date":"ISO date 12 months from today","process_area":"relevant process","status":"On Track"} Generate minimum 4 objectives covering: customer satisfaction, product quality, process efficiency, continual improvement. [FABRICATION GUARD] Targets MUST use [SAMPLE X%] placeholder. No real percentages or financial figures.`
const REQUIRED = ['objective', 'measure', 'target', 'owner']

const EMPTY = Object.fromEntries(['objective', 'measure', 'target', 'owner', 'process_area', 'due_date', 'status'].map(k => [k, '']))

export default function ObjectivesRegister() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { priorContext, priorLoading } = useQMSContext('ISO 9001:2015 Cl.6.2', activeProgramme?.id)
  const nextModule = NEXT_MODULE['ISO 9001:2015 Cl.6.2']
  const { isLead, isReviewer, canDelete } = useTeam()
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

  const saveAllPending = async () => {
    const pending = rows.filter(r => r._pending)
    if (!pending.length) return
    let saved = 0, failed = 0
    const updates = [...rows]
    for (const r of pending) {
      try {
        const { _pending, id: _id, ...data } = r
        const created = await createObjective(activeProgramme.id, user.id, data)
        const idx = updates.findIndex(x => x.id === r.id)
        if (idx !== -1) updates[idx] = created
        saved++
      } catch { failed++ }
    }
    setRows([...updates])
    toast(failed ? `Saved ${saved}, ${failed} failed` : `${saved} draft${saved > 1 ? 's' : ''} saved`)
  }

  const exportXLSX = async () => {
    const { exportObjectivesXLSX } = await import('../../lib/exportXLSX')
    exportObjectivesXLSX(rows, activeProgramme?.name || activeProgramme?.programme_id)
  }

  useEffect(() => {
    if (!activeProgramme) return
    getObjectives(activeProgramme.id).then(setRows)
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme) return
    try {
      if (editing) {
        const updated = await updateObjective(editing, form)
        setRows(r => r.map(x => x.id === editing ? updated : x))
      } else {
        const created = await createObjective(activeProgramme.id, user.id, form)
        setRows(r => [...r, created])
      }
      toast(editing ? 'Record updated' : 'Record saved')
      cancel()
    } catch(e) { toast(e.message, 'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete this record?')) return
    try { await deleteObjective(r.id); setRows(rs => rs.filter(x => x.id !== r.id)); toast('Deleted') }
    catch(e) { toast(e.message, 'error') }
  }

  const onGenerated = (records) => {
    setRows(existing => {
      const next = [...existing]
      records.forEach(r => next.push({ ...r, id: crypto.randomUUID(), _pending: true }))
      return next
    })
  }

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-4xl">
      <PageHeader title="Quality Objectives" subtitle="ISO 9001:2015 Cl.6.2" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.6.2" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — industry, main processes, current quality challenges..." onGenerated={onGenerated} priorContext={priorContext} />}
      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{editing ? 'Edit record' : 'New record'}</span>
            <button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button>
          </div>
                    <div><label className='block text-xs text-steel-400 mb-1'>Objective statement</label><textarea maxLength={500} value={form['objective']} onChange={e => set('objective', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>How it will be measured</label><input type='text' maxLength={200} value={form['measure']} onChange={e => set('measure', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Target value (use [SAMPLE] for numbers)</label><input type='text' maxLength={200} value={form['target']} onChange={e => set('target', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Responsible role</label><input type='text' maxLength={200} value={form['owner']} onChange={e => set('owner', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Process area</label><input type='text' maxLength={200} value={form['process_area']} onChange={e => set('process_area', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Due date</label><input type='date' maxLength={200} value={form['due_date']} onChange={e => set('due_date', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Status</label><select value={form['status']} onChange={e => set('status', e.target.value)} className='input-field w-full text-sm'><option>On Track</option>
<option>At Risk</option>
<option>Achieved</option>
<option>Missed</option></select></div>
          <button onClick={save} className="btn-primary text-sm"><Save size={13} /> Save</button>
        </div>
      )}
      {canEdit && !showForm && (
        <button onClick={() => setShowForm(true)} className="btn-secondary text-sm mb-4"><Plus size={13} /> Add record</button>
      )}
      {hasPending && (
        <div className="flex items-center justify-between bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3 mb-3">
          <span className="text-xs text-amber-400">{rows.filter(r=>r._pending).length} unsaved AI draft{rows.filter(r=>r._pending).length > 1 ? 's' : ''} — save before leaving this page</span>
          <button onClick={saveAllPending} className="btn-primary text-xs flex items-center gap-1.5">
            <Save size={12} /> Save all drafts
          </button>
        </div>
      )}
      {rows.filter(r=>!r._pending).length > 0 && (
        <div className="flex justify-end mb-2">
          <button onClick={exportXLSX} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download size={12} /> Export XLSX
          </button>
        </div>
      )}
      {nextModule && (
        <div className="flex justify-end mb-3">
          <button onClick={() => navigate(nextModule.path)} className="btn-secondary text-sm flex items-center gap-1.5">
            Next: {nextModule.label} <ArrowRight size={13} />
          </button>
        </div>
      )}
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isLead} />
    </div>
  )
}
