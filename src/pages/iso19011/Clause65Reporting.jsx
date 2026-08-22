import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const reportSections = [
  { title: 'Executive Summary', items: ['Overall audit conclusion', 'Scope covered and period', 'Key findings summary by rating', 'ISMS effectiveness opinion'] },
  { title: 'Scope & Methodology', items: ['Standards and criteria referenced', 'Audit period and team', 'Testing methodology (TOD/TOI/TOE)', 'Limitations and caveats noted'] },
  { title: 'Conformity Findings', items: ['Evidence of well-designed controls', 'Areas of strength observed', 'Positive observations noted', 'Best practice highlighted'] },
  { title: 'Nonconformity Findings', items: ['4Cs per finding (Condition/Criteria/Cause/Consequence)', 'Finding rating (Critical/High/Medium/Low)', 'Management response captured', 'Agreed remediation target date'] },
]

const followUpSteps = [
  'Schedule follow-up review at agreed remediation dates',
  'Obtain evidence of CAPA completion from control owners',
  'Verify corrective action addresses the root cause — not just symptom',
  'Re-test controls where Critical or High findings were raised',
  'Document follow-up conclusion in the audit file',
  'Close finding only when evidence confirms effectiveness',
]

export default function Clause65Reporting() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.5–6.6"
        title="Audit Reporting & Follow-Up"
        description="Formal requirements for producing, distributing, and following up on audit reports — including CAPA closure verification under Clause 6.6."
        badges={['Reporting', 'ISO 19011 Cl. 6.5–6.6']}
      />
      <div className="card mb-6">
        <h2 className="section-title mb-4">Audit Report Structure — Cl. 6.5.2</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reportSections.map(s => (
            <div key={s.title} className="bg-navy-800 border border-navy-600 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
              <div className="space-y-1.5">
                {s.items.map(i => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-steel-300 leading-snug">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card mb-6">
        <h2 className="section-title mb-3">Follow-Up Procedure — Cl. 6.6</h2>
        <p className="text-sm text-steel-300 mb-4 leading-relaxed">ISO 19011 Cl. 6.6 requires the audit programme manager to verify that agreed corrective actions have been completed effectively — not just that actions were taken.</p>
        <div className="space-y-2">
          {followUpSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-navy-800 border border-navy-600 text-xs text-steel-400 font-mono flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-xs text-steel-300 leading-snug">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <AIPanel
        title="Generate Reporting Artifacts"
        systemPrompt="You are an ISO 19011:2018 audit reporting expert. Generate professional audit reports, executive summaries, nonconformity reports, management response trackers, report distribution protocols, and follow-up procedures. Audit reports must include: executive summary, scope, methodology, findings with 4Cs, management responses, and audit conclusions. Use clear professional language."
        placeholder="e.g. Generate an executive summary for an ISO 27001 audit with 2 High and 3 Medium findings"
        contextFields={[
          { id: 'org', label: 'Organisation / Audit Scope', placeholder: 'e.g. Acme Ltd — ISO 27001 ISMS internal audit', type: 'text' },
          { id: 'findings', label: 'Findings Summary', placeholder: 'e.g. 2 High: patch mgmt, access review. 3 Medium: logging gaps', type: 'text' },
          { id: 'artifact', label: 'Report Artifact', type: 'select', options: ['Full Audit Report', 'Executive Summary', 'Nonconformity Report', 'Management Response Tracker', 'Report Distribution Protocol', 'Audit Closure Confirmation', 'Follow-Up Audit Procedure'] },
        ]}
      />
    </div>
  )
}
