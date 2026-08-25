import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react'
import { useToast } from './Toast'


// ─── ISO 9001:2015 reference data — structure only, no clause text reproduced ─
const CLAUSE_REFS = {
  'ISO 9001:2015 Cl.4.1–4.3': {
    what: 'What the AI will generate',
    outputs: ['Internal issues (SWOT — strengths, weaknesses)', 'External issues (PESTLE — political, economic, social, tech, legal, environmental)', 'QMS scope statement', 'Justified exclusions (Cl.8 only)'],
    guidance: 'ISO 9001 Cl.4.1 requires the organisation to determine internal and external issues relevant to its purpose and strategic direction. Cl.4.3 requires the scope to state products/services covered and any justified exclusions.',
    examples: [
      { sector: 'Manufacturing', text: 'Acme Precision Ltd — 120 employees, makes CNC-machined aluminium components for automotive Tier 1 OEMs, sites in UK and Poland, certified IATF 16949' },
      { sector: 'Software / SaaS', text: 'CloudOps Ltd — 35 employees, develops cloud monitoring SaaS for financial services clients, UK-based, subject to ISO 27001 and FCA guidance' },
      { sector: 'Food & Beverage', text: 'FreshBake Co — 60 employees, produces gluten-free baked goods for UK supermarket chains, subject to BRC Food Safety and allergen regulations' },
      { sector: 'Healthcare / Medical', text: 'MedDevice Ltd — 200 employees, manufactures Class II diagnostic devices for EU and US markets, subject to MDR 2017/745 and FDA 21 CFR Part 820' },
    ]
  },
  'ISO 9001:2015 Cl.4.2': {
    what: 'What the AI will generate',
    outputs: ['Stakeholder name / group', 'Category (Customer / Regulator / Supplier / Employee etc.)', 'Their needs and expectations', 'Relevance rating (High / Medium / Low)', 'Review date'],
    guidance: 'ISO 9001 Cl.4.2 requires identification of interested parties relevant to the QMS and their requirements. Minimum: customers, regulators, key suppliers, employees. Review periodically.',
    examples: [
      { sector: 'Manufacturing', text: 'Bosch Automotive — 80 employees, makes injection-moulded plastic parts for Tier 1 suppliers, customers are IATF-certified OEM supply chains, key regulator is HSE' },
      { sector: 'Construction', text: 'BuildRight Ltd — 150 employees, main contractor for commercial fit-outs, customers are property developers, regulated by Building Control and CDM 2015' },
      { sector: 'Professional Services', text: 'LexConsult LLP — 45 staff, provides legal advisory services to SMEs and local authorities, regulated by SRA, subject to GDPR' },
      { sector: 'Logistics', text: 'FastFreight Ltd — 300 employees, ambient temperature road haulage across UK and Ireland, customers are FMCG brands, regulated by DVSA and RHA standards' },
    ]
  },
  'ISO 9001:2015 Cl.5.2': {
    what: 'What the AI will generate',
    outputs: ['Quality policy statement (max 150 words)', 'Version number (1.0 DRAFT)'],
    guidance: "ISO 9001 Cl.5.2 requires a policy appropriate to the organisation's purpose, including commitment to customer requirements, continual improvement, and a framework for quality objectives. Must be communicated and available.",
    examples: [
      { sector: 'Electronics', text: 'CircuitCo Ltd — 90 employees, designs and assembles PCBs for telecoms equipment, customers are network infrastructure OEMs, certified ISO 9001, pursuing IPC-A-610' },
      { sector: 'Education / Training', text: 'SkillsFirst Academy — 25 staff, delivers vocational training to apprentices and corporate learners, regulated by Ofsted and ESFA, funded partly by government' },
      { sector: 'Oil & Gas Services', text: 'SafeDrilling Ltd — 180 employees, provides wellbore inspection services offshore, clients are major oil operators, subject to OPITO and OGUK standards' },
      { sector: 'Retail / E-commerce', text: 'HomeFit UK — 55 employees, online retailer of home improvement products, sells B2C via own site and marketplaces, subject to Consumer Rights Act and returns regulations' },
    ]
  },
  'ISO 9001:2015 Cl.6.2': {
    what: 'What the AI will generate',
    outputs: ['SMART quality objective statement', 'Measurement method', 'Target (shown as [SAMPLE] — you must set real numbers)', 'Responsible role', 'Due date', 'Process area', 'Status'],
    guidance: 'ISO 9001 Cl.6.2 requires quality objectives to be measurable, monitored, communicated, and updated. Must be consistent with the quality policy. Minimum: customer satisfaction, product conformity, process performance.',
    examples: [
      { sector: 'Aerospace', text: 'AeroFab Ltd — 70 employees, manufactures structural aircraft components, AS9100 certified, customers are prime contractors, subject to EASA Part 21' },
      { sector: 'Pharma / Life Sciences', text: 'BioProcess Ltd — 250 employees, contract manufacturer of pharmaceutical intermediates, GMP regulated, FDA and EMA submissions, ISO 9001 and ISO 13485' },
      { sector: 'FM / Facilities', text: 'ClearSpace FM — 400 employees, provides cleaning and maintenance services to NHS trusts and local authorities, subject to NHS procurement standards and COSHH' },
      { sector: 'Engineering Consultancy', text: 'StructEng Ltd — 30 staff, structural engineering consultancy for residential and commercial developers, subject to Building Regulations Approved Documents' },
    ]
  },
  'ISO 9001:2015 Cl.6.3': {
    what: 'What the AI will generate',
    outputs: ['Change description', 'Reason for change', 'Impact on QMS integrity', 'Responsible role', 'Planned date', 'Status'],
    guidance: 'ISO 9001 Cl.6.3 requires planned changes to be carried out in a controlled manner, with consideration of purpose, integrity of the QMS, resource availability, and responsibility allocation.',
    examples: [
      { sector: 'General Manufacturing', text: 'PrecisionParts Ltd — 100 employees, general engineering subcontractor, implementing ISO 9001 for the first time, currently uses informal quality checks only' },
      { sector: 'IT Services / MSP', text: 'NetManage Ltd — 45 staff, managed IT services provider for SME clients, implementing ISO 9001 alongside Cyber Essentials Plus, ITIL-based service desk' },
      { sector: 'Chemical Distribution', text: 'ChemDist UK — 80 employees, distributes industrial chemicals, subject to REACH, CLP, and ADR regulations, implementing QMS to meet customer audit requirements' },
      { sector: 'Architecture / Design', text: 'DesignForm LLP — 20 staff, architectural practice for residential and mixed-use developments, regulated by ARB, implementing QMS for RIBA QMS accreditation' },
    ]
  },
  'ISO 9001:2015 Cl.7.2': {
    what: 'What the AI will generate',
    outputs: ['Role title (no real names)', 'Function / department', 'Competence required', 'Evidence type (not fabricated credentials)', 'Gap (if known)', 'Training action', 'Review date'],
    guidance: 'ISO 9001 Cl.7.2 requires determination of necessary competence for persons affecting quality performance, ensuring they are competent (education, training, experience), and retaining evidence.',
    examples: [
      { sector: 'Automotive Supply Chain', text: 'TrimTech Ltd — 200 employees, interior trim components for automotive OEMs, IATF 16949 pursuing, key roles: Quality Manager, Process Engineers, Production Operators, Internal Auditors' },
      { sector: 'Defence', text: 'SecureSystems Ltd — 500 employees, electronic defence systems integrator, AS9100 and AQAP 2110 certified, SC-cleared engineering and programme management staff' },
      { sector: 'NHS / Healthcare', text: 'CareGroup NHS Trust — 2000 staff, community healthcare services, CQC regulated, key roles: Clinical Quality Lead, IG Officer, Safeguarding Leads, Admin Managers' },
      { sector: 'Publishing / Media', text: 'ContentFirst Ltd — 18 staff, B2B content marketing agency, key roles: Editorial Director, Account Managers, Designers, Digital Analysts, QMS Coordinator' },
    ]
  },
  'ISO 9001:2015 Cl.7.5': {
    what: 'What the AI will generate',
    outputs: ['Document reference (e.g. QP-001)', 'Title', 'Type (Procedure / Policy / Work Instruction / Form / Record)', 'Version (1.0 DRAFT)', 'Owner role', 'Review date', 'Status (Draft)'],
    guidance: 'ISO 9001 Cl.7.5 requires documented information required by the standard plus that determined necessary by the organisation. Mandatory: scope, policy, objectives, process control documents, calibration records, competence evidence, NC and CAPA records.',
    examples: [
      { sector: 'Printing / Packaging', text: 'PackPrint Ltd — 75 employees, commercial printing and packaging for retail brands, Sedex member, FSC certified, implementing QMS for retailer audits' },
      { sector: 'Agriculture / Food Processing', text: 'FreshFields Ltd — 120 employees, fresh produce packing for major supermarkets, Red Tractor certified, implementing ISO 9001 alongside SALSA food safety' },
      { sector: 'Security Services', text: 'GuardForce Ltd — 600 employees, manned guarding and CCTV monitoring for commercial properties, SIA licensed, implementing QMS for NHS and government contracts' },
      { sector: 'Marine / Offshore', text: 'MarineOps Ltd — 90 employees, offshore vessel operations and crew management, MCA and flag state regulated, ISM Code certified, ISO 9001 for shore-based QMS' },
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

export default function QMSAIGenerator({ clause, systemPrompt, requiredFields = [], placeholder, onGenerated }) {
  const [input, setInput] = useState('')
  const [ctx, setCtx] = useState({name:'',industry:'',products:'',size:'',customers:'',regulations:'',extra:''})
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState([])
  const [open, setOpen] = useState(true)
  const toast = useToast()

  const generate = async () => {
    if (!ctx.name.trim() || !ctx.industry.trim() || !ctx.products.trim()) {
      toast('Please fill in organisation name, industry and products/services', 'error'); return
    }
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
        setErrors(['Please fill in more detail — at minimum: organisation name, industry, and products/services. The more context you provide, the more relevant the AI output will be.'])
        setLoading(false); return
      }
      const { records, errors: errs } = validateJSON(raw, requiredFields)
      if (errs.length) { setErrors(errs); setLoading(false); return }
      setDraft(records)
    } catch (e) { setErrors([e.message]) }
    setLoading(false)
  }

  const confirm = () => {
    const stamped = draft.map(r => ({ ...r, ai_generated: true, status: r.status || 'Draft' }))
    onGenerated(stamped)
    setDraft(null); setInput('')
    setCtx({name:'',industry:'',products:'',size:'',customers:'',regulations:'',extra:''})
    toast('AI draft loaded — review and save to confirm')
  }

  return (
    <div className="border border-navy-700 rounded-xl mb-4 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-navy-800 text-left hover:bg-navy-700 transition-colors">
        <Sparkles size={14} className="text-amber-audit" />
        <span className="text-sm font-medium text-white">AI Draft Generator — {clause}</span>
        <span className="ml-auto text-xs text-steel-500">All output is DRAFT — human review required</span>
        {open ? <ChevronUp size={13} className="text-steel-500" /> : <ChevronDown size={13} className="text-steel-500" />}
      </button>

      {open && (
        <div className="p-4 bg-navy-900">
          <div className="flex gap-4">
          {/* LEFT — input fields */}
          <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-steel-400 mb-1">Organisation name <span className="text-red-400">*</span></label>
              <input maxLength={100} value={ctx.name} onChange={e => setCtx(c=>({...c,name:e.target.value}))} placeholder="e.g. Acme Manufacturing Ltd" className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Industry / sector <span className="text-red-400">*</span></label>
              <input maxLength={100} value={ctx.industry} onChange={e => setCtx(c=>({...c,industry:e.target.value}))} placeholder="e.g. Automotive components" className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Products / services <span className="text-red-400">*</span></label>
              <input maxLength={200} value={ctx.products} onChange={e => setCtx(c=>({...c,products:e.target.value}))} placeholder="e.g. Precision machined parts for OEMs" className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Organisation size</label>
              <select value={ctx.size} onChange={e => setCtx(c=>({...c,size:e.target.value}))} className="input-field w-full text-sm">
                <option value="">Select...</option>
                <option>1–10 employees</option>
                <option>11–50 employees</option>
                <option>51–250 employees</option>
                <option>251–1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Key customers / markets</label>
              <input maxLength={200} value={ctx.customers} onChange={e => setCtx(c=>({...c,customers:e.target.value}))} placeholder="e.g. Tier 1 automotive OEMs, EU market" className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Key regulations / standards</label>
              <input maxLength={200} value={ctx.regulations} onChange={e => setCtx(c=>({...c,regulations:e.target.value}))} placeholder="e.g. ISO 9001, IATF 16949, REACH" className="input-field w-full text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-steel-400 mb-1">Additional context (optional)</label>
            <textarea maxLength={500} value={ctx.extra} onChange={e => setCtx(c=>({...c,extra:e.target.value}))} placeholder="Key processes, locations, known challenges, current certifications..." className="input-field w-full h-16 text-sm resize-none" />
          </div>
          </div>{/* end input col */}

          {/* RIGHT — reference panel */}
          {(() => {
            const ref = CLAUSE_REFS[clause]
            if (!ref) return null
            return (
              <div className="w-72 flex-shrink-0 space-y-3 text-xs">
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <Lightbulb size={12} /> {ref.what}
                  </div>
                  <ul className="space-y-1">
                    {ref.outputs.map((o,i) => (
                      <li key={i} className="flex items-start gap-1.5 text-steel-400">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <BookOpen size={12} /> ISO Guidance
                  </div>
                  <p className="text-steel-400 leading-relaxed">{ref.guidance}</p>
                </div>
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium">
                    <Sparkles size={12} /> Example inputs by sector
                  </div>
                  <div className="space-y-2">
                    {ref.examples.map((ex,i) => (
                      <button key={i} onClick={() => {
                        const parts = ex.text.split(' — ')
                        if (parts.length >= 2) {
                          const name = parts[0].trim()
                          const rest = parts.slice(1).join(' — ')
                          setCtx(c => ({...c, name, extra: rest}))
                        }
                      }}
                        className="w-full text-left border border-navy-600 hover:border-amber-800/50 rounded-lg p-2 transition-colors group">
                        <div className="text-amber-audit/80 font-medium mb-0.5 group-hover:text-amber-audit">{ex.sector}</div>
                        <div className="text-steel-500 leading-relaxed line-clamp-3">{ex.text}</div>
                        <div className="text-steel-600 mt-1 group-hover:text-steel-400">↑ Click to prefill</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
          </div>{/* end flex row */}

          <div className="flex gap-2">
            <button onClick={generate} disabled={loading || !input.trim()}
              className="btn-primary text-sm flex items-center gap-2">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {loading ? 'Generating...' : 'Generate draft'}
            </button>
            {draft && (
              <button onClick={confirm} className="btn-secondary text-sm flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" /> Load {draft.length} record{draft.length > 1 ? 's' : ''} for review
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
              ⚠ {draft.length} draft record{draft.length > 1 ? 's' : ''} generated. Click "Load for review" then edit and save to confirm. AI output is never saved automatically.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
