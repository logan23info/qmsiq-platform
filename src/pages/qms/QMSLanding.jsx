import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, AlertCircle, ChevronRight, Award, TrendingUp, AlertTriangle, Link } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useProgramme } from '../../context/ProgrammeContext'
import { getQMSContext, getStakeholders, getQMSPolicy, getObjectives, getChanges, getCompetence, getDocuments, getFindings, getOperational, getDesign, getAuditSchedule, getImprovements } from '../../lib/supabase'
import { BarChart3, ClipboardList } from 'lucide-react'

// ─── Weighted minimums by org size ─────────────────────────
// Source: ISO 9001:2015 implementation guidance, not mandated by standard
const MINIMUMS = {
  '1–10 employees':    { stakeholders: 4, objectives: 3, competence: 3, documents: 5, changes: 1, operational: 3, design: 0, audit_schedule: 2, improvements: 2 },
  '11–50 employees':   { stakeholders: 6, objectives: 4, competence: 5, documents: 8, changes: 2, operational: 5, design: 0, audit_schedule: 3, improvements: 3 },
  '51–250 employees':  { stakeholders: 8, objectives: 5, competence: 8, documents: 10, changes: 3, operational: 6, design: 0, audit_schedule: 4, improvements: 4 },
  '251–1000 employees':{ stakeholders: 10, objectives: 6, competence: 12, documents: 15, changes: 4, operational: 7, design: 0, audit_schedule: 5, improvements: 5 },
  '1000+ employees':   { stakeholders: 12, objectives: 8, competence: 15, documents: 20, changes: 5, operational: 8, design: 0, audit_schedule: 6, improvements: 6 },
}
const DEFAULT_MIN = { stakeholders: 4, objectives: 3, competence: 3, documents: 5, changes: 1, operational: 3, design: 0, audit_schedule: 2, improvements: 2 }

const MODULES = [
  { id: 'context', label: 'Context & Scope', clause: 'Cl.4.1–4.3', path: '/qms/context', mandatory: true, single: true },
  { id: 'stakeholders', label: 'Interested Parties', clause: 'Cl.4.2', path: '/qms/stakeholders', mandatory: true, single: false },
  { id: 'policy', label: 'Quality Policy', clause: 'Cl.5.2', path: '/qms/policy', mandatory: true, single: true },
  { id: 'objectives', label: 'Quality Objectives', clause: 'Cl.6.2', path: '/qms/objectives', mandatory: true, single: false },
  { id: 'changes', label: 'Change Register', clause: 'Cl.6.3', path: '/qms/changes', mandatory: false, single: false },
  { id: 'competence', label: 'Competence Register', clause: 'Cl.7.2', path: '/qms/competence', mandatory: true, single: false },
  { id: 'documents', label: 'Document Register', clause: 'Cl.7.5', path: '/qms/documents', mandatory: true, single: false },
  { id: 'operational', label: 'Operational Planning', clause: 'Cl.8.1', path: '/qms/operational', mandatory: true, single: false },
  { id: 'design', label: 'Design & Development', clause: 'Cl.8.3', path: '/qms/design', mandatory: false, single: false },
  { id: 'audit_schedule', label: 'Internal Audit Schedule', clause: 'Cl.9.2', path: '/qms/audit-schedule', mandatory: true, single: false },
  { id: 'improvements', label: 'Continual Improvement', clause: 'Cl.10.3', path: '/qms/improvements', mandatory: true, single: false },
]

// Truth table: count × single × data → icon
function statusIcon(count, single, data, min) {
  if (count === 0) return <Circle size={16} className="text-steel-600 flex-shrink-0" />
  if (single) {
    if (data?.status === 'Complete' || data?.status === 'Approved') return <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
    return <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
  }
  if (data?.hasDraft) return <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
  if (min && count < min) return <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
  return <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
}

// Certification readiness — indicative only, not a guarantee
function certScore(counts, data, findings, orgSize) {
  const min = MINIMUMS[orgSize] || DEFAULT_MIN
  const checks = [
    { label: 'Context & Scope defined', pass: counts.context > 0 },
    { label: 'Quality Policy approved', pass: counts.policy > 0 && (data.policy?.status === 'Complete' || data.policy?.status === 'Approved') },
    { label: 'Minimum stakeholders', pass: counts.stakeholders >= min.stakeholders },
    { label: 'Minimum objectives', pass: counts.objectives >= min.objectives },
    { label: 'Minimum competence records', pass: counts.competence >= min.competence },
    { label: 'Minimum documents registered', pass: counts.documents >= min.documents },
    { label: 'Operational processes defined', pass: counts.operational >= min.operational },
    { label: 'No open Major NCs', pass: !findings.some(f => f.rating === 'Major NC' && f.status === 'Open') },
    { label: 'Change register maintained', pass: counts.changes >= min.changes },
    { label: 'Internal audit schedule defined', pass: counts.audit_schedule >= min.audit_schedule },
    { label: 'Improvement register maintained', pass: counts.improvements >= min.improvements },
  ]
  return checks
}

export default function QMSLanding() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({})
  const [data, setData] = useState({})
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReadiness, setShowReadiness] = useState(false)

  useEffect(() => {
    if (!activeProgramme) return
    setLoading(true)
    const pid = activeProgramme.id
    Promise.all([
      getQMSContext(pid), getStakeholders(pid), getQMSPolicy(pid),
      getObjectives(pid), getChanges(pid), getCompetence(pid),
      getDocuments(pid), getFindings(pid), getOperational(pid)
    ]).then(([ctx, sth, pol, obj, chg, cmp, doc, fin, ops, des, sch, imp]) => {
      setCounts({
        context: ctx ? 1 : 0, stakeholders: sth.length, policy: pol ? 1 : 0,
        objectives: obj.length, changes: chg.length, competence: cmp.length,
        documents: doc.length, operational: ops.length,
        design: des.length, audit_schedule: sch.length, improvements: imp.length
      })
      const allDraft = (arr) => arr.length > 0 && arr.every(r => r.ai_generated && r.status === 'Draft')
      setData({
        context: ctx, policy: pol,
        stakeholders: { hasDraft: allDraft(sth) },
        objectives: { hasDraft: allDraft(obj) },
        changes: { hasDraft: allDraft(chg) },
        competence: { hasDraft: allDraft(cmp) },
        documents: { hasDraft: allDraft(doc) },
        operational: { hasDraft: allDraft(ops) },
        design: { hasDraft: allDraft(des) },
        audit_schedule: { hasDraft: allDraft(sch) },
        improvements: { hasDraft: allDraft(imp) },
      })
      setFindings(fin || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeProgramme])

  const orgSize = data.context?.org_size || ''
  const min = MINIMUMS[orgSize] || DEFAULT_MIN
  const openMajorNCs = findings.filter(f => f.rating === 'Major NC' && f.status === 'Open').length
  const openFindings = findings.filter(f => f.status === 'Open').length

  // Weighted completion — count only if meets minimum
  const moduleStatus = MODULES.map(m => {
    const count = counts[m.id] || 0
    const threshold = m.single ? 1 : (min[m.id] || 1)
    const meetsMin = m.single ? count > 0 : count >= threshold
    return { ...m, count, meetsMin: m.single ? (count > 0) : meetsMin }
  })
  const done = moduleStatus.filter(m => m.meetsMin).length
  const pct = Math.round((done / MODULES.length) * 100)

  const certChecks = certScore(counts, data, findings, orgSize)
  const certPct = Math.round((certChecks.filter(c => c.pass).length / certChecks.length) * 100)

  if (!activeProgramme) return (
    <div className="text-center py-16 text-steel-500">Select a programme first to implement your QMS.</div>
  )

  return (
    <div className="max-w-3xl">
      <PageHeader title="Implement Your QMS" subtitle="ISO 9001:2015 implementation tracker" />

      {/* Progress bar */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-steel-400">Implementation progress</span>
          <span className="text-sm font-medium text-white">{done}/{MODULES.length} modules</span>
        </div>
        <div className="w-full bg-navy-700 rounded-full h-2 mb-2">
          <div className="bg-amber-audit h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-steel-500">
            {MODULES.filter(m => m.mandatory && !(counts[m.id] >= (m.single ? 1 : (min[m.id] || 1)))).length} mandatory items outstanding
            {orgSize && <span className="ml-1 text-steel-600">· Based on {orgSize}</span>}
          </span>
          <span className="text-xs text-steel-600 italic">Progress reflects saved records meeting minimum thresholds</span>
        </div>
      </div>

      {/* Findings link — only shown when findings exist */}
      {openFindings > 0 && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-4 border ${openMajorNCs > 0 ? 'bg-red-900/20 border-red-800/40' : 'bg-amber-900/20 border-amber-800/40'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className={openMajorNCs > 0 ? 'text-red-400' : 'text-amber-400'} />
            <span className="text-xs text-steel-300">
              {openFindings} open finding{openFindings > 1 ? 's' : ''} from audits
              {openMajorNCs > 0 && <span className="text-red-400 ml-1">· {openMajorNCs} Major NC — blocks certification readiness</span>}
            </span>
          </div>
          <button onClick={() => navigate('/fieldwork/findings')} className="text-xs text-amber-audit hover:text-amber-300 flex items-center gap-1">
            View findings <Link size={11} />
          </button>
        </div>
      )}

      {/* Certification readiness toggle */}
      <button onClick={() => setShowReadiness(r => !r)}
        className="w-full flex items-center justify-between card mb-4 hover:border-navy-500 transition-colors">
        <div className="flex items-center gap-3">
          <Award size={16} className={certPct >= 80 ? 'text-emerald-400' : certPct >= 50 ? 'text-amber-audit' : 'text-red-400'} />
          <div className="text-left">
            <div className="text-sm font-medium text-white">Certification Readiness — {certPct}%</div>
            <div className="text-xs text-steel-500 italic">Indicative only — not a guarantee of certification</div>
          </div>
        </div>
        <div className="w-24 bg-navy-700 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${certPct >= 80 ? 'bg-emerald-500' : certPct >= 50 ? 'bg-amber-audit' : 'bg-red-500'}`} style={{ width: `${certPct}%` }} />
        </div>
      </button>

      {showReadiness && (
        <div className="card mb-4 space-y-2">
          <p className="text-xs text-steel-500 mb-3 italic">Readiness checklist based on ISO 9001:2015 requirements and your organisation size. All items must pass before certification audit.</p>
          {certChecks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {c.pass
                ? <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                : <Circle size={13} className="text-steel-600 flex-shrink-0" />}
              <span className={c.pass ? 'text-steel-300' : 'text-steel-500'}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions — gap analysis + conduct audit + KPI */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button onClick={() => navigate('/fieldwork/gap-analysis')}
          className="flex items-center gap-2 card p-3 hover:border-navy-500 transition-colors">
          <BarChart3 size={14} className="text-amber-audit flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-xs font-medium text-white">Gap Analysis</div>
            <div className="text-xs text-steel-500">Cl.4–10 RAG</div>
          </div>
        </button>
        <button onClick={() => navigate('/conduct')}
          className="flex items-center gap-2 card p-3 hover:border-navy-500 transition-colors">
          <ClipboardList size={14} className="text-blue-400 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-xs font-medium text-white">Conduct Audit</div>
            <div className="text-xs text-steel-500">ISO 19011</div>
          </div>
        </button>
        <button onClick={() => navigate('/reporting/kpi')}
          className="flex items-center gap-2 card p-3 hover:border-navy-500 transition-colors">
          <TrendingUp size={14} className="text-teal-400 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-xs font-medium text-white">KPI Dashboard</div>
            <div className="text-xs text-steel-500">Cl.9.1</div>
          </div>
        </button>
      </div>

      {/* Module list */}
      <div className="space-y-2">
        {moduleStatus.map(m => {
          const threshold = m.single ? 1 : (min[m.id] || 1)
          return (
            <button key={m.id} onClick={() => navigate(m.path)}
              className="w-full flex items-center gap-3 p-4 card hover:border-navy-500 transition-colors text-left">
              {loading ? <Circle size={16} className="text-steel-600 flex-shrink-0" /> : statusIcon(m.count, m.single, data[m.id], threshold)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{m.label}</span>
                  {m.mandatory && <span className="text-xs text-amber-audit bg-amber-900/20 px-1.5 py-0.5 rounded">Required</span>}
                  {!m.single && m.count > 0 && m.count < threshold && (
                    <span className="text-xs text-amber-400 bg-amber-900/20 px-1.5 py-0.5 rounded">Min {threshold} needed</span>
                  )}
                </div>
                <div className="text-xs text-steel-500 mt-0.5">
                  {m.clause} · {m.count === 0 ? 'Not started' :
                    data[m.id]?.hasDraft ? `${m.count} record${m.count > 1 ? 's' : ''} — drafts unsaved` :
                    !m.single && m.count < threshold ? `${m.count} of ${threshold} minimum` :
                    `${m.count} record${m.count > 1 ? 's' : ''}`}
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
