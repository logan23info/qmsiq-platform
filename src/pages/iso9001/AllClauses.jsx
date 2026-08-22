import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const clause5Elements = [
  { clause: '5.1', title: 'Leadership & Commitment — Quality', items: ['Top management demonstrates active quality leadership', 'Quality policy established and communicated', 'QMS integrated into business processes', 'Customer focus promoted throughout organisation'], artifact: 'Quality Management Commitment Evidence' },
  { clause: '5.2', title: 'Quality Policy', items: ['Appropriate to the purpose of the organisation', 'Provides framework for quality objectives', 'Commitment to satisfy applicable requirements', 'Commitment to continual improvement of QMS'], artifact: 'Quality Policy' },
  { clause: '5.3', title: 'Roles, Responsibilities & Authorities — Quality', items: ['QMS roles formally assigned', 'Management Representative / Quality Manager designated', 'Reporting structure documented', 'Authorities communicated to relevant parties'], artifact: 'RACI Matrix — QMS Roles' },
]

export function ISO9001Clause5() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 5" title="Leadership — Quality Management" description="ISO 9001 Clause 5 requires top management to demonstrate leadership and commitment to the QMS — separate from ISO 27001 leadership obligations under an IMS." badges={['QMS Leadership', 'TOD']} />
      <div className="space-y-4 mb-6">
        {clause5Elements.map(el => (
          <div key={el.clause} className="card border-l-4 border-l-emerald-500">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{el.clause}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-2">{el.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {el.items.map(i => <div key={i} className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" /><span className="text-xs text-steel-300 leading-snug">{i}</span></div>)}
                </div>
                <div className="flex items-center gap-2"><span className="text-xs text-steel-400">Artifact:</span><span className="badge badge-emerald">{el.artifact}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIPanel title="Generate Clause 5 Quality Artifacts" systemPrompt="You are an ISO 9001:2015 QMS leadership expert. Generate Quality Policies, management commitment evidence checklists, and RACI matrices for QMS roles. Policies must be suitable for board-level approval and reference ISO 9001:2015 requirements. Distinguish clearly from ISO 27001 information security leadership obligations." placeholder="e.g. Generate a Quality Policy for a software development company seeking ISO 9001 certification" contextFields={[{ id: 'org', label: 'Organisation & Sector', placeholder: 'e.g. Software dev firm, 200 staff', type: 'text' }, { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Quality Policy', 'Management Commitment Evidence Checklist', 'RACI Matrix — QMS Roles', 'Customer Focus Statement'] }]} />
    </div>
  )
}

export function ISO9001Clause7() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 7" title="Support — Resources & Calibration" description="ISO 9001 Clause 7 includes a unique requirement absent from ISO 27001 — calibration of monitoring and measuring equipment (Cl. 7.1.5)." badges={['QMS Support', 'TOI', 'TOE']} />
      <div className="card mb-6">
        <h2 className="section-title mb-3">Key Clause 7 Elements</h2>
        <div className="space-y-3">
          {[
            { c: '7.1.5', t: 'Monitoring & Measuring Resources', d: 'Equipment used for measurement must be calibrated or verified at specified intervals.', items: ['Calibration register maintained', 'Calibration frequency defined per equipment', 'Calibration certificates retained', 'Out-of-calibration equipment quarantined'], art: 'Calibration Register & Certificates' },
            { c: '7.2', t: 'Competence — Quality', d: 'Persons affecting quality conformity must be competent based on education, training, or experience.', items: ['Competence requirements per quality role defined', 'Evidence of competence maintained', 'Training actions taken where gaps identified', 'Competence records retained'], art: 'QMS Competence Register' },
            { c: '7.3', t: 'Awareness — Quality', d: 'Persons must be aware of the quality policy, their contribution, and consequences of non-conformance.', items: ['Quality policy communicated to all staff', 'Quality objectives communicated', 'Consequences of non-conformance understood', 'Awareness records maintained'], art: 'Quality Awareness Records' },
          ].map(el => (
            <div key={el.c} className="bg-navy-800 border border-navy-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="clause-tag flex-shrink-0">{el.c}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">{el.t}</h3>
                  <p className="text-xs text-steel-300 mb-2 leading-relaxed">{el.d}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                    {el.items.map(i => <div key={i} className="flex items-start gap-2"><CheckCircle2 size={11} className="text-emerald-audit flex-shrink-0 mt-0.5" /><span className="text-xs text-steel-300 leading-snug">{i}</span></div>)}
                  </div>
                  <span className="badge badge-emerald">{el.art}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AIPanel title="Generate Clause 7 Quality Artifacts" systemPrompt="You are an ISO 9001:2015 QMS support expert. Generate calibration registers, QMS competence registers, and awareness records. The calibration register is unique to ISO 9001 and must include: Equipment ID, description, calibration method, frequency, last calibration date, next due date, calibration standard used, and certificate reference." placeholder="e.g. Generate a Calibration Register for a manufacturing company with 45 measuring instruments" contextFields={[{ id: 'org', label: 'Organisation & Sector', placeholder: 'e.g. Medical device manufacturer', type: 'text' }, { id: 'equipment', label: 'Equipment Types', placeholder: 'e.g. Calipers, pressure gauges, thermometers', type: 'text' }, { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Calibration Register', 'Calibration Procedure', 'QMS Competence Register', 'Quality Awareness Records', 'Out-of-Calibration Protocol'] }]} />
    </div>
  )
}

export function ISO9001Clause8() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 8" title="Operations & Product Conformity" description="ISO 9001 Clause 8 covers operational processes — planning, customer requirements, design, production, and product/service release conformity testing." badges={['QMS Operations', 'TOI', 'TOE']} />
      <div className="space-y-4 mb-6">
        {[
          { c: '8.1', t: 'Operational Planning & Control', d: 'Plan, implement, and control processes to meet product/service requirements.', items: ['Quality criteria for processes and products defined', 'Control of planned changes', 'Outsourced process controls', 'Process performance monitored'] },
          { c: '8.6', t: 'Release of Products & Services', d: 'Products and services verified against acceptance criteria before release to customer.', items: ['Acceptance criteria defined per product/service', 'Evidence of conformity retained', 'Release authorisation documented', 'Nonconforming outputs controlled per 8.7'] },
          { c: '8.7', t: 'Control of Nonconforming Outputs', d: 'Outputs that do not conform to requirements are identified and controlled to prevent unintended use.', items: ['Nonconformity detected and documented', 'Segregation or quarantine applied', 'Disposition decision (rework/scrap/concession)', 'Corrective action triggered per Cl. 10'] },
        ].map(el => (
          <div key={el.c} className="card border-l-4 border-l-cyan-500">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{el.c}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.t}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.d}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {el.items.map(i => <div key={i} className="flex items-start gap-2"><CheckCircle2 size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" /><span className="text-xs text-steel-300 leading-snug">{i}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIPanel title="Generate Clause 8 Quality Artifacts" systemPrompt="You are an ISO 9001:2015 operations and product conformity expert. Generate operational control registers, product release checklists, acceptance criteria templates, and nonconforming output control procedures. Focus on practical, audit-ready documents that demonstrate product/service quality control." placeholder="e.g. Generate a Product Release Checklist for a software development company — pre-release QA gate" contextFields={[{ id: 'org', label: 'Organisation & Product/Service', placeholder: 'e.g. Software company, SaaS product releases', type: 'text' }, { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Operational Control Register', 'Product Release Checklist', 'Acceptance Criteria Template', 'Nonconforming Output Procedure', 'Product/Service Conformity Evidence'] }]} />
    </div>
  )
}

export function ISO9001Clause9() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 9" title="Customer Satisfaction & Performance" description="ISO 9001 Clause 9 requires specific measurement of customer satisfaction — a unique QMS requirement not present in ISO 27001. Must be tested separately under an IMS." badges={['Customer Satisfaction', 'TOE', 'ISO 27004']} />
      <div className="card mb-6">
        <h2 className="section-title mb-3">Clause 9.1.2 — Customer Satisfaction (Unique to ISO 9001)</h2>
        <p className="text-sm text-steel-300 mb-4 leading-relaxed">The organisation must monitor customer perceptions of the degree to which needs and expectations have been fulfilled. Methods must be defined for obtaining, monitoring, and reviewing this information.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { t: 'Data Collection Methods', items: ['Customer satisfaction surveys (NPS, CSAT)', 'Customer complaints log', 'Customer feedback from account managers', 'Product/service reviews and ratings'] },
            { t: 'Analysis & Review', items: ['Customer satisfaction scores tracked over time', 'Trends identified and escalated', 'Results input to management review (Cl. 9.3)', 'Improvement actions triggered from low scores'] },
          ].map(s => (
            <div key={s.t} className="bg-navy-800 border border-navy-600 rounded-lg p-3">
              <div className="text-sm font-semibold text-white mb-2">{s.t}</div>
              {s.items.map(i => <div key={i} className="flex items-start gap-2 mb-1.5"><CheckCircle2 size={11} className="text-emerald-audit flex-shrink-0 mt-0.5" /><span className="text-xs text-steel-300 leading-snug">{i}</span></div>)}
            </div>
          ))}
        </div>
      </div>
      <AIPanel title="Generate Clause 9 Quality Artifacts" systemPrompt="You are an ISO 9001:2015 performance evaluation expert. Generate customer satisfaction measurement frameworks, NPS/CSAT survey templates, internal audit programmes for quality, and management review packs. Customer satisfaction measurement is unique to ISO 9001 — generate practical, deployable tools." placeholder="e.g. Generate a Customer Satisfaction Survey for a B2B SaaS company — quarterly NPS measurement" contextFields={[{ id: 'org', label: 'Organisation & Customer Type', placeholder: 'e.g. B2B SaaS, 150 enterprise customers', type: 'text' }, { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Customer Satisfaction Survey (NPS)', 'Customer Satisfaction Survey (CSAT)', 'Customer Complaints Register', 'Satisfaction Measurement Procedure', 'Quality KPI Dashboard', 'Quality Management Review Pack'] }]} />
    </div>
  )
}

export function ISO9001Clause10() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Clause 10" title="CAPA — Quality" description="ISO 9001 Clause 10 CAPA for quality nonconformities — separate from ISO 27001 Clause 10 ISMS CAPA. Both must be maintained independently under an IMS." badges={['Quality CAPA', 'Improvement', 'Audit Closure']} />
      <div className="card mb-6">
        <h2 className="section-title mb-3">Quality Nonconformity Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { t: 'Internal Sources', items: ['Internal quality audits', 'Product/service nonconformity (Cl. 8.7)', 'Process performance failures', 'Management review outputs'] },
            { t: 'External Sources', items: ['Customer complaints', 'Customer satisfaction survey results', 'Supplier nonconformity reports', 'Regulatory findings'] },
            { t: 'Proactive Sources', items: ['Risk and opportunity assessments', 'Process improvement suggestions', 'Benchmarking observations', 'Industry best practice gaps'] },
          ].map(s => (
            <div key={s.t} className="bg-navy-800 border border-navy-600 rounded-lg p-3">
              <div className="text-sm font-semibold text-white mb-2">{s.t}</div>
              {s.items.map(i => <div key={i} className="flex items-start gap-2 mb-1.5"><CheckCircle2 size={11} className="text-emerald-audit flex-shrink-0 mt-0.5" /><span className="text-xs text-steel-300 leading-snug">{i}</span></div>)}
            </div>
          ))}
        </div>
      </div>
      <AIPanel title="Generate Quality CAPA Artifacts" systemPrompt="You are an ISO 9001:2015 CAPA and continual improvement expert. Generate quality nonconformity reports, root cause analysis templates, corrective action plans, and continual improvement logs. Quality CAPAs must distinguish from ISMS CAPAs — focus on product/service quality, customer satisfaction failures, and process non-conformances." placeholder="e.g. Generate a CAPA for recurring customer complaints about slow response times in a SaaS product" contextFields={[{ id: 'nc', label: 'Nonconformity / Customer Complaint', placeholder: 'Describe the quality nonconformity', type: 'text' }, { id: 'org', label: 'Organisation / Product', placeholder: 'e.g. SaaS platform, B2B customers', type: 'text' }, { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Quality Nonconformity Report', '5-Why Root Cause Analysis', 'Quality Corrective Action Plan', 'Quality CAPA Register', 'Continual Improvement Log', 'Effectiveness Verification Checklist'] }]} />
    </div>
  )
}
