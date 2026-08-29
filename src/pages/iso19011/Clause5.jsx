import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const elements = [
  { clause: '5.2', title: 'Audit Programme Objectives', color: 'border-l-blue-500',
    desc: 'Establish measurable objectives for the entire audit programme — aligned to management system goals, risk levels, and regulatory requirements.',
    items: ['Alignment to ISMS strategic objectives', 'Regulatory and contractual requirements considered', 'Risk appetite and auditee risk levels reflected', 'Available resources and auditor competence assessed', 'Results of previous audits and lessons learned incorporated', 'Changes in the organisation and technology environment'],
    artifact: 'Audit Programme Objectives Document' },
  { clause: '5.3', title: 'Audit Programme Risks & Opportunities', color: 'border-l-red-500',
    desc: 'Identify risks and opportunities that could affect the audit programme — resource constraints, auditor availability, access issues, and scope changes.',
    items: ['Risk: insufficient auditor competence for complex technical areas', 'Risk: auditee unavailability during planned audit window', 'Risk: scope creep beyond agreed boundaries', 'Risk: insufficient evidence obtained to support conclusions', 'Opportunity: combine Stage 1 documentation review with surveillance planning to reduce auditee burden', 'Opportunity: remote audit methods reduce travel costs and time'],
    artifact: 'Audit Programme Risk Register' },
  { clause: '5.4', title: 'Audit Programme Resources', color: 'border-l-emerald-500',
    desc: 'Determine and provide resources needed — lead auditor, audit team, time, budget, tools, and access to auditee systems.',
    items: ['Lead auditor assigned with appropriate competence (Cl.7)', 'Audit team members assigned with complementary skills', 'Time allocated per audit phase: TOD, TOI, TOE, reporting', 'Budget confirmed: travel, tools, external expert fees', 'Access to auditee premises, systems, and staff confirmed', 'Audit management tools: workpaper templates, sampling tools'],
    artifact: 'Audit Programme Resource Plan' },
  { clause: '5.5', title: 'Audit Programme Implementation', color: 'border-l-purple-500',
    desc: 'Schedule individual audits within the programme — prioritising higher-risk areas and maintaining auditor independence.',
    items: ['Annual audit schedule produced and communicated to management', 'Higher-risk areas receive more frequent or in-depth audits', 'Auditor independence maintained — no self-review', 'Individual audit mandates issued (scope, criteria, dates, team)', 'Coordination with auditee to minimise operational disruption', 'Remote and on-site audit methods selected per context'],
    artifact: 'Annual Audit Schedule + Individual Audit Mandates' },
  { clause: '5.6', title: 'Audit Programme Monitoring & Review', color: 'border-l-amber-500',
    desc: 'Monitor progress, identify deviations, and review the programme at planned intervals to ensure its continuing effectiveness.',
    items: ['Programme progress monitored against planned schedule', 'Deviations from plan identified and managed (scope, timeline)', 'Programme performance metrics tracked: completion rate, finding rates', 'Programme reviewed annually — lessons learned incorporated', 'Results of monitoring reported to management', 'Programme updated when organisation or risk profile changes'],
    artifact: 'Audit Programme Review Report' },
  { clause: '5.7', title: 'Audit Programme Records', color: 'border-l-steel-400',
    desc: 'Maintain records of the audit programme as documented information — individual audit plans, reports, and evidence of corrective actions.',
    items: ['Individual audit plans and reports retained', 'Nonconformity and corrective action records maintained', 'Auditor competence and qualification records kept', 'Programme performance data and metrics retained', 'Management review records of programme performance', 'Records retained per defined retention schedule'],
    artifact: 'Audit Programme Records Register' },
]

const scheduleTemplate = [
  { area: 'ISO 27001 — Full ISMS Cl.4–7', freq: 'Annual', duration: '3 days', risk: 'High', method: 'On-site' },
  { area: 'ISO 27001 — Operations (Cl.8)', freq: 'Annual', duration: '2 days', risk: 'High', method: 'On-site' },
  { area: 'ISO 27001 — Performance (Cl.9)', freq: 'Annual', duration: '1 day', risk: 'Medium', method: 'Remote' },
  { area: 'ISO 27002 — Technological Controls', freq: 'Annual', duration: '3 days', risk: 'High', method: 'On-site' },
  { area: 'ISO 27002 — Organizational Controls', freq: 'Annual', duration: '2 days', risk: 'Medium', method: 'Hybrid' },
  { area: 'ISO 27005 — Risk Register Review', freq: 'Semi-annual', duration: '1 day', risk: 'High', method: 'Remote' },
  { area: 'Supplier Audits (key suppliers)', freq: 'Annual', duration: '1 day each', risk: 'Medium', method: 'On-site' },
]

export default function Clause5() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 19011:2018" clause="Clause 5" title="Clause 5 — Audit Programme Management"
        description="ISO 19011 Clause 5 covers managing the overall audit programme — setting objectives, identifying programme risks, allocating resources, implementing the annual schedule, monitoring progress, and maintaining records."
        badges={['Programme Management', 'Pre-Audit', 'Annual Planning']} />

      <div className="space-y-4 mb-6">
        {elements.map(el => (
          <div key={el.clause} className={`card border-l-4 ${el.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{el.clause}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {el.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-400">Key Artifact:</span>
                  <span className="badge badge-amber text-xs">{el.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <h2 className="section-title mb-3">Sample Annual Audit Schedule Template</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-navy-700 bg-navy-800/50">
              {['Audit Area', 'Frequency', 'Duration', 'Risk Level', 'Method'].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-steel-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {scheduleTemplate.map((r, i) => (
                <tr key={r.area} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="py-2.5 px-3 text-white font-medium">{r.area}</td>
                  <td className="py-2.5 px-3 text-steel-300">{r.freq}</td>
                  <td className="py-2.5 px-3 text-steel-300">{r.duration}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge text-xs ${r.risk === 'High' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'}`}>{r.risk}</span>
                  </td>
                  <td className="py-2.5 px-3 text-steel-300">{r.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIPanel title="Generate Audit Programme Documents"
        systemPrompt="You are an ISO 19011:2018 Clause 5 audit programme management specialist. Generate professional audit programme documents including objectives, annual schedules, resource plans, risk registers, and programme review reports. Align to ISO 19011:2018 Clause 5 requirements."
        placeholder="e.g. Generate a 12-month ISO 27001 internal audit programme for a 500-person financial services firm"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', type: 'text', placeholder: 'e.g. UK bank, 500 staff, ISO 27001 certified' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Annual Audit Programme', 'Audit Programme Objectives', 'Audit Programme Risk Register', 'Resource Plan', 'Individual Audit Mandate', 'Programme Review Report', 'Audit Schedule Template'] },
          { id: 'standards', label: 'Standards in Scope', type: 'text', placeholder: 'e.g. ISO 27001, ISO 27002, ISO 27005' },
        ]} />
    </div>
  )
}
