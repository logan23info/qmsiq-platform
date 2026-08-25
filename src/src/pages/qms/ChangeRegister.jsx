import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getChanges, createChange, updateChange, deleteChange } from '../../lib/supabase'
import { Plus, Save, X } from 'lucide-react'

const COLUMNS = [{'key': 'description', 'label': 'Change'}, {'key': 'reason', 'label': 'Reason'}, {'key': 'owner', 'label': 'Owner'}, {'key': 'planned_date', 'label': 'Planned date'}, {'key': 'status', 'label': 'Status'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS consultant. [SOURCE OF TRUTH] Organisation context only. [OUTPUT] JSON array — each: {description, reason, impact, owner, planned_date, status}. Generate 3 typical QMS implementation changes (e.g. process documentation, procedure creation, training). status: Planned. planned_date: next 3-6 months. [FABRICATION GUARD] No specific system or vendor names unless user provides them.`
const REQUIRED = ['description', 'reason']

const EMPTY = Object.fromEntries(['description', 'reason', 'impact', 'owner', 'planned_date', 'status'].map(k => [k, '']))

export default function ChangeRegister() {
  const { activeProgramme } = useProgramme()
  const { isLead, isReviewer, canDelete } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const canEdit = !isReviewer

  useEffect(() => {
    if (!activeProgramme) return
    getChanges(activeProgramme.id).then(setRows)
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme) return
    try {
      if (editing) {
        const updated = await updateChange(editing, form)
        setRows(r => r.map(x => x.id === editing ? updated : x))
      } else {
        const created = await createChange(activeProgramme.id, user.id, form)
        setRows(r => [...r, created])
      }
      toast(editing ? 'Record updated' : 'Record saved')
      cancel()
    } catch(e) { toast(e.message, 'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete this record?')) return
    try { await deleteChange(r.id); setRows(rs => rs.filter(x => x.id !== r.id)); toast('Deleted') }
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
      <PageHeader title="Change Register" subtitle="ISO 9001:2015 Cl.6.3" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.6.3" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation and the QMS changes you are planning to implement..." onGenerated={onGenerated} />}
      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{editing ? 'Edit record' : 'New record'}</span>
            <button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button>
          </div>
                    <div><label className='block text-xs text-steel-400 mb-1'>Change description</label><textarea maxLength={500} value={form['description']} onChange={e => set('description', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Reason for change</label><textarea maxLength={500} value={form['reason']} onChange={e => set('reason', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Impact on QMS integrity</label><textarea maxLength={500} value={form['impact']} onChange={e => set('impact', e.target.value)} className='input-field w-full h-20 text-sm resize-none' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Responsible role</label><input type='text' maxLength={200} value={form['owner']} onChange={e => set('owner', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Planned date</label><input type='date' maxLength={200} value={form['planned_date']} onChange={e => set('planned_date', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Status</label><select value={form['status']} onChange={e => set('status', e.target.value)} className='input-field w-full text-sm'><option>Planned</option>
<option>In Progress</option>
<option>Implemented</option>
<option>Cancelled</option></select></div>
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
