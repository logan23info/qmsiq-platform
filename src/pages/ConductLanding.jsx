import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, AlertTriangle, CheckCircle2, FolderOpen,
  Shield, FileText, Users, BookOpen, ArrowRight,
  ChevronRight, BarChart3, Truck, RefreshCw
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useProgramme } from '../context/ProgrammeContext'

const PHASES = [
  {
    phase: '1', label: 'Plan', color: 'text-blue-400', border: 'border-blue-800/40', bg: 'bg-blue-900/10',
    steps: [
      { label: 'ISO 19011 Methodology', path: '/iso19011/clause4', icon: BookOpen, desc: 'Cl.4–7 audit principles and planning framework' },
      { label: 'Audit Programme Setup', path: '/programmes', icon: ClipboardList, desc: 'Create programme, define scope, assign team' },
      { label: 'Team & Roles', path: '/team', icon: Users, desc: 'Assign Lead Auditor, Auditors, Reviewers' },
    ]
  },
  {
    phase: '2', label: 'Execute', color: 'text-amber-400', border: 'border-amber-800/40', bg: 'bg-amber-900/10',
    steps: [
      { label: 'PBC Evidence List', path: '/fieldwork/pbc', icon: ClipboardList, desc: 'Request and track evidence from auditee' },
      { label: 'Fieldwork Tracker', path: '/fieldwork/tracker', icon: CheckCircle2, desc: 'TOD / TOI / TOE workpaper completion' },
      { label: 'Workpaper Index', path: '/fieldwork/workpapers', icon: FolderOpen, desc: 'Document audit procedures and conclusions' },
      { label: 'Gap Analysis', path: '/fieldwork/gap-analysis', icon: BarChart3, desc: 'Cl.4–10 RAG assessment against ISO 9001' },
    ]
  },
  {
    phase: '3', label: 'Report', color: 'text-emerald-400', border: 'border-emerald-800/40', bg: 'bg-emerald-900/10',
    steps: [
      { label: 'Finding Register', path: '/fieldwork/findings', icon: AlertTriangle, desc: 'Major NC / Minor NC / Observation — 4Cs framework' },
      { label: 'Audit Report Builder', path: '/reporting/builder', icon: FileText, desc: 'Generate and export audit report PDF' },
    ]
  },
  {
    phase: '4', label: 'Specialised', color: 'text-purple-400', border: 'border-purple-800/40', bg: 'bg-purple-900/10',
    steps: [
      { label: 'Surveillance Audit', path: '/surveillance', icon: Shield, desc: 'Periodic surveillance — targeted scope' },
      { label: 'Supplier Audit', path: '/fieldwork/supplier-audit', icon: Truck, desc: 'ISO 9001 Cl.8.4 — external provider control' },
      { label: 'Recertification Audit', path: '/surveillance', icon: RefreshCw, desc: 'Full-scope recertification cycle — uses Surveillance Audit workflow' },
      { label: 'Audit Universe', path: '/reporting/universe', icon: BookOpen, desc: 'Multi-programme audit planning' },
    ]
  },
]

export default function ConductLanding() {
  const navigate = useNavigate()
  const { activeProgramme } = useProgramme()

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Conduct an Audit"
        subtitle="ISO 19011:2018 — Independent audit methodology"
        badges={['ISO 19011', 'TOD/TOI/TOE', '4Cs Framework']}
      />

      {!activeProgramme && (
        <div className="card mb-6 border border-dashed border-navy-600 text-center py-6">
          <div className="text-sm text-steel-400 mb-3">Select or create an audit programme to start</div>
          <button onClick={() => navigate('/programmes')} className="btn-primary text-sm">
            View programmes <ArrowRight size={13} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {PHASES.map(ph => (
          <div key={ph.phase} className={`border ${ph.border} ${ph.bg} rounded-xl overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b ${ph.border} flex items-center gap-2`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${ph.color}`}>Phase {ph.phase}</span>
              <span className="text-sm font-medium text-white">{ph.label}</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {ph.steps.map(s => (
                <button key={s.path} onClick={() => navigate(s.path)}
                  className="flex items-start gap-2.5 bg-navy-800/60 hover:bg-navy-700 rounded-xl p-3 text-left transition-colors group">
                  <s.icon size={13} className={`${ph.color} flex-shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white group-hover:text-white leading-snug">{s.label}</div>
                    <div className="text-xs text-steel-500 leading-snug mt-0.5">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/iso19011/clause4')}
        className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-steel-400 hover:text-white transition-colors py-2">
        Start with ISO 19011 Cl.4 — Principles <ChevronRight size={12} />
      </button>
    </div>
  )
}
