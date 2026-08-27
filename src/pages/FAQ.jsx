import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { ChevronDown, ChevronRight } from 'lucide-react'

const sections = [
  {
    label: 'Platform basics', color: 'border-l-amber-400',
    items: [
      { q: 'What is QMSiQ?',
        a: 'QMSiQ is a Quality Management Audit Platform serving two connected purposes. First, conducting audits — using ISO 19011:2018 methodology to independently verify ISO 9001:2015 conformity. Second, reviewing your QMS — using gap analysis, risk registers, CAPA tracking, KPI dashboards, and management review to assess and improve quality performance. Both activities are in one platform because audit findings feed into CAPA, which feeds into management review.' },
      { q: 'What is the difference between "Conduct an Audit" and "Review Your QMS"?',
        a: 'Conducting an audit is an independent verification activity — you gather objective evidence, test controls using TOD/TOI/TOE, and document findings (Major NC, Minor NC, Observation) using the 4Cs framework. The output is a formal audit report. Reviewing your QMS is a management activity — you assess readiness using gap analysis, monitor risks and KPIs, track corrective actions, and prepare management review packs. The output is decisions, actions, and improvements. Audit finds the problem. Review closes the loop.' },
      { q: 'What do the nav sections mean?',
        a: 'The sidebar is split into two clear workflows. "Conduct an Audit" covers audit methodology (ISO 19011), audit types (surveillance, internal, supplier), and audit execution (PBC, fieldwork tracker, findings, workpapers, report). "Review Your QMS" covers gap analysis, risk register, CAPA, KPI dashboard, management review, and audit universe. The ISO 9001 reference pages support the review workflow — each clause explains what is required and how to assess it.' },
      { q: 'What does ⭐ Live mean on some pages?',
        a: 'Live pages connect to the platform database in real time. Data is stored per programme, shared with your invited team members, and persists across sessions. PBC list, finding register, fieldwork tracker, risk register, CAPA tracker, KPI dashboard, and audit universe are all live. Reference pages (ISO 19011, ISO 9001 clauses, terminology) are built-in content — no database connection needed.' },
      { q: 'Can I use QMSiQ for multiple clients?',
        a: 'Yes. Create one audit programme per client engagement. The programme selector in the header lets you switch between clients instantly. All live data (findings, risks, workpapers, PBC) is scoped to the active programme. The All Programmes page gives you a card overview of every programme with status, quick links, and progress at a glance.' },
    ]
  },
  {
    label: 'Conducting an audit', color: 'border-l-teal-400',
    items: [
      { q: 'What is TOD / TOI / TOE?',
        a: 'These are the three phases of audit testing per ISO 19011. TOD (Test of Design) — does the control exist on paper? Review the policy, procedure, or documented process. TOI (Test of Implementation) — is it operating in practice? Walk through the process with the process owner, observe it being performed. TOE (Test of Effectiveness) — is it working consistently over time? Sample evidence from the audit period (inspection records, training logs, supplier scorecards). All three phases are tracked per workpaper in the Fieldwork Tracker.' },
      { q: 'What is the 4Cs finding framework?',
        a: 'The 4Cs structure every audit finding clearly and consistently. Condition — what you found (the factual observation). Criteria — what the standard or procedure requires (the ISO 9001 clause or internal policy). Cause — the root cause of the gap (use 5-Why or Ishikawa). Consequence — the risk or impact if not remediated (effect on product quality, customer satisfaction, or certification). This structure ensures findings are defensible, actionable, and clearly linked to a requirement. Use the Finding Register to document all four components per finding.' },
      { q: 'What is the difference between Major NC, Minor NC, and Observation?',
        a: 'Major NC — a significant failure to meet an ISO 9001 requirement that could affect the certification or the quality of products/services. Often indicates a systemic failure or complete absence of a required control. Minor NC — a single lapse or isolated failure in an otherwise functioning system. The requirement exists and is largely met, but there is a specific gap. Observation — a situation that is not currently a nonconformity but could become one if not addressed. Also used for improvement opportunities. The Finding Register uses these three ratings plus Advisory for recommendations beyond the standard.' },
      { q: 'What goes in the PBC list?',
        a: 'PBC (Provided By Client) is the evidence list you send to the auditee before the audit. Add every document, record, or data item you need to review — quality policy, process maps, training records, supplier scorecards, inspection records, management review minutes, internal audit reports. Set priority (High/Medium/Low), assign a domain (e.g. Clause 8, Supplier Management), and track receipt status. The PBC list is shared with your team in real time.' },
      { q: 'How does the Supplier Audit work?',
        a: 'The Supplier Audit template (ISO 9001 Cl.8.4) pre-loads a standard set of PBC evidence requests and workpaper sections relevant to supplier evaluation and control. Select it when creating a new programme with type \'Supplier Audit\'. This gives you a ready-made structure for auditing supplier quality agreements, performance data, approved supplier lists, and incoming inspection records — without starting from a blank slate.' },
      { q: 'How does the Audit Report Builder work?',
        a: 'The Report Builder pulls your live finding register data into a structured formal report. Add a client organisation name, executive summary, audit scope, methodology, and conclusions. Findings are automatically grouped and formatted. You can edit narrative sections and download the complete report. The report reflects the state of your finding register at the time of generation.' },
    ]
  },
  {
    label: 'Reviewing your QMS', color: 'border-l-purple-400',
    items: [
      { q: 'What is the Gap Analysis for?',
        a: 'Gap analysis is a readiness assessment — it is not an audit. Use it before a Stage 1 certification audit, at the start of a new client engagement, or when preparing for surveillance. Rate every ISO 9001:2015 requirement (27 items across Cl.4–10) as Green (conforms), Amber (partially met), Red (not in place), or N/A. Add notes per item. The readiness score shows overall QMS maturity. Unlike audit findings, gap analysis items are self-assessed — they do not require objective evidence.' },
      { q: 'How is the Gap Analysis different from the Finding Register?',
        a: 'Gap Analysis is a review tool — self-assessed readiness with RAG status, done before or outside of a formal audit. It uses management language (gap, readiness, action needed). Finding Register is an audit tool — findings based on objective evidence, raised during a formal audit using ISO 19011 methodology. It uses audit language (nonconformity, criteria, evidence). Gaps in the Gap Analysis may become findings if confirmed during a formal audit. Findings in the Finding Register always require a CAPA. Gap items may or may not require formal corrective action.' },
      { q: 'How does CAPA connect to audit findings?',
        a: 'Every Major NC and Minor NC from an audit should become a corrective action in the CAPA Tracker. The finding documents the nonconformity and root cause (4Cs). The CAPA tracks the agreed corrective action, owner, due date, and verification of effectiveness after closure. In the CAPA Tracker, link each action to its source finding. Management review (Cl. 9.3) requires a review of CAPA status as a mandatory input — the CAPA Tracker feeds directly into the management review pack.' },
      { q: 'What is the Management Review Pack?',
        a: 'ISO 9001 Cl.9.3 requires top management to review the QMS at planned intervals. The Management Review Pack covers all mandatory inputs — results of internal audits, customer satisfaction data, process performance and product conformity, CAPA status, quality objectives progress, resource adequacy, and risks and opportunities. Outputs must include decisions on improvement opportunities, changes to the QMS, and resource needs. The pack in QMSiQ guides you through each input with prompts and links to your live data.' },
      { q: 'What is the Audit Universe?',
        a: 'The Audit Universe is your annual internal audit schedule per ISO 9001 Cl.9.2. Add all QMS processes, clauses, and areas in scope. Assign a risk rating to each area — higher risk areas should be audited more frequently. Set planned audit dates and track completion. The audit universe ensures all areas are covered over the audit programme cycle and provides evidence to certification bodies that your internal audit programme is operating as planned.' },
    ]
  },
  {
    label: 'Team and access', color: 'border-l-blue-400',
    items: [
      { q: 'How do I invite someone to my audit programme?',
        a: 'When creating or editing a programme, use the Invite Team Members section. Enter your colleague\'s email address and select their role (Lead, Auditor, or Reviewer). They will receive an invitation email. When they register using that email address, they are automatically added to the programme with the assigned role. You can also manage team membership at any time from the Team Members page in the sidebar.' },
      { q: 'What can each role do?',
        a: 'Lead — full access. Creates programmes, invites members, changes roles, deletes records, and manages team membership. Auditor — creates and edits findings, workpapers, PBC items, and risks. Cannot delete records or manage team membership. Reviewer — read access plus sign-off. Can view all shared data, sign off workpapers, and close findings. Cannot create, edit, or delete records. Your role is shown as a badge in the header next to the programme selector.' },
      { q: 'Can a Reviewer see all findings from the whole team?',
        a: 'Yes. All team members — Lead, Auditor, and Reviewer — can see all data in the shared programme. Findings, risks, workpapers, and PBC items created by any team member are visible to all. The role controls what you can do with the data, not what you can see.' },
    ]
  },
  {
    label: 'AI features', color: 'border-l-emerald-400',
    items: [
      { q: 'How does the AI generation work?',
        a: 'Most reference pages and live pages have an AI panel at the bottom. Enter context (organisation type, clause, specific scenario) and select the artifact you need. The AI generates audit-ready documents — findings in 4Cs format, gap analysis reports, workpaper templates, management review packs, CAPA plans, and ISO 9001 clause guidance. The AI is pre-prompted with ISO 9001 and ISO 19011 context so outputs are aligned to the standards without requiring you to prompt from scratch.' },
      { q: 'Can the AI see my live data?',
        a: 'The AI panels on reference pages work from your text inputs only. The AI panels on live pages (Finding Register, CAPA Tracker, KPI Dashboard) can include your live data in the prompt — for example, generating a management review summary using your actual finding counts and CAPA status. This is opt-in per generation.' },
      { q: 'What if the AI is unavailable?',
        a: 'If the AI service is unavailable, you will see a brief error message. All other platform features — live data, reference content, fieldwork tracker, finding register — continue to work normally. The AI is supplementary, not required for the core workflow.' },

      { q: 'What is the difference between Implement Your QMS and Review Your QMS?',
        a: 'Implement Your QMS is for organisations building a QMS from scratch — it guides you through ISO 9001 Cl.4 to Cl.10 sequentially, with AI-assisted drafting for each clause. Review Your QMS is for ongoing monitoring — KPI tracking, CAPA management, risk register, gap analysis, and management review for an existing QMS.' },
      { q: 'What are the blind spot modules (Cl.8.3, Cl.9.2, Cl.10.3)?',
        a: 'Cl.8.3 Design and Development is for organisations that design products or services — distributors and service firms can mark it excluded per Cl.4.3. Cl.9.2 Internal Audit Schedule is your annual audit plan — all clauses must be covered each cycle. Cl.10.3 Continual Improvement is a proactive register of improvement ideas distinct from reactive CAPA.' },
      { q: 'How does the AI runtime panel work in the Finding Register?',
        a: 'Select one or more ISO 9001 clauses, describe your observation, and optionally paste relevant procedure text. The AI maps your observation to the clause context, classifies it (Major NC / Minor NC / Observation / OFI), determines root cause, and generates structured corrective actions with SLA days and verification requirements. All output is marked DRAFT and requires human auditor sign-off before becoming an audit record.' },
      { q: 'What is certification readiness on the Implementation Overview?',
        a: 'The certification readiness score checks 11 conditions — policy approved, minimum stakeholders, objectives, competence records and documents registered, operational processes defined, audit schedule in place, improvement register maintained, and no open Major NCs. It is indicative only and does not guarantee certification success. All items must be green before booking a certification audit.' },
      { q: 'How do gap analysis results link to implementation?',
        a: 'On the Gap Analysis page, any clause rated Red or Amber shows a direct link to its implementation module — Cl.7.2 Red takes you to the Competence Register, Cl.5.2 Amber takes you to the Quality Policy, and so on. This closes the loop between assessment and action.' },
      { q: 'Do I get notified when a CAPA is due?',
        a: 'Yes. The platform sends email reminders to the assigned action owner 7 days before a CAPA due date. Reminders are sent automatically each day for any CAPA in status \'CAPA Raised\' with a due date within the next 7 days. Make sure the action owner field in the CAPA Tracker contains the team member\'s name as registered on the platform.' },
    ]
  },
]

function FAQSection({ s }) {
  const [open, setOpen] = useState({})
  const toggle = (i) => setOpen(p => ({ ...p, [i]: !p[i] }))
  return (
    <div className={`card border-l-4 ${s.color} mb-4`}>
      <h2 className="font-semibold text-white text-sm mb-3">{s.label}</h2>
      <div className="space-y-2">
        {s.items.map((item, i) => (
          <div key={i} className="bg-navy-800 rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between gap-3 p-3 text-left"
              onClick={() => toggle(i)}>
              <span className="text-xs font-medium text-steel-200 leading-snug">{item.q}</span>
              {open[i] ? <ChevronDown size={12} className="text-steel-400 flex-shrink-0" /> : <ChevronRight size={12} className="text-steel-400 flex-shrink-0" />}
            </button>
            {open[i] && (
              <div className="px-3 pb-3">
                <div className="text-xs text-steel-300 leading-relaxed border-t border-navy-700 pt-3">{item.a}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader standard="Platform" clause="FAQ" title="Frequently Asked Questions"
        description="Common questions about QMSiQ — how the two modes work, what each feature does, and how audit and review connect."
        badges={['Audit', 'Review', 'ISO 9001', 'ISO 19011']} />
      <div className="mb-6">
        {sections.map((s, i) => <FAQSection key={i} s={s} />)}
      </div>
      <div className="card text-center py-6">
        <div className="text-xs text-steel-400 mb-2">Can\'t find what you\'re looking for?</div>
        <div className="text-xs text-steel-500">Contact the platform administrator for assistance.</div>
      </div>
    </div>
  )
}
