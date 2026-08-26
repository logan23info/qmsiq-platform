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
import { getCompetence, createCompetence, updateCompetence, deleteCompetence } from '../../lib/supabase'
import { Plus, Save, X, Download } from 'lucide-react'

const COLUMNS = [{'key': 'person_name', 'label': 'Person / role'}, {'key': 'role', 'label': 'Function'}, {'key': 'competence_required', 'label': 'Competence required'}, {'key': 'evidence', 'label': 'Evidence type'}, {'key': 'gap', 'label': 'Gap'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON array only — each object: {"person_name":"role title only — no real names e.g. Quality Manager","role":"function/department","competence_required":"what knowledge and skills are needed","evidence":"type of evidence e.g. certificate, qualification, experience record — not fabricated credentials","gap":"leave blank if unknown","action":"leave blank if unknown","review_date":"ISO date 12 months from today"} Generate minimum 4 key roles. [FABRICATION GUARD] No real names. Evidence field = type of evidence only, not fabricated qualifications.`
const REQUIRED = ['person_name', 'role', 'competence_required']

const EMPTY = Object.fromEntries(['person_name', 'role', 'competence_required', 'evidence', 'gap', 'action', 'review_date'].map(k => [k, '']))

export default function CompetenceRegister() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { priorContext, priorLoading } = useQMSContext('ISO 9001:2015 Cl.7.2', activeProgramme?.id)
  const nextModule = NEXT_MODULE['ISO 9001:2015 Cl.7.2']
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
        const created = await createCompetence(activeProgramme.id, user.id, data)
        const idx = updates.findIndex(x => x.id === r.id)
        if (idx !== -1) updates[idx] = created
        saved++
      } catch { failed++ }
    }
    setRows([...updates])
    toast(failed ? `Saved ${saved}, ${failed} failed` : `${saved} draft${saved > 1 ? 's' : ''} saved`)
  }

  const exportXLSX = async () => {
    const { exportCompetenceXLSX } = await import('../../lib/exportXLSX')
    exportCompetenceXLSX(rows, activeProgramme?.name || activeProgramme?.programme_id)
  }

  useEffect(() => {
    if (!activeProgramme) return
    getCompetence(activeProgramme.id).then(setRows)
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme) return
    try {
      if (editing) {
        const updated = await updateCompetence(editing, form)
        setRows(r => r.map(x => x.id === editing ? updated : x))
      } else {
        const created = await createCompetence(activeProgramme.id, user.id, form)
        setRows(r => [...r, created])
      }
      toast(editing ? 'Record updated' : 'Record saved')
      cancel()
    } catch(e) { toast(e.message, 'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete this record?')) return
    try { await deleteCompetence(r.id); setRows(rs => rs.filter(x => x.id !== r.id)); toast('Deleted') }
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
      <PageHeader title="Competence Register" subtitle="ISO 9001:2015 Cl.7.2" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.7.2" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — key roles involved in QMS, industry, any known skill gaps..." onGenerated={onGenerated} priorContext={priorContext} />}
      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{editing ? 'Edit record' : 'New record'}</span>
            <button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button>
          </div>
                    <div><label className='block text-xs text-steel-400 mb-1'>Person name or role title</label><input type='text' maxLength={200} value={form['person_name']} onChange={e => set('person_name', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Function / job title</label><input type='text' maxLength={200} value={form['role']} onChange={e => set('role', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Competence required</label><textarea maxLength={500} value={form['competence_required']} onChange={e => set('competence_required', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Evidence of competence</label><textarea maxLength={500} value={form['evidence']} onChange={e => set('evidence', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Competence gap (if any)</label><textarea maxLength={500} value={form['gap']} onChange={e => set('gap', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Action to close gap</label><textarea maxLength={500} value={form['action']} onChange={e => set('action', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Review date</label><input type='date' maxLength={200} value={form['review_date']} onChange={e => set('review_date', e.target.value)} className='input-field w-full text-sm' /></div>
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
