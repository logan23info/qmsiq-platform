import { useState, useEffect, useCallback } from 'react'
import { FileText, Send, Loader2, Download, Copy, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useProgramme } from '../../context/ProgrammeContext'
import { getFindings, getRisks } from '../../lib/supabase'

async function callAI(systemPrompt, userMessage) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  if (!groqKey) throw new Error('NO_KEY')
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
    body: JSON.stringify({ model: 'openai/gpt-oss-20b', max_tokens: 2000, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] })
  })
  if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err?.error?.message || `Error ${response.status}`) }
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const sections = [
  { id: 'executive', label: 'Executive Summary', icon: '📋', desc: 'Overall audit opinion, scope, and key conclusions' },
  { id: 'scope', label: 'Audit Scope & Methodology', icon: '🎯', desc: 'Standards audited, methodology (TOD/TOI/TOE), and period' },
  { id: 'findings', label: 'Findings Summary', icon: '⚠️', desc: 'All findings with 4Cs, ratings, and management responses' },
  { id: 'positive', label: 'Areas of Good Practice', icon: '✅', desc: 'Controls operating effectively and strengths observed' },
  { id: 'conclusion', label: 'Conclusion & Opinion', icon: '🏁', desc: 'Overall ISMS effectiveness opinion and audit sign-off' },
  { id: 'full', label: 'Full Audit Report', icon: '📄', desc: 'Complete ISO 19011 Cl. 6.5 report — all sections combined' },
]

const opinions = ['Effective — ISMS operating effectively with no material gaps', 'Partially Effective — minor gaps identified, remediation in progress', 'Partially Effective — significant gaps identified requiring management attention', 'Ineffective — material control failures requiring immediate action']

export default function ReportBuilder() {
  const { activeProgramme } = useProgramme()
  const [findings, setFindings] = useState([])
  const [risks, setRisks] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [form, setForm] = useState({ org: '', sector: '', period: '', lead_auditor: '', standards: 'ISO 27001:2022', opinion: opinions[0], section: 'full', notes: '' })
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [error, setError] = useState('')
  const [showFindings, setShowFindings] = useState(false)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoadingData(true)
    try {
      const [f, r] = await Promise.all([getFindings(activeProgramme.id), getRisks(activeProgramme.id)])
      setFindings(f); setRisks(r)
    } catch (e) { console.error(e) }
    setLoadingData(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const buildFindingsSummary = () => {
    if (findings.length === 0) return 'No findings raised in this audit.'
    const byRating = { Critical: [], High: [], Medium: [], 'Low / Advisory': [] }
    findings.forEach(f => { if (byRating[f.rating]) byRating[f.rating].push(f) })
    let summary = `Total findings: ${findings.length} (${findings.filter(f => f.status === 'Closed').length} closed, ${findings.filter(f => f.status !== 'Closed').length} open)\n\n`
    Object.entries(byRating).forEach(([rating, items]) => {
      if (items.length > 0) {
        summary += `${rating} (${items.length}):\n`
        items.forEach(f => {
          summary += `  - ${f.finding_ref}: ${f.title}\n`
          if (f.condition_text) summary += `    Condition: ${f.condition_text}\n`
          if (f.cause_text) summary += `    Cause: ${f.cause_text}\n`
          if (f.agreed_action) summary += `    Agreed Action: ${f.agreed_action}\n`
          if (f.action_owner) summary += `    Owner: ${f.action_owner} | Due: ${f.due_date || 'TBD'}\n`
          summary += '\n'
        })
      }
    })
    return summary
  }

  const buildRiskSummary = () => {
    if (risks.length === 0) return 'No risks logged in the risk register.'
    const above = risks.filter(r => (r.residual_score || r.residual_likelihood * r.residual_impact) >= 12)
    return `Total risks logged: ${risks.length}. Risks above appetite (residual score ≥12): ${above.length}. ${above.length > 0 ? 'High-priority risks: ' + above.map(r => `${r.risk_ref} (${r.asset} — ${r.threat})`).join(', ') : 'All risks within appetite.'}`
  }

  const generate = async (sectionId) => {
    setGenerating(true); setError(''); setOutput(''); setActiveSection(sectionId)
    const selectedSection = sections.find(s => s.id === sectionId)

    const systemPrompt = `You are a senior IT audit manager writing formal ISO 19011:2022 audit reports. Generate professional, board-ready audit report content. Use formal language. Structure with clear headings. Be specific and evidence-based. Reference clause numbers where appropriate.`

    const findingsSummary = buildFindingsSummary()
    const riskSummary = buildRiskSummary()

    const userMessage = `Generate the "${selectedSection?.label}" section of an ISO 19011:2022 formal audit report.

AUDIT DETAILS:
Organisation: ${form.org || 'Not specified'}
Sector: ${form.sector || 'Not specified'}  
Audit Period: ${form.period || 'Not specified'}
Lead Auditor: ${form.lead_auditor || 'Not specified'}
Standards Audited: ${form.standards}
Overall Opinion: ${form.opinion}
Programme: ${activeProgramme?.programme_id || 'Not specified'}

LIVE FINDINGS DATA FROM SUPABASE:
${findingsSummary}

LIVE RISK DATA FROM SUPABASE:
${riskSummary}

ADDITIONAL NOTES:
${form.notes || 'None'}

Generate a complete, professional ${selectedSection?.label} section. Use the actual findings and risk data provided above — reference specific finding references (F-001 etc.) and risk references where appropriate.`

    try {
      const text = await callAI(systemPrompt, userMessage)
      setOutput(text)
    } catch (e) {
      if (e.message === 'NO_KEY') setError('No AI key configured. Add VITE_GROQ_API_KEY to Vercel → Environment Variables.')
      else setError(`Error: ${e.message}`)
    }
    setGenerating(false)
  }

  const copy = () => navigator.clipboard.writeText(output)
  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AuditReport_${activeProgramme?.programme_id || 'draft'}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: findings.length,
    critical: findings.filter(f => f.rating === 'Critical').length,
    high: findings.filter(f => f.rating === 'High').length,
    open: findings.filter(f => f.status !== 'Closed').length,
    risksAbove: risks.filter(r => (r.residual_score || r.residual_likelihood * r.residual_impact) >= 12).length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2022"
        clause="Clause 6.5"
        title="Audit Report Builder"
        description="AI-powered audit report generator — auto-pulls live findings and risk data from your active programme. Generates formal ISO 19011 Cl. 6.5 report sections."
        badges={['Reporting', 'AI-Powered', 'ISO 19011 Cl. 6.5']}
      />

      {/* Live data summary */}
      {activeProgramme && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Live Data — {activeProgramme.programme_id}</h2>
            {loadingData && <Loader2 size={14} className="animate-spin text-steel-400" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
            {[
              { label: 'Total Findings', value: stats.total, color: 'text-white' },
              { label: 'Critical', value: stats.critical, color: 'text-red-400' },
              { label: 'High', value: stats.high, color: 'text-orange-400' },
              { label: 'Open', value: stats.open, color: 'text-amber-audit' },
              { label: 'Risks Above Appetite', value: stats.risksAbove, color: stats.risksAbove > 0 ? 'text-red-400' : 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="card-sm text-center">
                <div className={`font-display text-xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-steel-400 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
          {findings.length > 0 && (
            <button onClick={() => setShowFindings(!showFindings)} className="text-xs text-amber-audit hover:text-amber-300 flex items-center gap-1">
              {showFindings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showFindings ? 'Hide' : 'Preview'} findings to be included in report
            </button>
          )}
          {showFindings && findings.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
              {findings.map(f => (
                <div key={f.id} className="flex items-center gap-2 bg-navy-800 rounded p-2 text-xs">
                  <span className="font-mono text-amber-audit">{f.finding_ref}</span>
                  <span className={`badge text-xs ${f.rating === 'Critical' ? 'bg-red-900/40 text-red-300' : f.rating === 'High' ? 'bg-orange-900/40 text-orange-300' : f.rating === 'Medium' ? 'bg-amber-900/40 text-amber-300' : 'badge-steel'}`}>{f.rating}</span>
                  <span className="text-white truncate flex-1">{f.title}</span>
                  <span className={f.status === 'Closed' ? 'text-emerald-400' : 'text-red-400'}>{f.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report details form */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">Report Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'org', label: 'Organisation', placeholder: 'e.g. ABC Financial Services Ltd' },
            { key: 'sector', label: 'Sector', placeholder: 'e.g. Financial services, 500 employees' },
            { key: 'period', label: 'Audit Period', placeholder: 'e.g. 1 January – 31 December 2025' },
            { key: 'lead_auditor', label: 'Lead Auditor', placeholder: 'e.g. Logan, CIA, CISA' },
            { key: 'standards', label: 'Standards Audited', placeholder: 'e.g. ISO 27001:2022, ISO 27002:2022' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-steel-400 mb-1">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-steel-400 mb-1">Overall Audit Opinion</label>
            <select className="input-field" value={form.opinion} onChange={e => setForm(p => ({ ...p, opinion: e.target.value }))}>
              {opinions.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-steel-400 mb-1">Additional Notes / Context (optional)</label>
          <textarea className="textarea-field" rows={2} placeholder="e.g. First audit of new cloud infrastructure, management cooperative throughout..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>

      {/* Section selection */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">Generate Report Section</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map(s => (
            <button key={s.id} onClick={() => generate(s.id)} disabled={generating}
              className={`text-left p-4 rounded-xl border transition-all ${activeSection === s.id && output ? 'border-amber-audit bg-amber-900/10' : 'border-navy-600 bg-navy-800 hover:border-steel-400'} disabled:opacity-60`}>
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{s.label}</div>
              <div className="text-xs text-steel-400 leading-snug">{s.desc}</div>
              {generating && activeSection === s.id && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-audit">
                  <Loader2 size={11} className="animate-spin" /> Generating...
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card mb-4 text-xs text-red-400 bg-red-900/20 border border-red-800">{error}</div>}

      {output && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white">{sections.find(s => s.id === activeSection)?.label}</span>
              <span className="badge badge-amber text-xs">AI-Generated</span>
            </div>
            <div className="flex gap-2">
              <button onClick={copy} className="btn-secondary text-xs py-1.5"><Copy size={12} /> Copy</button>
              <button onClick={download} className="btn-secondary text-xs py-1.5"><Download size={12} /> Download .txt</button>
            </div>
          </div>
          <div className="bg-navy-950 border border-navy-700 rounded-lg p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs text-steel-200 whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
          </div>
          <p className="text-xs text-steel-500 mt-3">Review and validate before including in formal audit report. AI outputs are structured starting points — apply professional judgement.</p>
        </div>
      )}
    </div>
  )
}
