import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const annexASections = [
  {
    ref: 'A.1', title: 'Structure and Terminology',
    color: 'border-l-amber-audit',
    desc: 'The clause structure and terminology of ISO 9001:2015 are intended to improve alignment with other management system standards — they do not require an organisation to structure its own documentation to mirror the clauses, nor to adopt the standard\'s terminology internally.',
    items: [
      'Clause structure is for the standard itself, not a mandated document structure',
      'No requirement to replace an organisation\'s own terms with the standard\'s terms',
      '"Environment for the operation of processes" replaces the old "work environment" concept',
      'The role of "management representative" is no longer required — responsibilities may be assigned as the organisation sees fit',
    ]
  },
  {
    ref: 'A.2', title: 'Products and Services',
    color: 'border-l-blue-400',
    desc: 'ISO 9001:2015 uses "products and services" throughout, rather than "products" alone, to make clear the standard applies equally to organisations that deliver services, not only tangible goods.',
    items: [
      'Applies to manufactured products and delivered services alike',
      'Removes any implication that the standard is primarily product-manufacturing focused',
      'Relevant when scoping a QMS for a service-only organisation',
    ]
  },
  {
    ref: 'A.3', title: 'Understanding the Needs and Expectations of Interested Parties',
    color: 'border-l-emerald-400',
    desc: 'The organisation must identify interested parties relevant to the QMS, but Clause 4.2 does not require meeting every need or expectation those parties have — only determining which are relevant requirements for the QMS.',
    items: [
      'Identify interested parties: customers, regulators, suppliers, employees, and others',
      'Determine which of their needs/expectations become QMS requirements',
      'Not every interested-party expectation becomes a formal requirement',
    ]
  },
  {
    ref: 'A.4', title: 'Risk-Based Thinking',
    color: 'border-l-red-400',
    desc: 'Risk-based thinking is built into the requirements for establishing, implementing, maintaining, and continually improving the QMS — but ISO 9001:2015 does not require a formal risk management process, documented risk methodology, or a "risk register" by name.',
    items: [
      'Risk-based thinking replaces the old concept of "preventive action" as a standalone clause',
      'No mandated formal methodology — the organisation determines its own approach',
      'Applies proportionately: more rigour for higher-risk processes',
    ]
  },
  {
    ref: 'A.5', title: 'Applicability',
    color: 'border-l-purple-400',
    desc: 'ISO 9001:2015 replaced the 2008 edition\'s formal "exclusions" concept. An organisation may now determine that a requirement does not apply, provided that determination does not affect its ability to ensure conformity of products and services or enhance customer satisfaction.',
    items: [
      'No formal "exclusion" clause list to complete, unlike ISO 9001:2008',
      'Non-applicability must be justified and must not affect conformity or customer satisfaction',
      'Document the rationale for any requirement treated as not applicable',
    ]
  },
  {
    ref: 'A.6', title: 'Documented Information',
    color: 'border-l-cyan-400',
    desc: '"Documented information" is a single unified term replacing the 2008 edition\'s separate concepts of "documented procedures" and "records." The organisation decides what documented information is necessary for the effectiveness of its own QMS.',
    items: [
      'Single term covers what was previously "procedures" and "records"',
      'No mandated document list beyond what the standard explicitly requires be retained',
      'Organisation determines the extent of documented information needed for its own context',
    ]
  },
  {
    ref: 'A.7', title: 'Organizational Knowledge',
    color: 'border-l-sky-400',
    desc: 'Clause 7.1.6 requires the organisation to determine the knowledge necessary for its processes and to maintain and make that knowledge available — addressing the risk of losing critical knowledge (e.g. through staff turnover) and encouraging the acquisition of new knowledge.',
    items: [
      'Identify knowledge critical to process operation and product/service conformity',
      'Address knowledge-loss risk — succession, staff turnover, undocumented expertise',
      'Consider how new or additional knowledge is acquired when needed',
    ]
  },
  {
    ref: 'A.8', title: 'Control of Externally Provided Processes, Products and Services',
    color: 'border-l-orange-400',
    desc: 'Clause 8.4 broadens the old "purchasing" concept to cover any process, product, or service provided by an external party — including outsourced processes, associate/affiliate companies, and not just traditional suppliers.',
    items: [
      'Covers outsourced processes, not only purchased goods',
      'Applies to associate or affiliated companies providing processes/products/services',
      'Type and extent of control must be proportionate to the risk involved',
    ]
  },
]

const annexBComparison = [
  { std: 'ISO 9000', focus: 'Fundamentals and vocabulary', relation: 'Defines the terms used throughout ISO 9001 — read alongside, not a requirements standard itself.' },
  { std: 'ISO 9004', focus: 'Quality management — Quality of an organisation, guidance for sustained success', relation: 'Broader guidance for organisations that want to go beyond ISO 9001 conformity toward sustained performance.' },
  { std: 'ISO 10001 – 10004 series', focus: 'Customer satisfaction guidance (codes of conduct, complaints handling, dispute resolution, monitoring/measuring)', relation: 'Practical guidance documents that support Clause 9.1.2 (customer satisfaction) implementation.' },
  { std: 'ISO 10005 / 10006 / 10007', focus: 'Quality plans / project quality management / configuration management', relation: 'Supporting guidance for planning-heavy or project-based QMS implementations.' },
  { std: 'ISO 10008', focus: 'Business-to-consumer electronic commerce transactions', relation: 'Sector-specific guidance for organisations with significant e-commerce activity.' },
  { std: 'ISO 10012', focus: 'Measurement management systems', relation: 'Supports Clause 7.1.5 (monitoring and measuring resources) in detail.' },
  { std: 'ISO 10015', focus: 'Guidelines for training', relation: 'Supports Clause 7.2 (competence) implementation.' },
  { std: 'ISO 19011', focus: 'Guidelines for auditing management systems', relation: 'The audit-methodology standard this platform\'s "Conduct an Audit" workflow is built on — see the ISO 19011 section.' },
]

export default function AnnexAB() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 9001:2015"
        clause="Annex A & B"
        title="Annex A & B — Clarification and Related Standards"
        description="Annex A and Annex B are informative — not requirements. Annex A explains the intent behind the 2015 clause structure and terminology; Annex B places ISO 9001 in the context of other ISO/TC 176 quality management standards. Useful for interpreting why the standard is worded the way it is, not for auditing against."
        badges={['Informative', 'Non-Mandatory', 'Interpretation Guide']}
      />

      <h2 className="text-sm font-semibold text-white mt-2 mb-3">Annex A — Clarification of New Structure, Terminology and Concepts</h2>
      <div className="space-y-5 mb-8">
        {annexASections.map(s => (
          <div key={s.ref} className={`card border-l-4 ${s.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{s.ref}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{s.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {s.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-steel-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-white mb-1">Annex B — Other International Standards on Quality Management and Quality Management Systems</h2>
      <p className="text-xs text-steel-400 mb-3">Developed by ISO/TC 176 (the same committee responsible for ISO 9001). Informative only — none of these are certification requirements under ISO 9001.</p>
      <div className="card mb-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-navy-700">
              {['Standard', 'Focus', 'Relation to ISO 9001'].map(h => (
                <th key={h} className="text-left py-1.5 px-2 text-steel-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {annexBComparison.map((row, i) => (
              <tr key={row.std} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                <td className="py-1.5 px-2 text-white font-medium whitespace-nowrap">{row.std}</td>
                <td className="py-1.5 px-2 text-steel-300">{row.focus}</td>
                <td className="py-1.5 px-2 text-steel-300">{row.relation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AIPanel
        title="Generate Annex A / B Interpretation Notes"
        systemPrompt="You are an ISO 9001:2015 standards-interpretation specialist. Generate practical interpretation notes based on Annex A (clarification of structure, terminology, and concepts) and Annex B (related standards) — helping auditors and auditees understand the intent behind a clause, not just its literal wording. All outputs must be structured, professional, and clearly marked as interpretive guidance, not a substitute for the clause requirements themselves."
        placeholder="e.g. Explain why 'documented information' replaced 'procedures and records', for a team transitioning from ISO 9001:2008"
        contextFields={[
          { id: 'topic', label: 'Annex A Topic', type: 'select', options: ['A.1 — Structure & Terminology', 'A.2 — Products and Services', 'A.3 — Interested Parties', 'A.4 — Risk-Based Thinking', 'A.5 — Applicability', 'A.6 — Documented Information', 'A.7 — Organizational Knowledge', 'A.8 — External Provision'] },
          { id: 'audience', label: 'Audience', placeholder: 'e.g. New QMS team transitioning from ISO 9001:2008', type: 'text' },
        ]}
      />
    </div>
  )
}
