import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ExternalLink, CheckCircle2, Zap, Database, Key, AlertCircle, Sun, Moon, Map, Bell, Trash2, Search, User } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const workflow = [
  {
    phase: 'Phase 1 — Pre-Audit Setup', color: 'border-l-steel-400', badge: 'bg-steel-400/20 text-steel-300',
    steps: [
      { label: 'Create audit programme', desc: 'Click the folder icon in the header → New. Set name, standards, period, lead auditor. Gets auto-ID: AP-2025-001. Edit anytime via the pencil icon in the programme dropdown.', path: '/', action: 'Header → Folder Icon' },
      { label: 'Sign independence declaration', desc: 'ISO 19011 Cl. 4 — confirm no conflicts of interest before any audit work begins.', path: '/iso19011/clause4', action: 'ISO 19011 → Clause 4' },
      { label: 'Set up audit programme objectives', desc: 'ISO 19011 Cl. 5 — define objectives, risks, resources, and annual schedule.', path: '/iso19011/clause5', action: 'ISO 19011 → Clause 5' },
      { label: 'Issue appointment letter', desc: 'ISO 19011 Cl. 6.2 — generate lead auditor appointment + auditee contact letter.', path: '/iso19011/clause6-initiation', action: 'ISO 19011 → Cl. 6.2' },
      { label: 'Generate audit plan', desc: 'ISO 19011 Cl. 6.3 — formal audit plan, document adequacy review, work assignment matrix.', path: '/iso19011/clause6-preparation', action: 'ISO 19011 → Cl. 6.3' },
    ]
  },
  {
    phase: 'Phase 2 — Fieldwork', color: 'border-l-blue-400', badge: 'bg-blue-900/40 text-blue-300',
    steps: [
      { label: 'Run opening meeting', desc: 'Generate opening meeting agenda, capture attendance register, confirm scope with auditee.', path: '/iso19011/meetings', action: 'ISO 19011 → Meetings' },
      { label: 'Issue PBC evidence list ⭐', desc: 'Add all evidence items needed from the auditee — tagged by phase, domain, priority. Search and filter. Track receipt status live. Toast confirms each update.', path: '/fieldwork/pbc', action: 'Fieldwork → PBC List ⭐' },
      { label: 'Test of Design (TOD)', desc: 'Does the control exist and is it properly designed? Generate design gap analysis and TOD workpaper.', path: '/iso19011/tod', action: 'ISO 19011 → TOD' },
      { label: 'Test of Implementation (TOI)', desc: 'Walkthrough — confirm control is in operation. Generate walkthrough scripts and evidence checklists.', path: '/iso19011/toi', action: 'ISO 19011 → TOI' },
      { label: 'Test of Effectiveness (TOE)', desc: 'Sample population — confirm control operated consistently. Generate sampling justification workpapers.', path: '/iso19011/toe', action: 'ISO 19011 → TOE' },
      { label: 'Track fieldwork progress ⭐', desc: 'Monitor TOD/TOI/TOE status per control. Progress bar shows overall and per-phase completion. Toast confirms status updates.', path: '/fieldwork/tracker', action: 'Fieldwork → Tracker ⭐' },
      { label: 'Upload evidence to library ☁️', desc: 'Drag & drop files — auto-named WP-001 in Supabase cloud. Search, filter, download, or delete. AI outputs also saveable here.', path: '/fieldwork/library', action: 'Fieldwork → Library ☁️' },
    ]
  },
  {
    phase: 'Phase 3 — Findings', color: 'border-l-red-400', badge: 'bg-red-900/40 text-red-300',
    steps: [
      { label: 'Raise findings using 4Cs ⭐', desc: 'Condition → Criteria → Cause → Consequence. Search by ref or title. Delete with trash icon. Toast confirms all saves.', path: '/fieldwork/findings', action: 'Fieldwork → Finding Register ⭐' },
      { label: 'Rate and document findings', desc: 'Set rating (Critical/High/Medium/Low), update management response, agreed action, owner, and due date. Overdue findings flagged in red.', path: '/fieldwork/findings', action: 'Fieldwork → Finding Register ⭐' },
      { label: 'Review Annex A guidance', desc: 'ISO 19011 Annex A — supplemental guidance on audit methods, remote auditing, risk-based approach, and sampling.', path: '/iso19011/annexa', action: 'ISO 19011 → Annex A' },
    ]
  },
  {
    phase: 'Phase 4 — Reporting & Closure', color: 'border-l-emerald-400', badge: 'bg-emerald-900/40 text-emerald-300',
    steps: [
      { label: 'Run closing meeting', desc: 'Present findings, capture management responses, handle disputed findings per ISO 19011 Cl. 6.4.7.', path: '/iso19011/meetings', action: 'ISO 19011 → Meetings' },
      { label: 'Generate audit report', desc: 'ISO 19011 Cl. 6.5-aligned report with all mandatory sections. Select overall opinion and generate.', path: '/reporting/builder', action: 'Reporting → Report Builder' },
      { label: 'Management review pack ⭐', desc: 'ISO 27001 Cl. 9.3 — live checklist of all mandatory inputs. AI generates board-level review pack with live data injected.', path: '/reporting/management-review', action: 'Reporting → Mgmt Review ⭐' },
      { label: 'Track CAPAs to closure ⭐', desc: 'Pulls all findings automatically. Update actions, due dates. Overdue CAPAs highlighted. Toast confirms all saves.', path: '/reporting/capa', action: 'Reporting → CAPA Tracker ⭐' },
      { label: 'Monitor KPIs ⭐', desc: '8 live KPIs calculated from your audit data — CAPA rate, risks above appetite, PBC receipt, workpaper sign-off.', path: '/reporting/kpi', action: 'Reporting → KPI Dashboard ⭐' },
    ]
  },
]

const livePages = [
  { label: 'PBC Master List', path: '/fieldwork/pbc', desc: 'Evidence tracker — search, filter, delete, inline status update' },
  { label: 'Fieldwork Tracker', path: '/fieldwork/tracker', desc: 'TOD/TOI/TOE progress per control with completion bars' },
  { label: 'Finding Register', path: '/fieldwork/findings', desc: '4Cs findings — search, delete, management response, CAPA' },
  { label: 'Workpaper Library', path: '/fieldwork/library', desc: 'Cloud file storage — upload, search, download, delete' },
  { label: 'Risk Register', path: '/iso27005/live-register', desc: 'Asset × Threat × Vulnerability — search, delete, update treatment' },
  { label: 'CAPA Tracker', path: '/reporting/capa', desc: 'Live CAPA closure from findings — overdue alerts, toast saves' },
  { label: 'KPI Dashboard', path: '/reporting/kpi', desc: '8 live KPIs with targets calculated from real audit data' },
  { label: 'Management Review', path: '/reporting/management-review', desc: 'Cl. 9.3 input checklist with live data and AI pack generation' },
  { label: 'Asset Register', path: '/iso27005/assets', desc: 'Live asset inventory — category, classification, criticality, owner' },
  { label: 'Audit Universe', path: '/reporting/universe', desc: 'Risk-ranked annual audit schedule with inline status tracking' },
]

const standards = [
  { std: 'ISO 19011:2018', color: 'text-amber-audit', role: 'Audit backbone — HOW to audit', pages: 'Cl.4, 5, 6.2, 6.3, TOD, TOI, TOE, Findings, Meetings, Reporting, Cl.7, Annex A' },
  { std: 'ISO 27001:2022', color: 'text-blue-400', role: 'ISMS requirements — WHAT the org must do', pages: 'Clause 4 through 10' },
  { std: 'ISO 27002:2022', color: 'text-purple-400', role: 'Controls guidance — 93 Annex A controls with audit testing points', pages: 'Organizational (37), People (8), Physical (14), Technological (34) + Net-New 11' },
  { std: 'ISO 27005:2022', color: 'text-red-400', role: 'Risk management — Asset × Threat × Vulnerability + STRIDE', pages: 'Asset Register ⭐ Live, Risk Register ⭐ Live, RTP (control mapping), Scenarios (6 pre-built + AI)' },
  { std: 'ISO 9001:2015', color: 'text-emerald-400', role: 'QMS — kept separate under IMS', pages: 'Clause 5, 7, 8, 9, 10' },
  { std: 'IMS Cross-Walk', color: 'text-cyan-400', role: 'ISO 27001 × ISO 9001 — 18 shared clauses, 30-40% saving', pages: 'Cross-Walk Matrix (18 clauses), Joint Worksheets (Change, Supplier, Incident, SDLC)' },
]

export default function Wiki() {
  const navigate = useNavigate()
  const [activePhase, setActivePhase] = useState(0)

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="AuditIQ"
        clause="Wiki & Guide"
        title="How to Use AuditIQ"
        description="Complete guide to using the platform — audit workflow, live pages, AI generation, keyboard shortcuts, and setup. Last updated August 2026."
        badges={['Guide', 'Documentation', 'Wiki']}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'GitHub README', href: 'https://github.com/logan23info/audit-platform#readme' },
          { label: 'GitHub Repo', href: 'https://github.com/logan23info/audit-platform' },
          { label: 'FAQ', path: '/faq' },
          { label: 'Live Platform', href: 'https://auditiq-it.vercel.app' },
        ].map(l => l.href ? (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={11} /> {l.label}</a>
        ) : (
          <button key={l.label} onClick={() => navigate(l.path)} className="btn-secondary text-xs"><ArrowRight size={11} /> {l.label}</button>
        ))}
      </div>

      {/* Workflow */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">Audit Workflow — Step by Step</h2>
        <div className="flex flex-wrap gap-2 mb-5">
          {workflow.map((phase, i) => (
            <button key={i} onClick={() => setActivePhase(i)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activePhase === i ? `${phase.badge} border-current` : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-400'}`}>
              {phase.phase.split(' — ')[0]}
            </button>
          ))}
        </div>
        <div className={`border-l-4 ${workflow[activePhase].color} pl-4`}>
          <div className="text-sm font-bold text-white mb-4">{workflow[activePhase].phase}</div>
          <div className="space-y-3">
            {workflow[activePhase].steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-navy-800 border border-navy-600 rounded-lg p-3 hover:border-steel-400 transition-colors">
                <span className="w-6 h-6 rounded-full bg-navy-700 text-steel-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white mb-0.5">{step.label}</div>
                  <div className="text-xs text-steel-400 leading-snug mb-1.5">{step.desc}</div>
                  <button onClick={() => navigate(step.path)} className="inline-flex items-center gap-1 text-xs text-amber-audit hover:text-amber-300 transition-colors font-mono">
                    {step.action} <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live pages */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={15} className="text-emerald-400" />
          <h2 className="section-title mb-0">⭐ Live Pages — Supabase Connected</h2>
        </div>
        <p className="text-xs text-steel-400 mb-4">These 9 pages save data permanently to Supabase. All support search, filtering, and delete. Toast notifications confirm every action. Select an audit programme from the header before using any live page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {livePages.map(p => (
            <button key={p.path} onClick={() => navigate(p.path)} className="text-left bg-navy-800 border border-navy-600 rounded-lg p-3 hover:border-emerald-600 transition-colors group">
              <div className="text-sm font-medium text-white group-hover:text-emerald-300 mb-1">{p.label}</div>
              <div className="text-xs text-steel-400 leading-snug">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Keyboard Shortcuts & Interface Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Search, label: 'Ctrl+K / Cmd+K', desc: 'Open module search from anywhere in the platform' },
            { icon: Sun, label: 'Sun/Moon icon', desc: 'Toggle dark/light mode — preference saved to localStorage' },
            { icon: Bell, label: 'Notification bell', desc: 'Live notifications — overdue findings, outstanding PBC, critical issues' },
            { icon: Map, label: 'Breadcrumbs', desc: 'Clickable path shown on every page — navigate back instantly' },
            { icon: User, label: 'Profile icon', desc: 'Edit name, role, organisation, and change password' },
            { icon: Trash2, label: 'Trash icon in tables', desc: 'Delete records from any live table with confirmation prompt' },
            { icon: Search, label: 'Search bars in tables', desc: 'Filter live tables by ref, title, asset, control, or description' },
            { icon: CheckCircle2, label: 'Toast notifications', desc: 'Bottom-right confirmation messages — auto-dismiss in 3 seconds' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-navy-800 rounded-lg p-3">
              <s.icon size={14} className="text-amber-audit flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white mb-0.5">{s.label}</div>
                <div className="text-xs text-steel-400 leading-snug">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standards */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Standards Quick Reference</h2>
        <div className="space-y-2">
          {standards.map(s => (
            <div key={s.std} className="flex flex-col sm:flex-row sm:items-start gap-2 bg-navy-800 rounded-lg p-3">
              <span className={`text-xs font-mono font-bold flex-shrink-0 w-32 ${s.color}`}>{s.std}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white mb-0.5">{s.role}</div>
                <div className="text-xs text-steel-500">{s.pages}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI + Storage + Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Zap size={15} className="text-purple-400" /><h2 className="section-title mb-0">AI Generation — Groq (Free)</h2></div>
          <div className="space-y-1.5 text-xs text-steel-300 mb-3">
            {['Fill in context fields on any page', 'Click Generate → Groq API (free, ~2 seconds)', 'Toggle Formatted / Raw output view', 'Copy, Download, or Save to Library', 'Auto-detects standard and phase from page URL', 'Live data injected into Management Review prompt'].map((s, i) => (
              <div key={i} className="flex gap-2"><span className="text-purple-400 font-bold flex-shrink-0">{i+1}.</span><span>{s}</span></div>
            ))}
          </div>
          <div className="bg-amber-900/20 border border-amber-800/50 rounded p-2 text-xs text-amber-200/80 flex gap-1.5">
            <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />Requires VITE_GROQ_API_KEY in Vercel — free at console.groq.com
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3"><Key size={15} className="text-red-400" /><h2 className="section-title mb-0">Required Environment Variables</h2></div>
          <div className="space-y-2">
            {[
              { var: 'VITE_GROQ_API_KEY', source: 'console.groq.com → API Keys (free)', req: 'AI Generate buttons' },
              { var: 'VITE_SUPABASE_URL', source: 'Supabase → Settings → API → Project URL', req: 'All live pages + login' },
              { var: 'VITE_SUPABASE_ANON_KEY', source: 'Supabase → Settings → API → Publishable', req: 'All live pages + login' },
            ].map(r => (
              <div key={r.var} className="bg-navy-800 rounded p-2">
                <div className="font-mono text-amber-audit text-xs">{r.var}</div>
                <div className="text-xs text-steel-400 mt-0.5">{r.source}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-blue-900/20 border border-blue-800/50 rounded p-2 text-xs text-blue-200/80 flex gap-1.5">
            <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />After adding env vars — commit a change to GitHub for a fresh Vercel build.
          </div>
        </div>
      </div>

      <div className="card text-center">
        <div className="text-xs text-steel-400 mb-2">AuditIQ — IT Audit Intelligence Platform</div>
        <div className="text-xs text-steel-500 mb-4">ISO 19011 · 27001 · 27002 · 27005 · 9001 · Powered by Groq AI (Free)</div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => navigate('/faq')} className="btn-secondary text-xs">FAQ</button>
          <a href="https://github.com/logan23info/audit-platform#readme" target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={11} /> GitHub README</a>
        </div>
      </div>
    </div>
  )
}
