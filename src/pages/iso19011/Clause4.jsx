import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const principles = [
  {
    id: 'P1', name: 'Integrity', clause: 'Cl. 4.1',
    description: 'The foundation of professionalism. Auditors perform work honestly, diligently, and responsibly.',
    requirements: ['Perform work ethically and with due diligence', 'Observe and comply with applicable legal requirements', 'Demonstrate competence while performing work', 'Report truthfully and accurately'],
    artifact: 'Auditor Ethics & Integrity Declaration',
    color: 'border-l-amber-audit'
  },
  {
    id: 'P2', name: 'Fair Presentation', clause: 'Cl. 4.2',
    description: 'Audit findings, conclusions and reports must reflect audit activities truthfully and accurately.',
    requirements: ['Report significant obstacles encountered', 'Report unresolved divergences between auditors and auditee', 'Ensure findings reflect evidence gathered', 'Communicate audit conclusions accurately'],
    artifact: 'Finding Presentation Standard',
    color: 'border-l-blue-400'
  },
  {
    id: 'P3', name: 'Due Professional Care', clause: 'Cl. 4.3',
    description: 'Auditors exercise care commensurate with importance and complexity of audit tasks.',
    requirements: ['Apply judgement in all audit situations', 'Consider significance and complexity of tasks', 'Verify competence before accepting assignments', 'Maintain professional standards throughout'],
    artifact: 'Professional Care Checklist',
    color: 'border-l-purple-400'
  },
  {
    id: 'P4', name: 'Confidentiality', clause: 'Cl. 4.4',
    description: 'Auditors exercise discretion in use and protection of information acquired during audits.',
    requirements: ['Handle audit information with discretion', 'Protect confidential or commercially sensitive information', 'Obtain permission before disclosing audit information', 'Sign NDA/confidentiality agreements where required'],
    artifact: 'Audit Confidentiality & NDA Template',
    color: 'border-l-emerald-400'
  },
  {
    id: 'P5', name: 'Independence', clause: 'Cl. 4.5',
    description: 'Auditors are independent of the activity being audited and are free from bias and conflict of interest.',
    requirements: ['Declare all potential conflicts of interest', 'Maintain impartiality throughout the audit', 'Disclose any relationships with auditee', 'Internal auditors must be independent of functions audited'],
    artifact: 'Independence & Conflict of Interest Declaration',
    color: 'border-l-red-400'
  },
  {
    id: 'P6', name: 'Evidence-Based Approach', clause: 'Cl. 4.6',
    description: 'Audit evidence must be verifiable, based on samples of information available.',
    requirements: ['Base conclusions on verifiable evidence', 'Use systematic audit methods', 'Document evidence adequately', 'Ensure evidence is sufficient and appropriate'],
    artifact: 'Evidence Sufficiency Standard',
    color: 'border-l-cyan-400'
  },
  {
    id: 'P7', name: 'Risk-Based Approach', clause: 'Cl. 4.7',
    description: 'The audit approach must reflect risks and opportunities linked to the auditee\'s objectives.',
    requirements: ['Consider risks to audit programme objectives', 'Apply greater scrutiny to higher-risk areas', 'Balance resource allocation with risk level', 'Adjust audit scope based on risk assessment'],
    artifact: 'Risk-Based Audit Planning Guide',
    color: 'border-l-orange-400'
  },
]

export default function Clause4() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 4"
        title="Principles of Auditing"
        description="The 7 principles that form the basis of all audit activity. Every audit conducted under this platform must be anchored to these principles. They define what makes audit conclusions reliable, fair, and defensible."
        badges={['Audit Backbone', 'Pre-Audit']}
      />

      <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle size={16} className="text-amber-audit flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-300 mb-1">Mandatory Foundation</div>
          <div className="text-xs text-amber-200/80 leading-relaxed">
            ISO 19011 Clause 4 principles apply to all audit types — internal, external, first-party, second-party, and third-party. All TOD, TOI, and TOE activities in this platform are governed by these 7 principles.
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {principles.map((p, idx) => (
          <div key={p.id} className={`card border-l-4 ${p.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex items-center gap-2 sm:flex-col sm:items-center sm:w-12 flex-shrink-0">
                <span className="font-display text-lg font-bold text-white">{p.id}</span>
                <span className="clause-tag text-xs">{p.clause}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{p.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {p.requirements.map(r => (
                    <div key={r} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{r}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-400">Artifact:</span>
                  <span className="badge badge-steel">{p.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIPanel
        title="Generate Clause 4 Artifacts"
        systemPrompt={`You are a senior ISO 19011:2018 audit methodology expert. Generate precise, professional audit artifacts based on the 7 principles of auditing (Clause 4). All outputs must be structured, practical, and ready for use in real audit engagements. Use professional audit language. Format outputs with clear sections and numbered items where appropriate. Focus on the specific artifact type requested.`}
        placeholder="e.g. Generate an Independence and Conflict of Interest Declaration form for an IT auditor conducting an ISO 27001 audit at a financial institution"
        contextFields={[
          { id: 'org', label: 'Organisation / Sector', placeholder: 'e.g. Financial services firm, 500 employees', type: 'text' },
          { id: 'auditType', label: 'Audit Type', placeholder: 'e.g. Internal ISO 27001 audit, Second-party supplier audit', type: 'text' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: [
            'Auditor Ethics & Integrity Declaration',
            'Finding Presentation Standard',
            'Professional Care Checklist',
            'Audit Confidentiality & NDA Template',
            'Independence & Conflict of Interest Declaration',
            'Evidence Sufficiency Standard',
            'Risk-Based Audit Planning Guide',
            'All 7 Principle Declarations (Combined)'
          ]},
        ]}
      />
    </div>
  )
}
