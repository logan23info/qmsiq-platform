import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const annexSections = [
  {
    ref: 'A.1', title: 'General guidance for auditors',
    color: 'border-l-amber-audit',
    desc: 'Supplemental guidance for auditors on applying ISO 19011 principles across different types of management system audits.',
    items: [
      'Auditor behaviour and professionalism in all audit situations',
      'Handling sensitive or confidential information during fieldwork',
      'Managing difficult audit situations — hostile auditees, access denial',
      'Documenting verbal evidence from interviews consistently',
      'Maintaining objectivity when auditing familiar processes',
    ]
  },
  {
    ref: 'A.2', title: 'Audit methods',
    color: 'border-l-blue-400',
    desc: 'A comprehensive matrix of audit methods available to auditors — on-site, remote, human-based, and technical.',
    items: [
      'On-site — document review, interviews, observation, walkthrough',
      'Remote — virtual interviews, screen-share demonstrations, remote log review',
      'Human-based — structured interviews, questionnaires, focus groups',
      'Technical — system queries, configuration analysis, log parsing',
      'Sampling — statistical, haphazard, systematic (see TOE page)',
    ],
    table: [
      { method: 'Document review', type: 'Human/Technical', site: 'On-site/Remote', phase: 'TOD/TOI' },
      { method: 'Interview', type: 'Human', site: 'On-site/Remote', phase: 'TOI' },
      { method: 'Observation', type: 'Human', site: 'On-site', phase: 'TOI' },
      { method: 'System demonstration', type: 'Technical', site: 'On-site/Remote', phase: 'TOI' },
      { method: 'Sampling', type: 'Technical', site: 'On-site/Remote', phase: 'TOE' },
      { method: 'Log/config analysis', type: 'Technical', site: 'Remote', phase: 'TOE' },
      { method: 'Re-performance', type: 'Technical', site: 'On-site/Remote', phase: 'TOE' },
    ]
  },
  {
    ref: 'A.3', title: 'Remote audit guidance',
    color: 'border-l-purple-400',
    desc: 'ISO 19011 Annex A.3 provides specific guidance for conducting audits remotely — increasingly common since 2020.',
    items: [
      'Pre-audit technology check — video conferencing, screen sharing capability',
      'Secure evidence transfer protocols — encrypted file sharing only',
      'Remote observation techniques — screen share for system demos',
      'Managing connectivity issues — backup communication plan',
      'Remote signing of attendance registers and documents',
      'Limitations of remote auditing — physical security cannot be observed remotely',
    ]
  },
  {
    ref: 'A.4', title: 'Understanding auditee context',
    color: 'border-l-emerald-400',
    desc: 'Guidance on understanding the auditee\'s organisation before and during the audit — feeds directly into ISO 27001 Clause 4 review.',
    items: [
      'Review organisation structure before audit begins',
      'Understand the business environment and key risks',
      'Identify key processes and their information security implications',
      'Review previous audit reports and outstanding findings',
      'Understand regulatory and contractual obligations',
    ]
  },
  {
    ref: 'A.5', title: 'Risk-based audit approach',
    color: 'border-l-red-400',
    desc: 'Detailed guidance on applying a risk-based approach to audit planning — allocating more time and scrutiny to higher-risk areas.',
    items: [
      'Higher-risk areas receive more audit time and deeper testing',
      'Risk factors: complexity, regulatory impact, previous findings, change activity',
      'Risk-based sampling: larger samples for high-risk controls',
      'Risk-based scheduling: critical controls tested earlier in audit',
      'Document risk rationale for all scope and sampling decisions',
    ]
  },
  {
    ref: 'A.6', title: 'Sampling guidance (19011)',
    color: 'border-l-cyan-400',
    desc: 'ISO 19011 Annex A.6 provides specific sampling guidance aligned to the TOE methodology used throughout this platform.',
    items: [
      'Define the full population before selecting any sample',
      'Document the sampling method used and justify the choice',
      'Statistical sampling preferred for high-risk or large populations',
      'Haphazard sampling acceptable for low-risk or small populations',
      'Document all sampling decisions in the TOE workpaper',
      'Expand sample if exception rate approaches or exceeds threshold',
    ]
  },
]

export default function AnnexA() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Annex A"
        title="Annex A — Supplemental Guidance"
        description="ISO 19011 Annex A provides additional guidance beyond the main clauses — covering auditor behaviour, audit methods, remote auditing, auditee context, risk-based approaches, and sampling. Informative, not mandatory — but highly recommended practice."
        badges={['Supplemental', 'Informative', 'Best Practice']}
      />

      <div className="space-y-5 mb-6">
        {annexSections.map(s => (
          <div key={s.ref} className={`card border-l-4 ${s.color}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{s.ref}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{s.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {s.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-steel-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
                {s.table && (
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-navy-700">
                          {['Method', 'Type', 'On-site/Remote', 'Phase'].map(h => (
                            <th key={h} className="text-left py-1.5 px-2 text-steel-400 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.map((row, i) => (
                          <tr key={i} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                            <td className="py-1.5 px-2 text-white font-medium">{row.method}</td>
                            <td className="py-1.5 px-2 text-steel-300">{row.type}</td>
                            <td className="py-1.5 px-2 text-steel-300">{row.site}</td>
                            <td className="py-1.5 px-2">
                              <span className={`badge text-xs ${row.phase.includes('TOD') ? 'bg-blue-900/40 text-blue-300' : row.phase.includes('TOI') ? 'bg-purple-900/40 text-purple-300' : 'bg-emerald-900/40 text-emerald-300'}`}>{row.phase}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIPanel
        title="Generate Annex A Guidance Documents"
        systemPrompt="You are an ISO 19011:2018 Annex A expert. Generate practical guidance documents based on ISO 19011 Annex A supplemental guidance — covering audit methods selection, remote audit procedures, risk-based audit planning, sampling justifications, and auditee context analysis. All outputs must be structured, professional, and immediately usable in real audit engagements."
        placeholder="e.g. Generate a Remote Audit Procedure document for conducting ISO 27001 audits via video conferencing"
        contextFields={[
          { id: 'section', label: 'Annex A Section', type: 'select', options: ['A.1 — Auditor Behaviour Guidance', 'A.2 — Audit Methods Matrix', 'A.3 — Remote Audit Procedure', 'A.4 — Auditee Context Guide', 'A.5 — Risk-Based Audit Plan', 'A.6 — Sampling Justification Template'] },
          { id: 'org', label: 'Organisation / Sector', placeholder: 'e.g. Financial services, 500 staff, hybrid working', type: 'text' },
          { id: 'auditType', label: 'Audit Type', type: 'select', options: ['Internal ISO 27001 audit', 'External ISO 27001 audit', 'Remote audit', 'IMS combined audit', 'Supplier second-party audit'] },
        ]}
      />
    </div>
  )
}
