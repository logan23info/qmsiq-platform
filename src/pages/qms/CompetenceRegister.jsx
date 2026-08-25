import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getCompetence, createCompetence, updateCompetence, deleteCompetence } from '../../lib/supabase'
import { Plus, Save, X } from 'lucide-react'

const COLUMNS = [{'key': 'person_name', 'label': 'Person / role'}, {'key': 'role', 'label': 'Function'}, {'key': 'competence_required', 'label': 'Competence required'}, {'key': 'evidence', 'label': 'Evidence type'}, {'key': 'gap', 'label': 'Gap'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON array only — each object: {"person_name":"role title only — no real names e.g. Quality Manager","role":"function/department","competence_required":"what knowledge and skills are needed","evidence":"type of evidence e.g. certificate, qualification, experience record — not fabricated credentials","gap":"leave blank if unknown","action":"leave blank if unknown","review_date":"ISO date 12 months from today"} Generate minimum 4 key roles. [FABRICATION GUARD] No real names. Evidence field = type of evidence only, not fabricated qualifications.`
const REQUIRED = ['person_name', 'role', 'competence_required']

const EMPTY = Object.fromEntries(['person_name', 'role', 'competence_required', 'evidence', 'gap', 'action', 'review_date'].map(k => [k, '']))

export default function CompetenceRegister() {
  const { activeProgramme } = useProgramme()
  const { isLead, isReviewer, canDelete } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer

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
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.7.2" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — key roles involved in QMS, industry, any known skill gaps..." onGenerated={onGenerated} />}
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
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isLead} />
    </div>
  )
}
