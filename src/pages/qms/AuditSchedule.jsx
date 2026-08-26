import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import QMSRecordTable from '../../components/QMSRecordTable'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getAuditSchedule, createAuditSchedule, updateAuditSchedule, deleteAuditSchedule } from '../../lib/supabase'
import { Plus, Save, X, ExternalLink } from 'lucide-react'

const COLUMNS = [
  { key:'audit_ref', label:'Ref' },{ key:'scope', label:'Scope' },
  { key:'clause_coverage', label:'Clauses' },{ key:'scheduled_date', label:'Date' },
  { key:'lead_auditor', label:'Lead' },{ key:'frequency', label:'Freq.' },{ key:'status', label:'Status' }
]
const EMPTY = { audit_ref:'', scope:'', clause_coverage:'', process_area:'', scheduled_date:'', lead_auditor:'', frequency:'Annual', last_result:'', notes:'', status:'Planned' }

export default function AuditSchedule() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer

  useEffect(() => { if (activeProgramme) getAuditSchedule(activeProgramme.id).then(setRows).catch(() => setRows([])) }, [activeProgramme])

  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const startEdit = (r) => { setForm(r); setEditing(r.id); setShowForm(true) }
  const cancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false) }

  const save = async () => {
    if (!activeProgramme || !form.scope.trim()) { toast('Scope required','error'); return }
    try {
      const { id:_i, programme_id:_p, user_id:_u, created_at:_c, ...clean } = form
      if (editing) { const u = await updateAuditSchedule(editing, clean); setRows(r => r.map(x => x.id===editing?u:x)) }
      else { const c = await createAuditSchedule(activeProgramme.id, user.id, clean); setRows(r => [...r,c]) }
      toast(editing?'Updated':'Saved'); cancel()
    } catch(e) { toast(e.message,'error') }
  }

  const remove = async (r) => {
    if (!window.confirm('Delete?')) return
    try { await deleteAuditSchedule(r.id); setRows(rs => rs.filter(x => x.id!==r.id)); toast('Deleted') } catch(e) { toast(e.message,'error') }
  }

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-4xl">
      <PageHeader title="Internal Audit Schedule" subtitle="ISO 9001:2015 Cl.9.2 — Annual audit plan" />

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-steel-400">Plan and track internal audits across all QMS clauses and process areas. All clauses must be audited within each audit cycle.</p>
        <button onClick={() => navigate('/reporting/universe')} className="btn-secondary text-xs flex items-center gap-1.5">
          Audit Universe <ExternalLink size={11} />
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{editing?'Edit':'New'} audit</span><button onClick={cancel}><X size={13} className="text-steel-500 hover:text-white" /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Reference</label><input maxLength={50} value={form.audit_ref} onChange={e=>set('audit_ref',e.target.value)} placeholder="IA-2026-01" className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Frequency</label><select value={form.frequency} onChange={e=>set('frequency',e.target.value)} className="input-field w-full text-sm"><option>Annual</option><option>Bi-annual</option><option>Quarterly</option><option>Ad-hoc</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Clause coverage</label><input maxLength={200} value={form.clause_coverage} onChange={e=>set('clause_coverage',e.target.value)} placeholder="Cl.4-7, Cl.8.1" className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Process area</label><input maxLength={200} value={form.process_area} onChange={e=>set('process_area',e.target.value)} placeholder="Production, Procurement" className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Scheduled date</label><input type="date" value={form.scheduled_date} onChange={e=>set('scheduled_date',e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Lead auditor</label><input maxLength={200} value={form.lead_auditor} onChange={e=>set('lead_auditor',e.target.value)} className="input-field w-full text-sm" /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-field w-full text-sm"><option>Planned</option><option>In Progress</option><option>Complete</option><option>Overdue</option><option>Cancelled</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Last result</label><select value={form.last_result} onChange={e=>set('last_result',e.target.value)} className="input-field w-full text-sm"><option value="">N/A</option><option>No findings</option><option>Minor NCs</option><option>Major NCs</option></select></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Scope description *</label><textarea maxLength={500} value={form.scope} onChange={e=>set('scope',e.target.value)} className="input-field w-full h-16 text-sm resize-none" /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Notes</label><textarea maxLength={300} value={form.notes} onChange={e=>set('notes',e.target.value)} className="input-field w-full h-12 text-sm resize-none" /></div>
          <button onClick={save} className="btn-primary text-sm"><Save size={13} /> Save</button>
        </div>
      )}
      {canEdit && !showForm && <button onClick={() => setShowForm(true)} className="btn-secondary text-sm mb-4"><Plus size={13} /> Add audit</button>}
      <QMSRecordTable columns={COLUMNS} rows={rows} onEdit={startEdit} onDelete={remove} canEdit={canEdit} canDelete={isOwner||!isReviewer} />
    </div>
  )
}
