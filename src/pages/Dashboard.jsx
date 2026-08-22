import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { useTeam } from '../context/TeamContext'
import { getFindings, getRisks, getPBCItems, getWorkpapers } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import {
  ClipboardList, AlertTriangle, CheckCircle2, BarChart3,
  ArrowRight, Shield, FileText, Target, TrendingUp,
  Activity, Globe, FolderOpen, Users, Plus
} from 'lucide-react'

function ModeCard({ mode, title, desc, color, accent, items, cta, ctaPath, navigate }) {
  return (
    <div className={`card border-l-4 ${accent}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{mode}</span>
      </div>
      <h2 className="text-base font-semibold text-white mb-1">{title}</h2>
      <p className="text-xs text-steel-400 mb-4 leading-relaxed">{desc}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 rounded-xl p-2.5 transition-colors text-left group">
            <item.icon size={13} className={`${color} flex-shrink-0`} />
            <span className="text-xs text-steel-300 group-hover:text-white transition-colors leading-snug">{item.label}</span>
          </button>
        ))}
      </div>
      <button onClick={() => navigate(ctaPath)}
        className="text-xs text-steel-400 hover:text-white transition-colors flex items-center gap-1">
        {cta} <ArrowRight size={11} />
      </button>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center justify-between bg-navy-800 rounded-xl px-3 py-2">
      <span className="text-xs text-steel-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { activeProgramme, programmes } = useProgramme()
  const { myRole } = useTeam()
  const [stats, setStats] = useState(null)
  const [recentFindings, setRecentFindings] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeProgramme) return
    setLoading(true)
    Promise.all([
      getFindings(activeProgramme.id).catch(() => []),
      getRisks(activeProgramme.id).catch(() => []),
      getPBCItems(activeProgramme.id).catch(() => []),
      getWorkpapers(activeProgramme.id).catch(() => []),
    ]).then(([findings, risks, pbc, workpapers]) => {
      const open = findings.filter(f => !['Closed', 'Verified Effective'].includes(f.status))
      const major = findings.filter(f => f.rating === 'Major NC')
      const pbcPending = pbc.filter(p => p.status === 'Not Started' || p.status === 'Requested')
      const wpSigned = workpapers.filter(w => w.status === 'Signed Off').length
      setStats({
        findings: findings.length, openFindings: open.length, majorNC: major.length,
        risks: risks.length, pbc: pbc.length, pbcPending: pbcPending.length,
        workpapers: workpapers.length, wpSigned,
      })
      setRecentFindings(findings.slice(0, 4))
      setLoading(false)
    })
  }, [activeProgramme])

  const name = profile?.full_name?.split(' ')[0] || 'Auditor'

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Welcome */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-steel-400 text-xs mb-1">Welcome back, <span className="text-white font-medium">{name}</span></div>
            <h1 className="text-xl font-bold text-white mb-1">QMSiQ</h1>
            <p className="text-xs text-steel-400">Quality Management Audit Platform — ISO 9001 · ISO 19011</p>
          </div>
          {!activeProgramme ? (
            <button onClick={() => {}} className="btn-primary text-xs">
              <Plus size={13} /> Start Auditing
            </button>
          ) : (
            <div className="text-right">
              <div className="text-xs text-steel-500 mb-0.5">Active programme</div>
              <div className="text-sm font-semibold text-white">{activeProgramme.name || activeProgramme.programme_id}</div>
              {myRole && <span className={`badge text-xs mt-1 ${myRole === 'lead' ? 'bg-amber-900/40 text-amber-300' : myRole === 'auditor' ? 'bg-blue-900/40 text-blue-300' : 'bg-purple-900/40 text-purple-300'}`}>{myRole}</span>}
            </div>
          )}
        </div>
      </div>

      {/* No programme selected */}
      {!activeProgramme && (
        <div className="card text-center py-10 border border-dashed border-navy-600">
          <FolderOpen size={28} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">No audit programme selected</div>
          <div className="text-xs text-steel-400 mb-4">Select or create a programme to start auditing or reviewing your QMS</div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/programmes')} className="btn-secondary text-xs">View all programmes</button>
          </div>
        </div>
      )}

      {/* Live stats — only when programme active */}
      {activeProgramme && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open findings', value: stats.openFindings, color: stats.openFindings > 0 ? 'text-red-400' : 'text-emerald-400', icon: AlertTriangle },
            { label: 'Major NCs', value: stats.majorNC, color: stats.majorNC > 0 ? 'text-red-400' : 'text-steel-400', icon: Shield },
            { label: 'PBC pending', value: stats.pbcPending, color: stats.pbcPending > 0 ? 'text-amber-400' : 'text-emerald-400', icon: ClipboardList },
            { label: 'WPs signed off', value: `${stats.wpSigned}/${stats.workpapers}`, color: 'text-blue-400', icon: CheckCircle2 },
          ].map(s => (
            <div key={s.label} className="card-sm">
              <s.icon size={14} className={`${s.color} mb-2`} />
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{loading ? '—' : s.value}</div>
              <div className="text-xs text-steel-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModeCard
          mode="Conduct an audit"
          title="ISO 19011 audit methodology"
          desc="Independent verification using TOD/TOI/TOE fieldwork and 4Cs finding framework."
          color="text-teal-400"
          accent="border-l-teal-500"
          navigate={navigate}
          ctaPath="/iso19011/clause4"
          cta="Start with ISO 19011 methodology"
          items={[
            { label: 'PBC evidence list', path: '/fieldwork/pbc', icon: ClipboardList },
            { label: 'Fieldwork tracker', path: '/fieldwork/tracker', icon: CheckCircle2 },
            { label: 'Finding register', path: '/fieldwork/findings', icon: AlertTriangle },
            { label: 'Workpapers', path: '/fieldwork/workpapers', icon: FolderOpen },
            { label: 'Surveillance audit', path: '/surveillance', icon: Shield },
            { label: 'Audit report', path: '/reporting/builder', icon: FileText },
          ]}
        />
        <ModeCard
          mode="Review your QMS"
          title="ISO 9001 performance review"
          desc="Assess readiness, monitor risks, track CAPA, and prepare management review."
          color="text-purple-400"
          accent="border-l-purple-500"
          navigate={navigate}
          ctaPath="/fieldwork/gap-analysis"
          cta="Start with gap analysis"
          items={[
            { label: 'Gap analysis', path: '/fieldwork/gap-analysis', icon: Target },
            { label: 'Risk register', path: '/reporting/risks', icon: BarChart3 },
            { label: 'CAPA tracker', path: '/reporting/capa', icon: CheckCircle2 },
            { label: 'KPI dashboard', path: '/reporting/kpi', icon: Activity },
            { label: 'Management review', path: '/reporting/management-review', icon: TrendingUp },
            { label: 'Audit universe', path: '/reporting/universe', icon: Globe },
          ]}
        />
      </div>

      {/* Recent findings */}
      {activeProgramme && recentFindings.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Recent findings</h2>
            <button onClick={() => navigate('/fieldwork/findings')}
              className="text-xs text-steel-400 hover:text-white transition-colors flex items-center gap-1">
              All findings <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {recentFindings.map(f => (
              <div key={f.id} className="flex items-center gap-3 bg-navy-800 rounded-xl px-3 py-2.5">
                <span className={`badge text-xs border flex-shrink-0 ${
                  f.rating === 'Major NC' ? 'bg-red-900/40 text-red-300 border-red-700' :
                  f.rating === 'Minor NC' ? 'bg-orange-900/40 text-orange-300 border-orange-700' :
                  'bg-amber-900/40 text-amber-300 border-amber-700'
                }`}>{f.rating}</span>
                <span className="text-xs text-steel-300 flex-1 truncate">{f.title}</span>
                <span className={`badge text-xs ${f.status === 'Closed' ? 'bg-emerald-900/40 text-emerald-300' : f.status === 'Verified Effective' ? 'bg-blue-900/40 text-blue-300' : f.status === 'CAPA Raised' ? 'bg-amber-900/40 text-amber-300' : 'bg-navy-700 text-steel-400'}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programme overview strip */}
      {programmes.length > 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">All programmes</h2>
            <button onClick={() => navigate('/programmes')}
              className="text-xs text-steel-400 hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {programmes.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => navigate('/programmes')}
                className={`text-left bg-navy-800 hover:bg-navy-700 rounded-xl p-3 transition-colors ${activeProgramme?.id === p.id ? 'ring-1 ring-amber-800/60' : ''}`}>
                <div className="text-xs font-medium text-white truncate mb-1">{p.name || p.programme_id}</div>
                <div className="text-xs text-steel-500">{p.programme_type || p.status || 'Internal Audit'}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
