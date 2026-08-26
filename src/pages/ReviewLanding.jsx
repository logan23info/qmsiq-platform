import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, BarChart3, CheckCircle2, TrendingUp,
  Globe, AlertTriangle, ChevronRight, ArrowRight,
  BookOpen, FileText, Layers
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useProgramme } from '../context/ProgrammeContext'
import { getFindings, getRisks } from '../lib/supabase'

const SECTIONS = [
  {
    label: 'Assess', color: 'text-amber-audit', border: 'border-amber-800/40', bg: 'bg-amber-900/10',
    items: [
      { label: 'Gap Analysis', path: '/fieldwork/gap-analysis', icon: Target, desc: 'ISO 9001 Cl.4–10 RAG per clause — where are you now?' },
      { label: 'Audit Universe', path: '/reporting/universe', icon: Globe, desc: 'Multi-programme audit planning and scheduling' },
      { label: 'ISO 9001 Reference', path: '/iso9001/clause4', icon: BookOpen, desc: 'Full Cl.4–10 clause guidance and requirements' },
      { label: 'ISO 9000 Terminology', path: '/iso9000', icon: Layers, desc: '44 quality management terms and definitions' },
    ]
  },
  {
    label: 'Monitor', color: 'text-teal-400', border: 'border-teal-800/40', bg: 'bg-teal-900/10',
    items: [
      { label: 'KPI Dashboard', path: '/reporting/kpi', icon: TrendingUp, desc: 'Cl.9.1 — live quality metrics from your programme data' },
      { label: 'Risk Register', path: '/reporting/risks', icon: BarChart3, desc: 'Likelihood × Impact — treatment, owner, status' },
      { label: 'CAPA Tracker', path: '/reporting/capa', icon: CheckCircle2, desc: 'Corrective actions — root cause, owner, due date, closure' },
      { label: 'Finding Register', path: '/fieldwork/findings', icon: AlertTriangle, desc: 'Open NCs and observations from all audits' },
    ]
  },
  {
    label: 'Review', color: 'text-purple-400', border: 'border-purple-800/40', bg: 'bg-purple-900/10',
    items: [
      { label: 'Management Review', path: '/reporting/management-review', icon: FileText, desc: 'Cl.9.3 — agenda, inputs, outputs, action items' },
      { label: 'Audit Report Builder', path: '/reporting/builder', icon: FileText, desc: 'Generate ISO 19011 compliant audit reports' },
    ]
  },
]

export default function ReviewLanding() {
  const navigate = useNavigate()
  const { activeProgramme } = useProgramme()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!activeProgramme) return
    Promise.all([
      getFindings(activeProgramme.id).catch(() => []),
      getRisks(activeProgramme.id).catch(() => []),
    ]).then(([findings, risks]) => {
      setStats({
        openFindings: findings.filter(f => !['Closed', 'Verified Effective'].includes(f.status)).length,
        majorNC: findings.filter(f => f.rating === 'Major NC' && f.status === 'Open').length,
        highRisks: risks.filter(r => ['High', 'Critical'].includes(r.risk_level) && r.status !== 'Closed').length,
        openCAPAs: findings.filter(f => f.status === 'CAPA Raised').length,
      })
    })
  }, [activeProgramme])

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Review Your QMS"
        subtitle="ISO 9001:2015 — Performance monitoring and continual improvement"
        badges={['ISO 9001', 'Cl.9', 'Cl.10']}
      />

      {/* Live snapshot */}
      {activeProgramme && stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Open findings', value: stats.openFindings, color: stats.openFindings > 0 ? 'text-red-400' : 'text-emerald-400', path: '/fieldwork/findings' },
            { label: 'Major NCs', value: stats.majorNC, color: stats.majorNC > 0 ? 'text-red-400' : 'text-steel-400', path: '/fieldwork/findings' },
            { label: 'High risks', value: stats.highRisks, color: stats.highRisks > 0 ? 'text-amber-400' : 'text-steel-400', path: '/reporting/risks' },
            { label: 'Open CAPAs', value: stats.openCAPAs, color: stats.openCAPAs > 0 ? 'text-amber-400' : 'text-emerald-400', path: '/reporting/capa' },
          ].map(s => (
            <button key={s.label} onClick={() => navigate(s.path)}
              className="card-sm text-left hover:border-navy-500 transition-colors">
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-steel-400">{s.label}</div>
            </button>
          ))}
        </div>
      )}

      {!activeProgramme && (
        <div className="card mb-6 border border-dashed border-navy-600 text-center py-6">
          <div className="text-sm text-steel-400 mb-3">Select a programme to see live metrics</div>
          <button onClick={() => navigate('/programmes')} className="btn-primary text-sm">
            View programmes <ArrowRight size={13} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {SECTIONS.map(sec => (
          <div key={sec.label} className={`border ${sec.border} ${sec.bg} rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${sec.border}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${sec.color}`}>{sec.label}</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {sec.items.map(s => (
                <button key={s.path} onClick={() => navigate(s.path)}
                  className="flex items-start gap-2.5 bg-navy-800/60 hover:bg-navy-700 rounded-xl p-3 text-left transition-colors group">
                  <s.icon size={13} className={`${sec.color} flex-shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white leading-snug">{s.label}</div>
                    <div className="text-xs text-steel-500 leading-snug mt-0.5">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/fieldwork/gap-analysis')}
        className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-steel-400 hover:text-white transition-colors py-2">
        Start with Gap Analysis — baseline your current QMS <ChevronRight size={12} />
      </button>
    </div>
  )
}
