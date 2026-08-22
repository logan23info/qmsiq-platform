import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const elements = [
  { clause: '4.1', title: 'Understanding the Organisation & Its Context', color: 'border-l-blue-500',
    desc: 'Determine external and internal issues that are relevant to the organisation\'s purpose and strategic direction that affect ability to achieve intended QMS outcomes.',
    items: [
      'Internal issues: culture, values, governance, capabilities, processes, technology, resources',
      'External issues: legal, regulatory, competitive, market, cultural, economic environment',
      'Context documented — SWOT, PESTLE, or equivalent analysis',
      'Context reviewed at management review or when significant changes occur',
      'Internal/external issues feed directly into risk and opportunity identification (Cl. 6.1)',
      'Customer and market context drives quality objectives',
    ], artifact: 'Internal/External Issues Register (SWOT/PESTLE)' },
  { clause: '4.2', title: 'Understanding Needs & Expectations of Interested Parties', color: 'border-l-purple-500',
    desc: 'Identify interested parties relevant to the QMS and determine their requirements — statutory, regulatory, and contractual.',
    items: [
      'Customers — product/service quality requirements, delivery expectations, satisfaction measures',
      'Regulatory bodies — statutory product/service compliance requirements',
      'Shareholders — financial performance, quality reputation',
      'Employees — safe working conditions, role clarity, training',
      'Suppliers — order specifications, payment terms, quality requirements',
      'Requirements reviewed for QMS relevance',
      'Requirements that become legal/contractual obligations identified',
      'Interested parties register reviewed annually',
    ], artifact: 'Interested Parties Register' },
  { clause: '4.3', title: 'Determining the Scope of the QMS', color: 'border-l-emerald-500',
    desc: 'Define the boundaries and applicability of the QMS — products/services, sites, functions, and any exclusions with justification.',
    items: [
      'Products and services in scope clearly defined',
      'Sites and functions included in the QMS documented',
      'Exclusions from ISO 9001 requirements justified — only Cl.8 exclusions permitted',
      'Scope statement formally documented and approved by top management',
      'Interfaces and dependencies with out-of-scope areas controlled',
      'Scope reviewed when organisation or product/service changes occur',
    ], artifact: 'QMS Scope Statement' },
  { clause: '4.4', title: 'QMS & Its Processes', color: 'border-l-amber-500',
    desc: 'Establish, implement, maintain, and continually improve the QMS and its processes — including process inputs, outputs, sequence, interactions, criteria, and controls.',
    items: [
      'All QMS processes identified with owners',
      'Process inputs and outputs defined',
      'Process sequence and interaction documented (process map / turtle diagram)',
      'Process criteria and control methods defined',
      'Resources determined and provided per process',
      'Risks and opportunities per process addressed',
      'Processes evaluated and improved',
      'Documented information retained as evidence of processes operating as planned',
    ], artifact: 'QMS Process Map + Process Turtle Diagrams' },
]

export default function QMSClause4() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 4" title="Context of the Organisation"
        description="Clause 4 establishes the QMS foundation — understanding the internal/external context, identifying interested parties, formally defining the QMS scope, and documenting all QMS processes with their interactions. Audited primarily via document review (TOD) and walkthrough (TOI)."
        badges={['QMS Foundation', 'TOD', 'TOI']} />
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
      <AIPanel title="Generate Clause 4 QMS Artifacts"
        systemPrompt="You are an ISO 9001:2015 Clause 4 specialist. Generate professional context analysis documents, interested parties registers, QMS scope statements, and process maps. Include SWOT/PESTLE frameworks where relevant. All outputs must be formal, audit-ready, and aligned to ISO 9001:2015 Clause 4 requirements."
        placeholder="e.g. Generate an interested parties register for a UK manufacturing company supplying automotive components"
        contextFields={[
          { id: 'org', label: 'Organisation & Sector', type: 'text', placeholder: 'e.g. UK automotive supplier, 300 staff, IATF 16949 + ISO 9001' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Context Analysis (SWOT/PESTLE)', 'Interested Parties Register', 'QMS Scope Statement', 'Process Map', 'Process Turtle Diagram', 'Exclusions Justification', 'Context Annual Review Record'] },
          { id: 'context', label: 'Key Context', type: 'text', placeholder: 'e.g. ISO 9001:2015 certification target Q4 2025, 3 sites, 50 key products' },
        ]} />
    </div>
  )
}
