import { useState, useEffect } from 'react'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, BarChart3, FileText, AlertTriangle, CheckCircle2, Clock, FolderOpen, Zap, TrendingUp, Activity, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { getWorkpapers, getFindings, getRisks, getPBCItems } from '../lib/supabase'

const quickAccess = [
  { label: 'Clause 4 — Principles', path: '/iso19011/clause4', tag: 'ISO 19011', color: 'border-amber-audit/30 hover:border-amber-audit/60' },
  { label: 'TOD — Test of Design', path: '/iso19011/tod', tag: 'TOD', color: 'border-blue-800 hover:border-blue-600' },
  { label: 'TOI — Test of Implementation', path: '/iso19011/toi', tag: 'TOI', color: 'border-purple-800 hover:border-purple-600' },
  { label: 'TOE — Test of Effectiveness', path: '/iso19011/toe', tag: 'TOE', color: 'border-emerald-800 hover:border-emerald-600' },
  { label: 'Finding Register ⭐', path: '/fieldwork/findings', tag: 'Live', color: 'border-red-800 hover:border-red-600' },
  { label: 'Risk Register ⭐', path: '/iso27005/live-register', tag: 'Live', color: 'border-orange-800 hover:border-orange-600' },
  { label: 'Statement of Applicability', path: '/iso27001/clause6', tag: '27001', color: 'border-navy-600 hover:border-steel-400/50' },
  { label: 'Workpaper Library ☁️', path: '/fieldwork/library', tag: 'Cloud', color: 'border-navy-600 hover:border-steel-400/50' },
  { label: 'Audit Report Builder', path: '/reporting/builder', tag: 'Report', color: 'border-pink-800 hover:border-pink-600' },
  { label: 'Management Review Pack', path: '/reporting/management-review', tag: 'Mgmt', color: 'border-navy-600 hover:border-steel-400/50' },
  { label: 'KPI Dashboard', path: '/reporting/kpi', tag: 'KPI', color: 'border-navy-600 hover:border-steel-400/50' },
  { label: 'Audit Universe ⭐', path: '/reporting/universe', tag: 'Live', color: 'border-cyan-800 hover:border-cyan-600' },
]

function StatCard({ label, value, sub, color, icon: Icon, loading }) {
  return (
    <div className="card-sm">
      <div className="flex items-start justify-between mb-2">
        <Icon size={16} className={color} />
      </div>
      {loading
        ? <div className="h-8 w-12 bg-navy-700 rounded animate-pulse mb-1" />
        : <div className={`font-display text-2xl font-bold mb-1 ${color}`}>{value}</div>}
      <div className="text-xs font-medium text-steel-200">{label}</div>
      {sub && <div className="text-xs text-steel-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { activeProgramme, programmes } = useProgramme()
  const [stats, setStats] = useState({ workpapers: 0, findings: 0, openFindings: 0, risks: 0, risksAboveAppetite: 0, pbcOutstanding: 0 })
  const [loading, setLoading] = useState(false)
  const [recentWorkpapers, setRecentWorkpapers] = useState([])
  const [recentFindings, setRecentFindings] = useState([])

  useEffect(() => {
    if (!activeProgramme) return
    const load = async () => {
      setLoading(true)
      try {
        const [wps, findings, risks, pbc] = await Promise.all([
          getWorkpapers(activeProgramme.id),
          getFindings(activeProgramme.id),
          getRisks(activeProgramme.id),
          getPBCItems(activeProgramme.id),
        ])
        setStats({
          workpapers: wps.length,
          findings: findings.length,
          openFindings: findings.filter(f => f.status === 'Open').length,
          risks: risks.length,
          risksAboveAppetite: risks.filter(r => (r.residual_score || r.residual_likelihood * r.residual_impact) >= 12).length,
          pbcOutstanding: pbc.filter(p => p.status !== 'Received').length,
        })
        setRecentWorkpapers(wps.slice(0, 5))
        setRecentFindings(findings.slice(0, 5))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [activeProgramme])

  const ratingColor = { Critical: 'text-red-400', High: 'text-orange-400', Medium: 'text-amber-audit', 'Low / Advisory': 'text-steel-400' }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Hero */}
      <div className="card border-navy-600 bg-gradient-to-br from-navy-800 to-navy-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-steel-400 mb-1">
              Welcome back, <span className="text-white font-medium">{profile?.full_name || profile?.email || 'Auditor'}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-1">AuditIQ</h2>
            <p className="text-steel-300 text-sm max-w-xl leading-relaxed">
              IT Audit Intelligence Platform — ISO 19011 · 27001 · 27002 · 27005 · 9001
            </p>
          </div>
          <button onClick={() => navigate('/iso19011/clause4')} className="btn-primary flex-shrink-0">
            Start Auditing <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Active Programme */}
      {activeProgramme ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen size={15} className="text-amber-audit" />
                <span className="text-sm font-semibold text-white">{activeProgramme.programme_id} — {activeProgramme.name}</span>
                <span className={`badge text-xs ${activeProgramme.status === 'In Progress' ? 'bg-amber-900/40 text-amber-300' : activeProgramme.status === 'Closed' ? 'badge-steel' : 'bg-blue-900/40 text-blue-300'}`}>{activeProgramme.status}</span>
              </div>
              <div className="text-xs text-steel-400 ml-6">
                {activeProgramme.standards?.join(' · ')} {activeProgramme.audit_period_start && `· ${activeProgramme.audit_period_start} to ${activeProgramme.audit_period_end}`}
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Workpapers', value: stats.workpapers, sub: 'saved to cloud', color: 'text-blue-400', icon: FileText },
              { label: 'Total Findings', value: stats.findings, sub: `${stats.openFindings} open`, color: 'text-red-400', icon: AlertTriangle },
              { label: 'Open Findings', value: stats.openFindings, sub: 'need attention', color: 'text-orange-400', icon: Clock },
              { label: 'Risks Logged', value: stats.risks, sub: `${stats.risksAboveAppetite} above appetite`, color: 'text-amber-audit', icon: Database },
              { label: 'PBC Outstanding', value: stats.pbcOutstanding, sub: 'evidence needed', color: 'text-purple-400', icon: CheckCircle2 },
              { label: 'Programmes', value: programmes.length, sub: 'total', color: 'text-emerald-400', icon: FolderOpen },
            ].map(s => <StatCard key={s.label} {...s} loading={loading} />)}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Workpapers */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Recent Workpapers</h2>
                <button onClick={() => navigate('/fieldwork/library')} className="text-xs text-amber-audit hover:text-amber-300 flex items-center gap-1">View all <ArrowRight size={11} /></button>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-navy-800 rounded animate-pulse" />)}</div>
              ) : recentWorkpapers.length === 0 ? (
                <div className="text-center py-6">
                  <FileText size={24} className="text-steel-600 mx-auto mb-2" />
                  <div className="text-xs text-steel-400">No workpapers yet</div>
                  <button onClick={() => navigate('/fieldwork/library')} className="btn-secondary text-xs mt-2">Upload First File</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentWorkpapers.map(wp => (
                    <div key={wp.id} className="flex items-center justify-between bg-navy-800 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-audit text-xs font-bold">{wp.workpaper_ref}</span>
                          <span className="text-xs text-white truncate">{wp.title}</span>
                        </div>
                        <div className="text-xs text-steel-500">{wp.standard} · {wp.phase}</div>
                      </div>
                      <span className={`badge text-xs ${wp.status === 'Signed Off' ? 'bg-emerald-900/30 text-emerald-300' : wp.status === 'In Review' ? 'bg-amber-900/30 text-amber-300' : 'bg-blue-900/30 text-blue-300'}`}>{wp.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Findings */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Recent Findings</h2>
                <button onClick={() => navigate('/fieldwork/findings')} className="text-xs text-amber-audit hover:text-amber-300 flex items-center gap-1">View all <ArrowRight size={11} /></button>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-navy-800 rounded animate-pulse" />)}</div>
              ) : recentFindings.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle size={24} className="text-steel-600 mx-auto mb-2" />
                  <div className="text-xs text-steel-400">No findings raised yet</div>
                  <button onClick={() => navigate('/fieldwork/findings')} className="btn-secondary text-xs mt-2">Raise First Finding</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentFindings.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-navy-800 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-audit text-xs font-bold">{f.finding_ref}</span>
                          <span className={`text-xs font-semibold ${ratingColor[f.rating] || 'text-steel-400'}`}>{f.rating}</span>
                        </div>
                        <div className="text-xs text-white truncate">{f.title}</div>
                      </div>
                      <span className={`badge text-xs ${f.status === 'Closed' ? 'bg-emerald-900/30 text-emerald-300' : f.status === 'In Progress' ? 'bg-amber-900/30 text-amber-300' : 'bg-red-900/30 text-red-300'}`}>{f.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* No programme selected */
        <div className="card text-center py-10">
          <FolderOpen size={36} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-semibold mb-1">No Audit Programme Selected</div>
          <div className="text-xs text-steel-400 mb-4">Click the folder icon in the header to create or select an audit programme</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-sm mx-auto text-xs text-steel-400">
            {[{ icon: FileText, label: 'Workpapers' }, { icon: AlertTriangle, label: 'Findings' }, { icon: Database, label: 'Risks' }, { icon: Activity, label: 'KPIs' }].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 bg-navy-800 rounded-lg p-3">
                <s.icon size={16} className="text-steel-500" />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programme Health */}
      {activeProgramme && !loading && stats.workpapers > 0 && (
        <div className="card">
          <h2 className="section-title mb-3">Programme Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Findings Closure', value: stats.total > 0 ? Math.round(((stats.total - stats.openFindings) / stats.total) * 100) : 100, color: 'bg-emerald-500', target: 80 },
              { label: 'PBC Evidence', value: stats.pbcOutstanding > 0 ? Math.round(((stats.workpapers - stats.pbcOutstanding) / stats.workpapers) * 100) : 100, color: 'bg-blue-500', target: 85 },
              { label: 'Risk Coverage', value: stats.risks > 0 ? Math.round(((stats.risks - stats.risksAboveAppetite) / stats.risks) * 100) : 100, color: 'bg-purple-500', target: 90 },
            ].map(h => (
              <div key={h.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-steel-400">{h.label}</span>
                  <span className={`text-xs font-bold ${h.value >= h.target ? 'text-emerald-400' : 'text-amber-audit'}`}>{h.value}%</span>
                </div>
                <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div className={`h-full ${h.color} rounded-full transition-all duration-700`} style={{ width: `${h.value}%` }} />
                </div>
                <div className="text-xs text-steel-500 mt-1">Target: {h.target}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activeProgramme && (
        <div className="card">
          <h2 className="section-title mb-3">Recent Activity</h2>
          {loading ? <Skeleton rows={4} /> : (
            <div className="space-y-2">
              {[
                ...recentFindings.slice(0,2).map(f => ({
                  icon: '⚠️', label: `Finding raised — ${f.finding_ref}: ${f.title}`,
                  sub: f.rating, color: 'text-red-400', time: f.created_at
                })),
                ...recentWorkpapers.slice(0,2).map(w => ({
                  icon: '📋', label: `Workpaper — ${w.workpaper_ref}: ${w.title}`,
                  sub: w.status, color: 'text-blue-400', time: w.created_at
                })),
              ]
              .filter(a => a.time)
              .sort((a,b) => new Date(b.time) - new Date(a.time))
              .slice(0,5)
              .map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0">
                  <span className="text-base flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{a.label}</div>
                    <div className={`text-xs ${a.color}`}>{a.sub}</div>
                  </div>
                  <div className="text-xs text-steel-500 flex-shrink-0">
                    {new Date(a.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
              {recentFindings.length === 0 && recentWorkpapers.length === 0 && (
                <div className="text-xs text-steel-500 text-center py-4">No activity yet — start by raising a finding or logging a risk</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h2 className="section-title mb-3">Quick Access — All Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickAccess.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`card-sm text-left border transition-all duration-150 hover:bg-navy-800 group ${item.color}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-steel-100 truncate">{item.label}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="badge badge-steel text-xs">{item.tag}</span>
                  <ArrowRight size={12} className="text-steel-500 group-hover:text-steel-300 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
