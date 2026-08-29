import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { ChevronDown, ChevronRight } from 'lucide-react'

const sections = [
  {
    title: 'What is QMSiQ?',
    content: `QMSiQ is a Quality Management Audit Platform built around two distinct but connected activities: conducting audits and reviewing your QMS.

Conducting an audit means independently verifying that your organisation's quality management processes conform to ISO 9001:2015 requirements — using ISO 19011:2018 audit methodology. The output is findings: nonconformities and observations, formally documented using the 4Cs framework.

Reviewing your QMS means assessing whether your quality management system is working effectively — using gap analysis, risk registers, KPI monitoring, CAPA tracking, and management review. The output is actions and improvements.

Both activities live in one platform because they feed each other. Audit findings raise CAPAs. CAPAs close in the review cycle. The management review inputs come from audit results. They are not the same thing — but they are part of the same loop.`
  },
  {
    title: 'Conduct an Audit — step by step',
    steps: [
      { ref: 'Step 1', label: 'Create an audit programme', path: '/', desc: 'Click Select Programme → New Programme. Enter the programme name, audit scope, dates, and lead auditor. Invite team members with their roles (Auditor, Reviewer) directly in the creation form.' },
      { ref: 'Step 1b', label: 'Use a Supplier Audit template (optional)', path: '/fieldwork/supplier', desc: 'If auditing a supplier against ISO 9001 Cl.8.4, select programme type Supplier Audit. This pre-loads 12 PBC evidence requests and 6 workpaper sections covering supplier agreements, performance records, and approved supplier lists.' },
      
      { ref: 'Step 1c', label: 'Cl.8.3 — Design & Development (if applicable)', path: '/qms/design', desc: 'If your organisation designs products or services, register design projects with inputs, outputs, verification and validation methods. If not applicable, tick "excluded per Cl.4.3".' },
      { ref: 'Step 1d', label: 'Cl.9.2 — Internal Audit Schedule', path: '/qms/audit-schedule', desc: 'Plan your annual internal audit schedule. All QMS clauses must be covered each cycle. Frequency should be risk-based. Auditors must be objective and impartial — they cannot audit their own work.' },
      { ref: 'Step 1e', label: 'Cl.10.3 — Continual Improvement', path: '/qms/improvements', desc: 'Maintain a proactive improvement register separate from reactive CAPA. Sources include internal audits, management review, customer feedback, KPI analysis and staff suggestions.' },
      { ref: 'Step 2', label: 'Plan the audit (ISO 19011 Cl. 5)', path: '/iso19011/clause5', desc: 'Review the Audit Programme Management page to understand how to set objectives, assign resources, and schedule audits across the year.' },
      { ref: 'Step 3', label: 'Initiate (ISO 19011 Cl. 6.2)', path: '/iso19011/clause6-initiation', desc: 'Formal audit initiation — confirm mandate, define audit scope and objectives, assign the audit team, and confirm feasibility.' },
      { ref: 'Step 4', label: 'Prepare (ISO 19011 Cl. 6.3)', path: '/iso19011/clause6-preparation', desc: 'Document review (TOD), prepare the audit plan, create PBC evidence requests, and assign workpaper sections to team members.' },
      { ref: 'Step 5', label: 'Build your PBC list', path: '/fieldwork/pbc', desc: 'Add all evidence items you need from the client. Set priority (High/Medium/Low), domain, and track receipt status. Filter and manage in real time.' },
      { ref: 'Step 6', label: 'Run fieldwork (TOD → TOI → TOE)', path: '/fieldwork/tracker', desc: 'Work through each control or clause using TOD (design exists?), TOI (implemented in practice?), TOE (effective over time?). Log workpaper status per item.' },
      { ref: 'Step 7', label: 'Raise findings (4Cs)', path: '/fieldwork/findings', desc: 'Document each finding using the 4Cs framework: Condition (what you found), Criteria (what the standard requires), Cause (root cause), Consequence (impact). Rate as Major NC / Minor NC / Observation / Advisory.' },
      { ref: 'Step 8', label: 'Opening and closing meetings', path: '/iso19011/meetings', desc: 'Use the meeting guidance pages for agenda templates, attendee requirements, and how to present findings in the closing meeting.' },
      { ref: 'Step 9', label: 'Write the audit report', path: '/reporting/builder', desc: 'Pull live findings into the Report Builder. Add executive summary, scope, methodology, and conclusions. The report auto-populates from your finding register.' },
    ]
  },
  {
    title: 'Review Your QMS — step by step',
    steps: [
      { ref: 'Step 1', label: 'Run a gap analysis', path: '/fieldwork/gap-analysis', desc: 'Rate every ISO 9001:2015 requirement (Cl.4–10) as Green (conforms), Amber (partial), Red (not in place), or N/A. Add notes per item. The readiness score updates live. Use this before Stage 1 audit or when starting a new client engagement.' },
      { ref: 'Step 2', label: 'Maintain the risk register', path: '/reporting/risks', desc: 'Log quality risks — process risks, supplier risks, customer satisfaction risks. Score likelihood × impact. Assign treatment and owner. Review quarterly.' },
      { ref: 'Step 3', label: 'Track CAPA', path: '/reporting/capa', desc: 'Every finding from an audit should become a corrective action. Log the nonconformity, root cause, agreed action, owner, and due date. Track to verified closure. Action owners are automatically emailed 7 days before a due date.' },
      { ref: 'Step 4', label: 'Check Certification Readiness', path: '/qms', desc: 'The Implementation Overview shows a certification readiness score across 11 checks. All must be green before booking a certification audit. Open Major NCs from audits automatically block the score.' },
      { ref: 'Step 4', label: 'Monitor KPIs', path: '/reporting/kpi', desc: 'Track quality KPIs — CAPA closure rate, customer complaint rate, nonconformity trends, supplier performance. Use to demonstrate continual improvement.' },
      { ref: 'Step 5', label: 'Prepare management review', path: '/reporting/management-review', desc: 'ISO 9001 Cl.9.3 requires management review at planned intervals. The pack covers all mandatory inputs (audit results, customer satisfaction, CAPA status, objectives progress) and documents outputs (decisions, actions, resources).' },
      { ref: 'Step 6', label: 'Plan next year\'s audits', path: '/reporting/universe', desc: 'The Audit Universe is your annual audit schedule. Add all processes and clauses in scope, assign risk ratings, and set planned audit dates. Track completion across the year.' },
    ]
  },
  {
    title: 'ISO 9001 vs ISO 19011 — the difference',
    content: `ISO 9001:2015 specifies WHAT your organisation must do to manage quality — the requirements for a quality management system. It tells you that you must conduct internal audits (Cl. 9.2), manage risks (Cl. 6.1), and review performance (Cl. 9.3).

ISO 19011:2018 specifies HOW to conduct management system audits — the methodology. It covers audit principles, programme management, conducting audits, and auditor competence. It applies to any management system audit, including ISO 9001 internal audits.

In QMSiQ:
• The Conduct an Audit sections are governed by ISO 19011
• The Review Your QMS sections are governed by ISO 9001
• Both are needed — ISO 9001 requires internal audits, ISO 19011 defines how to do them properly`
  },
  {
    title: 'Audit vs Review — key differences',
    table: {
      headers: ['', 'Audit', 'Review'],
      rows: [
        ['Purpose', 'Independent verification — did you do what you said?', 'Assessment — is what you\'re doing working?'],
        ['Output', 'Findings: Major NC / Minor NC / Observation', 'Actions: CAPA, improvements, decisions'],
        ['Who does it', 'Independent auditor — no self-audit', 'Quality manager, management team'],
        ['Evidence', 'Objective evidence required per finding', 'Data analysis, trends, judgement'],
        ['Standard', 'ISO 19011:2018', 'ISO 9001:2015 Cl.9 & 10'],
        ['Frequency', 'Planned — annual programme', 'Ongoing — year-round monitoring'],
        ['In QMSiQ', 'Conduct an Audit sections', 'Review Your QMS sections'],
      ]
    }
  },
  {
    title: 'Team collaboration — roles explained',
    content: `When you create a programme, you can invite team members and assign roles before starting the audit.

Lead — full access. Creates the programme, invites members, manages team, can delete records. Usually the lead auditor or quality manager.

Auditor — can create and edit findings, workpapers, risks, and PBC items. Cannot delete records or manage team membership. Typical for team auditors working on fieldwork.

Reviewer — read-only plus sign-off. Can view all data, sign off workpapers, and close findings. Cannot create or delete. Typical for technical reviewers, quality directors, or client representatives.

Your role is shown as a badge next to the programme selector in the header. Permissions are enforced automatically — you will not see buttons that your role cannot use. Passwords must be at least 10 characters.`
  },
  {
    title: 'Live pages — what they mean',
    content: `Pages marked ⭐ Live connect to the platform database in real time — data is stored, shared with your team, and persists across sessions.

PBC Evidence List ⭐ — evidence requests sent to the client. All team members see the same list.
Fieldwork Tracker ⭐ — workpaper status per control or clause. Team progress visible to all.
Finding Register ⭐ — the definitive list of audit findings. Shared across the team. Feeds the report builder.
Risk Register ⭐ — quality risk register. Maintained year-round.
CAPA Tracker ⭐ — corrective actions from findings. Tracks to closure.
KPI Dashboard ⭐ — quality performance metrics. Updated as data is added.
Audit Universe ⭐ — annual audit schedule. All planned and completed audits.

Reference pages (ISO 19011, ISO 9001 Cl.4–10, terminology) are built-in content — no database connection needed.`
  },
]

function Section({ s, open, toggle }) {
  return (
    <div className="card mb-3">
      <button className="w-full flex items-center justify-between gap-3 text-left" onClick={toggle}>
        <span className="font-semibold text-white text-sm">{s.title}</span>
        {open ? <ChevronDown size={14} className="text-steel-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-steel-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {s.content && (
            <div className="text-xs text-steel-300 leading-relaxed whitespace-pre-line">{s.content}</div>
          )}
          {s.steps && (
            <div className="space-y-2">
              {s.steps.map(step => (
                <div key={step.ref} className="flex gap-3 bg-navy-800 rounded-xl p-3">
                  <span className="clause-tag flex-shrink-0 self-start">{step.ref}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white mb-1">{step.label}</div>
                    <div className="text-xs text-steel-400 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {s.table && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-700">
                    {s.table.headers.map(h => (
                      <th key={h} className="text-left py-2 px-3 text-steel-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, i) => (
                    <tr key={i} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/30'}`}>
                      {row.map((cell, j) => (
                        <td key={j} className={`py-2.5 px-3 leading-snug ${j === 0 ? 'text-amber-audit font-semibold whitespace-nowrap' : 'text-steel-300'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Wiki() {
  const [open, setOpen] = useState({ 0: true })
  const toggle = (i) => setOpen(p => ({ ...p, [i]: !p[i] }))

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader standard="Platform" clause="Guide" title="How to Use QMSiQ"
        description="QMSiQ covers two connected activities — conducting audits (ISO 19011) and reviewing your QMS (ISO 9001). This guide walks through both workflows step by step."
        badges={['Audit', 'Review', 'ISO 9001', 'ISO 19011']} />
      <div className="mb-6">
        {sections.map((s, i) => (
          <Section key={i} s={s} open={!!open[i]} toggle={() => toggle(i)} />
        ))}
      </div>
    </div>
  )
}
