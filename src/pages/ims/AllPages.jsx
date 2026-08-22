import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const crosswalkData = [
  { iso9001: '4.1 — Context', iso27001: '4.1 — Context', alignment: 'Identical requirement', saving: 'One combined context analysis document serves both standards' },
  { iso9001: '4.2 — Interested Parties', iso27001: '4.2 — Interested Parties', alignment: 'Identical requirement', saving: 'One interested parties register — add IS requirements alongside QMS' },
  { iso9001: '4.3 — Scope', iso27001: '4.3 — Scope', alignment: 'Near-identical', saving: 'Combined IMS scope statement with QMS and ISMS boundaries defined' },
  { iso9001: '5.1 — Leadership', iso27001: '5.1 — Leadership', alignment: 'Identical requirement', saving: 'One leadership commitment statement. Combined policy framework.' },
  { iso9001: '5.2 — Quality Policy', iso27001: '5.2 — IS Policy', alignment: 'Same structure — different focus', saving: 'Separate policies but single sign-off process and combined communication' },
  { iso9001: '5.3 — Roles', iso27001: '5.3 — Roles', alignment: 'Identical structure', saving: 'One RACI matrix covering both QMS and ISMS roles' },
  { iso9001: '6.1 — Risk & Opportunity', iso27001: '6.1 — Risk Assessment', alignment: 'Similar — IS more prescriptive', saving: 'Combined risk register: quality risks + IS risks in one register' },
  { iso9001: '6.2 — Quality Objectives', iso27001: '6.2 — IS Objectives', alignment: 'Identical structure', saving: 'Combined objectives register — quality objectives alongside IS objectives' },
  { iso9001: '7.1 — Resources', iso27001: '7.1 — Resources', alignment: 'Identical requirement', saving: 'One resource plan and budget covering both management systems' },
  { iso9001: '7.2 — Competence', iso27001: '7.2 — Competence', alignment: 'Identical requirement', saving: 'Single competence register — QMS and ISMS role requirements combined' },
  { iso9001: '7.3 — Awareness', iso27001: '7.3 — Awareness', alignment: 'Identical requirement', saving: 'Combined awareness training covering quality policy and IS policy' },
  { iso9001: '7.4 — Communication', iso27001: '7.4 — Communication', alignment: 'Identical structure', saving: 'One communication plan — QMS and ISMS communications combined' },
  { iso9001: '7.5 — Doc Control', iso27001: '7.5 — Doc Control', alignment: 'Identical requirement', saving: 'Single document control procedure and document register for both' },
  { iso9001: '9.1 — Monitoring', iso27001: '9.1 — Monitoring', alignment: 'Similar — both require measurement', saving: 'Combined KPI dashboard: quality metrics + IS metrics' },
  { iso9001: '9.2 — Internal Audit', iso27001: '9.2 — Internal Audit', alignment: 'Identical — both reference ISO 19011', saving: 'Joint audit programme: combined QMS + ISMS audits save 30-40% audit time' },
  { iso9001: '9.3 — Mgmt Review', iso27001: '9.3 — Mgmt Review', alignment: 'Identical structure', saving: 'Single management review meeting — QMS + ISMS inputs and outputs combined' },
  { iso9001: '10.2 — Nonconformity', iso27001: '10.2 — Corrective Action', alignment: 'Identical requirement', saving: 'Single CAPA register: quality nonconformities + IS nonconformities' },
  { iso9001: '10.3 — Improvement', iso27001: '10.1 — Improvement', alignment: 'Identical requirement', saving: 'One continual improvement register covering both systems' },
]

const worksheets = [
  { title: 'Joint QMS/ISMS Audit Worksheet — Supplier Management', refs: 'ISO 9001 Cl.8.4 / ISO 27001 A.5.19–A.5.22',
    checkpoints: ['Approved supplier list maintained with evaluation criteria', 'Supplier qualification covers quality AND security requirements', 'Quality KPIs and security assessment results in supplier scorecards', 'Contractual quality and IS requirements included in supplier agreements', 'Supplier audits planned — joint QMS/ISMS audit team where possible', 'Supplier non-conformances (quality and IS) tracked in single register', 'Sub-contractor requirements flowed down through supply chain', 'Supplier offboarding removes access and returns assets'] },
  { title: 'Joint QMS/ISMS Audit Worksheet — Management Review', refs: 'ISO 9001 Cl.9.3 / ISO 27001 Cl.9.3',
    checkpoints: ['Review scheduled at planned intervals — combined agenda covers QMS and ISMS', 'Quality inputs: customer satisfaction, process performance, objectives', 'ISMS inputs: IS incidents, risk status, security objectives, nonconformities', 'Actions from previous reviews reviewed for completion', 'Resource adequacy reviewed — for both QMS and ISMS', 'Opportunities for improvement identified for both systems', 'Minutes retained as documented information', 'Actions assigned with owners and deadlines'] },
  { title: 'Joint QMS/ISMS Audit Worksheet — CAPA Process', refs: 'ISO 9001 Cl.10.2 / ISO 27001 Cl.10.2',
    checkpoints: ['Single CAPA register covers quality and IS nonconformities', 'Nonconformities identified from: customer complaints, audits, incidents, inspections', 'Root cause analysis conducted (5-Why, Ishikawa) for all significant CAPAs', 'Corrective actions address root cause — not just symptom', 'Similar processes checked for same nonconformity pattern', 'CAPA effectiveness verified after implementation', 'Lessons learned shared across quality and IS teams', 'CAPA register reviewed at management review'] },
  { title: 'Joint QMS/ISMS Audit Worksheet — Document Control', refs: 'ISO 9001 Cl.7.5 / ISO 27001 Cl.7.5',
    checkpoints: ['Single document control procedure covers QMS and ISMS documents', 'Document register lists all controlled documents — quality and IS', 'Approval and version control applied consistently to all documents', 'Current versions available at point of use for all staff', 'Obsolete documents removed from circulation or clearly marked', 'External origin documents (standards, regulations) identified and controlled', 'Document retention periods defined for QMS and ISMS records', 'Periodic document review scheduled and evidenced'] },
]

export function IMSCrosswalk() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="IMS" clause="Cross-Walk" title="ISO 9001 × ISO 27001 — Clause Alignment"
        description="Integrated Management System cross-walk — 18 shared clauses between ISO 9001:2015 and ISO 27001:2022. Running an integrated QMS/ISMS typically saves 30–40% documentation and audit effort vs separate management systems."
        badges={['IMS', 'ISO 9001', 'ISO 27001']} />
      <div className="card mb-6 bg-emerald-900/10 border-emerald-800/40">
        <div className="text-sm font-semibold text-emerald-400 mb-2">IMS Efficiency — Key Savings</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-steel-300">
          {[
            { label: 'Shared Clauses', value: '18 of 30', desc: '18 clauses are functionally identical or near-identical between ISO 9001 and ISO 27001' },
            { label: 'Audit Saving', value: '30–40%', desc: 'Joint internal audits using ISO 19011 cover both standards simultaneously' },
            { label: 'Documentation Saving', value: '40–50%', desc: 'Combined procedures, policies, and registers serve both management systems' },
          ].map(s => (
            <div key={s.label} className="bg-navy-800 rounded-lg p-3">
              <div className="text-emerald-400 font-bold text-lg mb-1">{s.value}</div>
              <div className="font-semibold text-white mb-0.5">{s.label}</div>
              <div className="text-steel-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-0 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-navy-700 bg-navy-800/50">
              {['ISO 9001:2015', 'ISO 27001:2022', 'Alignment', 'IMS Saving'].map(h => (
                <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {crosswalkData.map((row, i) => (
                <tr key={i} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-medium whitespace-nowrap">{row.iso9001}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-mono font-medium whitespace-nowrap">{row.iso27001}</td>
                  <td className="py-2.5 px-3"><span className={`badge text-xs ${row.alignment === 'Identical requirement' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{row.alignment}</span></td>
                  <td className="py-2.5 px-3 text-steel-300 max-w-xs">{row.saving}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AIPanel title="Generate IMS Documentation"
        systemPrompt="You are an Integrated Management System (IMS) specialist combining ISO 9001:2015 and ISO 27001:2022. Generate combined IMS documentation satisfying both standards simultaneously — unified policies, combined procedures, joint registers, and shared management review templates."
        placeholder="e.g. Generate a combined IMS Context Analysis satisfying ISO 9001 Cl.4 and ISO 27001 Cl.4 simultaneously"
        contextFields={[
          { id: 'org', label: 'Organisation', type: 'text', placeholder: 'e.g. Professional services firm, 300 staff, dual certified' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['IMS Policy Framework', 'Combined Context Analysis', 'Joint Interested Parties Register', 'IMS Scope Statement', 'Combined RACI Matrix', 'Joint Management Review Agenda', 'Combined Objectives Register', 'IMS Document Register'] },
        ]} />
    </div>
  )
}

export function IMSWorksheets() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="IMS" clause="Joint Worksheets" title="IMS Joint Audit Worksheets"
        description="Pre-built joint audit worksheets covering key processes spanning both ISO 9001 and ISO 27001 — Supplier Management, Management Review, CAPA, and Document Control. Each checkpoint satisfies both standards simultaneously."
        badges={['IMS', 'Joint Audit', 'ISO 19011']} />
      <div className="space-y-5 mb-6">
        {worksheets.map((ws, idx) => (
          <div key={idx} className="card border-l-4 border-l-cyan-400">
            <div className="flex items-start gap-3 mb-3">
              <span className="clause-tag flex-shrink-0 self-start">WS-{String(idx+1).padStart(2,'0')}</span>
              <div>
                <h3 className="font-semibold text-white mb-1">{ws.title}</h3>
                <span className="badge bg-cyan-900/40 text-cyan-300 text-xs">{ws.refs}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ws.checkpoints.map((cp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-steel-300 leading-snug">{cp}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <AIPanel title="Generate Joint QMS/ISMS Audit Worksheets"
        systemPrompt="You are an IMS joint audit specialist combining ISO 9001:2015 and ISO 27001:2022. Generate detailed joint audit worksheets covering both standards simultaneously. Include specific test steps, evidence to request, and audit questions. Reference both standard clause numbers for each checkpoint."
        placeholder="e.g. Generate a joint IMS audit worksheet for Change Management covering ISO 9001 Cl.8.5 and ISO 27001 A.8.32"
        contextFields={[
          { id: 'process', label: 'Process to Audit', type: 'text', placeholder: 'e.g. New product development, HR onboarding, software release' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Joint Audit Worksheet', 'Combined Audit Checklist', 'Joint Finding Template', 'IMS Process RACI', 'Combined Evidence List'] },
          { id: 'org', label: 'Organisation', type: 'text', placeholder: 'e.g. Manufacturing company, 500 staff, ISO 9001 + ISO 27001' },
        ]} />
    </div>
  )
}
