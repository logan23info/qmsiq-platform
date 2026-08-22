import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2, Info } from 'lucide-react'

const samplingTable = [
  { freq: 'Real-time / Automated', period: 'Annual', population: 'System-generated', sample: '25–60 items', method: 'Random' },
  { freq: 'Daily', period: 'Annual', population: '~260 occurrences', sample: '25–40 items', method: 'Random / Systematic' },
  { freq: 'Weekly', period: 'Annual', population: '~52 occurrences', sample: '10–25 items', method: 'Random' },
  { freq: 'Monthly', period: 'Annual', population: '12 occurrences', sample: '3–6 items', method: 'Haphazard / All' },
  { freq: 'Quarterly', period: 'Annual', population: '4 occurrences', sample: '2–4 items', method: 'All (census)' },
  { freq: 'Annual', period: 'Annual', population: '1 occurrence', sample: '1 item (all)', method: 'Census' },
]

const toeElements = [
  { title: 'Control Frequency Matrix', desc: 'Maps every control to its operating frequency — determines sample size and method for TOE.', steps: ['List all in-scope controls', 'Assign operating frequency per control', 'Map to sampling standard', 'Document in workpaper index'] },
  { title: 'Population Definition Workpaper', desc: 'Formally define the full population before sampling — date range, system, record type, total count.', steps: ['Define audit period (start and end date)', 'Identify source system and record type', 'Obtain total population count', 'Document completeness assertion'] },
  { title: 'Sample Selection Methodology', desc: 'Document the rationale for sampling method chosen per control — Random, Haphazard, or Systematic.', steps: ['Random: use random number generator', 'Haphazard: unpredictable selection without bias', 'Systematic: every Nth item from population', 'Document method and justify selection'] },
  { title: 'Exception Rate Calculator', desc: 'If X of N samples fail — is the control effective? Uses threshold tables per control frequency and risk level.', steps: ['Define tolerable exception rate (usually 0–5%)', 'Count exceptions in sample', 'Apply exception rate formula', 'Conclude effective / effective with exceptions / ineffective'] },
  { title: 'Exception Identification & Escalation', desc: 'What happens when a sample item fails — exception rate threshold, escalation triggers, and documentation.', steps: ['Document each exception immediately', 'Assess whether exception is isolated or systemic', 'Escalate to lead auditor if rate exceeds threshold', 'Expand sample if exception rate is borderline'] },
  { title: 'Re-performance Testing Scripts', desc: 'Auditor independently re-runs the control to verify outcome — e.g., re-runs an access review independently.', steps: ['Obtain same inputs as control owner', 'Execute control independently', 'Compare auditor result to control owner result', 'Document any discrepancies'] },
  { title: 'ITGC Automated Testing Scripts', desc: 'For IT General Controls — scripts to pull and verify automated control operation directly from systems.', steps: ['Define automated control query', 'Extract system logs / config data', 'Run automated validation script', 'Document results and exceptions'] },
  { title: 'Rollforward & Rollback Procedures', desc: 'For audits covering prior periods — procedures to test controls outside the direct observation window.', steps: ['Define rollforward/rollback period', 'Identify evidence available for prior period', 'Document limitations on prior period testing', 'Obtain management representation where gaps exist'] },
  { title: 'TOE Conclusion Workpaper', desc: 'Formal sign-off on operating effectiveness — the final conclusion before findings are documented.', steps: ['Effective — no exceptions or within threshold', 'Effective with Exceptions — exceptions noted, risk accepted', 'Ineffective — exceptions exceed threshold', 'Obtain lead auditor sign-off'] },
]

const conclusions = [
  { label: 'Effective', desc: 'No exceptions or within tolerable threshold. Control is operating effectively.', color: 'bg-emerald-900/30 border-emerald-700 text-emerald-300' },
  { label: 'Effective with Exceptions', desc: 'Exceptions noted but within threshold. Exceptions documented. Risk accepted by management.', color: 'bg-amber-900/30 border-amber-700 text-amber-300' },
  { label: 'Ineffective', desc: 'Exceptions exceed threshold. Raise finding. Escalate to management.', color: 'bg-red-900/30 border-red-700 text-red-300' },
]

export default function TOE() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.4"
        title="TOE — Test of Operating Effectiveness"
        description="Has the control operated consistently over the audit period? TOE tests whether a control that was designed (TOD) and implemented (TOI) has continued to operate effectively across the full audit window — typically 6 to 12 months. It uses statistical sampling, exception analysis, and multi-period evidence review."
        badges={['TOE', 'Effectiveness', 'ISO 19011 Cl. 6.4']}
      />

      <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-emerald-300 mb-1">TOE Prerequisite — TOD & TOI Must Be Complete</div>
          <div className="text-xs text-emerald-200/80 leading-relaxed">
            TOE cannot begin unless TOD concludes "Design Adequate" and TOI concludes "Implemented." If either prior phase has findings, the auditor must assess whether TOE is feasible or whether the control should be treated as failed without testing.
          </div>
        </div>
      </div>

      {/* Sampling Reference Table */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Sampling Reference — Control Frequency vs Sample Size</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy-700">
                {['Control Frequency', 'Audit Period', 'Population', 'Sample Size', 'Method'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-steel-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samplingTable.map((row, i) => (
                <tr key={row.freq} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/30'}`}>
                  <td className="py-2 px-3 text-white font-medium">{row.freq}</td>
                  <td className="py-2 px-3 text-steel-300">{row.period}</td>
                  <td className="py-2 px-3 text-steel-300">{row.population}</td>
                  <td className="py-2 px-3 text-emerald-300 font-medium">{row.sample}</td>
                  <td className="py-2 px-3 text-steel-300">{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-steel-400 mt-2">Reference: AICPA/IIA audit sampling standards. Adjust based on risk level and control significance.</p>
      </div>

      {/* TOE Conclusion */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">TOE Conclusion Framework</h2>
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
        {toeElements.map((el, idx) => (
          <div key={el.title} className="card border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-emerald-900/50 text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {el.steps.map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
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
        title="Generate TOE Artifacts"
        systemPrompt={`You are a senior IT auditor specialising in Test of Operating Effectiveness (TOE) under ISO 19011:2018 and AICPA/IIA sampling standards. Generate detailed sampling workpapers, population definition templates, exception analysis frameworks, and TOE conclusion workpapers. TOE tests consistency of control operation over the audit period using statistical sampling. All outputs must be structured professional workpapers with clear sampling rationale, exception thresholds, and conclusion fields. Reference control frequency and risk level in all sampling decisions.`}
        placeholder="e.g. Generate a TOE sampling workpaper for User Access Review control — monthly frequency, 12 month audit period, Azure AD environment"
        contextFields={[
          { id: 'control', label: 'Control Being Tested', placeholder: 'e.g. User Access Review — ISO 27002 A.8.2', type: 'text' },
          { id: 'frequency', label: 'Control Frequency', type: 'select', options: ['Real-time / Automated', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'] },
          { id: 'period', label: 'Audit Period', placeholder: 'e.g. 1 Jan 2025 – 31 Dec 2025', type: 'text' },
          { id: 'system', label: 'System / Source', placeholder: 'e.g. Azure AD, ServiceNow, Jira', type: 'text' },
          { id: 'artifact', label: 'TOE Artifact Required', type: 'select', options: [
            'Control Frequency Matrix',
            'Population Definition Workpaper',
            'Sample Selection Methodology',
            'Exception Rate Calculator',
            'Exception Escalation Guide',
            'Re-performance Testing Script',
            'ITGC Automated Testing Script',
            'Rollforward & Rollback Procedure',
            'Multi-Period Evidence Workpaper',
            'TOE Conclusion Workpaper',
          ]},
        ]}
      />
    </div>
  )
}
