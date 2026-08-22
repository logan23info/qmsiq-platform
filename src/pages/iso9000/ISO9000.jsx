import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { Search, X } from 'lucide-react'

const terms = [
  { term: 'Audit', definition: 'Systematic, independent, documented process for obtaining audit evidence and evaluating it objectively to determine conformity. Can be first, second, or third party.', category: 'Audit' },
  { term: 'Audit criteria', definition: 'Set of requirements used as reference — includes ISO 9001 clauses, customer requirements, internal policies, and statutory obligations.', category: 'Audit' },
  { term: 'Audit evidence', definition: 'Records, statements of fact, or other information relevant to audit criteria and verifiable. Can be qualitative or quantitative.', category: 'Audit' },
  { term: 'Audit finding', definition: 'Result of evaluating audit evidence against criteria. May indicate conformity, nonconformity, or opportunity for improvement.', category: 'Audit' },
  { term: 'Audit programme', definition: 'Set of one or more audits planned for a specific time frame and directed towards a specific purpose — per ISO 19011 Clause 5.', category: 'Audit' },
  { term: 'Calibration', definition: 'Operation establishing relation between measurement values and reference standards. Required for monitoring and measuring resources per Cl. 7.1.5.', category: 'Operations' },
  { term: 'Competence', definition: 'Ability to apply knowledge and skills to achieve intended results. Must be determined, ensured, and evidenced per Cl. 7.2.', category: 'Support' },
  { term: 'Conformity', definition: 'Fulfilment of a requirement. The positive state — contrasted with nonconformity.', category: 'Core' },
  { term: 'Context', definition: 'Combination of internal and external issues that affect the organisation\'s purpose and strategic direction — assessed per Cl. 4.1.', category: 'Core' },
  { term: 'Continual improvement', definition: 'Recurring activity to enhance performance. Distinct from "continuous" — improvements may be incremental and planned, not necessarily uninterrupted.', category: 'Improvement' },
  { term: 'Correction', definition: 'Action to eliminate a detected nonconformity. Addresses the symptom — not the root cause. Contrast with corrective action.', category: 'Improvement' },
  { term: 'Corrective action', definition: 'Action to eliminate the cause of a nonconformity and prevent recurrence. Must follow root cause analysis per Cl. 10.2.', category: 'Improvement' },
  { term: 'Customer satisfaction', definition: 'Perception of the degree to which customer expectations have been fulfilled. Must be monitored per Cl. 9.1.2.', category: 'Core' },
  { term: 'Design & Development', definition: 'Set of processes that transform requirements into specified characteristics. Covered by Cl. 8.3 — can be excluded if not applicable.', category: 'Operations' },
  { term: 'Documented information', definition: 'Information required to be controlled and maintained. ISO 9001 mandates specific documented information throughout Clauses 4-10.', category: 'Support' },
  { term: 'Effectiveness', definition: 'Extent to which planned activities are realised and planned results achieved. QMS effectiveness evaluated per Cl. 9.1 and 9.3.', category: 'Core' },
  { term: 'External provider', definition: 'Organisation or person that provides a product or service from outside the organisation. Controlled per Cl. 8.4.', category: 'Operations' },
  { term: 'Infrastructure', definition: 'System of facilities, equipment, and services needed for operation — buildings, equipment, IT, transport. Required per Cl. 7.1.3.', category: 'Support' },
  { term: 'Interested party', definition: 'Person or organisation that can affect, be affected by, or perceive itself to be affected by a decision or activity. Identified per Cl. 4.2.', category: 'Core' },
  { term: 'Management review', definition: 'Formal review of the QMS by top management at planned intervals. Mandatory inputs and outputs defined in Cl. 9.3.', category: 'Performance' },
  { term: 'Measurement uncertainty', definition: 'Parameter characterising the dispersion of values attributed to a quantity being measured. Relevant to calibration and test results.', category: 'Operations' },
  { term: 'Nonconformity', definition: 'Non-fulfilment of a requirement. Must trigger correction and corrective action per Cl. 10.2. Can be major or minor.', category: 'Improvement' },
  { term: 'Nonconforming output', definition: 'Output that does not conform to requirements. Must be identified and controlled per Cl. 8.7 — cannot be delivered to customer uncontrolled.', category: 'Operations' },
  { term: 'Objective evidence', definition: 'Data supporting the existence or verity of something — verifiable and factual. The basis for audit conclusions.', category: 'Audit' },
  { term: 'Outsourcing', definition: 'Arrangement where an external organisation performs part of the QMS function. The organisation retains responsibility — controls required per Cl. 8.4.', category: 'Operations' },
  { term: 'Process', definition: 'Set of interrelated or interacting activities that use inputs to deliver an intended result. QMS is a system of interacting processes per Cl. 4.4.', category: 'Core' },
  { term: 'Process approach', definition: 'Systematic management of processes and their interactions. One of the 7 quality management principles underpinning ISO 9001.', category: 'Core' },
  { term: 'Product', definition: 'Output of a process — tangible goods. Contrasted with service. ISO 9001 covers both products and services.', category: 'Core' },
  { term: 'Quality', definition: 'Degree to which a set of inherent characteristics of an object fulfils requirements. The central concept of ISO 9001.', category: 'Core' },
  { term: 'Quality management principle', definition: '7 principles underpinning ISO 9001: Customer focus, Leadership, Engagement, Process approach, Improvement, Evidence-based decisions, Relationship management.', category: 'Core' },
  { term: 'Quality manual', definition: 'Document specifying the QMS — no longer mandatory in ISO 9001:2015 but still widely used to describe scope, processes, and interactions.', category: 'Support' },
  { term: 'Quality objective', definition: 'Objective related to quality — must be SMART, consistent with quality policy, monitored, communicated, and updated per Cl. 6.2.', category: 'Performance' },
  { term: 'Quality plan', definition: 'Specification of procedures, resources, and sequence of activities relevant to a specific product, project, or contract.', category: 'Operations' },
  { term: 'Quality policy', definition: 'Intentions and direction of an organisation related to quality — formally expressed by top management. Required per Cl. 5.2.', category: 'Core' },
  { term: 'Risk-based thinking', definition: 'Consideration of risk throughout the QMS — not a separate risk management system. Embedded in context (Cl.4), planning (Cl.6), and operations (Cl.8).', category: 'Core' },
  { term: 'Service', definition: 'Intangible output of a process — performed for and often with a customer. ISO 9001 covers both products and services.', category: 'Core' },
  { term: 'Top management', definition: 'Person or group of people who directs and controls the organisation at the highest level. Has specific responsibilities under Cl. 5.1.', category: 'Core' },
  { term: 'Traceability', definition: 'Ability to trace the history, application, or location of an object. Required where specified — production identification and traceability per Cl. 8.5.2.', category: 'Operations' },
  { term: 'Verification', definition: 'Confirmation through objective evidence that specified requirements have been fulfilled. Contrasted with validation.', category: 'Operations' },
  { term: 'Validation', definition: 'Confirmation through objective evidence that requirements for a specific intended use have been fulfilled. Proves fitness for purpose.', category: 'Operations' },
  { term: 'Work environment', definition: 'Conditions under which work is performed — physical, social, psychological, and environmental. Managed per Cl. 7.1.4.', category: 'Support' },
  { term: 'CAPA', definition: 'Corrective and Preventive Action. In ISO 9001:2015 the term "preventive action" is replaced by risk-based thinking — but CAPA remains widely used in practice.', category: 'Improvement' },
  { term: 'PDCA', definition: 'Plan-Do-Check-Act cycle — the Deming cycle underlying all ISO management systems. Plan objectives, Do implement, Check monitor, Act improve.', category: 'Core' },
  { term: '4Cs', definition: 'Condition, Criteria, Cause, Consequence — the audit finding framework used in ISO 19011. Structures quality audit findings for clarity and root cause focus.', category: 'Audit' },
  { term: 'TOD / TOI / TOE', definition: 'Test of Design, Test of Implementation, Test of Effectiveness — the three phases of audit testing per ISO 19011. TOD = design exists, TOI = implemented, TOE = effective over time.', category: 'Audit' },
]

const categories = ['All', 'Core', 'Audit', 'Support', 'Operations', 'Performance', 'Improvement']
const catColors = {
  Core: 'bg-blue-900/40 text-blue-300', Audit: 'bg-amber-900/40 text-amber-300',
  Support: 'bg-purple-900/40 text-purple-300', Operations: 'bg-emerald-900/40 text-emerald-300',
  Performance: 'bg-cyan-900/40 text-cyan-300', Improvement: 'bg-red-900/40 text-red-300',
}

export default function ISO9000() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const filtered = terms.filter(t =>
    (cat === 'All' || t.category === cat) &&
    (!search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()))
  )
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9000:2015" clause="Terminology" title="QMS Audit Terminology Dictionary"
        description={`${terms.length} key terms from ISO 9000:2015 and the broader quality management audit lexicon — core QMS concepts, audit methodology, process approach, risk-based thinking, and improvement terminology.`}
        badges={[`${terms.length} Terms`, 'ISO 9000:2015', 'Reference']} />
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input className="input-field pl-8 text-xs py-1.5" placeholder="Search terms or definitions..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400"><X size={12} /></button>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${cat === c ? 'bg-navy-700 border-steel-400 text-white' : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-400'}`}>
                {c}
              </button>
            ))}
          </div>
          <span className="text-xs text-steel-400 ml-auto">{filtered.length} terms</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {filtered.map(t => (
          <div key={t.term} className="card-sm">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-sm font-bold text-white">{t.term}</span>
              <span className={`badge text-xs flex-shrink-0 ${catColors[t.category]}`}>{t.category}</span>
            </div>
            <p className="text-xs text-steel-300 leading-relaxed">{t.definition}</p>
          </div>
        ))}
      </div>
      <AIPanel title="Generate Quality Terminology Guidance"
        systemPrompt="You are an ISO 9000:2015 and ISO 9001:2015 terminology specialist. Explain QMS terms in context, generate plain-English quality glossaries for different audiences, and produce terminology sections for audit reports and management review packs."
        placeholder="e.g. Explain the difference between correction and corrective action for a board audience"
        contextFields={[
          { id: 'term', label: 'Term / Concept', type: 'text', placeholder: 'e.g. Risk-based thinking vs preventive action' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Plain English Explanation', 'Board-Level Glossary', 'Technical Glossary', 'Audit Report Glossary', 'QMS Training Handout', 'Term Comparison'] },
          { id: 'audience', label: 'Audience', type: 'select', options: ['Top management / Board', 'Quality team', 'Operations staff', 'Certification body', 'New auditor'] },
        ]} />
    </div>
  )
}
