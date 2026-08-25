import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getObjectives, createObjective, updateObjective, deleteObjective } from '../../lib/supabase'
import { Plus, Save, X } from 'lucide-react'

const COLUMNS = [{'key': 'objective', 'label': 'Objective'}, {'key': 'measure', 'label': 'Measure'}, {'key': 'target', 'label': 'Target'}, {'key': 'owner', 'label': 'Owner'}, {'key': 'due_date', 'label': 'Due date'}, {'key': 'status', 'label': 'Status'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON array only — each object: {"objective":"SMART objective statement","measure":"how it will be measured","target":"[SAMPLE X%] — never invent real numbers","owner":"responsible role title","due_date":"ISO date 12 months from today","process_area":"relevant process","status":"On Track"} Generate minimum 4 objectives covering: customer satisfaction, product quality, process efficiency, continual improvement. [FABRICATION GUARD] Targets MUST use [SAMPLE X%] placeholder. No real percentages or financial figures.`
const REQUIRED = ['objective', 'measure', 'target', 'owner']

const EMPTY = Object.fromEntries(['objective', 'measure', 'target', 'owner', 'process_area', 'due_date', 'status'].map(k => [k, '']))

export default function ObjectivesRegister() {
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
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.6.2" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — industry, main processes, current quality challenges..." onGenerated={onGenerated} />}
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
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isLead} />
    </div>
  )
}
