import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const elements = [
  {
    clause: '6.2.2', title: 'Lead Auditor Appointment',
    desc: 'Formal appointment designating the lead auditor, their scope authority, and team composition.',
    items: ['Name and credentials of lead auditor', 'Audit scope and boundaries defined', 'Team member assignments confirmed', 'Reporting line and authority established'],
    artifact: 'Lead Auditor Appointment Letter',
  },
  {
    clause: '6.2.3', title: 'Feasibility Assessment',
    desc: 'Pre-audit check confirming the audit is achievable given scope, resources, and access.',
    items: ['Scope is clearly defined and agreed', 'Sufficient audit time allocated', 'Auditee cooperation confirmed', 'Resources and tools available'],
    artifact: 'Feasibility Assessment Template',
  },
  {
    clause: '6.2.4', title: 'Auditee Initial Contact',
    desc: 'Formal communication establishing audit timeline, PBC requirements, and key contacts.',
    items: ['Formal audit notification issued', 'Key auditee contact identified', 'PBC list issued in advance', 'Audit dates and logistics confirmed'],
    artifact: 'Initial Contact & Notification Template',
  },
]

export default function Clause6Initiation() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.2"
        title="Audit Initiation"
        description="Formal activities required before fieldwork begins — appointing the lead auditor, confirming feasibility, and establishing initial contact with the auditee."
        badges={['Pre-Fieldwork', 'ISO 19011 Cl. 6.2']}
      />
      <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle size={16} className="text-amber-audit flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/80 leading-relaxed">
          <span className="font-semibold text-amber-300">Initiation Gate: </span>
          No audit activities may begin until Clause 6.2 is complete and the Audit Plan (Cl. 6.3.3) is formally approved.
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {elements.map(el => (
          <div key={el.clause} className="card">
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
                  <span className="text-xs text-steel-400">Artifact:</span>
                  <span className="badge badge-amber">{el.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIPanel
        title="Generate Initiation Artifacts"
        systemPrompt="You are an ISO 19011:2018 audit initiation expert. Generate professional audit initiation documents: lead auditor appointment letters, feasibility assessments, initial contact templates, and terms of reference. Be concise, structured, and ready-to-use. Use professional audit language with clear sections."
        placeholder="e.g. Generate a Lead Auditor Appointment Letter for an ISO 27001 internal audit at a fintech company"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', placeholder: 'e.g. Fintech Ltd, 400 employees, ISO 27001 scope', type: 'text' },
          { id: 'lead', label: 'Lead Auditor Name & Credentials', placeholder: 'e.g. John Smith, CISA, ISO 27001 LA', type: 'text' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Lead Auditor Appointment Letter', 'Feasibility Assessment', 'Auditee Initial Contact Letter', 'Terms of Reference', 'Full Initiation Package'] },
        ]}
      />
    </div>
  )
}
