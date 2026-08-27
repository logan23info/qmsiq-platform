import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { useQMSContext } from '../../hooks/useQMSContext'
import { getImprovements, createImprovement, updateImprovement, deleteImprovement } from '../../lib/supabase'
import { Plus, Save, X, Download } from 'lucide-react'

const CLAUSE = 'ISO 9001:2015 Cl.10.3'
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS consultant. [SOURCE OF TRUTH] Organisation and prior context only. [DETERMINISM] Return INSUFFICIENT_DATA if context too vague. [OUTPUT] JSON array only. Start with [ end with ]. No preamble. Each object: {"improvement_ref":"e.g. CI-001","title":"improvement title","source":"one of: Internal Audit|Management Review|Customer Feedback|KPI Analysis|Staff Suggestion|Risk Assessment","description":"what improvement is proposed","expected_benefit":"quality or business benefit","owner":"responsible role","target_date":"ISO date 6 months from today","status":"Proposed","linked_objective":"which quality objective this supports"} Generate 4-6 typical improvements for the described organisation and industry. [FABRICATION GUARD] No specific targets or financials. Base on described products and prior context only.`

const COLUMNS = [
  { key:'improvement_ref', label:'Ref' },{ key:'title', label:'Improvement' },
  { key:'source', label:'Source' },{ key:'owner', label:'Owner' },
  { key:'target_date', label:'Target' },{ key:'status', label:'Status' }
]
const EMPTY = { improvement_ref:'', title:'', source:'Internal Audit', description:'', expected_benefit:'', owner:'', target_date:'', actual_date:'', status:'Proposed', outcome:'', linked_objective:'' }

export default function ContinualImprovement() {
  const { activeProgramme } = useProgramme()
  const { priorContext, orgProfile } = useQMSContext(CLAUSE, activeProgramme?.id)
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const { toast } = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer
  const hasPending = rows.some(r => r._pending)

  useEffect(() => { if (activeProgramme) getImprovements(activeProgramme.id).then(setRows).catch(() => setRows([])) }, [activeProgramme])

  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme || !form.title.trim()) { toast('Title required','error'); return }
    try {
      const { id:_i, programme_id:_p, user_id:_u, created_at:_c, ...clean } = form
      if (editing) { const u = await updateImprovement(editing, clean); setRows(r => r.map(x => x.id===editing?u:x)) }
      else { const c = await createImprovement(activeProgramme.id, user.id, clean); setRows(r => [...r,c]) }
      toast(editing?'Updated':'Saved'); cancel()
    } catch(e) { toast(e.message,'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete?')) return
    try { await deleteImprovement(r.id); setRows(rs => rs.filter(x => x.id!==r.id)); toast('Deleted') } catch(e) { toast(e.message,'error') }
  }

  const saveAllPending = async () => {
    const pending = rows.filter(r => r._pending); let saved=0,failed=0; const updates=[...rows]
    for (const r of pending) {
      try { const {_pending,id:_id,...data}=r; const c=await createImprovement(activeProgramme.id,user.id,data); const i=updates.findIndex(x=>x.id===r.id); if(i!==-1)updates[i]=c; saved++ } catch { failed++ }
    }
    setRows([...updates]); toast(failed?`Saved ${saved}, ${failed} failed`:`${saved} draft${saved>1?'s':''} saved`)
  }

  const exportXLSX = async () => {
    const { default: XLSX } = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({ Ref:r.improvement_ref, Title:r.title, Source:r.source, Description:r.description, Benefit:r.expected_benefit, Owner:r.owner, Target:r.target_date, Status:r.status, Outcome:r.outcome })))
    XLSX.utils.book_append_sheet(wb, ws, 'Improvements')
    XLSX.writeFile(wb, `QMSiQ_Improvements_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const onGenerated = (records) => setRows(e => [...e, ...records.map(r => ({...r,id:crypto.randomUUID(),_pending:true}))])

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-4xl">
      <PageHeader title="Continual Improvement" subtitle="ISO 9001:2015 Cl.10.3 — Proactive improvement register" />
      {canEdit && <QMSAIGenerator clause={CLAUSE} systemPrompt={SYSTEM_PROMPT} requiredFields={["title","source"]} onGenerated={onGenerated} priorContext={priorContext} orgProfile={orgProfile} />}
      {hasPending && (
        <div className="flex items-center justify-between bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3 mb-3">
          <span className="text-xs text-amber-400">{rows.filter(r=>r._pending).length} unsaved drafts</span>
          <button onClick={saveAllPending} className="btn-primary text-xs flex items-center gap-1.5"><Save size={12} /> Save all drafts</button>
        </div>
      )}
      {rows.filter(r=>!r._pending).length>0 && (
        <div className="flex justify-end mb-2"><button onClick={exportXLSX} className="btn-secondary text-xs flex items-center gap-1.5"><Download size={12} /> Export XLSX</button></div>
      )}
      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{editing?'Edit':'New'} improvement</span><button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Reference</label><input maxLength={50} value={form.improvement_ref} onChange={e=>set('improvement_ref',e.target.value)} placeholder="CI-001" className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Source</label><select value={form.source} onChange={e=>set('source',e.target.value)} className="input-field w-full text-sm"><option>Internal Audit</option><option>Management Review</option><option>Customer Feedback</option><option>KPI Analysis</option><option>Staff Suggestion</option><option>Risk Assessment</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Title *</label><input maxLength={200} value={form.title} onChange={e=>set('title',e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Owner</label><input maxLength={200} value={form.owner} onChange={e=>set('owner',e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Target date</label><input type="date" value={form.target_date} onChange={e=>set('target_date',e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-field w-full text-sm"><option>Proposed</option><option>Approved</option><option>In Progress</option><option>Complete</option><option>Rejected</option></select></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Description</label><textarea maxLength={500} value={form.description} onChange={e=>set('description',e.target.value)} className="input-field w-full h-16 text-sm resize-none" /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Expected benefit</label><textarea maxLength={300} value={form.expected_benefit} onChange={e=>set('expected_benefit',e.target.value)} className="input-field w-full h-12 text-sm resize-none" /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Linked quality objective</label><input maxLength={200} value={form.linked_objective} onChange={e=>set('linked_objective',e.target.value)} className="input-field w-full text-sm" /></div>
          <button onClick={save} className="btn-primary text-sm"><Save size={13} /> Save</button>
        </div>
      )}
      {canEdit && !showForm && <button onClick={() => setShowForm(true)} className="btn-secondary text-sm mb-4"><Plus size={13} /> Add improvement</button>}
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isOwner||!isReviewer} />
    </div>
  )
}
