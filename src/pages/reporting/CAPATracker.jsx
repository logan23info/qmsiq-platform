import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle2, Clock, AlertTriangle, Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { getFindings, updateFinding } from '../../lib/supabase'
import AIPanel from '../../components/AIPanel'
import { useToast } from '../../components/Toast'

const ratingColor = { Critical: 'border-l-red-500', High: 'border-l-orange-500', Medium: 'border-l-amber-500', 'Low / Advisory': 'border-l-navy-600' }
const statusBadge = { Open: 'bg-red-900/40 text-red-300', 'In Progress': 'bg-amber-900/40 text-amber-300', Closed: 'bg-emerald-900/40 text-emerald-300' }

function CAPARow({ finding, onUpdate }) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ agreed_action: finding.agreed_action || '', action_owner: finding.action_owner || '', due_date: finding.due_date || '', management_response: finding.management_response || '', status: finding.status || 'Open' })
  const [saving, setSaving] = useState(false)
  const isOverdue = finding.due_date && new Date(finding.due_date) < new Date() && finding.status !== 'Closed'

  const save = async () => {
    setSaving(true)
    try { const updated = await updateFinding(finding.id, form); onUpdate(updated) }
    catch (e) { console.error(e) }
    setSaving(false); setEditing(false)
  }

  const daysUntilDue = finding.due_date ? Math.ceil((new Date(finding.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className={`card p-0 overflow-hidden border-l-4 ${ratingColor[finding.rating] || 'border-l-navy-600'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start justify-between p-4 text-left hover:bg-navy-800/20 transition-colors">
        <div className="flex items-start gap-3 flex-1 min-w-0 flex-wrap">
          <span className="font-mono text-amber-audit font-bold text-sm flex-shrink-0">{finding.finding_ref}</span>
          <span className="text-sm text-white truncate">{finding.title}</span>
          <span className={`badge text-xs ${statusBadge[finding.status]}`}>{finding.status}</span>
          {isOverdue && <span className="badge bg-red-900/60 text-red-200 text-xs">OVERDUE</span>}
          {daysUntilDue !== null && finding.status !== 'Closed' && !isOverdue && daysUntilDue <= 14 && (
            <span className="badge bg-amber-900/40 text-amber-300 text-xs">{daysUntilDue}d left</span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-steel-400 flex-shrink-0 mt-1" /> : <ChevronDown size={14} className="text-steel-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-navy-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            {[
              { label: 'Condition', value: finding.condition_text },
              { label: 'Cause', value: finding.cause_text },
              { label: 'Consequence', value: finding.consequence_text },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="bg-navy-800 rounded-lg p-3">
                <div className="text-steel-400 font-medium mb-1">{f.label}</div>
                <div className="text-steel-200 leading-relaxed">{f.value}</div>
              </div>
            ))}
          </div>

          {!editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-navy-800 rounded-lg p-3"><div className="text-steel-400 mb-1">Agreed Action</div><div className="text-white">{finding.agreed_action || '—'}</div></div>
                <div className="bg-navy-800 rounded-lg p-3"><div className="text-steel-400 mb-1">Action Owner</div><div className="text-white">{finding.action_owner || '—'}</div></div>
                <div className={`bg-navy-800 rounded-lg p-3 ${isOverdue ? 'border border-red-700' : ''}`}><div className="text-steel-400 mb-1">Due Date</div><div className={`text-white ${isOverdue ? 'text-red-400 font-bold' : ''}`}>{finding.due_date || '—'}</div></div>
              </div>
              <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1.5">Update CAPA</button>
            </div>
          ) : (
            <div className="bg-navy-800 rounded-lg p-4 space-y-3">
              <div className="text-xs font-semibold text-white mb-2">Update CAPA Details</div>
              <div><label className="block text-xs text-steel-400 mb-1">Agreed Corrective Action</label><textarea className="textarea-field" rows={2} value={form.agreed_action} onChange={e => setForm(p => ({ ...p, agreed_action: e.target.value }))} /></div>
              <div><label className="block text-xs text-steel-400 mb-1">Management Response</label><textarea className="textarea-field" rows={2} value={form.management_response} onChange={e => setForm(p => ({ ...p, management_response: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-steel-400 mb-1">Action Owner</label><input className="input-field" value={form.action_owner} onChange={e => setForm(p => ({ ...p, action_owner: e.target.value }))} /></div>
                <div><label className="block text-xs text-steel-400 mb-1">Due Date</label><input className="input-field" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
                <div><label className="block text-xs text-steel-400 mb-1">Status</label><select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option>Open</option><option>In Progress</option><option>Closed</option></select></div>
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5">{saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> Save CAPA</>}</button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <AIPanel
          title="AI — Generate Corrective Action Guidance"
          systemPrompt="You are an ISO 27001:2022 CAPA specialist. Generate structured corrective action plans for audit findings. Include: root cause analysis (5-Why), corrective action steps, preventive measures, success criteria, and realistic timelines. Align to ISO 27001 Clause 10.2 requirements."
          placeholder="e.g. Generate a corrective action plan for F-003 High finding: no formal patch management process, 47 critical servers unpatched"
          contextFields={[
            { id: 'finding', label: 'Finding Details', type: 'textarea', placeholder: 'Paste finding title, rating, and condition text here...' },
            { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Corrective Action Plan', 'Root Cause Analysis (5-Why)', 'Management Response Template', 'CAPA Effectiveness Review', 'Preventive Action Plan'] },
            { id: 'owner', label: 'Action Owner / Team', type: 'text', placeholder: 'e.g. IT Security Manager, Cloud Team' },
          ]}
        />
      </div>
    </div>
  )
}

export default function CAPATracker() {
  const { activeProgramme } = useProgramme()
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setFindings(await getFindings(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const filtered = findings.filter(f => filter === 'All' || f.status === filter || (filter === 'Overdue' && f.due_date && new Date(f.due_date) < new Date() && f.status !== 'Closed'))
  const stats = {
    total: findings.length,
    open: findings.filter(f => f.status === 'Open').length,
    inProgress: findings.filter(f => f.status === 'In Progress').length,
    closed: findings.filter(f => f.status === 'Closed').length,
    overdue: findings.filter(f => f.due_date && new Date(f.due_date) < new Date() && f.status !== 'Closed').length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="Reporting" clause="CAPA Tracker" title="CAPA Closure Tracker ⭐ Live" description="Corrective and Preventive Action tracker — all findings from your active programme. Track agreed actions, owners, due dates, and closure status in real time." badges={['Live Data', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[{ label: 'Total', value: stats.total, color: 'text-white' }, { label: 'Open', value: stats.open, color: 'text-red-400' }, { label: 'In Progress', value: stats.inProgress, color: 'text-amber-audit' }, { label: 'Closed', value: stats.closed, color: 'text-emerald-400' }, { label: 'Overdue', value: stats.overdue, color: 'text-red-400' }].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      {stats.total > 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-steel-400">CAPA Closure Rate</span><span className="text-xs font-bold text-white">{Math.round((stats.closed / stats.total) * 100)}%</span></div>
          <div className="h-2 bg-navy-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((stats.closed / stats.total) * 100)}%` }} /></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {['All', 'Open', 'In Progress', 'Closed', 'Overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? 'bg-navy-700 border-steel-500 text-white' : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-500'}`}>{f}</button>
        ))}
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><div className="text-white font-medium mb-1">No programme selected</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><CheckCircle2 size={28} className="text-steel-500 mx-auto mb-3" /><div className="text-white font-medium mb-1">{findings.length === 0 ? 'No findings raised yet' : 'No findings match this filter'}</div><div className="text-xs text-steel-400">Raise findings from Fieldwork → Finding Register</div></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => <CAPARow key={f.id} finding={f} onUpdate={updated => setFindings(prev => prev.map(x => x.id === updated.id ? updated : x))} />)}
        </div>
      )}
    </div>
  )
}
