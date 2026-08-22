import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2, Info } from 'lucide-react'

const todElements = [
  {
    title: 'Control Objective Library',
    desc: 'Each control must have a stated objective before design adequacy can be assessed. Maps control intent to business risk.',
    steps: ['Define control objective in measurable terms', 'Link objective to specific risk(s) it mitigates', 'Identify relevant ISO 27002 clause reference', 'Document expected control output/evidence'],
  },
  {
    title: 'Design Gap Analyzer',
    desc: 'AI-powered review of policy documents to flag missing mandatory controls against ISO 27002 requirements before fieldwork begins.',
    steps: ['Upload or paste policy/procedure document', 'AI maps content to 27002 control requirements', 'Gap report generated per theme', 'Prioritised remediation recommendations produced'],
  },
  {
    title: 'Control Architecture Review',
    desc: 'Verify whether the proposed control workflow adequately mitigates the target risk — not just that a control exists.',
    steps: ['Map control workflow end-to-end', 'Identify control gaps in the workflow', 'Assess if preventive + detective layers exist', 'Document design adequacy conclusion'],
  },
  {
    title: 'Segregation of Duties (SoD) Design Check',
    desc: 'Review the org structure to confirm SoD is designed into roles before testing whether it is implemented.',
    steps: ['Obtain role/responsibility matrix', 'Identify incompatible function combinations', 'Map SoD conflicts to access control design', 'Document compensating controls where SoD not feasible'],
  },
  {
    title: 'Compensating Control Register',
    desc: 'Where primary controls are absent or inadequate, compensating controls must be documented and assessed for design sufficiency.',
    steps: ['Identify controls where primary control is absent', 'Document the compensating control in place', 'Assess whether compensating control achieves same objective', 'Obtain management acceptance of risk where compensating control is insufficient'],
  },
  {
    title: 'Control Dependency Map',
    desc: 'Some controls only work if upstream controls are also designed correctly. Dependency failures invalidate downstream controls.',
    steps: ['List all controls and their upstream dependencies', 'Identify dependency chain for critical controls', 'Flag controls where dependency gaps exist', 'Prioritise upstream control testing'],
  },
  {
    title: 'TOD Interview Guide',
    desc: 'Structured questions to ask control owners during design review — "Walk me through how this control was designed and why."',
    steps: ['Per-control interview question set', 'Prompt control owner to explain design rationale', 'Probe for documented procedures and approvals', 'Capture responses in standardised workpaper'],
  },
  {
    title: 'TOD Conclusion Workpaper',
    desc: 'Formal sign-off on design adequacy before proceeding to TOI. Three possible conclusions.',
    steps: ['Design Adequate — proceed to TOI', 'Design Partially Adequate — note gaps, proceed with caveat', 'Design Inadequate — raise finding, consider if TOI is feasible', 'Obtain lead auditor sign-off on conclusion'],
  },
]

const conclusions = [
  { label: 'Design Adequate', desc: 'Control is well-designed to mitigate stated risk. Proceed to TOI.', color: 'bg-emerald-900/30 border-emerald-700 text-emerald-300' },
  { label: 'Design Partially Adequate', desc: 'Control has gaps but partially mitigates risk. Document gaps, proceed with caveat.', color: 'bg-amber-900/30 border-amber-700 text-amber-300' },
  { label: 'Design Inadequate', desc: 'Control does not adequately mitigate risk. Raise design finding. Assess TOI feasibility.', color: 'bg-red-900/30 border-red-700 text-red-300' },
]

export default function TOD() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.4"
        title="TOD — Test of Design"
        description="Does the control exist and is it properly designed to mitigate the stated risk? TOD is the first testing phase — it must be completed before TOI or TOE can begin. A design failure means the control cannot be effective regardless of how well it operates."
        badges={['TOD', 'Design', 'ISO 19011 Cl. 6.4']}
      />

      <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-blue-300 mb-1">TOD Sequencing Rule (ISO 19011 Cl. 6.4.4)</div>
          <div className="text-xs text-blue-200/80 leading-relaxed">
            TOD must be completed before TOI. TOI must be completed before TOE. If TOD concludes "Design Inadequate", the auditor must document a finding and assess whether TOI/TOE can proceed or whether the control should be treated as failed.
          </div>
        </div>
      </div>

      {/* TOD Conclusion Types */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">TOD Conclusion Framework</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {conclusions.map(c => (
            <div key={c.label} className={`border rounded-lg p-3 ${c.color}`}>
              <div className="text-xs font-bold mb-1">{c.label}</div>
              <div className="text-xs opacity-80 leading-snug">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOD Elements */}
      <div className="space-y-4 mb-6">
        {todElements.map((el, idx) => (
          <div key={el.title} className="card border-l-4 border-l-blue-500">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-blue-900/50 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {el.steps.map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIPanel
        title="Generate TOD Artifacts"
        systemPrompt={`You are a senior IT auditor specialising in Test of Design (TOD) under ISO 19011:2018 Clause 6.4. Generate detailed, professional TOD workpapers, interview guides, and design assessment templates. All outputs must follow professional audit workpaper standards. Use structured formats with clear headings, control references, and conclusion fields. Be specific to the control, sector, and technology stack provided. TOD assesses whether a control is properly designed to mitigate its stated risk — not whether it operates.`}
        placeholder="e.g. Generate a TOD interview guide for Access Control Policy covering user provisioning, periodic access review, and privileged access management"
        contextFields={[
          { id: 'control', label: 'Control / Policy Being Tested', placeholder: 'e.g. Access Control Policy — User Provisioning (ISO 27002 A.8.2)', type: 'text' },
          { id: 'sector', label: 'Organisation / Sector', placeholder: 'e.g. Financial services, cloud-based infrastructure', type: 'text' },
          { id: 'risk', label: 'Risk Being Mitigated', placeholder: 'e.g. Unauthorised access to customer data', type: 'text' },
          { id: 'artifact', label: 'TOD Artifact Required', type: 'select', options: [
            'Control Objective Statement',
            'Design Gap Analysis Report',
            'Control Architecture Review',
            'SoD Design Check Worksheet',
            'Compensating Control Assessment',
            'Control Dependency Map',
            'TOD Interview Guide',
            'TOD Conclusion Workpaper',
          ]},
        ]}
      />
    </div>
  )
}
