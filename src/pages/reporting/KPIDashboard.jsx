import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, FileText, Shield, Loader2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useProgramme } from '../../context/ProgrammeContext'
import AIPanel from '../../components/AIPanel'
import { getWorkpapers, getFindings, getRisks, getPBCItems } from '../../lib/supabase'

function KPICard({ label, value, target, unit, trend, desc, color, icon: Icon, loading }) {
  const met = typeof value === 'number' && typeof target === 'number' ? value >= target : null
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <Icon size={16} className={color} />
        {trend === 'up' ? <TrendingUp size={14} className="text-emerald-400" /> : trend === 'down' ? <TrendingDown size={14} className="text-red-400" /> : <Minus size={14} className="text-steel-500" />}
      </div>
      {loading ? <div className="h-8 w-16 bg-navy-700 rounded animate-pulse mb-1" /> : <div className={`font-display text-3xl font-bold mb-1 ${color}`}>{value}{unit}</div>}
      <div className="text-sm font-medium text-white mb-1">{label}</div>
      {target !== undefined && <div className={`text-xs mb-1 ${met ? 'text-emerald-400' : 'text-red-400'}`}>{met ? '✓' : '✗'} Target: {target}{unit}</div>}
      <div className="text-xs text-steel-400 leading-relaxed">{desc}</div>

        <div className="mt-6">
          <AIPanel
            title="AI — Interpret KPI Results & Recommend Actions"
            systemPrompt="You are an ISO 27004:2016 information security measurement specialist. Analyse KPI results and generate actionable recommendations. Interpret metrics in context of ISO 27001 requirements and industry benchmarks. Produce board-ready KPI commentary and improvement recommendations."
            placeholder="e.g. CAPA closure rate is 45% (target 80%), 3 critical findings open, 2 risks above appetite — generate executive commentary and action plan"
            contextFields={[
              { id: 'kpis', label: 'Current KPI Values', type: 'textarea', placeholder: 'e.g. CAPA closure: 45%, Critical open: 3, PBC receipt: 60%, Risks above appetite: 2' },
              { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Executive KPI Commentary', 'KPI Improvement Action Plan', 'Board KPI Report', 'KPI Trend Analysis', 'ISO 27004 Measurement Report'] },
              { id: 'audience', label: 'Audience', type: 'select', options: ['Board / Executive', 'Audit Committee', 'CISO / IT Management', 'Certification Body'] },
            ]}
          />
        </div>
    </div>
  )
}

export default function KPIDashboard() {
  const { activeProgramme } = useProgramme()
  const [data, setData] = useState({ workpapers: [], findings: [], risks: [], pbc: [] })
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try {
      const [workpapers, findings, risks, pbc] = await Promise.all([
        getWorkpapers(activeProgramme.id),
        getFindings(activeProgramme.id),
        getRisks(activeProgramme.id),
        getPBCItems(activeProgramme.id),
      ])
      setData({ workpapers, findings, risks, pbc })
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const { workpapers, findings, risks, pbc } = data

  // Calculate KPIs
  const totalFindings = findings.length
  const closedFindings = findings.filter(f => f.status === 'Closed').length
  const capaRate = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 100
  const criticalOpen = findings.filter(f => f.rating === 'Critical' && f.status !== 'Closed').length
  const highOpen = findings.filter(f => f.rating === 'High' && f.status !== 'Closed').length
  const risksAboveAppetite = risks.filter(r => (r.residual_score || (r.residual_likelihood * r.residual_impact)) >= 12).length
  const risksCovered = risks.length > 0 ? Math.round(((risks.length - risksAboveAppetite) / risks.length) * 100) : 100
  const pbcReceived = pbc.length > 0 ? Math.round((pbc.filter(p => p.status === 'Received').length / pbc.length) * 100) : 0
  const wpSignedOff = workpapers.length > 0 ? Math.round((workpapers.filter(w => w.status === 'Signed Off').length / workpapers.length) * 100) : 0
  const overdueFindings = findings.filter(f => f.due_date && new Date(f.due_date) < new Date() && f.status !== 'Closed').length

  const kpis = [
    { label: 'CAPA Closure Rate', value: capaRate, target: 80, unit: '%', trend: capaRate >= 80 ? 'up' : 'down', desc: `${closedFindings} of ${totalFindings} findings closed`, color: capaRate >= 80 ? 'text-emerald-400' : 'text-red-400', icon: CheckCircle2 },
    { label: 'Critical Findings Open', value: criticalOpen, target: 0, unit: '', trend: criticalOpen === 0 ? 'up' : 'down', desc: 'Must be zero — immediate escalation required', color: criticalOpen === 0 ? 'text-emerald-400' : 'text-red-400', icon: AlertTriangle },
    { label: 'High Findings Open', value: highOpen, target: 0, unit: '', trend: highOpen === 0 ? 'up' : 'down', desc: 'Should be zero — 30-day remediation window', color: highOpen === 0 ? 'text-emerald-400' : 'text-orange-400', icon: AlertTriangle },
    { label: 'Risks Above Appetite', value: risksAboveAppetite, target: 0, unit: '', trend: risksAboveAppetite === 0 ? 'up' : 'down', desc: `Residual score ≥12 — requires treatment or acceptance`, color: risksAboveAppetite === 0 ? 'text-emerald-400' : 'text-red-400', icon: Shield },
    { label: 'Risk Coverage', value: risksCovered, target: 90, unit: '%', trend: risksCovered >= 90 ? 'up' : 'down', desc: `${risks.length - risksAboveAppetite} of ${risks.length} risks within appetite`, color: risksCovered >= 90 ? 'text-emerald-400' : 'text-amber-audit', icon: Shield },
    { label: 'PBC Evidence Receipt', value: pbcReceived, target: 85, unit: '%', trend: pbcReceived >= 85 ? 'up' : 'down', desc: `${pbc.filter(p => p.status === 'Received').length} of ${pbc.length} items received`, color: pbcReceived >= 85 ? 'text-emerald-400' : 'text-amber-audit', icon: FileText },
    { label: 'Workpaper Sign-Off', value: wpSignedOff, target: 100, unit: '%', trend: wpSignedOff >= 100 ? 'up' : 'down', desc: `${workpapers.filter(w => w.status === 'Signed Off').length} of ${workpapers.length} workpapers signed off`, color: wpSignedOff >= 100 ? 'text-emerald-400' : 'text-amber-audit', icon: FileText },
    { label: 'Overdue Actions', value: overdueFindings, target: 0, unit: '', trend: overdueFindings === 0 ? 'up' : 'down', desc: 'Findings past their agreed remediation date', color: overdueFindings === 0 ? 'text-emerald-400' : 'text-red-400', icon: TrendingDown },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 27004" clause="KPI Dashboard" title="KPI Dashboard ⭐ Live" description="Live metrics calculated from your active audit programme data — findings, risks, workpapers, and PBC evidence. All KPIs update in real time as you work." badges={['Live Data', 'ISO 27004', activeProgramme?.programme_id || 'No Programme']} />

      {!activeProgramme ? (
        <div className="card text-center py-12"><div className="text-white font-medium mb-1">No programme selected</div><div className="text-xs text-steel-400">Select a programme from the header</div></div>
      ) : (
        <>
          {loading && <div className="card text-center py-6 mb-4"><Loader2 size={20} className="animate-spin text-steel-400 mx-auto mb-2" /><div className="text-xs text-steel-400">Loading KPI data...</div></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} loading={loading} />)}
          </div>
          <div className="card mt-6">
            <div className="text-xs font-semibold text-white mb-3">Programme Summary — {activeProgramme.programme_id}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Workpapers', value: workpapers.length, color: 'text-blue-400' },
                { label: 'Findings', value: totalFindings, color: 'text-red-400' },
                { label: 'Risks', value: risks.length, color: 'text-amber-audit' },
                { label: 'PBC Items', value: pbc.length, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="text-center bg-navy-800 rounded-lg p-3">
                  <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-steel-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
