import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../../lib/supabase'
import { Plus, Save, X, Download } from 'lucide-react'

const COLUMNS = [{'key': 'doc_ref', 'label': 'Ref'}, {'key': 'title', 'label': 'Title'}, {'key': 'doc_type', 'label': 'Type'}, {'key': 'version', 'label': 'Ver.'}, {'key': 'owner', 'label': 'Owner'}, {'key': 'status', 'label': 'Status'}]
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON array only — each object: {"doc_ref":"sequential ref e.g. QP-001 for procedures, QF-001 for forms","title":"document title","doc_type":"one of: Procedure|Policy|Work Instruction|Form|Record|Other","version":"1.0 DRAFT","owner":"role title","review_date":"ISO date 12 months from today","status":"Draft"} Generate the mandatory ISO 9001:2015 documented information list plus common industry documents. [FABRICATION GUARD] Document structure only — no document content. No invented regulatory references unless user provided them.`
const REQUIRED = ['doc_ref', 'title', 'doc_type']

const EMPTY = Object.fromEntries(['doc_ref', 'title', 'doc_type', 'version', 'owner', 'review_date', 'status'].map(k => [k, '']))

export default function DocumentRegister() {
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
        const created = await createDocument(activeProgramme.id, user.id, data)
        const idx = updates.findIndex(x => x.id === r.id)
        if (idx !== -1) updates[idx] = created
        saved++
      } catch { failed++ }
    }
    setRows([...updates])
    toast(failed ? `Saved ${saved}, ${failed} failed` : `${saved} draft${saved > 1 ? 's' : ''} saved`)
  }

  const exportXLSX = async () => {
    const { exportDocumentsXLSX } = await import('../../lib/exportXLSX')
    exportDocumentsXLSX(rows, activeProgramme?.name || activeProgramme?.programme_id)
  }

  useEffect(() => {
    if (!activeProgramme) return
    getDocuments(activeProgramme.id).then(setRows)
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme) return
    try {
      if (editing) {
        const updated = await updateDocument(editing, form)
        setRows(r => r.map(x => x.id === editing ? updated : x))
      } else {
        const created = await createDocument(activeProgramme.id, user.id, form)
        setRows(r => [...r, created])
      }
      toast(editing ? 'Record updated' : 'Record saved')
      cancel()
    } catch(e) { toast(e.message, 'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete this record?')) return
    try { await deleteDocument(r.id); setRows(rs => rs.filter(x => x.id !== r.id)); toast('Deleted') }
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
      <PageHeader title="Document Register" subtitle="ISO 9001:2015 Cl.7.5" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.7.5" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — industry, size, products/services, any existing documents..." onGenerated={onGenerated} />}
      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{editing ? 'Edit record' : 'New record'}</span>
            <button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button>
          </div>
                    <div><label className='block text-xs text-steel-400 mb-1'>Document reference (e.g. QP-001)</label><input type='text' maxLength={200} value={form['doc_ref']} onChange={e => set('doc_ref', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Document title</label><input type='text' maxLength={200} value={form['title']} onChange={e => set('title', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Type</label><select value={form['doc_type']} onChange={e => set('doc_type', e.target.value)} className='input-field w-full text-sm'><option>Procedure</option>
<option>Policy</option>
<option>Work Instruction</option>
<option>Form</option>
<option>Record</option>
<option>Other</option></select></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Version</label><input type='text' maxLength={200} value={form['version']} onChange={e => set('version', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Document owner (role)</label><input type='text' maxLength={200} value={form['owner']} onChange={e => set('owner', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Review date</label><input type='date' maxLength={200} value={form['review_date']} onChange={e => set('review_date', e.target.value)} className='input-field w-full text-sm' /></div>
          <div><label className='block text-xs text-steel-400 mb-1'>Status</label><select value={form['status']} onChange={e => set('status', e.target.value)} className='input-field w-full text-sm'><option>Draft</option>
<option>Approved</option>
<option>Obsolete</option></select></div>
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
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isLead} />
    </div>
  )
}
