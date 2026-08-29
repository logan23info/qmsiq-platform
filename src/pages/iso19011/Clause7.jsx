import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const competencyAreas = [
  { area: 'Professional Knowledge', color: 'border-l-blue-500',
    items: ['ISO 19011:2018 — audit principles, process, and methods', 'ISO 27001:2022 — ISMS requirements (for IS auditors)', 'ISO 27002:2022 — controls and implementation guidance', 'ISO 27005:2022 — information security risk management', 'Applicable legal and regulatory requirements', 'Industry-specific standards (PCI-DSS, SOC 2, GDPR)'] },
  { area: 'Audit Skills', color: 'border-l-emerald-500',
    items: ['TOD — design gap analysis and documentation review', 'TOI — walkthrough and interview techniques', 'TOE — statistical sampling and re-performance', 'Finding development using 4Cs methodology', 'Evidence evaluation and sufficiency assessment', 'Working paper documentation to professional standard'] },
  { area: 'Personal Attributes', color: 'border-l-purple-500',
    items: ['Ethical — fair, truthful, sincere, honest, discreet', 'Open-minded — willing to consider alternative ideas', 'Diplomatic — tactful in dealing with auditees', 'Observant — actively aware of physical surroundings', 'Perceptive — aware of and able to understand situations', 'Versatile — adapt readily to different contexts'] },
  { area: 'Communication', color: 'border-l-amber-500',
    items: ['Structured interview techniques — open vs closed questions', 'Active listening — confirm understanding, avoid assumption', 'Clear verbal communication of findings', 'Professional written reporting — concise and objective', 'Presentation of findings to management', 'Handling hostile or uncooperative auditees'] },
]

const certifications = [
  { cert: 'ISO 27001 Lead Auditor (LA)', body: 'PECB / BSI / IRCA', relevance: 'Primary certification for IS auditors — covers full audit lifecycle', recommended: true },
  { cert: 'ISO 27001 Lead Implementer (LI)', body: 'PECB / BSI', relevance: 'Useful for understanding ISMS implementation from auditee perspective', recommended: false },
  { cert: 'CISA — Certified IS Auditor', body: 'ISACA', relevance: 'Industry-leading IT audit certification — broad IS audit coverage', recommended: true },
  { cert: 'CISSP', body: 'ISC²', relevance: 'Technical IS expertise — valuable for Technological controls (A.8.x)', recommended: false },
  { cert: 'CIA — Certified Internal Auditor', body: 'IIA', relevance: 'Internal audit methodology — complements IS audit skills', recommended: false },
]

const competencyMatrix = [
  { role: 'IS Audit Lead', tod: '✅ Required', toi: '✅ Required', toe: '✅ Required', report: '✅ Required', cert: 'ISO 27001 LA or CISA' },
  { role: 'IS Audit Team Member', tod: '✅ Required', toi: '✅ Required', toe: '⚠️ Supervised', report: '⚠️ Supervised', cert: 'ISO 27001 LA (in progress)' },
  { role: 'Technical Specialist', tod: '⚠️ Supervised', toi: '✅ Required', toe: '✅ Required', report: '⚠️ Supervised', cert: 'CISSP / CISA' },
  { role: 'Trainee Auditor', tod: '⚠️ Supervised', toi: '⚠️ Supervised', toe: '⚠️ Supervised', report: '⚠️ Supervised', cert: 'None required' },
]

export default function Clause7() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 19011:2018" clause="Clause 7" title="Clause 7 — Auditor Competence"
        description="ISO 19011 Clause 7 defines the knowledge, skills, and personal attributes required of auditors and audit team leaders. Competence must be demonstrated, not just claimed — and maintained through continual professional development."
        badges={['Auditor Competence', 'CPD', 'Pre-Audit']} />

      <div className="space-y-4 mb-6">
        {competencyAreas.map(area => (
          <div key={area.area} className={`card border-l-4 ${area.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">Cl.7</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-3">{area.area}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {area.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Competency Matrix */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Auditor Role Competency Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-navy-700 bg-navy-800/50">
              {['Role', 'TOD', 'TOI', 'TOE', 'Reporting', 'Certification'].map(h => (
                <th key={h} className="text-left py-2.5 px-3 text-steel-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {competencyMatrix.map((r, i) => (
                <tr key={r.role} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">{r.role}</td>
                  {[r.tod, r.toi, r.toe, r.report].map((v, j) => (
                    <td key={j} className={`py-2.5 px-3 whitespace-nowrap ${v.includes('✅') ? 'text-emerald-400' : 'text-amber-audit'}`}>{v}</td>
                  ))}
                  <td className="py-2.5 px-3 text-blue-400 font-mono">{r.cert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certifications */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Professional Certifications</h2>
        <div className="space-y-2">
          {certifications.map(c => (
            <div key={c.cert} className={`flex items-start gap-3 bg-navy-800 rounded-lg p-3 ${c.recommended ? 'border border-amber-800/40' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{c.cert}</span>
                  {c.recommended && <span className="badge badge-amber text-xs">Recommended</span>}
                  <span className="text-xs text-steel-500">— {c.body}</span>
                </div>
                <div className="text-xs text-steel-400 mt-0.5">{c.relevance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AIPanel title="Generate Competence Documentation"
        systemPrompt="You are an ISO 19011:2018 auditor competence specialist. Generate professional competence assessments, CPD plans, auditor training records, and independence declarations aligned to Clause 7 requirements."
        placeholder="e.g. Generate an auditor competence assessment for a CISA-certified auditor conducting their first ISO 27001 audit"
        contextFields={[
          { id: 'role', label: 'Auditor Role', type: 'select', options: ['IS Audit Lead', 'IS Audit Team Member', 'Technical Specialist', 'Trainee Auditor'] },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Competence Assessment', 'CPD Plan', 'Independence Declaration', 'Auditor Training Record', 'Audit Team Competence Matrix', 'Auditor Evaluation Form'] },
          { id: 'context', label: 'Auditor Background', type: 'text', placeholder: 'e.g. 5 years IT audit, CISA certified, first ISO 27001 audit' },
        ]} />
    </div>
  )
}
