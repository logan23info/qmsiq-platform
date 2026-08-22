import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2, Info } from 'lucide-react'

const toiElements = [
  { title: 'Walkthrough Scripts', desc: 'Step-by-step scripts for walking through a control end-to-end with the control owner. One walkthrough per control.', steps: ['Open with control objective statement', 'Ask control owner to narrate the process', 'Observe the control in action where possible', 'Capture evidence at each step'] },
  { title: 'System Demonstration Guide', desc: 'Script for asking control owners to demonstrate the control working live — screen share, system login, or physical observation.', steps: ['Request live system demonstration', 'Observe control settings and configurations', 'Capture screenshots and screen recordings', 'Verify against documented procedure'] },
  { title: 'Single Transaction Trace', desc: 'Trace one complete transaction through the control — e.g., one access request from ticket to provisioning to review.', steps: ['Select a real recent transaction', 'Trace from initiation to completion', 'Verify each step matches documented procedure', 'Document the trace in workpaper'] },
  { title: 'Implementation Interview Questions', desc: '"Show me the last time this control ran — walk me through what happened." Structured questions per control type.', steps: ['Per-control question set', 'Focus on last occurrence of control execution', 'Request supporting evidence for each step', 'Identify deviations from documented procedure'] },
  { title: 'Walkthrough Evidence Checklist', desc: 'Per-control list of what physical or digital evidence to capture during the walkthrough.', steps: ['Screenshots of system configurations', 'Exported access logs or approval records', 'Policy/procedure document version in use', 'Control owner name and date of walkthrough'] },
  { title: 'Screenshot & Artifact Capture SOP', desc: 'Standard for how screenshots, exports, and config dumps are captured, named, and stored as audit evidence.', steps: ['Naming convention: ControlRef_Date_Type', 'Metadata: captured by, system, timestamp', 'Stored in audit file within 24 hours', 'Reviewed by lead auditor before TOE begins'] },
  { title: 'First Instance Testing Template', desc: 'Formally documents the single walkthrough instance used to confirm implementation — the "first example" of the control operating.', steps: ['Document the specific instance tested', 'Reference transaction/event ID', 'Confirm control operated as designed', 'Obtain auditor sign-off on implementation'] },
  { title: 'TOI vs TOE Boundary Guide', desc: 'Clear auditor guidance on when the walkthrough (TOI) ends and sampling (TOE) begins — critical to prevent scope creep.', steps: ['TOI = one instance, confirms control exists', 'TOE = multiple samples, confirms consistency', 'Do not use TOI samples in TOE population', 'Document boundary clearly in workpaper index'] },
  { title: 'TOI Conclusion Workpaper', desc: 'Formal sign-off on implementation before proceeding to TOE.', steps: ['Implemented — control confirmed in operation', 'Not Implemented — control designed but not in use', 'Partially Implemented — some elements operational', 'Obtain lead auditor sign-off'] },
]

const conclusions = [
  { label: 'Implemented', desc: 'Control confirmed in operation. Proceed to TOE.', color: 'bg-emerald-900/30 border-emerald-700 text-emerald-300' },
  { label: 'Partially Implemented', desc: 'Some elements operational. Document gap, proceed with caveat.', color: 'bg-amber-900/30 border-amber-700 text-amber-300' },
  { label: 'Not Implemented', desc: 'Control designed but not in use. Raise finding. TOE not applicable.', color: 'bg-red-900/30 border-red-700 text-red-300' },
]

export default function TOI() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.4"
        title="TOI — Test of Implementation"
        description="Has the control actually been put into practice? TOI confirms that the control designed in TOD is actually operating in the organisation. It uses walkthroughs, system demonstrations, and single transaction traces to confirm implementation — not consistency over time."
        badges={['TOI', 'Implementation', 'ISO 19011 Cl. 6.4']}
      />

      <div className="bg-purple-900/20 border border-purple-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-purple-300 mb-1">TOI Scope — One Instance Only</div>
          <div className="text-xs text-purple-200/80 leading-relaxed">
            TOI uses a single walkthrough instance to confirm a control is implemented. It does NOT test consistency over time — that is TOE. Evidence from the TOI walkthrough must not be included in the TOE sample population.
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="section-title mb-3">TOI Conclusion Framework</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {conclusions.map(c => (
            <div key={c.label} className={`border rounded-lg p-3 ${c.color}`}>
              <div className="text-xs font-bold mb-1">{c.label}</div>
              <div className="text-xs opacity-80 leading-snug">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {toiElements.map((el, idx) => (
          <div key={el.title} className="card border-l-4 border-l-purple-500">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-purple-900/50 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {el.steps.map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIPanel
        title="Generate TOI Artifacts"
        systemPrompt={`You are a senior IT auditor specialising in Test of Implementation (TOI) under ISO 19011:2018. Generate detailed walkthrough scripts, implementation interview guides, and evidence capture templates. TOI tests whether a control is actually in operation — using one walkthrough instance. All outputs must be structured, professional audit workpapers. Include specific questions, evidence items, and auditor instruction notes. Tailor to the control, system, and sector provided.`}
        placeholder="e.g. Generate a walkthrough script for testing the Patch Management control in an Azure environment"
        contextFields={[
          { id: 'control', label: 'Control Being Tested', placeholder: 'e.g. Patch Management — ISO 27002 A.8.8', type: 'text' },
          { id: 'system', label: 'System / Technology', placeholder: 'e.g. Azure, Active Directory, AWS IAM', type: 'text' },
          { id: 'sector', label: 'Organisation / Sector', placeholder: 'e.g. Healthcare SaaS, 300 employees', type: 'text' },
          { id: 'artifact', label: 'TOI Artifact Required', type: 'select', options: [
            'Walkthrough Script',
            'System Demonstration Guide',
            'Single Transaction Trace Template',
            'Implementation Interview Questions',
            'Walkthrough Evidence Checklist',
            'Screenshot & Artifact Capture SOP',
            'First Instance Testing Template',
            'TOI vs TOE Boundary Guidance Note',
            'TOI Conclusion Workpaper',
          ]},
        ]}
      />
    </div>
  )
}
