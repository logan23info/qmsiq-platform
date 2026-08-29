import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const faqs = [
  {
    category: 'Getting Started',
    color: 'border-l-amber-audit',
    items: [
      {
        q: 'What is AuditIQ and who is it for?',
        a: 'AuditIQ is a free, AI-powered ISMS audit engineering platform for IT auditors, information security professionals, and compliance managers. It covers the full audit lifecycle across ISO 19011, ISO 27001, ISO 27002, and ISO 27005. Every module generates tailored audit artifacts using the Groq AI engine — free, no credit card needed.'
      },
      {
        q: 'How do I start my first audit?',
        a: 'Follow the ISO 19011 backbone: (1) Create an Audit Programme — click the folder icon in the header. (2) Clause 4 — sign the independence declaration. (3) Clause 5 — set up the programme objectives. (4) Clause 6.2 — issue the appointment letter. (5) Clause 6.3 — generate the audit plan. Then move into fieldwork via TOD → TOI → TOE → Findings → Reporting.'
      },
      {
        q: 'Do I need to create an account?',
        a: 'Yes — AuditIQ requires a free account. Go to auditiq-it.vercel.app and click "Create Account". Register with your email and password (minimum 6 characters). All your data is stored privately in Supabase and only accessible to your account.'
      },
      {
        q: 'What is an Audit Programme and how do I create one?',
        a: 'An Audit Programme (AP-2025-001) is the root container for all your work — workpapers, findings, risks, PBC items, and the audit universe are all linked to it. Click the folder icon in the header → New. Set the name, standards in scope, audit period, and lead auditor. You can also edit an existing programme by clicking the pencil icon in the programme dropdown.'
      },
      {
        q: 'I forgot my password — how do I reset it?',
        a: 'On the login page, click "Forgot password?" below the password field. Enter your email and click "Send Reset Link". Check your inbox for the reset email. Click the link to set a new password.'
      },
      {
        q: 'How do I edit my profile or change my password?',
        a: 'Click your user icon (top-right of header) → Edit Profile. Or navigate to My Profile in the sidebar under Platform. You can update your full name, role, and organisation. To change your password, scroll to the "Change Password" section on the same page.'
      },
    ]
  },
  {
    category: 'AI Generation',
    color: 'border-l-purple-400',
    items: [
      {
        q: 'Which AI provider does AuditIQ use?',
        a: 'AuditIQ uses Groq as the primary AI provider — completely free, no credit card needed. The active provider is shown as a badge ("Groq · GPT-OSS 20B") next to "AI-Powered" on every panel. Priority fallback order: Groq (VITE_GROQ_API_KEY) → OpenAI (VITE_OPENAI_API_KEY) → Anthropic (VITE_ANTHROPIC_API_KEY).'
      },
      {
        q: 'How does AI artifact generation work?',
        a: 'Every page has an AI Panel at the bottom. Fill in the context fields, select the artifact type, and click Generate. The platform calls the Groq API and returns a structured artifact in seconds. Toggle between Formatted (markdown rendered with headings and bullets) and Raw (plain text) views.'
      },
      {
        q: 'What is the "Save to Library" button?',
        a: 'After generating an artifact, click Save to Library. The output is automatically saved to Supabase as a workpaper (WP-001, WP-002...) linked to your active audit programme. It auto-detects the standard and phase from the current page URL. View all saved AI outputs at Fieldwork → Workpaper Library.'
      },
      {
        q: 'The Generate button shows an error — what do I do?',
        a: 'Most common causes: (1) No VITE_GROQ_API_KEY in Vercel — get a free key from console.groq.com, add to Vercel → Environment Variables, then commit any change to GitHub to trigger a fresh build. (2) Groq rate limit hit — wait 30 seconds and try again. The error message will tell you exactly what happened.'
      },
      {
        q: 'How specific should my inputs be?',
        a: 'Very specific inputs produce much better outputs. Instead of "tech company", use "AWS-native SaaS fintech, 200 employees, processing EU payment data under GDPR, Microsoft 365". Include the specific control reference (e.g. A.8.8), technology tested (e.g. Qualys), and audit period (e.g. 1 Jan–31 Dec 2025).'
      },
    ]
  },
  {
    category: 'TOD / TOI / TOE',
    color: 'border-l-blue-400',
    items: [
      {
        q: 'What is the difference between TOD, TOI, and TOE?',
        a: 'TOD (Test of Design) — does the control exist and is it properly designed? TOI (Test of Implementation) — has the control actually been put into practice? (one walkthrough instance). TOE (Test of Operating Effectiveness) — has the control operated consistently over the audit period? (statistical sample). Complete in order — TOD → TOI → TOE.'
      },
      {
        q: 'What happens if TOD concludes Design Inadequate?',
        a: 'Raise a design finding immediately via Fieldwork → Finding Register. Assess whether TOI and TOE are still feasible — if the control is not designed properly there may be nothing to test. In most cases a design inadequacy means the control is treated as failed without further testing.'
      },
      {
        q: 'How many samples do I need for TOE?',
        a: 'Sample sizes by control frequency: Real-time/automated → 25–60. Daily → 25–40. Weekly → 10–25. Monthly → 3–6. Quarterly → 2–4. Annual → census. The TOE page has a full sampling reference table and the AI panel generates sampling justification workpapers.'
      },
    ]
  },
  {
    category: 'Fieldwork — Live Pages',
    color: 'border-l-orange-400',
    items: [
      {
        q: 'What does "⭐ Live" mean in the sidebar?',
        a: '⭐ Live means the page is connected to Supabase — data is permanently saved, persists across sessions, and is linked to your active audit programme. All live pages require an active programme to be selected. Non-live pages are static reference content with AI generation only.'
      },
      {
        q: 'How do I delete a finding, risk, PBC item, or workpaper?',
        a: 'Every live table has a 🗑 trash icon on each row. Click it and confirm the deletion prompt. Deletions are permanent and cannot be undone. Finding Register, Risk Register, PBC List, and Workpaper Library all support deletion.'
      },
      {
        q: 'How does search work in the live tables?',
        a: 'Finding Register, Risk Register, PBC List, Fieldwork Tracker, and Workpaper Library all have a search bar at the top. Type any keyword to filter by title, reference number, control number, or asset name. Search works in combination with the phase/status filters.'
      },
      {
        q: 'How does the PBC Master List work?',
        a: 'Add each piece of evidence needed from the auditee — tag by phase (TOD/TOI/TOE), domain (Governance, People, Technological etc.), and priority. Update status inline (Not Started → Pending → Received). A toast notification confirms each status change. Filter by phase, status, or search by description.'
      },
      {
        q: 'How does the Finding Register work?',
        a: 'Raise findings using the 4Cs framework (Condition, Criteria, Cause, Consequence). Set rating (Critical/High/Medium/Low). Expand any finding to update management response, agreed action, action owner, due date, and status. Overdue findings are flagged in red. Delete findings with the trash icon. Toast notifications confirm all saves.'
      },
      {
        q: 'How does the Workpaper Library work?',
        a: 'Upload evidence files via drag & drop or click to browse (PDF, Word, Excel, PNG — max 50MB). Files are stored in Supabase cloud. Download any file via the download icon — generates a secure signed URL valid for 1 hour. Delete files with the trash icon. AI-generated outputs saved via "Save to Library" also appear here.'
      },
      {
        q: 'Does my active programme persist when I refresh the page?',
        a: 'Yes — your active programme is saved to localStorage and automatically restored when you reload the page or return to the site. You will not need to re-select it each session.'
      },
    ]
  },
  {
    category: 'Reporting — Live Pages',
    color: 'border-l-pink-400',
    items: [
      {
        q: 'How does the CAPA Tracker work?',
        a: 'The CAPA Tracker pulls all findings from your active audit programme automatically. Expand any finding to update the agreed corrective action, action owner, due date, and closure status. Overdue CAPAs are highlighted in red. The closure rate progress bar updates in real time. Toast notifications confirm all saves.'
      },
      {
        q: 'What KPIs does the KPI Dashboard show?',
        a: 'Eight live KPIs calculated from your Supabase data: CAPA Closure Rate (target 80%), Critical Findings Open (target 0), High Findings Open (target 0), Risks Above Appetite (target 0), Risk Coverage (target 90%), PBC Evidence Receipt (target 85%), Workpaper Sign-Off (target 100%), Overdue Actions (target 0). All update automatically.'
      },
      {
        q: 'How does the Risk Register work?',
        a: 'Add risks using Asset × Threat × Vulnerability methodology. Set inherent and residual scores via sliders (1–5 likelihood × impact). Apply ISO 27002 controls and assign a risk owner. Update treatment (Mitigate/Accept/Transfer/Avoid) inline. Delete risks with the trash icon. Search by asset name, threat, or risk reference.'
      },
      {
        q: 'How does the Management Review Pack work?',
        a: 'The Management Review page (ISO 27001 Cl. 9.3) pulls live stats from your audit programme — findings, risks, workpapers. It shows all 8 mandatory Cl. 9.3.2 inputs as an interactive checklist. The AI panel generates a full board-level review pack with the live data automatically injected into the prompt.'
      },
    ]
  },
  {
    category: 'Interface & Navigation',
    color: 'border-l-cyan-400',
    items: [
      {
        q: 'How do I search for a module quickly?',
        a: 'Press Ctrl+K (or Cmd+K on Mac) from anywhere in the platform to open the search bar instantly. Type any keyword — module name, standard, or clause. Results appear instantly. Press Escape to close. You can also click the "Search... ⌘K" bar in the header.'
      },
      {
        q: 'How do I switch between dark and light mode?',
        a: 'Click the Sun/Moon icon in the header. You can also toggle it from the user menu (top-right profile icon → Light mode / Dark mode). Your preference is saved to localStorage and persists across sessions.'
      },
      {
        q: 'What are the tooltips on the sidebar?',
        a: 'Hover over any item in the sidebar navigation to see a tooltip describing what that page does — what phase it covers, what artifacts it produces, and whether it is a live Supabase page. Tooltips appear to the right of the nav item.'
      },
      {
        q: 'What are the breadcrumbs at the top of each page?',
        a: 'Breadcrumbs show your current location — e.g. 🏠 → ISO 27001 — ISMS → Clause 4 — Context & Scope. Each crumb is clickable and navigates back to that section. Breadcrumbs appear on all pages except the Dashboard.'
      },
      {
        q: 'What are the toast notifications?',
        a: 'Toast notifications slide in from the bottom-right of the screen confirming saves, updates, deletions, and errors. They auto-dismiss after 3 seconds. You can also click the × to dismiss immediately. Green = success, Red = error, Blue = info, Amber = warning.'
      },
      {
        q: 'How do I export a page to PDF?',
        a: 'Press Ctrl+P (Cmd+P on Mac) on any page to print/save as PDF. Buttons and navigation are hidden in the printed output. The ExportButton component also appears on select pages for one-click PDF export.'
      },
      {
        q: 'The sidebar stays open on mobile — is that fixed?',
        a: 'Yes — the sidebar automatically closes when you tap any navigation item on mobile. The dark overlay also closes the sidebar when tapped.'
      },
    ]
  },
  {
    category: 'Technical & Setup',
    color: 'border-l-steel-400',
    items: [
      {
        q: 'What environment variables are required?',
        a: 'Required: VITE_GROQ_API_KEY (console.groq.com — free), VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Supabase → Settings → API). Optional fallbacks: VITE_OPENAI_API_KEY, VITE_ANTHROPIC_API_KEY. After adding any env var in Vercel, commit any change to GitHub to trigger a fresh build — the Redeploy button reuses old cache.'
      },
      {
        q: 'What tech stack is AuditIQ built on?',
        a: 'React 18 + Vite with lazy-loaded code splitting (fast initial load), Tailwind CSS v3, React Router v6, Supabase (auth + PostgreSQL + file storage), Groq API — openai/gpt-oss-20b (free AI), Vercel (deployment), GitHub (source control). Dark/light theming via ThemeContext + CSS variables.'
      },
      {
        q: 'Why do I get a 404 when refreshing the page?',
        a: 'AuditIQ is a React SPA — the vercel.json file in the repo root handles this with a rewrite rule pointing all routes to index.html. This is already in the repo. If you see 404s, check that vercel.json exists in your GitHub repo root.'
      },
      {
        q: 'How do I deploy updates using VS Code?',
        a: 'Run bash sync-from-claude.sh in the VS Code terminal, or press Ctrl+Shift+B → "Sync & Deploy to Vercel". This runs npm install → build → git add → commit → push. Vercel deploys automatically in ~30 seconds. The Ctrl+K shortcut in the platform also works for quick module navigation during development.'
      },
      {
        q: 'How do I delete stale files from the GitHub repo?',
        a: 'Fastest method: open VS Code terminal and run git rm <filepath> for each file, then git commit -m "cleanup" and git push. Alternatively press . (period) on the GitHub repo page to open GitHub.dev (browser VS Code), right-click files → Delete, then commit and push.'
      },
    ]
  },
]

export default function FAQ() {
  const [openItems, setOpenItems] = useState({})
  const toggle = (key) => setOpenItems(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        standard="AuditIQ"
        clause="Help & FAQ"
        title="Frequently Asked Questions"
        description="Everything you need to know about AuditIQ — from starting your first audit to using all live features. Last updated August 2026."
        badges={['Help', 'FAQ', 'Documentation']}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {faqs.map(section => (
          <a key={section.category} href={`#${section.category.replace(/[\s\/]+/g, '-').toLowerCase()}`}
            className="badge badge-steel text-xs hover:bg-navy-700 transition-colors cursor-pointer">
            {section.category}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {faqs.map(section => (
          <div key={section.category} id={section.category.replace(/[\s\/]+/g, '-').toLowerCase()}>
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-navy-700">
              <div className={`w-1 h-5 rounded-full ${section.color.replace('border-l-', 'bg-')}`} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">{section.category}</h2>
              <span className="text-xs text-steel-400">{section.items.length} questions</span>
            </div>
            <div className="space-y-2">
              {section.items.map((item, idx) => {
                const key = `${section.category}-${idx}`
                const isOpen = openItems[key]
                return (
                  <div key={key} className={`card border-l-4 ${section.color} p-0 overflow-hidden`}>
                    <button onClick={() => toggle(key)} className="w-full flex items-start justify-between p-4 text-left hover:bg-navy-800/30 transition-colors gap-3">
                      <span className="text-sm font-medium text-white leading-snug">{item.q}</span>
                      {isOpen ? <ChevronUp size={14} className="text-steel-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-steel-400 flex-shrink-0 mt-0.5" />}
                    </button>
                    {isOpen && <div className="px-4 pb-4"><p className="text-sm text-steel-300 leading-relaxed">{item.a}</p></div>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 text-center">
        <div className="text-sm font-semibold text-white mb-2">Still have questions?</div>
        <div className="text-xs text-steel-400 mb-4">Check the GitHub repo or raise an issue.</div>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://github.com/logan23info/audit-platform#readme" target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={12} /> GitHub README</a>
          <a href="https://github.com/logan23info/audit-platform/issues" target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={12} /> Raise an Issue</a>
        </div>
      </div>
    </div>
  )
}
