import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react'
import { useToast } from './Toast'

// ─── ISO 9001:2015 reference data — structure only, no clause text reproduced ─
const CLAUSE_REFS = {
  'ISO 9001:2015 Cl.4.1–4.3': {
    outputs: ['Internal issues (SWOT — strengths, weaknesses)', 'External issues (PESTLE — political, economic, social, tech, legal, environmental)', 'QMS scope statement', 'Justified exclusions (Cl.8 only if applicable)'],
    guidance: 'ISO 9001 Cl.4.1 requires determination of internal and external issues relevant to the organisation\'s purpose and strategic direction. Cl.4.3 requires the scope to state products and services covered and any justified exclusions.',
    fields: {
      name: 'Your registered or trading name — used in the scope statement.',
      industry: 'Your sector e.g. Automotive components, SaaS, Food manufacturing, Healthcare devices.',
      products: 'What you make, deliver or provide — be specific e.g. CNC-machined aluminium brackets for Tier 1 OEMs.',
      size: 'Headcount helps determine the scale of internal issues.',
      customers: 'Who buys from you and in which markets — e.g. NHS trusts, EU automotive OEMs, UK supermarkets.',
      regulations: 'Standards and regulations that apply — e.g. IATF 16949, MDR 2017/745, BRC, ISO 27001, REACH.',
      extra: 'Key sites, current certifications, known risks, strategic challenges, outsourced processes.',
    },
    examples: [
      { sector: 'Automotive', name: 'Acme Precision Ltd', industry: 'Automotive components', products: 'CNC-machined aluminium components for Tier 1 OEMs', size: '51–250 employees', customers: 'Tier 1 automotive OEM supply chains, UK and EU', regulations: 'IATF 16949, ISO 9001, REACH', extra: 'Sites in UK and Poland, currently IATF certified, pursuing ISO 14001' },
      { sector: 'SaaS / Tech', name: 'CloudOps Ltd', industry: 'Software / SaaS', products: 'Cloud infrastructure monitoring platform for financial services', size: '11–50 employees', customers: 'UK financial services firms, regulated by FCA', regulations: 'ISO 27001, ISO 9001, FCA SYSC guidance', extra: 'Remote-first, single UK entity, SOC 2 Type II in progress' },
      { sector: 'Food & Beverage', name: 'FreshBake Co', industry: 'Food manufacturing', products: 'Gluten-free baked goods for UK supermarket retail', size: '51–250 employees', customers: 'Major UK supermarket chains', regulations: 'BRC Global Standard Food Safety, allergen regulations, HACCP', extra: 'Single site, temperature-controlled production, Red Tractor member' },
      { sector: 'Medical Devices', name: 'MedDevice Ltd', industry: 'Medical device manufacturing', products: 'Class II in-vitro diagnostic devices for clinical laboratories', size: '251–1000 employees', customers: 'NHS trusts, private labs, EU hospital networks', regulations: 'MDR 2017/745, ISO 13485, FDA 21 CFR Part 820', extra: 'CE marked products, post-market surveillance programme in place' },
    ]
  },
  'ISO 9001:2015 Cl.4.2': {
    outputs: ['Stakeholder name / group', 'Category (Customer / Regulator / Supplier / Employee etc.)', 'Their needs and expectations', 'Relevance rating (High / Medium / Low)', 'Review date'],
    guidance: 'ISO 9001 Cl.4.2 requires identification of interested parties relevant to the QMS and their requirements. Minimum coverage: customers, regulators, key suppliers, employees. Must be reviewed periodically.',
    fields: {
      name: 'Your organisation name — used to contextualise stakeholder relationships.',
      industry: 'Your sector drives which regulators and bodies are relevant.',
      products: 'What you supply determines customer and supplier stakeholders.',
      size: 'Size affects which employee groups and governance bodies apply.',
      customers: 'Be specific — name customer types e.g. NHS procurement, Tier 1 OEMs, retail buyers.',
      regulations: 'Regulators are key interested parties — list all that apply to your sector.',
      extra: 'Ownership structure, trade associations, local community dependencies, subcontractors.',
    },
    examples: [
      { sector: 'Construction', name: 'BuildRight Ltd', industry: 'Commercial construction', products: 'Main contractor services for commercial fit-outs and refurbishments', size: '51–250 employees', customers: 'Property developers, local authorities, NHS estates', regulations: 'Building Control, CDM 2015, HSE, PAS 91 procurement', extra: 'Suitably qualified subcontractors, CHAS accredited, Constructionline Gold' },
      { sector: 'Professional Services', name: 'LexConsult LLP', industry: 'Legal services', products: 'Commercial legal advisory to SMEs and public sector bodies', size: '11–50 employees', customers: 'SME businesses, local authorities', regulations: 'SRA Solicitors Code of Conduct, GDPR, AML regulations', extra: 'Partner-managed practice, Lexcel accredited, Cyber Essentials certified' },
      { sector: 'Logistics', name: 'FastFreight Ltd', industry: 'Road haulage and logistics', products: 'Ambient temperature road haulage across UK and Ireland', size: '251–1000 employees', customers: 'FMCG brands, retail distribution centres', regulations: 'DVSA, RHA standards, Working Time Directive, ADR for hazardous goods', extra: 'Owner-operated fleet, cold chain capability being added, FORS Silver' },
    ]
  },
  'ISO 9001:2015 Cl.5.2': {
    outputs: ['Quality policy statement (max 150 words)', 'Version (1.0 DRAFT — you must set approval details)'],
    guidance: 'ISO 9001 Cl.5.2 requires a policy appropriate to the organisation\'s purpose, including commitment to satisfying applicable requirements and continual improvement. Must be communicated internally and available to interested parties.',
    fields: {
      name: 'Organisation name appears in the policy statement — must be your actual name.',
      industry: 'Sector context shapes the tone and focus of quality commitments.',
      products: 'The policy should reference what you supply — products, services, or both.',
      size: 'Governance language differs for an SME versus a large enterprise.',
      customers: 'Customer focus is a core policy commitment — be specific about who you serve.',
      regulations: 'Regulatory compliance must be referenced if applicable to your sector.',
      extra: 'Quality commitments, customer satisfaction goals, certification aspirations, values.',
    },
    examples: [
      { sector: 'Electronics', name: 'CircuitCo Ltd', industry: 'Electronics manufacturing', products: 'PCB design and assembly for telecoms equipment OEMs', size: '51–250 employees', customers: 'Network infrastructure OEMs, UK and Europe', regulations: 'ISO 9001, IPC-A-610, RoHS, WEEE', extra: 'Currently ISO 9001 certified, pursuing IPC Certified Interconnect Designer programme' },
      { sector: 'Training Provider', name: 'SkillsFirst Academy', industry: 'Vocational education and training', products: 'Apprenticeship delivery and corporate training programmes', size: '11–50 employees', customers: 'Apprentices, corporate learners, ESFA funded programmes', regulations: 'Ofsted Education Inspection Framework, ESFA funding rules, Prevent duty', extra: 'Ofsted Good rated, Matrix accredited, implementing QMS for contract compliance' },
    ]
  },
  'ISO 9001:2015 Cl.6.2': {
    outputs: ['SMART objective statement', 'Measurement method', 'Target (shown as [SAMPLE] — you must replace with real numbers)', 'Owner role', 'Due date', 'Process area', 'Status'],
    guidance: 'ISO 9001 Cl.6.2 requires quality objectives to be measurable, monitored, communicated and updated. Must be consistent with the quality policy. Minimum: customer satisfaction, product conformity, process efficiency, improvement.',
    fields: {
      name: 'Organisation name for context.',
      industry: 'Industry drives relevant process areas and objective types.',
      products: 'Objectives must relate to the products and services you deliver.',
      size: 'Scale affects which processes and KPIs are relevant.',
      customers: 'Customer satisfaction objectives should reflect your customer type.',
      regulations: 'Regulatory compliance may drive specific mandatory objectives.',
      extra: 'Current performance gaps, strategic priorities, known weak processes, audit findings.',
    },
    examples: [
      { sector: 'Aerospace', name: 'AeroFab Ltd', industry: 'Aerospace manufacturing', products: 'Structural aircraft components — machined and fabricated', size: '51–250 employees', customers: 'Prime contractors (Tier 1), subject to NADCAP requirements', regulations: 'AS9100 Rev D, EASA Part 21, customer-specific requirements', extra: 'Currently AS9100 certified, NADCAP accreditation being pursued for heat treatment' },
      { sector: 'Facilities Management', name: 'ClearSpace FM', industry: 'Facilities management and cleaning services', products: 'Cleaning, maintenance and FM services to NHS and public sector', size: '251–1000 employees', customers: 'NHS trusts, local authorities, government estates', regulations: 'NHS procurement standards, COSHH, Living Wage Foundation, ISO 14001', extra: 'TUPE transfers common, high staff turnover risk, contract renewal pressure' },
    ]
  },
  'ISO 9001:2015 Cl.6.3': {
    outputs: ['Change description', 'Reason for change', 'Impact on QMS integrity', 'Responsible role', 'Planned date', 'Status'],
    guidance: 'ISO 9001 Cl.6.3 requires planned QMS changes to be carried out in a controlled manner, considering purpose, consequences for integrity, resource availability, and responsibility allocation.',
    fields: {
      name: 'Organisation name.',
      industry: 'Industry context determines what types of changes are common.',
      products: 'Changes often relate to product or process changes — describe your outputs.',
      size: 'Larger organisations have more formal change control; smaller ones more informal.',
      customers: 'Customer-driven changes are common — note key customer requirements.',
      regulations: 'Regulatory changes often trigger QMS updates — list applicable standards.',
      extra: 'Planned process changes, new product introductions, system implementations, site changes.',
    },
    examples: [
      { sector: 'General Manufacturing', name: 'PrecisionParts Ltd', industry: 'General engineering subcontract', products: 'Turned and milled metal components for industrial OEMs', size: '11–50 employees', customers: 'Industrial equipment OEMs, UK market', regulations: 'ISO 9001 (implementing for first time)', extra: 'Currently uses informal quality checks, no documented QMS, implementing in response to customer audit requirement' },
      { sector: 'IT Services', name: 'NetManage Ltd', industry: 'Managed IT services', products: 'IT infrastructure management, helpdesk and cyber security services for SMEs', size: '11–50 employees', customers: 'SME businesses across UK', regulations: 'ISO 9001, Cyber Essentials Plus, GDPR', extra: 'ITIL-based service desk, implementing QMS alongside ISO 27001, existing Cyber Essentials certified' },
    ]
  },
  'ISO 9001:2015 Cl.7.2': {
    outputs: ['Role title (no real names)', 'Function / department', 'Competence required', 'Evidence type (not fabricated credentials)', 'Gap (if applicable)', 'Training action', 'Review date'],
    guidance: 'ISO 9001 Cl.7.2 requires determination of necessary competence, actions to acquire it where gaps exist, and retention of appropriate evidence. Competence = education + training + experience.',
    fields: {
      name: 'Organisation name.',
      industry: 'Sector determines which qualifications and competences are standard.',
      products: 'Products and services drive process-specific competence requirements.',
      size: 'Number of roles and depth of specialisation.',
      customers: 'Customer requirements may specify competence standards.',
      regulations: 'Regulated industries have mandatory competence requirements — list all.',
      extra: 'List key roles involved in quality — e.g. Quality Manager, Engineers, Operators, Internal Auditors.',
    },
    examples: [
      { sector: 'Automotive', name: 'TrimTech Ltd', industry: 'Automotive interior components', products: 'Injection-moulded interior trim for automotive OEMs', size: '251–1000 employees', customers: 'Tier 1 automotive supply chain, IATF 16949 customers', regulations: 'IATF 16949, ISO 9001, PPAP requirements', extra: 'Key roles: Quality Manager, Process Engineers, Production Operators, SPC Analysts, Internal Auditors, Lab Technicians' },
      { sector: 'Healthcare', name: 'CareGroup NHS Trust', industry: 'NHS community healthcare', products: 'Community nursing, therapy and mental health services', size: '1000+ employees', customers: 'NHS patients, ICB commissioners, CQC', regulations: 'CQC Fundamental Standards, NHS England frameworks, Safeguarding, IG Toolkit', extra: 'Key roles: Clinical Quality Lead, Information Governance Officer, Safeguarding Leads, Service Managers' },
    ]
  },
  'ISO 9001:2015 Cl.7.5': {
    outputs: ['Document reference (e.g. QP-001)', 'Title', 'Type (Procedure / Policy / Work Instruction / Form / Record)', 'Version (1.0 DRAFT)', 'Owner role', 'Review date', 'Status (Draft)'],
    guidance: 'ISO 9001 Cl.7.5 requires documented information mandated by the standard plus any determined necessary by the organisation. Mandatory documents include: scope, quality policy, objectives, calibration records, competence evidence, nonconformity and CAPA records.',
    fields: {
      name: 'Organisation name — used in document references and headers.',
      industry: 'Industry drives which additional documents are required beyond ISO 9001 mandatory.',
      products: 'Process-specific work instructions and specifications relate to your products.',
      size: 'Larger organisations need more formal document hierarchies.',
      customers: 'Customer-specific quality plans or requirements may need separate documents.',
      regulations: 'Regulatory requirements often mandate specific documented procedures.',
      extra: 'Current documents that exist, document numbering format preference, any regulatory-specific requirements.',
    },
    examples: [
      { sector: 'Food Processing', name: 'FreshFields Ltd', industry: 'Fresh produce packing', products: 'Fresh produce packing and dispatch for major UK supermarkets', size: '51–250 employees', customers: 'Major UK supermarkets — retail buyers and technical teams', regulations: 'BRC Food Safety, Red Tractor, allergen regulations, HACCP', extra: 'Existing HACCP plan, traceability procedure, allergen policy — need to integrate into ISO 9001 document structure' },
      { sector: 'Security Services', name: 'GuardForce Ltd', industry: 'Manned guarding and CCTV monitoring', products: 'Manned guarding, mobile patrol and CCTV monitoring services', size: '251–1000 employees', customers: 'NHS estates, commercial property, government sites', regulations: 'SIA licensing, BS 7499, ISO 9001, NHS Protect standards', extra: 'Implementing QMS for government contract compliance, existing assignment instructions need document control' },
    ]
  },
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function callEdge(systemPrompt, userMessage) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ systemPrompt, userMessage })
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || `Error ${res.status}`)
  return data.content || ''
}

function validateJSON(raw, requiredFields) {
  try {
    const text = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)
    const records = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    records.forEach((r, i) => {
      requiredFields.forEach(f => {
        if (!r[f] || String(r[f]).trim() === '') errors.push(`Record ${i + 1}: missing "${f}"`)
      })
    })
    return { records, errors }
  } catch {
    return { records: [], errors: ['AI returned invalid JSON — please retry'] }
  }
}

const EMPTY_CTX = { name: '', industry: '', products: '', size: '', customers: '', regulations: '', extra: '' }

export default function QMSAIGenerator({ clause, systemPrompt, requiredFields = [], onGenerated }) {
  const [ctx, setCtx] = useState(EMPTY_CTX)
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState([])
  const [open, setOpen] = useState(true)
  const toast = useToast()
  const ref = CLAUSE_REFS[clause]

  const isReady = ctx.name.trim() && ctx.industry.trim() && ctx.products.trim()

  const generate = async () => {
    if (!isReady) { toast('Fill in name, industry and products/services first', 'error'); return }
    const builtInput = [
      `Organisation: ${ctx.name}`,
      `Industry/sector: ${ctx.industry}`,
      `Products/services: ${ctx.products}`,
      ctx.size ? `Size: ${ctx.size}` : '',
      ctx.customers ? `Key customers/markets: ${ctx.customers}` : '',
      ctx.regulations ? `Key regulations/standards: ${ctx.regulations}` : '',
      ctx.extra ? `Additional context: ${ctx.extra}` : '',
    ].filter(Boolean).join('\n')
    setLoading(true); setDraft(null); setErrors([])
    try {
      const raw = await callEdge(systemPrompt, builtInput)
      if (raw.includes('INSUFFICIENT_DATA')) {
        setErrors(['Add more detail — describe your products and customers more specifically.'])
        setLoading(false); return
      }
      const { records, errors: errs } = validateJSON(raw, requiredFields)
      if (errs.length) { setErrors(errs); setLoading(false); return }
      setDraft(records)
    } catch (e) { setErrors([e.message]) }
    setLoading(false)
  }

  const confirm = () => {
    onGenerated(draft.map(r => ({ ...r, ai_generated: true, status: r.status || 'Draft' })))
    setDraft(null); setCtx(EMPTY_CTX)
    toast('AI draft loaded — review and save to confirm')
  }

  const prefill = (ex) => setCtx({ name: ex.name || '', industry: ex.industry || '', products: ex.products || '', size: ex.size || '', customers: ex.customers || '', regulations: ex.regulations || '', extra: ex.extra || '' })

  const hint = (key) => ref?.fields?.[key] ? (
    <p className="text-xs text-steel-600 italic mb-1">{ref.fields[key]}</p>
  ) : null

  return (
    <div className="border border-navy-700 rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-navy-800 text-left hover:bg-navy-700 transition-colors">
        <Sparkles size={14} className="text-amber-audit" />
        <span className="text-sm font-medium text-white">AI Draft Generator — {clause}</span>
        <span className="ml-auto text-xs text-steel-500">Output is DRAFT — human review required</span>
        {open ? <ChevronUp size={13} className="text-steel-500" /> : <ChevronDown size={13} className="text-steel-500" />}
      </button>

      {open && (
        <div className="p-4 bg-navy-900 space-y-4">
          <div className="flex gap-4">

            {/* LEFT — structured input fields */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  {hint('name')}
                  <label className="block text-xs text-steel-400 mb-1">Organisation name <span className="text-red-400">*</span></label>
                  <input maxLength={100} value={ctx.name} onChange={e => setCtx(c => ({ ...c, name: e.target.value }))}
                    placeholder="e.g. Acme Manufacturing Ltd" className="input-field w-full text-sm" />
                </div>
                <div>
                  {hint('industry')}
                  <label className="block text-xs text-steel-400 mb-1">Industry / sector <span className="text-red-400">*</span></label>
                  <input maxLength={100} value={ctx.industry} onChange={e => setCtx(c => ({ ...c, industry: e.target.value }))}
                    placeholder="e.g. Automotive components" className="input-field w-full text-sm" />
                </div>
              </div>

              <div>
                {hint('products')}
                <label className="block text-xs text-steel-400 mb-1">Products / services <span className="text-red-400">*</span></label>
                <input maxLength={300} value={ctx.products} onChange={e => setCtx(c => ({ ...c, products: e.target.value }))}
                  placeholder="e.g. CNC-machined aluminium components for Tier 1 automotive OEMs" className="input-field w-full text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  {hint('size')}
                  <label className="block text-xs text-steel-400 mb-1">Organisation size</label>
                  <select value={ctx.size} onChange={e => setCtx(c => ({ ...c, size: e.target.value }))} className="input-field w-full text-sm">
                    <option value="">Select...</option>
                    <option>1–10 employees</option>
                    <option>11–50 employees</option>
                    <option>51–250 employees</option>
                    <option>251–1000 employees</option>
                    <option>1000+ employees</option>
                  </select>
                </div>
                <div>
                  {hint('customers')}
                  <label className="block text-xs text-steel-400 mb-1">Key customers / markets</label>
                  <input maxLength={200} value={ctx.customers} onChange={e => setCtx(c => ({ ...c, customers: e.target.value }))}
                    placeholder="e.g. Tier 1 OEMs, NHS trusts, EU retail" className="input-field w-full text-sm" />
                </div>
              </div>

              <div>
                {hint('regulations')}
                <label className="block text-xs text-steel-400 mb-1">Key regulations / standards</label>
                <input maxLength={200} value={ctx.regulations} onChange={e => setCtx(c => ({ ...c, regulations: e.target.value }))}
                  placeholder="e.g. IATF 16949, ISO 27001, BRC, MDR 2017/745" className="input-field w-full text-sm" />
              </div>

              <div>
                {hint('extra')}
                <label className="block text-xs text-steel-400 mb-1">Additional context</label>
                <textarea maxLength={600} value={ctx.extra} onChange={e => setCtx(c => ({ ...c, extra: e.target.value }))}
                  placeholder="Sites, certifications, known risks, key processes, strategic priorities..."
                  className="input-field w-full h-24 text-sm resize-none" />
              </div>

              {/* Action row */}
              <div className="flex gap-2 pt-1">
                <button onClick={generate} disabled={loading || !isReady}
                  className={`btn-primary text-sm flex items-center gap-2 ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {loading ? 'Generating...' : 'Generate draft'}
                </button>
                {!isReady && <span className="text-xs text-steel-600 self-center italic">Fill name, industry and products to enable</span>}
                {draft && (
                  <button onClick={confirm} className="btn-secondary text-sm flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Load {draft.length} record{draft.length > 1 ? 's' : ''} for review
                  </button>
                )}
              </div>

              {errors.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                  <div>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>
                </div>
              )}
              {draft && (
                <div className="text-xs text-amber-audit bg-amber-900/20 border border-amber-800/40 rounded-lg p-3">
                  ⚠ {draft.length} draft record{draft.length > 1 ? 's' : ''} generated. Click "Load for review", then edit and save to confirm. AI output is never saved automatically.
                </div>
              )}
            </div>

            {/* RIGHT — reference panel */}
            {ref && (
              <div className="w-72 flex-shrink-0 space-y-3 text-xs self-start">
                {/* What AI generates */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <Lightbulb size={12} /> What the AI will generate
                  </div>
                  <ul className="space-y-1.5">
                    {ref.outputs.map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-steel-400 leading-relaxed">
                        <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ISO guidance */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <BookOpen size={12} /> ISO 9001 requirement
                  </div>
                  <p className="text-steel-400 leading-relaxed">{ref.guidance}</p>
                </div>

                {/* Sector examples — clickable prefill */}
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <Sparkles size={12} /> Try a sector example
                  </div>
                  <p className="text-steel-500 italic leading-relaxed">Click any example to prefill all fields — then customise for your organisation.</p>
                  <div className="space-y-1.5">
                    {ref.examples.map((ex, i) => (
                      <button key={i} onClick={() => prefill(ex)}
                        className="w-full text-left border border-navy-600 hover:border-amber-800/60 bg-navy-900 hover:bg-navy-800/60 rounded-lg px-3 py-2 transition-colors group">
                        <div className="text-amber-audit/80 font-medium group-hover:text-amber-audit mb-0.5">{ex.sector}</div>
                        <div className="text-steel-500 leading-relaxed line-clamp-2">{ex.name} — {ex.products}</div>
                        <div className="text-steel-600 text-xs mt-1 group-hover:text-steel-400">↑ Click to prefill all fields</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
