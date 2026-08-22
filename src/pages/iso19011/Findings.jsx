import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'

const fourcS = [
  { c: 'C1 — Condition', color: 'border-l-blue-400', badge: 'bg-blue-900/40 text-blue-300', desc: 'What the auditor found. The factual observation based on evidence gathered during TOD, TOI, or TOE.', example: 'User access reviews were not performed for 7 of 25 sampled accounts during the audit period (Q1–Q3 2025).' },
  { c: 'C2 — Criteria', color: 'border-l-emerald-400', badge: 'bg-emerald-900/40 text-emerald-300', desc: 'What should be happening — the standard, policy, or control requirement measured against.', example: 'ISO 27002 A.8.2 requires periodic access rights review. Company Access Control Policy §4.3 mandates quarterly reviews.' },
  { c: 'C3 — Cause', color: 'border-l-amber-400', badge: 'bg-amber-900/40 text-amber-300', desc: 'Why the gap exists — the root cause, not the symptom. Use 5-Why analysis for systemic findings.', example: 'No automated workflow exists to trigger quarterly reviews. Process relies on manual calendar reminders which were not actioned.' },
  { c: 'C4 — Consequence', color: 'border-l-red-400', badge: 'bg-red-900/40 text-red-300', desc: 'The risk or impact. What could happen if this finding is not remediated.', example: 'Unauthorised or excessive access may remain undetected, increasing risk of data breach or insider threat incident.' },
]

const ratings = [
  { label: 'Critical', desc: 'Immediate risk. Escalate to executive management. Remediation within 7 days.', color: 'bg-red-900/40 border-red-700 text-red-300' },
  { label: 'High', desc: 'Significant control failure. Remediation required within 30 days.', color: 'bg-orange-900/40 border-orange-700 text-orange-300' },
  { label: 'Medium', desc: 'Partial control failure. Remediation within 90 days.', color: 'bg-amber-900/40 border-amber-700 text-amber-300' },
  { label: 'Low / Advisory', desc: 'Minor gap or improvement. Remediation within 180 days.', color: 'bg-emerald-900/40 border-emerald-700 text-emerald-300' },
]

export default function Findings() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.4.5"
        title="Finding Development — 4Cs Framework"
        description="Every audit finding must be structured using the 4Cs: Condition, Criteria, Cause, and Consequence. A finding missing any one of the 4Cs is incomplete and cannot be formally reported."
        badges={['Findings', 'ISO 19011 Cl. 6.4.5']}
      />
      <div className="space-y-4 mb-6">
        {fourcS.map(f => (
          <div key={f.c} className={`card border-l-4 ${f.color}`}>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mb-2 ${f.badge}`}>{f.c}</span>
            <p className="text-sm text-steel-300 mb-3 leading-relaxed">{f.desc}</p>
            <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 text-xs text-steel-300 italic leading-relaxed">{f.example}</div>
          </div>
        ))}
      </div>
      <div className="card mb-6">
        <h2 className="section-title mb-3">Finding Rating Matrix</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ratings.map(r => (
            <div key={r.label} className={`border rounded-lg p-3 ${r.color}`}>
              <div className="text-xs font-bold mb-1">{r.label}</div>
              <div className="text-xs opacity-80 leading-snug">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <AIPanel
        title="Generate Audit Finding (4Cs)"
        systemPrompt="You are an ISO 19011:2018 audit finding development expert. Generate complete, professional audit findings using the 4Cs framework: Condition (what is), Criteria (what should be), Cause (root cause — use 5-Why), Consequence (impact and risk). Also generate finding rating justifications. Findings must be factual, evidence-based, professionally worded, and immediately reportable."
        placeholder="e.g. Patch management logs show 23 servers not patched within the 30-day policy requirement during Q3"
        contextFields={[
          { id: 'observation', label: 'Audit Observation (what you found)', placeholder: 'Describe the gap or issue observed during testing', type: 'text' },
          { id: 'control', label: 'Control / Policy Reference', placeholder: 'e.g. ISO 27002 A.8.8, Company Patch Policy §3.2', type: 'text' },
          { id: 'impact', label: 'Potential Risk / Impact', placeholder: 'e.g. Exploitable vulnerabilities, regulatory penalty', type: 'text' },
          { id: 'rating', label: 'Preliminary Rating', type: 'select', options: ['Critical', 'High', 'Medium', 'Low / Advisory'] },
        ]}
      />
    </div>
  )
}
