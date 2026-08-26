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
import { getDesign, createDesign, updateDesign, deleteDesign } from '../../lib/supabase'
import { Plus, Save, X, ArrowRight, AlertCircle } from 'lucide-react'

const CLAUSE = 'ISO 9001:2015 Cl.8.3'
const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS consultant. [SOURCE OF TRUTH] Organisation and prior context only. [DETERMINISM] Return INSUFFICIENT_DATA if context too vague. [OUTPUT] JSON array only. Start with [ end with ]. No preamble. Each object: {"design_ref":"e.g. DD-001","title":"design project title","design_type":"one of: Product|Service|Process|Software","stage":"one of: Planning|Design Input|Design Output|Review|Verification|Validation|Transfer","inputs":"key design inputs","outputs":"expected design outputs","verification":"how design output will be verified","validation":"how product will be validated with customer","owner":"responsible role","target_date":"ISO date","status":"In Progress"} Generate 3-5 typical design projects for the described industry. [FABRICATION GUARD] No specific technical specifications. Base on described products only.`

const COLUMNS = [
  { key:'design_ref', label:'Ref' },{ key:'title', label:'Title' },
  { key:'design_type', label:'Type' },{ key:'stage', label:'Stage' },
  { key:'owner', label:'Owner' },{ key:'status', label:'Status' }
]
const EMPTY = { design_ref:'', title:'', design_type:'Product', stage:'Planning', inputs:'', outputs:'', review_required:true, verification:'', validation:'', changes_controlled:false, owner:'', target_date:'', status:'In Progress', excluded:false, exclusion_reason:'' }

export default function DesignDevelopment() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { priorContext, orgProfile } = useQMSContext(CLAUSE, activeProgramme?.id)
  const nextModule = NEXT_MODULE[CLAUSE]
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [excluded, setExcluded] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer

  useEffect(() => { if (activeProgramme) getDesign(activeProgramme.id).then(setRows).catch(() => setRows([])) }, [activeProgramme])

  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme || !form.title.trim()) { toast('Title required','error'); return }
    try {
      const { id:_i, programme_id:_p, user_id:_u, created_at:_c, ...clean } = form
      if (editing) { const u = await updateDesign(editing, clean); setRows(r => r.map(x => x.id===editing?u:x)) }
      else { const c = await createDesign(activeProgramme.id, user.id, clean); setRows(r => [...r,c]) }
      toast(editing?'Updated':'Saved'); cancel()
    } catch(e) { toast(e.message,'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete?')) return
    try { await deleteDesign(r.id); setRows(rs => rs.filter(x => x.id!==r.id)); toast('Deleted') } catch(e) { toast(e.message,'error') }
  }

  const onGenerated = (records) => setRows(e => [...e, ...records.map(r => ({...r,id:crypto.randomUUID(),_pending:true}))])

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-4xl">
      <PageHeader title="Design & Development" subtitle="ISO 9001:2015 Cl.8.3" />

      {/* Exclusion option — Cl.4.3 allows excluding Cl.8.3 if no design activity */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${excluded ? "bg-steel-900/20 border-steel-700" : "bg-navy-800 border-navy-700"}`}>
        <input type="checkbox" id="excluded" checked={excluded} onChange={e => setExcluded(e.target.checked)} className="mt-0.5" />
        <div>
          <label htmlFor="excluded" className="text-sm font-medium text-white cursor-pointer">This clause is excluded per Cl.4.3</label>
          <p className="text-xs text-steel-400 mt-0.5">Tick if your organisation does not design or develop products/services. Justify the exclusion in your QMS scope document.</p>
        </div>
      </div>

      {!excluded && (<>
        {canEdit && <QMSAIGenerator clause={CLAUSE} systemPrompt={SYSTEM_PROMPT} requiredFields={["title","design_type"]} onGenerated={onGenerated} priorContext={priorContext} orgProfile={orgProfile} />}
        {nextModule && <div className="flex justify-end mb-2"><button onClick={() => navigate(nextModule.path)} className="btn-secondary text-sm flex items-center gap-1.5">Next: {nextModule.label} <ArrowRight size={13} /></button></div>}
        {showForm && (
          <div className="card mb-4 space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{editing?'Edit':'New'} design project</span><button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-steel-400 mb-1">Reference</label><input maxLength={50} value={form.design_ref} onChange={e=>set('design_ref',e.target.value)} className="input-field w-full text-sm" placeholder="DD-001" /></div>
              <div><label className="block text-xs text-steel-400 mb-1">Title *</label><input maxLength={200} value={form.title} onChange={e=>set('title',e.target.value)} className="input-field w-full text-sm" /></div>
              <div><label className="block text-xs text-steel-400 mb-1">Type</label><select value={form.design_type} onChange={e=>set('design_type',e.target.value)} className="input-field w-full text-sm"><option>Product</option><option>Service</option><option>Process</option><option>Software</option></select></div>
              <div><label className="block text-xs text-steel-400 mb-1">Stage</label><select value={form.stage} onChange={e=>set('stage',e.target.value)} className="input-field w-full text-sm"><option>Planning</option><option>Design Input</option><option>Design Output</option><option>Review</option><option>Verification</option><option>Validation</option><option>Transfer</option></select></div>
              <div><label className="block text-xs text-steel-400 mb-1">Owner</label><input maxLength={200} value={form.owner} onChange={e=>set('owner',e.target.value)} className="input-field w-full text-sm" /></div>
              <div><label className="block text-xs text-steel-400 mb-1">Target date</label><input type="date" value={form.target_date} onChange={e=>set('target_date',e.target.value)} className="input-field w-full text-sm" /></div>
            </div>
            <div><label className="block text-xs text-steel-400 mb-1">Design inputs</label><textarea maxLength={500} value={form.inputs} onChange={e=>set('inputs',e.target.value)} className="input-field w-full h-16 text-sm resize-none" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Design outputs</label><textarea maxLength={500} value={form.outputs} onChange={e=>set('outputs',e.target.value)} className="input-field w-full h-16 text-sm resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-steel-400 mb-1">Verification method</label><textarea maxLength={300} value={form.verification} onChange={e=>set('verification',e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
              <div><label className="block text-xs text-steel-400 mb-1">Validation method</label><textarea maxLength={300} value={form.validation} onChange={e=>set('validation',e.target.value)} className="input-field w-full h-14 text-sm resize-none" /></div>
            </div>
            <div><label className="block text-xs text-steel-400 mb-1">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-field text-sm"><option>In Progress</option><option>On Hold</option><option>Complete</option><option>Cancelled</option></select></div>
            <button onClick={save} className="btn-primary text-sm"><Save size={13} /> Save</button>
          </div>
        )}
        {canEdit && !showForm && <button onClick={() => setShowForm(true)} className="btn-secondary text-sm mb-4"><Plus size={13} /> Add design project</button>}
        <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isOwner||!isReviewer} />
      </>)}
    </div>
  )
}
