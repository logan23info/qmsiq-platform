import { useState, useEffect, useCallback } from 'react'
import { BarChart2, CheckCircle2, AlertTriangle, TrendingUp, Loader2, FileText } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { useProgramme } from '../../context/ProgrammeContext'
import { getFindings, getRisks, getWorkpapers } from '../../lib/supabase'

const inputs = [
  { id: 'audit-results', label: 'Results of Audits', icon: FileText, desc: 'Internal audit findings and external audit outcomes from the period under review.' },
  { id: 'interested-parties', label: 'Issues of Interested Parties', icon: BarChart2, desc: 'Feedback from customers, regulators, certification bodies, and other stakeholders.' },
  { id: 'risk-performance', label: 'Risk & Opportunity Performance', icon: AlertTriangle, desc: 'Status of risks and opportunities identified in information security risk assessment.' },
  { id: 'isms-performance', label: 'ISMS Performance', icon: TrendingUp, desc: 'Measurement results, KPIs, and monitoring metrics against security objectives.' },
  { id: 'nc-corrective', label: 'Nonconformities & Corrective Actions', icon: CheckCircle2, desc: 'Status of all nonconformities and the effectiveness of corrective actions taken.' },
  { id: 'previous-actions', label: 'Follow-up from Previous Reviews', icon: CheckCircle2, desc: 'Actions agreed at the last management review and their current status.' },
  { id: 'changes', label: 'Changes Affecting ISMS', icon: BarChart2, desc: 'Changes in external/internal context, technology, regulatory, and business environment.' },
  { id: 'resources', label: 'Resource Adequacy', icon: FileText, desc: 'Whether adequate resources (people, budget, tools) are available to maintain the ISMS.' },
]

const outputs = [
  { label: 'Decisions on continual improvement opportunities', ref: 'Cl. 10.1' },
  { label: 'Changes needed to the ISMS', ref: 'Cl. 8.1' },
  { label: 'Resource requirements approved', ref: 'Cl. 7.1' },
  { label: 'Actions to address risks and opportunities', ref: 'Cl. 6.1' },
  { label: 'Implications for business continuity', ref: 'Cl. 8.1' },
]

export default function ManagementReview() {
  const { activeProgramme } = useProgramme()
  const [findings, setFindings] = useState([])
  const [risks, setRisks] = useState([])
  const [workpapers, setWorkpapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [completedInputs, setCompletedInputs] = useState({})

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try {
      const [f, r, w] = await Promise.all([getFindings(activeProgramme.id), getRisks(activeProgramme.id), getWorkpapers(activeProgramme.id)])
      setFindings(f); setRisks(r); setWorkpapers(w)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const stats = {
    totalFindings: findings.length,
    openFindings: findings.filter(f => f.status !== 'Closed').length,
    criticalHigh: findings.filter(f => ['Critical', 'High'].includes(f.rating) && f.status !== 'Closed').length,
    risksAbove: risks.filter(r => (r.residual_score || r.residual_likelihood * r.residual_impact) >= 12).length,
    capaRate: findings.length > 0 ? Math.round((findings.filter(f => f.status === 'Closed').length / findings.length) * 100) : 100,
    wpComplete: workpapers.length > 0 ? Math.round((workpapers.filter(w => w.status === 'Signed Off').length / workpapers.length) * 100) : 0,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 27001:2022"
        clause="Clause 9.3"
        title="Management Review Pack"
        description="ISO 27001 Cl. 9.3 requires top management to review the ISMS at planned intervals. This page consolidates all mandatory review inputs from live audit data and generates structured review documentation."
        badges={['Cl. 9.3', 'Live Data', activeProgramme?.programme_id || 'No Programme']}
      />

      {/* Live data summary */}
      {activeProgramme && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-amber-audit" />
            <h2 className="section-title mb-0">Live ISMS Performance Data — {activeProgramme.programme_id}</h2>
          </div>
          {loading ? <div className="flex items-center gap-2 text-xs text-steel-400"><Loader2 size={14} className="animate-spin" /> Loading live data...</div> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Findings', value: stats.totalFindings, color: 'text-white' },
                { label: 'Open Findings', value: stats.openFindings, color: 'text-red-400' },
                { label: 'Critical / High Open', value: stats.criticalHigh, color: stats.criticalHigh > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Risks Above Appetite', value: stats.risksAbove, color: stats.risksAbove > 0 ? 'text-amber-audit' : 'text-emerald-400' },
                { label: 'CAPA Closure Rate', value: `${stats.capaRate}%`, color: stats.capaRate >= 80 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Workpapers Complete', value: `${stats.wpComplete}%`, color: stats.wpComplete >= 80 ? 'text-emerald-400' : 'text-amber-audit' },
              ].map(s => (
                <div key={s.label} className="card-sm text-center">
                  <div className={`font-display text-xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-steel-400 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory inputs checklist */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">Mandatory Review Inputs — ISO 27001 Cl. 9.3.2</h2>
        <p className="text-xs text-steel-400 mb-4 leading-relaxed">All inputs below are mandatory per ISO 27001:2022 Cl. 9.3.2. Tick each off as you confirm the information has been gathered and presented to top management.</p>
        <div className="space-y-3">
          {inputs.map(input => {
            const Icon = input.icon
            const done = completedInputs[input.id]
            return (
              <div key={input.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${done ? 'bg-emerald-900/20 border-emerald-700' : 'bg-navy-800 border-navy-600 hover:border-steel-500'}`}
                onClick={() => setCompletedInputs(p => ({ ...p, [input.id]: !p[input.id] }))}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${done ? 'bg-emerald-500 border-emerald-500' : 'border-steel-500'}`}>
                  {done && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={done ? 'text-emerald-400' : 'text-steel-400'} />
                    <span className={`text-sm font-medium ${done ? 'text-emerald-300' : 'text-white'}`}>{input.label}</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-0.5 leading-relaxed">{input.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between bg-navy-800 rounded-lg px-4 py-3">
          <span className="text-xs text-steel-400">{Object.values(completedInputs).filter(Boolean).length} of {inputs.length} inputs confirmed</span>
          <div className="h-1.5 w-32 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(Object.values(completedInputs).filter(Boolean).length / inputs.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Required outputs */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Required Review Outputs — ISO 27001 Cl. 9.3.3</h2>
        <p className="text-xs text-steel-400 mb-3">The management review must produce documented evidence of these outputs:</p>
        <div className="space-y-2">
          {outputs.map(o => (
            <div key={o.label} className="flex items-start gap-2 text-xs">
              <span className="font-mono text-amber-audit flex-shrink-0">{o.ref}</span>
              <span className="text-steel-300 leading-snug">{o.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AIPanel
        title="Generate Management Review Documentation"
        systemPrompt={`You are an ISO 27001:2022 management review expert. Generate structured management review documents aligned to Clause 9.3. Include all mandatory inputs (Cl. 9.3.2) and required outputs (Cl. 9.3.3). Use the live data provided. Format as a professional board-level document with executive summary, findings summary, risk status, KPIs, and required decisions.

Live ISMS Data Context:
- Total Findings: ${stats.totalFindings} (${stats.openFindings} open, ${stats.criticalHigh} critical/high open)
- CAPA Closure Rate: ${stats.capaRate}%
- Risks Above Appetite: ${stats.risksAbove}
- Workpaper Completion: ${stats.wpComplete}%
- Audit Programme: ${activeProgramme?.programme_id || 'Not selected'}`}
        placeholder="e.g. Generate a complete Q4 management review pack for board presentation including all ISO 27001 Cl. 9.3 mandatory inputs and outputs"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', type: 'text', placeholder: 'e.g. ABC Fintech, 500 employees, AWS cloud' },
          { id: 'period', label: 'Review Period', type: 'text', placeholder: 'e.g. Q4 2025 — January to December 2025' },
          { id: 'opinion', label: 'Overall ISMS Opinion', type: 'select', options: ['Effective — no material gaps', 'Partially Effective — minor gaps', 'Partially Effective — significant gaps', 'Ineffective — material control failures'] },
          { id: 'format', label: 'Document Format', type: 'select', options: ['Full Board Pack', 'Executive Summary only', 'Action Register only', 'Minutes template'] },
        ]}
      />
    </div>
  )
}
