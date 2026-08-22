import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const meetings = [
  { clause: 'Cl. 6.4.2', title: 'Opening Meeting', color: 'border-l-blue-400', items: ['Introduce audit team and confirm roles', 'Confirm scope, objectives, and audit criteria', 'Confirm audit schedule and auditee contacts', 'Explain evidence collection methods (TOD/TOI/TOE)', 'Confirm confidentiality arrangements', 'Address auditee questions', 'Sign attendance register'], artifact: 'Opening Meeting Agenda + Minutes' },
  { clause: 'Cl. 6.4.7', title: 'Closing Meeting', color: 'border-l-purple-400', items: ['Present all findings (conformities and nonconformities)', 'Explain finding rating methodology', 'Allow auditee to respond to each finding', 'Document disputed findings and formal process', 'Agree on management response timelines', 'Confirm report distribution list', 'Sign attendance register'], artifact: 'Closing Meeting Agenda + Minutes' },
]

const disputedSteps = [
  'Lead auditor documents the disputed finding and auditee objection verbatim',
  'Auditor presents evidence supporting the finding clearly',
  'Auditee presents counter-evidence or explanation',
  'If unresolved, finding is reported as "Disputed" — it is NOT removed from the report',
  'Audit programme manager adjudicates if escalation is required',
  'Outcome of dispute is formally documented in the audit report',
]

export default function Meetings() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.4.2 & 6.4.7"
        title="Opening & Closing Meetings"
        description="Both meetings are mandatory under ISO 19011. The opening meeting sets expectations and scope. The closing meeting presents findings before the formal report is issued — giving the auditee opportunity to respond."
        badges={['Meetings', 'ISO 19011 Cl. 6.4']}
      />
      <div className="space-y-4 mb-6">
        {meetings.map(m => (
          <div key={m.title} className={`card border-l-4 ${m.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{m.clause}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-3">{m.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {m.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-400">Artifact:</span>
                  <span className="badge badge-amber">{m.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card mb-6">
        <h2 className="section-title mb-3">Disputed Findings Process — Cl. 6.4.7</h2>
        <p className="text-sm text-steel-300 mb-4 leading-relaxed">ISO 19011 requires a formal process when the auditee disputes a finding at the closing meeting. Findings are never removed simply because the auditee disagrees.</p>
        <div className="space-y-2">
          {disputedSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-navy-800 border border-navy-600 text-xs text-steel-400 font-mono flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-xs text-steel-300 leading-snug">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <AIPanel
        title="Generate Meeting Documents"
        systemPrompt="You are an ISO 19011:2018 audit meeting facilitation expert. Generate professional opening meeting agendas, closing meeting agendas, attendance registers, meeting minutes, and disputed findings process documents. All outputs should be ready to use in real audit engagements. Include timing estimates, facilitation notes, and ISO 19011 clause references."
        placeholder="e.g. Generate an opening meeting agenda for an ISO 27001 internal audit at a financial services company"
        contextFields={[
          { id: 'org', label: 'Organisation', placeholder: 'e.g. Acme Financial Ltd', type: 'text' },
          { id: 'date', label: 'Audit Date', placeholder: 'e.g. 25 August 2026', type: 'text' },
          { id: 'artifact', label: 'Document Required', type: 'select', options: ['Opening Meeting Agenda', 'Opening Meeting Minutes', 'Closing Meeting Agenda', 'Closing Meeting Minutes', 'Attendance Register', 'Disputed Findings Process Note', 'Full Meeting Pack'] },
        ]}
      />
    </div>
  )
}
