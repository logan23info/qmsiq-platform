import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const elements = [
  { clause: '6.1', title: 'Actions to Address Risks & Opportunities', color: 'border-l-red-500',
    desc: 'Identify risks and opportunities from context (Cl.4.1) and interested parties (Cl.4.2). Plan actions to address them — the core of risk-based thinking in ISO 9001.',
    items: [
      'Risks identified from: internal/external context, interested party requirements, process failures',
      'Opportunities identified: new markets, technology, customer needs, process improvements',
      'Actions planned to address risks and opportunities',
      'Actions integrated into QMS processes — not separate risk register alone',
      'Proportionality — actions proportionate to potential impact on product/service conformity',
      'Effectiveness of actions evaluated at management review',
      'Quality risks differ from ISO 27005 — focus on conformity, customer satisfaction, delivery',
    ], artifact: 'Risk & Opportunity Register' },
  { clause: '6.2', title: 'Quality Objectives & Planning', color: 'border-l-emerald-500',
    desc: 'Establish measurable quality objectives at relevant functions and levels. Plan how to achieve them.',
    items: [
      'Objectives consistent with the quality policy',
      'Objectives are SMART — measurable with defined metrics',
      'Objectives take into account applicable requirements',
      'Objectives relevant to product/service conformity and customer satisfaction',
      'Objectives communicated to relevant personnel',
      'Objectives monitored — progress tracked and reported',
      'Plans documented: what, who, when, how evaluated, resources',
      'Objectives reviewed at management review and updated as needed',
    ], artifact: 'Quality Objectives Register' },
  { clause: '6.3', title: 'Planning of Changes', color: 'border-l-purple-500',
    desc: 'When changes to the QMS are needed, carry them out in a planned manner — considering purpose, integrity, resources, and responsibilities.',
    items: [
      'Planned changes documented before implementation',
      'Purpose of change documented',
      'Consequences of change assessed — impact on QMS integrity',
      'Resources availability confirmed',
      'Responsibilities and authorities assigned for the change',
      'QMS documented information updated to reflect change',
    ], artifact: 'QMS Change Record' },
]

export default function QMSClause6() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 6" title="Planning — Risk-Based Thinking"
        description="Clause 6 embeds risk-based thinking into the QMS — identifying quality risks and opportunities from context, setting measurable quality objectives, and planning QMS changes formally. This is where ISO 9001:2015's key evolution from the 2008 version lies."
        badges={['Risk-Based Thinking', 'Quality Objectives', 'TOD']} />
      <div className="space-y-4 mb-6">
        {elements.map(el => (
          <div key={el.clause} className={`card border-l-4 ${el.color}`}>
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
                  <span className="text-xs text-steel-400">Key Artifact:</span>
                  <span className="badge badge-amber text-xs">{el.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIPanel title="Generate Clause 6 QMS Artifacts"
        systemPrompt="You are an ISO 9001:2015 Clause 6 planning specialist. Generate risk and opportunity registers, quality objectives registers, and QMS change records. Apply risk-based thinking principles specific to quality management — product conformity, customer satisfaction, delivery performance."
        placeholder="e.g. Generate a risk and opportunity register for a food manufacturing company with 5 key quality risks"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', type: 'text', placeholder: 'e.g. Food manufacturer, 200 staff, BRC + ISO 9001' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Risk & Opportunity Register', 'Quality Objectives Register', 'Quality Objectives KPI Dashboard', 'QMS Change Record', 'Risk-Based Thinking Procedure', 'Objectives Review Template'] },
        ]} />
    </div>
  )
}
