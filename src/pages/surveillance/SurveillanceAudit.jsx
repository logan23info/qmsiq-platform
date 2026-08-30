import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const auditTypes = [
  {
    type: 'Surveillance Audit (Year 1 & 2)', color: 'border-l-blue-500',
    desc: 'Conducted annually in years 1 and 2 after initial certification. Verifies the QMS continues to meet ISO 9001:2015 requirements and that certification conditions are maintained.',
    scope: 'Partial scope — not all clauses every year. Focus on: internal audit results, CAPA, customer satisfaction, management review, and any weak areas from previous audit.',
    items: [
      'Confirm QMS still implemented and maintained per certification scope',
      'Internal audit programme operating — all required audits conducted',
      'Management review conducted at planned intervals with all mandatory inputs',
      'Corrective actions from previous audit closed or on track',
      'Customer satisfaction monitored and trends analysed',
      'Quality objectives monitored — progress against targets',
      'No major changes to scope, processes, or products/services unreported',
      'Documented information controlled and current',
    ], artifact: 'Surveillance Audit Report' },
  {
    type: 'Recertification Audit (Year 3)', color: 'border-l-emerald-500',
    desc: 'Full audit conducted every 3 years at end of certification cycle. Reviews entire QMS against all ISO 9001:2015 clauses. Renews the certificate for another 3-year cycle.',
    scope: 'Full scope — all clauses assessed. Equivalent in depth to initial certification audit. Includes all sites in scope.',
    items: [
      'Full Clause 4–10 assessment — context, leadership, planning, support, operations, performance, improvement',
      'All processes in scope audited over recertification cycle',
      'Evidence of QMS effectiveness over 3-year period',
      'All previous nonconformities resolved with verified effectiveness',
      'QMS adapted to internal/external changes since last recertification',
      'Documented information reflects current QMS — no ghost documents',
      'Certification body review of audit history, complaints, incidents',
    ], artifact: 'Recertification Audit Report' },
  {
    type: 'Internal Audit (ISO 9001 Cl. 9.2)', color: 'border-l-amber-500',
    desc: 'Organisation\'s own audit — mandatory under Cl. 9.2. Must cover all QMS processes and clauses over the audit programme cycle. Results are mandatory input to management review.',
    scope: 'Annual programme must cover all QMS clauses and processes. Risk-based prioritisation determines frequency per area.',
    items: [
      'Audit programme planned — all clauses and processes covered over the cycle',
      'Auditor independence from auditee maintained — no self-audit',
      'Audit criteria, scope, methods, and frequency defined per mandate',
      'Nonconformities and observations raised using 4Cs format',
      'Findings reported to relevant management without undue delay',
      'Corrective actions raised and tracked to verified closure',
      'Audit programme results reported at management review (Cl. 9.3)',
      'Audit records retained as documented information (Cl. 7.5)',
    ], artifact: 'Internal Audit Report + CAPA Register' },
  {
    type: 'Supplier / Second Party Audit', color: 'border-l-purple-500',
    desc: 'Audit of external providers conducted by the organisation. Required where supplier quality risk is significant. Supports ISO 9001 Cl. 8.4 external provider control.',
    scope: 'Focused on supplier\'s quality management processes relevant to the supplied product/service. Not a full ISO 9001 audit unless supplier is certified.',
    items: [
      'Supplier audit criteria defined — quality requirements from Cl. 8.4 agreement',
      'Supplier quality management processes assessed — planning, inspection, CAPA',
      'Key quality KPIs reviewed — defect rates, on-time delivery, complaints',
      'Previous nonconformities and corrective actions reviewed',
      'Sub-contractor controls assessed where applicable',
      'Findings reported to supplier with agreed corrective action timelines',
      'Audit frequency risk-based — critical suppliers audited more frequently',
      'Audit results feed into supplier performance review and approved list update',
    ], artifact: 'Supplier Audit Report' },
]

const surveillanceChecklist = [
  { clause: 'Cl. 4', item: 'Context review — any significant internal/external changes since last audit?', mandatory: true },
  { clause: 'Cl. 5.1', item: 'Leadership commitment — management review conducted, quality policy current?', mandatory: true },
  { clause: 'Cl. 6.2', item: 'Quality objectives — measurable, monitored, progress reported?', mandatory: true },
  { clause: 'Cl. 7.2', item: 'Competence — training records current, role changes addressed?', mandatory: true },
  { clause: 'Cl. 8.1', item: 'Operational controls — planned changes implemented correctly?', mandatory: false },
  { clause: 'Cl. 8.4', item: 'Supplier control — approved supplier list current, performance monitored?', mandatory: true },
  { clause: 'Cl. 8.7', item: 'Nonconforming output — process operating, no repeat escapes to customers?', mandatory: true },
  { clause: 'Cl. 9.1', item: 'Customer satisfaction — measured, trends analysed, complaints reviewed?', mandatory: true },
  { clause: 'Cl. 9.2', item: 'Internal audit — programme on track, all planned audits conducted?', mandatory: true },
  { clause: 'Cl. 9.3', item: 'Management review — conducted, all inputs covered, outputs actioned?', mandatory: true },
  { clause: 'Cl. 10.2', item: 'Corrective actions — previous NCs closed, root cause addressed, effective?', mandatory: true },
  { clause: 'Cl. 10.3', item: 'Continual improvement — improvement actions identified and tracked?', mandatory: false },
]

const certificationCycle = [
  { year: 'Year 0', event: 'Initial Certification Audit', type: 'Stage 1 + Stage 2', desc: 'Stage 1 — document review and readiness. Stage 2 — full on-site assessment of all clauses.' },
  { year: 'Year 1', event: 'Surveillance Audit 1', type: 'Partial scope', desc: 'Focus on internal audits, CAPA, management review, customer satisfaction, and previous weak areas.' },
  { year: 'Year 2', event: 'Surveillance Audit 2', type: 'Partial scope', desc: 'Different areas from SA1. Must cover all mandatory inputs collectively over the 3-year cycle.' },
  { year: 'Year 3', event: 'Recertification Audit', type: 'Full scope', desc: 'Full QMS reassessment — all clauses. Renews certificate for another 3 years.' },
]

export default function SurveillanceAudit() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Audit Types" title="QMS Audit Types — Surveillance, Recertification & Internal"
        description="ISO 9001 requires different audit types at different stages — internal audits annually (Cl. 9.2), surveillance audits in years 1 and 2 of the certification cycle, and full recertification every 3 years. Each has a different scope, objective, and evidence requirement."
        badges={['Surveillance', 'Recertification', 'Internal', 'ISO 19011']} />

      {/* 3-year cycle */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">ISO 9001 Certification Cycle — 3 Years</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {certificationCycle.map((c, i) => (
            <div key={i} className={`bg-navy-800 rounded-xl p-3 border-t-4 ${i === 0 ? 'border-t-red-500' : i === 3 ? 'border-t-emerald-500' : 'border-t-blue-500'}`}>
              <div className="text-xs font-bold text-amber-audit mb-1">{c.year}</div>
              <div className="text-xs font-semibold text-white mb-1">{c.event}</div>
              <div className={`badge text-xs mb-2 ${i === 0 ? 'bg-red-900/40 text-red-300' : i === 3 ? 'bg-emerald-900/40 text-emerald-300' : 'bg-blue-900/40 text-blue-300'}`}>{c.type}</div>
              <div className="text-xs text-steel-400 leading-snug">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit type cards */}
      <div className="space-y-4 mb-6">
        {auditTypes.map(a => (
          <div key={a.type} className={`card border-l-4 ${a.color}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <span className="clause-tag flex-shrink-0 self-start whitespace-nowrap">
                {a.type.split(' ')[0]}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{a.type}</h3>
                <p className="text-sm text-steel-300 mb-2 leading-relaxed">{a.desc}</p>
                <div className="bg-navy-800 rounded-lg p-2 mb-3">
                  <span className="text-xs font-semibold text-amber-audit">Scope: </span>
                  <span className="text-xs text-steel-300">{a.scope}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {a.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-400">Key Artifact:</span>
                  <span className="badge badge-amber text-xs">{a.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Surveillance checklist */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Surveillance Audit Checklist — Mandatory Focus Areas</h2>
        <p className="text-xs text-steel-400 mb-4">Items marked <span className="text-red-400 font-semibold">Mandatory</span> must be covered in every surveillance audit per IAF MD 1:2023 guidance.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-navy-700 bg-navy-800/50">
              {['Clause', 'Surveillance Audit Focus', 'Status'].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-steel-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {surveillanceChecklist.map((r, i) => (
                <tr key={r.clause} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold whitespace-nowrap">{r.clause}</td>
                  <td className="py-2.5 px-3 text-steel-300">{r.item}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`badge text-xs ${r.mandatory ? 'bg-red-900/40 text-red-300' : 'bg-navy-700 text-steel-400'}`}>
                      {r.mandatory ? 'Mandatory' : 'Recommended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIPanel title="Generate Surveillance & Audit Artifacts"
        systemPrompt="You are an ISO 9001:2015 surveillance and certification audit specialist. Generate surveillance audit plans, recertification checklists, internal audit reports, supplier audit reports, and management review packs. Align to ISO 19011:2026 methodology and IAF MD 1:2023 surveillance audit requirements."
        placeholder="e.g. Generate a surveillance audit plan for Year 1 following ISO 9001 initial certification of a 200-staff manufacturing company"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', type: 'text', placeholder: 'e.g. UK manufacturer, 200 staff, ISO 9001 certified 2024' },
          { id: 'audit_type', label: 'Audit Type', type: 'select', options: ['Surveillance Audit Year 1', 'Surveillance Audit Year 2', 'Recertification Audit Year 3', 'Internal Audit', 'Supplier Audit', 'Stage 1 — Document Review', 'Stage 2 — On-site Certification'] },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Audit Plan', 'Opening Meeting Agenda', 'Audit Checklist', 'Nonconformity Report', 'Audit Report', 'Corrective Action Request', 'Closing Meeting Summary', 'Certificate Recommendation Report'] },
          { id: 'focus', label: 'Focus Areas / Previous NCs', type: 'text', placeholder: 'e.g. CAPA effectiveness, supplier control, document control' },
        ]} />
    </div>
  )
}
