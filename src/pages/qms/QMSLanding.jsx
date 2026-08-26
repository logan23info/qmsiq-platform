import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, AlertCircle, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useProgramme } from '../../context/ProgrammeContext'
import { getQMSContext, getStakeholders, getQMSPolicy, getObjectives, getChanges, getCompetence, getDocuments } from '../../lib/supabase'

const MODULES = [
  { id: 'context', label: 'Context & Scope', clause: 'Cl.4.1–4.3', path: '/qms/context', mandatory: true, single: true },
  { id: 'stakeholders', label: 'Interested Parties', clause: 'Cl.4.2', path: '/qms/stakeholders', mandatory: true, single: false },
  { id: 'policy', label: 'Quality Policy', clause: 'Cl.5.2', path: '/qms/policy', mandatory: true, single: true },
  { id: 'objectives', label: 'Quality Objectives', clause: 'Cl.6.2', path: '/qms/objectives', mandatory: true, single: false },
  { id: 'changes', label: 'Change Register', clause: 'Cl.6.3', path: '/qms/changes', mandatory: false, single: false },
  { id: 'competence', label: 'Competence Register', clause: 'Cl.7.2', path: '/qms/competence', mandatory: true, single: false },
  { id: 'documents', label: 'Document Register', clause: 'Cl.7.5', path: '/qms/documents', mandatory: true, single: false },
]

function statusIcon(count, single, data) {
  // Truth table: no data → not started; data exists but Draft → in progress; Complete → done
  if (count === 0) return <Circle size={16} className="text-steel-600" />
  if (single) {
    if (data?.status === 'Complete' || data?.status === 'Approved') return <CheckCircle2 size={16} className="text-emerald-400" />
    return <AlertCircle size={16} className="text-amber-400" />
  }
  // Many-record: check if any are Draft (ai_generated) vs all saved
  if (data?.hasDraft) return <AlertCircle size={16} className="text-amber-400" />
  return <CheckCircle2 size={16} className="text-emerald-400" />
}

export default function QMSLanding() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({})
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeProgramme) return
    setLoading(true)
    const pid = activeProgramme.id
    Promise.all([
      getQMSContext(pid), getStakeholders(pid), getQMSPolicy(pid),
      getObjectives(pid), getChanges(pid), getCompetence(pid), getDocuments(pid)
    ]).then(([ctx, sth, pol, obj, chg, cmp, doc]) => {
      setCounts({
        context: ctx ? 1 : 0, stakeholders: sth.length, policy: pol ? 1 : 0,
        objectives: obj.length, changes: chg.length, competence: cmp.length, documents: doc.length
      })
      const allDraft = (arr) => arr.length > 0 && arr.every(r => r.ai_generated && r.status === 'Draft')
      setData({
        context: ctx,
        policy: pol,
        stakeholders: { hasDraft: allDraft(sth) },
        objectives: { hasDraft: allDraft(obj) },
        changes: { hasDraft: allDraft(chg) },
        competence: { hasDraft: allDraft(cmp) },
        documents: { hasDraft: allDraft(doc) },
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeProgramme])

  const done = MODULES.filter(m => (counts[m.id] || 0) > 0).length
  const pct = Math.round((done / MODULES.length) * 100)

  if (!activeProgramme) return (
    <div className="text-center py-16 text-steel-500">Select a programme first to implement your QMS.</div>
  )

  return (
    <div className="max-w-3xl">
      <PageHeader title="Implement Your QMS" subtitle="ISO 9001:2015 implementation tracker" />

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-steel-400">Implementation progress</span>
          <span className="text-sm font-medium text-white">{done}/{MODULES.length} modules</span>
        </div>
        <div className="w-full bg-navy-700 rounded-full h-2">
          <div className="bg-amber-audit h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-steel-500">{pct}% complete · {MODULES.filter(m => m.mandatory && !counts[m.id]).length} mandatory items outstanding</div>
        <div className="mt-1 text-xs text-steel-600 italic">Progress reflects saved records only. AI drafts must be saved in each module to count.</div>
      </div>

      <div className="space-y-2">
        {MODULES.map(m => {
          const count = counts[m.id] || 0
          return (
            <button key={m.id} onClick={() => navigate(m.path)}
              className="w-full flex items-center gap-3 p-4 card hover:border-navy-500 transition-colors text-left">
              {loading ? <Circle size={16} className="text-steel-600 flex-shrink-0" /> : statusIcon(count, m.single, data[m.id])}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{m.label}</span>
                  {m.mandatory && <span className="text-xs text-amber-audit bg-amber-900/20 px-1.5 py-0.5 rounded">Required</span>}
                  {m.ai && <span className="text-xs text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded">AI</span>}
                </div>
                <div className="text-xs text-steel-500 mt-0.5">
                  {m.clause} · {count === 0 ? 'Not started' : 
                    data[m.id]?.hasDraft ? `${count} record${count > 1 ? 's' : ''} — drafts unsaved` :
                    `${count} record${count > 1 ? 's' : ''}`}
                </div>
              </div>
              <ChevronRight size={14} className="text-steel-600 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
