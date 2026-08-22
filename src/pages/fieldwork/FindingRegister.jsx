import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle, CheckCircle2, Clock, Loader2, ChevronDown, ChevronUp, Save, Trash2, Search, X, FileDown } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { getFindings, createFinding, updateFinding, deleteFinding } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'
import AIPanel from '../../components/AIPanel'
import { exportToCSV, FINDING_COLUMNS } from '../../utils/exportCSV'

const ratingConfig = {
  Critical: 'bg-red-900/40 text-red-300 border-red-700',
  High: 'bg-orange-900/40 text-orange-300 border-orange-700',
  Medium: 'bg-amber-900/40 text-amber-300 border-amber-700',
  'Low / Advisory': 'bg-navy-700 text-steel-300 border-navy-600',
}
const ratingBorder = { Critical: 'border-l-red-500', High: 'border-l-orange-500', Medium: 'border-l-amber-500', 'Low / Advisory': 'border-l-navy-600' }
const statusConfig = {
  Open: { color: 'text-red-400', icon: AlertTriangle },
  'In Progress': { color: 'text-amber-audit', icon: Clock },
  Closed: { color: 'text-emerald-400', icon: CheckCircle2 },
}

function FindingCard({ finding, onUpdate, onDelete }) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    management_response: finding.management_response || '',
    agreed_action: finding.agreed_action || '',
    action_owner: finding.action_owner || '',
    due_date: finding.due_date || '',
    status: finding.status || 'Open'
  })
  const StatusIcon = statusConfig[finding.status]?.icon || AlertTriangle
  const isOverdue = finding.due_date && new Date(finding.due_date) < new Date() && finding.status !== 'Closed'

  const save = async () => {
    setSaving(true)
    try { const u = await updateFinding(finding.id, form); onUpdate(u); toast('Finding updated') }
    catch (e) { toast('Save failed: ' + e.message, 'error') }
    setSaving(false); setEditing(false)
  }

  return (
    <div className={`card p-0 overflow-hidden border-l-4 ${ratingBorder[finding.rating] || 'border-l-navy-600'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start justify-between p-4 text-left hover:bg-navy-800/30 transition-colors">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="font-mono text-amber-audit font-bold text-sm">{finding.finding_ref}</span>
          <span className={`badge border text-xs ${ratingConfig[finding.rating] || 'badge-steel'}`}>{finding.rating}</span>
          <StatusIcon size={13} className={statusConfig[finding.status]?.color || 'text-steel-400'} />
          {isOverdue && <span className="badge bg-red-900/60 text-red-200 text-xs border border-red-700">OVERDUE</span>}
          <span className="text-sm text-white truncate">{finding.title}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <button onClick={e => { e.stopPropagation(); onDelete(finding) }}
            className="p-1 rounded hover:bg-red-900/30 text-steel-500 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-steel-400" /> : <ChevronDown size={14} className="text-steel-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-navy-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { label: 'C1 — Condition', value: finding.condition_text, color: 'border-blue-500' },
              { label: 'C2 — Criteria', value: finding.criteria_text, color: 'border-emerald-500' },
              { label: 'C3 — Cause', value: finding.cause_text, color: 'border-amber-500' },
              { label: 'C4 — Consequence', value: finding.consequence_text, color: 'border-red-500' },
            ].filter(c => c.value).map(c => (
              <div key={c.label} className={`bg-navy-800 border-l-4 ${c.color} rounded-r-lg p-3`}>
                <div className="text-xs font-semibold text-steel-400 mb-1">{c.label}</div>
                <div className="text-xs text-steel-200 leading-relaxed">{c.value}</div>
              </div>
            ))}
          </div>

          {!editing ? (
            <div className="space-y-2">
              {finding.management_response && <div className="bg-navy-800 rounded-lg p-3"><div className="text-xs text-steel-400 mb-1">Management Response</div><div className="text-xs text-steel-200">{finding.management_response}</div></div>}
              {finding.agreed_action && <div className="bg-navy-800 rounded-lg p-3"><div className="text-xs text-steel-400 mb-1">Agreed Action</div><div className="text-xs text-steel-200">{finding.agreed_action}</div></div>}
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {finding.action_owner && <span className="text-steel-400">Owner: <span className="text-steel-200">{finding.action_owner}</span></span>}
                {finding.due_date && <span className={isOverdue ? 'text-red-400 font-bold' : 'text-steel-400'}>Due: {finding.due_date}</span>}
                <span className={`font-semibold ${statusConfig[finding.status]?.color}`}>{finding.status}</span>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1.5">Update Response</button>
            </div>
          ) : (
            <div className="space-y-3 bg-navy-800 rounded-lg p-3">
              {[
                { label: 'Management Response', key: 'management_response', type: 'textarea' },
                { label: 'Agreed Action', key: 'agreed_action', type: 'textarea' },
                { label: 'Action Owner', key: 'action_owner', type: 'text', ph: 'e.g. IT Security Manager' },
                { label: 'Due Date', key: 'due_date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-steel-400 mb-1">{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea className="textarea-field" rows={2} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    : <input className="input-field" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />}
                </div>
              ))}
              <div>
                <label className="block text-xs text-steel-400 mb-1">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option>Open</option><option>In Progress</option><option>Closed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5">
                  {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> Save</>}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NewFindingModal({ programmeId, userId, onCreated, onClose }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ title: '', standard: 'ISO 27001', clause_control: '', rating: 'High', condition_text: '', criteria_text: '', cause_text: '', consequence_text: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.title || !form.condition_text) return
    setSaving(true)
    try {
      const f = await createFinding({ ...form, user_id: userId, programme_id: programmeId, status: 'Open' })
      onCreated(f); onClose(); toast('Finding created — ' + f.finding_ref)
    } catch (e) { toast('Create failed: ' + e.message, 'error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">New Finding — 4Cs</h2>
          <button onClick={onClose} className="text-steel-400 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-steel-400 mb-1">Finding Title *</label>
              <input className="input-field" placeholder="e.g. User Access Review Gap" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Rating</label>
              <select className="input-field" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low / Advisory</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-steel-400 mb-1">Standard</label>
              <select className="input-field" value={form.standard} onChange={e => setForm(p => ({ ...p, standard: e.target.value }))}>
                {['ISO 27001', 'ISO 27002', 'ISO 27005', 'ISO 9001', 'ISO 19011'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Clause / Control</label>
              <input className="input-field" placeholder="e.g. A.8.2" value={form.clause_control} onChange={e => setForm(p => ({ ...p, clause_control: e.target.value }))} />
            </div>
          </div>
          {[
            { key: 'condition_text', label: 'C1 — Condition *', ph: 'Factual observation — what you found...' },
            { key: 'criteria_text', label: 'C2 — Criteria', ph: 'Standard or policy requirement...' },
            { key: 'cause_text', label: 'C3 — Cause', ph: 'Root cause (5-Why analysis)...' },
            { key: 'consequence_text', label: 'C4 — Consequence', ph: 'Risk or impact if not remediated...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-steel-400 mb-1">{f.label}</label>
              <textarea className="textarea-field" rows={2} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving || !form.title || !form.condition_text} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Plus size={14} /> Create Finding</>}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FindingRegister() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const { toast } = useToast()
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setFindings(await getFindings(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const handleDelete = (finding) => {
    setConfirmDel({
      title: `Delete ${finding.finding_ref}?`,
      message: 'This finding and all associated data will be permanently deleted.',
      onConfirm: async () => {
        try { await deleteFinding(finding.id); setFindings(p => p.filter(f => f.id !== finding.id)); toast(`${finding.finding_ref} deleted`, 'info') }
        catch (e) { toast('Delete failed: ' + e.message, 'error') }
      }
    })
  }

  const filtered = findings.filter(f =>
    (filter === 'All' || f.status === filter || f.rating === filter) &&
    (!search || f.title?.toLowerCase().includes(search.toLowerCase()) || f.finding_ref?.toLowerCase().includes(search.toLowerCase()) || f.clause_control?.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    total: findings.length,
    open: findings.filter(f => f.status === 'Open').length,
    inProgress: findings.filter(f => f.status === 'In Progress').length,
    closed: findings.filter(f => f.status === 'Closed').length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="Fieldwork" clause="Findings" title="Finding Register ⭐ Live"
        description="Live finding register — all audit findings tracked from 4Cs documentation to management response and CAPA closure."
        badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Open', value: stats.open, color: 'text-red-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-audit' },
          { label: 'Closed', value: stats.closed, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card-sm text-center">
            <div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-steel-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input className="input-field pl-8 text-xs py-1.5" placeholder="Search findings, refs, controls..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-200"><X size={12} /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Open', 'In Progress', 'Closed', 'Critical', 'High', 'Medium'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${filter === f ? 'bg-navy-700 border-steel-400 text-white' : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-400'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => exportToCSV(filtered, `Findings_${activeProgramme?.programme_id}`, FINDING_COLUMNS)}
            disabled={filtered.length === 0} className="btn-secondary text-xs py-1.5">
            <FileDown size={12} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs py-1.5">
            <Plus size={13} /> New Finding
          </button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12">
          <div className="text-white font-medium mb-1">No audit programme selected</div>
          <div className="text-xs text-steel-400">Select a programme from the header</div>
        </div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle size={28} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">{findings.length === 0 ? 'No findings yet' : 'No findings match'}</div>
          {findings.length === 0 && (
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs mt-3 mx-auto">
              <Plus size={12} /> Raise First Finding
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <FindingCard key={f.id} finding={f}
              onUpdate={u => setFindings(p => p.map(x => x.id === u.id ? u : x))}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* AI panel for generating findings */}
      <div className="mt-6">
        <AIPanel
          title="AI — Generate Finding (4Cs Framework)"
          systemPrompt="You are an ISO 27001:2022 IT audit specialist. Generate a complete finding using the 4Cs framework: Condition (what you found — factual observation), Criteria (what the standard/policy requires), Cause (root cause using 5-Why analysis), Consequence (risk or impact if not remediated). Also suggest a rating (Critical/High/Medium/Low), agreed action, and realistic due date. Format clearly with each C on its own line."
          placeholder="e.g. Generate a High finding for ISO 27001 A.8.8 — no formal patch management process, critical servers unpatched for 180+ days"
          contextFields={[
            { id: 'control', label: 'Control / Clause', type: 'text', placeholder: 'e.g. ISO 27001 A.8.8 — Vulnerability Management' },
            { id: 'observation', label: 'What You Observed', type: 'textarea', placeholder: 'e.g. Patch scan shows 47 critical servers with CVEs > 90 days old. No formal patch schedule exists.' },
            { id: 'rating', label: 'Expected Rating', type: 'select', options: ['Critical', 'High', 'Medium', 'Low / Advisory'] },
          ]}
        />
      </div>

      {confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
      {showModal && (
        <NewFindingModal programmeId={activeProgramme?.id} userId={user?.id}
          onCreated={f => setFindings(p => [f, ...p])}
          onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
