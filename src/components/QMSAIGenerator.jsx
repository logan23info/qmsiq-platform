import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react'
import { useToast } from './Toast'

// ─── Reference data — ISO 9001:2015 structure + Indian market examples ────────
// Source: ISO 9001:2015 clause structure (no text reproduced verbatim)
// Examples: Indian industry sectors — generic, no fabricated financials or named clients
const CLAUSE_REFS = {
  'ISO 9001:2015 Cl.4.1–4.3': {
    outputs: ['Internal issues — SWOT internal factors specific to your organisation','External issues — PESTLE factors specific to your industry and market','QMS scope — products, services and sites covered','Justified exclusions (Cl.8 only, if applicable)'],
    guidance: 'Cl.4.1 requires identification of internal and external issues relevant to your strategic direction. Cl.4.3 requires the scope to state what the QMS covers and justify any Cl.8 exclusions.',
    fields: {
      name: 'Your registered company name — appears in the scope statement.',
      industry: 'Your sector — e.g. Automotive components, IT services, Pharmaceuticals, Food processing.',
      products: 'Be specific — e.g. "Forged steel components for passenger vehicle OEMs" not just "auto parts".',
      size: 'Employee count affects the scale and nature of internal issues.',
      customers: 'Name customer types and markets — e.g. "Maruti Suzuki Tier 1 supply chain, domestic and export".',
      regulations: 'List all applicable standards — e.g. IATF 16949, Schedule M GMP, FSSAI, BIS, ISO 27001.',
      extra: 'Key sites, current certifications, known risks, outsourced processes, strategic goals.',
    },
    examples: [
      { sector: 'Auto Components', name: 'Bharat Precision Parts Pvt Ltd', industry: 'Automotive components manufacturing', products: 'Forged and machined steel components for passenger vehicle OEMs', size: '251–1000 employees', customers: 'Maruti Suzuki, Tata Motors, Mahindra — Tier 1 OEM supply chain, domestic', regulations: 'IATF 16949, AIS standards, BIS, MSIL supplier requirements', extra: 'Plants in Pune and Chennai, IATF certified, pursuing ISO 14001, MSME registered' },
      { sector: 'IT / Software Services', name: 'IndiaTech Solutions Pvt Ltd', industry: 'IT services and software development', products: 'Custom software development and managed IT services for BFSI sector', size: '51–250 employees', customers: 'Indian banks, NBFCs, insurance companies', regulations: 'ISO 27001, RBI IT guidelines, SEBI cyber security framework, GDPR for international clients', extra: 'Offices in Bengaluru and Hyderabad, STPI registered, implementing QMS for CMMI Level 3 alignment' },
      { sector: 'Pharmaceuticals', name: 'Dhanvantari Formulations Pvt Ltd', industry: 'Pharmaceutical manufacturing', products: 'Generic oral solid dosage forms — tablets and capsules for domestic and export markets', size: '251–1000 employees', customers: 'Indian hospital chains, government tender NPMOC, WHO prequalification markets', regulations: 'Schedule M GMP, CDSCO, WHO-GMP, US FDA 21 CFR Part 211', extra: 'Plant in Baddi, WHO-GMP certified, USFDA filing in progress, export to Africa and ASEAN' },
      { sector: 'Food Processing', name: 'Annapurna Agro Foods Pvt Ltd', industry: 'Food processing and packaging', products: 'Packaged spices, ready-to-cook mixes and rice for retail and institutional buyers', size: '11–50 employees', customers: 'Modern trade retail chains, QSRs, export to Middle East', regulations: 'FSSAI, Food Safety and Standards Act, APEDA for exports, Halal certification', extra: 'Unit in Rajkot, FSSAI licensed, implementing QMS for large retail buyer audit requirement' },
    ]
  },
  'ISO 9001:2015 Cl.4.2': {
    outputs: ['Stakeholder name / group','Category (Customer / Regulator / Supplier / Employee / Other)','Their needs and expectations relevant to quality','Relevance rating (High / Medium / Low)','Suggested review date'],
    guidance: 'Cl.4.2 requires identification of interested parties relevant to the QMS and their specific requirements. Minimum: customers, regulators, key suppliers, employees. Must be reviewed periodically.',
    fields: {
      name: 'Organisation name — used to frame stakeholder relationships.',
      industry: 'Your sector determines which regulators and industry bodies are relevant.',
      products: 'What you supply determines who your customers and key suppliers are.',
      size: 'Headcount affects employee representative bodies and governance.',
      customers: 'Name customer types specifically — e.g. "State PWDs, NHAI contractors, private developers".',
      regulations: 'Regulators are key interested parties — list all bodies with authority over your operations.',
      extra: 'Ownership (promoter / PE / listed), trade association memberships, community dependencies, subcontractors.',
    },
    examples: [
      { sector: 'Engineering Services', name: 'Techno Build Engineers Pvt Ltd', industry: 'Civil and structural engineering consultancy', products: 'Structural design, project management and site supervision for infrastructure projects', size: '11–50 employees', customers: 'State PWDs, NHAI contractors, private real estate developers', regulations: 'BIS codes IS 456 and IS 800, MoRTH specifications, EIA requirements, RERA', extra: 'Mumbai-based, empanelled with CPWD and NMMC, implementing QMS for government contract eligibility' },
      { sector: 'Textile / Garment Export', name: 'Kusum Garments Pvt Ltd', industry: 'Garment manufacturing and export', products: 'Ready-made woven shirts and trousers for European fashion brands', size: '251–1000 employees', customers: 'European fashion retail buyers, export through buying agents', regulations: 'OEKO-TEX, REACH for EU exports, SEDEX, Customs and DGFT norms', extra: 'Unit in Tirupur, SEDEX member, WRAP certified, implementing ISO 9001 for buyer audit compliance' },
      { sector: 'Fintech / BFSI', name: 'PaySwift Fintech Pvt Ltd', industry: 'Payment technology and digital lending', products: 'UPI payment gateway and BNPL platform for retail merchants and NBFCs', size: '51–250 employees', customers: 'Retail merchants, NBFCs, co-operative banks', regulations: 'RBI Payment Aggregator guidelines, PCI DSS, IT Act 2000, DPDP Act 2023', extra: 'Bengaluru HQ, RBI PA licence applied, ISO 27001 in progress, implementing QMS for NBFC partner requirements' },
    ]
  },
  'ISO 9001:2015 Cl.5.2': {
    outputs: ['Quality policy statement (max 150 words, referencing customer focus, continual improvement and compliance)','Version number — shown as 1.0 DRAFT (you must add approval details)'],
    guidance: 'Cl.5.2 requires a quality policy appropriate to the organisation\'s purpose, committing to applicable requirements and continual improvement. Must be communicated internally and available to interested parties.',
    fields: {
      name: 'Your organisation name — must appear in the policy statement.',
      industry: 'Sector context shapes quality commitments and regulatory references.',
      products: 'The policy must reference your products and services.',
      size: 'Governance language differs for SMEs vs large enterprises.',
      customers: 'Customer focus is a core commitment — name your customer types.',
      regulations: 'Regulatory compliance must be referenced if sector-specific standards apply.',
      extra: 'Quality values, customer satisfaction commitments, certification goals, ethical commitments.',
    },
    examples: [
      { sector: 'Construction', name: 'Nirman Build Infra Pvt Ltd', industry: 'Construction and infrastructure', products: 'Residential housing projects and commercial build-outs', size: '51–250 employees', customers: 'Private real estate developers, MHADA, state housing boards', regulations: 'NBC 2016, BIS codes, RERA, EIA clearance, labour welfare board', extra: 'Operations in Maharashtra and Gujarat, RERA registered, implementing QMS for ISO certification for large project bids' },
      { sector: 'Healthcare / Hospital', name: 'Aarogya Healthcare Pvt Ltd', industry: 'Multi-specialty hospital services', products: 'Inpatient, outpatient and diagnostic services across general medicine and surgery', size: '251–1000 employees', customers: 'Private patients, corporate health insurance empanelment, Ayushman Bharat panel', regulations: 'Clinical Establishments Act, NABH standards, PCPNDT, Biomedical Waste Rules', extra: '120-bed hospital in Nagpur, NABH entry level certified, implementing QMS as foundation for full NABH accreditation' },
    ]
  },
  'ISO 9001:2015 Cl.6.2': {
    outputs: ['SMART objective statement','Measurement method','Target — shown as [SAMPLE X%] — you must replace with real numbers','Responsible role','Due date','Process area','Status (On Track)'],
    guidance: 'Cl.6.2 requires quality objectives to be measurable, monitored, communicated and updated. Must be consistent with the quality policy. Minimum coverage: customer satisfaction, product conformity, process efficiency, improvement.',
    fields: {
      name: 'Organisation name.',
      industry: 'Industry drives which process areas and KPIs are relevant.',
      products: 'Objectives must relate to your specific products and services.',
      size: 'Scale affects which processes and measurement methods are practical.',
      customers: 'Customer satisfaction objectives should reflect your customer type and expectations.',
      regulations: 'Regulatory compliance may mandate specific measurable objectives.',
      extra: 'Current performance gaps, strategic priorities, known weak areas, recent audit findings.',
    },
    examples: [
      { sector: 'Logistics / 3PL', name: 'SwiftMove Logistics Pvt Ltd', industry: 'Third-party logistics and warehousing', products: 'Pan-India road freight FTL/LTL and contract warehousing for e-commerce and FMCG', size: '251–1000 employees', customers: 'D2C e-commerce brands, FMCG distributors, pharma cold chain clients', regulations: 'Motor Vehicles Act, GST e-way bill, FSSAI for food logistics, ADG rules for hazmat', extra: 'Fleet of 150 vehicles, 8 warehouses, implementing QMS for large FMCG contract requirement' },
      { sector: 'EdTech / Education', name: 'Vidya EdTech Pvt Ltd', industry: 'Online education and skill development', products: 'K-12 tutoring, JEE/NEET/UPSC exam prep and corporate upskilling programmes', size: '51–250 employees', customers: 'Individual students, schools, NSDC programme participants', regulations: 'NEP 2020 guidelines, NSDC norms, UGC online education guidelines, DPDP Act for student data', extra: 'Headquartered in Delhi, NSDC partner, implementing QMS for B2B school and corporate contracts' },
    ]
  },
  'ISO 9001:2015 Cl.6.3': {
    outputs: ['Change description','Reason for the change','Impact on QMS integrity','Responsible role','Planned implementation date','Status (Planned)'],
    guidance: 'Cl.6.3 requires planned QMS changes to be carried out in a controlled manner, considering purpose, consequences for QMS integrity, resource availability and responsibility allocation.',
    fields: {
      name: 'Organisation name.',
      industry: 'Industry context determines the most common QMS change types.',
      products: 'Changes often relate to product or process changes — describe outputs specifically.',
      size: 'Larger organisations have more formal change control; smaller ones more informal.',
      customers: 'Customer-driven changes are common — note key customer-imposed requirements.',
      regulations: 'Regulatory changes often trigger mandatory QMS updates.',
      extra: 'Planned process changes, new product lines, ERP or system implementation, site additions.',
    },
    examples: [
      { sector: 'Metal Fabrication', name: 'Aggarwal Fabricators Pvt Ltd', industry: 'Sheet metal fabrication and precision engineering', products: 'Sheet metal components, enclosures and assemblies for electrical and telecom OEMs', size: '51–250 employees', customers: 'Electrical panel OEMs, telecom equipment manufacturers, defence PSUs', regulations: 'BIS, ISO 9001 implementing first time, defence DGQA requirements for some clients', extra: 'Plant in Faridabad, implementing QMS in response to OEM audit requirement, currently uses informal inspection records only' },
      { sector: 'Specialty Chemicals', name: 'Chemovate Industries Pvt Ltd', industry: 'Specialty chemical manufacturing', products: 'Specialty surfactants and industrial cleaning chemicals for FMCG and textile industries', size: '11–50 employees', customers: 'FMCG manufacturers, textile processing units, institutional cleaning companies', regulations: 'Factories Act, Hazardous Waste Rules, BIS, REACH for export, IS standards', extra: 'Unit in Vapi GIDC, implementing QMS for FMCG buyer approval, MSME, no current certification' },
    ]
  },
  'ISO 9001:2015 Cl.7.2': {
    outputs: ['Role title — no real names','Function / department','Competence required','Evidence type — e.g. certificate, qualification, experience record (not fabricated credentials)','Gap if applicable','Training action to close gap','Review date'],
    guidance: 'Cl.7.2 requires determination of necessary competence, acquisition of competence where gaps exist, and retention of appropriate documented evidence. Competence = education + training + experience.',
    fields: {
      name: 'Organisation name.',
      industry: 'Sector determines which qualifications and regulatory competences are mandatory.',
      products: 'Products and services drive process-specific competence requirements.',
      size: 'Number of specialist roles and depth of functional specialisation.',
      customers: 'Customer or client requirements may specify mandatory competence standards.',
      regulations: 'List regulated roles — e.g. NDT Level 2, DQA Liaison, CDSCO-qualified QC, NABH-qualified nurses.',
      extra: 'List key roles involved in quality — QC Manager, Process Engineers, Operators, Internal Auditors, Lab Analysts.',
    },
    examples: [
      { sector: 'Defence / Aerospace', name: 'Raksha Aeroparts Pvt Ltd', industry: 'Aerospace and defence components', products: 'Precision machined and fabricated components for DRDO, HAL and private aerospace OEMs', size: '51–250 employees', customers: 'HAL, BEL, DRDO, private aerospace Tier 1 contractors under Make in India', regulations: 'AS9100 Rev D, DGQA, CEMILAC approvals, BIS, ITAR for some export parts', extra: 'Plant in Bangalore aerospace SEZ, AS9100 certified, key roles: Quality Manager, NDT Level 2 Inspectors, CNC Operators, DQA Liaison' },
      { sector: 'FMCG Distribution', name: 'Shree Distributors Pvt Ltd', industry: 'FMCG wholesale distribution', products: 'Distribution of FMCG, personal care and packaged food products across tier 2 and 3 markets', size: '11–50 employees', customers: 'Kirana stores, small supermarkets, institutional buyers in 3 districts', regulations: 'FSSAI for food products, GST compliance, Legal Metrology Act', extra: 'Based in Indore, implementing QMS for FMCG principal audit requirement, key roles: Warehouse Manager, Sales Officers, Accounts Manager' },
    ]
  },
  'ISO 9001:2015 Cl.7.5': {
    outputs: ['Document reference — e.g. QP-001 for procedures, QF-001 for forms','Document title','Type: Procedure / Policy / Work Instruction / Form / Record','Version — shown as 1.0 DRAFT','Owner role','Review date','Status (Draft)'],
    guidance: 'Cl.7.5 requires documented information mandated by the standard plus that determined necessary by the organisation. Mandatory: scope, quality policy, objectives evidence, calibration records, competence evidence, NC and CAPA records.',
    fields: {
      name: 'Organisation name — used in document headers and references.',
      industry: 'Industry drives which documents are mandatory beyond ISO 9001 baseline.',
      products: 'Process-specific work instructions and test specifications relate to your products.',
      size: 'Larger organisations need more formal document hierarchies and control registers.',
      customers: 'Customer-specific quality plans or FAI reports may need separate document types.',
      regulations: 'Regulatory requirements often mandate specific documented procedures — list all.',
      extra: 'Existing documents already in use, preferred numbering format, regulatory-specific document needs.',
    },
    examples: [
      { sector: 'Printing / Packaging', name: 'Madhur Print Pack Pvt Ltd', industry: 'Commercial printing and flexible packaging', products: 'Flexible packaging laminates and printed cartons for pharma and FMCG packaging', size: '51–250 employees', customers: 'Pharma companies, FMCG brands, food packaging buyers', regulations: 'BIS IS 2062, Food Contact Material regulations, FSSAI food packaging norms, CPCB plastic rules', extra: 'Plant in Silvassa, FSC certified, implementing ISO 9001 for pharma customer approval, existing SOPs need formalisation' },
      { sector: 'Electronics / EMS', name: 'DigitronICS Pvt Ltd', industry: 'Electronics manufacturing services', products: 'PCB assembly, box-build and electronics testing for industrial and IoT OEMs', size: '51–250 employees', customers: 'Industrial electronics OEMs, smart meter manufacturers, IoT device companies', regulations: 'BIS CRS registration, RoHS, e-Waste Management Rules, BEE energy labelling', extra: 'Unit in Noida SEZ, BIS CRS compliant, implementing QMS for Tier 1 OEM audit qualification' },
    ]
  },
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const EMPTY_CTX = { name: '', industry: '', products: '', size: '', customers: '', regulations: '', extra: '' }

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
    // Strip markdown fences and any preamble/postamble text
    let text = raw.replace(/```json|```/g, '').trim()
    // Extract JSON array or object — find first [ or { 
    const arrStart = text.indexOf('[')
    const objStart = text.indexOf('{')
    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      text = text.slice(arrStart, text.lastIndexOf(']') + 1)
    } else if (objStart !== -1) {
      text = text.slice(objStart, text.lastIndexOf('}') + 1)
    }
    // Attempt repair if array is truncated mid-stream
    if (text.startsWith('[') && !text.trim().endsWith(']')) {
      const lastComma = text.lastIndexOf(',')
      const lastBrace = text.lastIndexOf('}')
      if (lastBrace > lastComma) {
        text = text.slice(0, lastBrace + 1) + ']'
      } else {
        text = text.slice(0, lastComma) + ']'
      }
    }
    const parsed = JSON.parse(text)
    const records = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    records.forEach((r, i) => requiredFields.forEach(f => {
      if (!r[f] || String(r[f]).trim() === '') errors.push(`Record ${i + 1}: missing "${f}"`)
    }))
    return { records, errors }
  } catch {
    return { records: [], errors: ['AI returned invalid JSON — please retry'] }
  }
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1">
      {hint && <p className="text-xs text-steel-600 italic leading-relaxed break-words">{hint}</p>}
      <label className="block text-xs font-medium text-steel-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function QMSAIGenerator({ clause, systemPrompt, requiredFields = [], onGenerated, priorContext, orgProfile, onContextChange }) {
  const [ctx, setCtx] = useState(EMPTY_CTX)
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState([])
  const [open, setOpen] = useState(true)
  const toast = useToast()
  const ref = CLAUSE_REFS[clause]
  // Pre-fill from Cl.4.1 org profile when available
  // Pre-fill from Cl.4.1 org profile when it loads — only if user hasn't typed yet
  useEffect(() => {
    if (orgProfile && orgProfile.name && !ctx.name) {
      setCtx(orgProfile)
    }
  }, [orgProfile])

  const set = (k, v) => { setCtx(c => { const next = { ...c, [k]: v }; onContextChange?.(next); return next }) }
  const isReady = ctx.name.trim() && ctx.industry.trim() && ctx.products.trim()

  const generate = async () => {
    if (!isReady) { toast('Fill in name, industry and products/services first', 'error'); return }
    const contextBlock = priorContext ? `\n\n[PRIOR CONTEXT FROM EARLIER CLAUSES — use this to ensure consistency]\n${priorContext}` : ''
    const built = [
      `Organisation: ${ctx.name}`,
      `Industry: ${ctx.industry}`,
      `Products/services: ${ctx.products}`,
      ctx.size && `Size: ${ctx.size}`,
      ctx.customers && `Key customers/markets: ${ctx.customers}`,
      ctx.regulations && `Key regulations/standards: ${ctx.regulations}`,
      ctx.extra && `Additional context: ${ctx.extra}`,
    ].filter(Boolean).join('\n') + contextBlock
    setLoading(true); setDraft(null); setErrors([])
    try {
      const raw = await callEdge(systemPrompt, built)
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

  return (
    <div className="border border-navy-700 rounded-xl mb-4 overflow-hidden">

      {/* ── Header ── */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-navy-800 text-left hover:bg-navy-700 transition-colors">
        <Sparkles size={14} className="text-amber-audit" />
        <span className="text-sm font-medium text-white">AI Draft Generator — {clause}</span>
        <span className="ml-auto text-xs text-steel-500 mr-2">Output is DRAFT — human review required</span>
        {priorContext && <span className="text-xs text-emerald-600 mr-2" title="Prior clause data loaded as context">● Prior context loaded</span>}
        {orgProfile?.name && <span className="text-xs text-blue-400 mr-2" title="Organisation profile pre-filled from Cl.4.1">● Org profile pre-filled</span>}
        {open ? <ChevronUp size={13} className="text-steel-500" /> : <ChevronDown size={13} className="text-steel-500" />}
      </button>

      {open && (
        <div className="bg-navy-900 p-5">
          <div className="flex gap-5">

            {/* ── LEFT: input form ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">

              {/* Row 1: name + industry */}
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <Field label="Organisation name" required hint={ref?.fields?.name}>
                  <input maxLength={100} value={ctx.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Bharat Precision Parts Pvt Ltd"
                    className="input-field w-full text-sm" />
                </Field>
                <Field label="Industry / sector" required hint={ref?.fields?.industry}>
                  <input maxLength={100} value={ctx.industry} onChange={e => set('industry', e.target.value)}
                    placeholder="e.g. Automotive components manufacturing"
                    className="input-field w-full text-sm" />
                </Field>
              </div>

              {/* Row 2: products full width */}
              <Field label="Products / services" required hint={ref?.fields?.products}>
                <input maxLength={300} value={ctx.products} onChange={e => set('products', e.target.value)}
                  placeholder="e.g. Forged and machined steel components for passenger vehicle OEMs"
                  className="input-field w-full text-sm" />
              </Field>

              {/* Row 3: size + customers */}
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <Field label="Organisation size" hint={ref?.fields?.size}>
                  <select value={ctx.size} onChange={e => set('size', e.target.value)}
                    className="input-field w-full text-sm">
                    <option value="">Select...</option>
                    <option>1–10 employees</option>
                    <option>11–50 employees</option>
                    <option>51–250 employees</option>
                    <option>251–1000 employees</option>
                    <option>1000+ employees</option>
                  </select>
                </Field>
                <Field label="Key customers / markets" hint={ref?.fields?.customers}>
                  <input maxLength={200} value={ctx.customers} onChange={e => set('customers', e.target.value)}
                    placeholder="e.g. Maruti Suzuki Tier 1 supply chain, domestic"
                    className="input-field w-full text-sm" />
                </Field>
              </div>

              {/* Row 4: regulations full width */}
              <Field label="Applicable regulations / standards" hint={ref?.fields?.regulations}>
                <input maxLength={200} value={ctx.regulations} onChange={e => set('regulations', e.target.value)}
                  placeholder="e.g. IATF 16949, Schedule M GMP, FSSAI, BIS, ISO 27001"
                  className="input-field w-full text-sm" />
              </Field>

              {/* Row 5: additional context textarea — taller */}
              <Field label="Additional context" hint={ref?.fields?.extra}>
                <textarea maxLength={600} value={ctx.extra} onChange={e => set('extra', e.target.value)}
                  placeholder="Sites, certifications, known risks, key processes, strategic priorities, existing documents..."
                  className="input-field w-full text-sm resize-none h-28" />
              </Field>

              {/* ── Action row ── */}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={generate} disabled={loading || !isReady}
                  className={`btn-primary text-sm flex items-center gap-2 ${!isReady ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {loading ? 'Generating...' : 'Generate draft'}
                </button>
                {!isReady && !loading && (
                  <span className="text-xs text-steel-600 italic">Complete name, industry and products to enable</span>
                )}
                {draft && (
                  <button onClick={confirm} className="btn-secondary text-sm flex items-center gap-2 ml-auto">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Load {draft.length} record{draft.length > 1 ? 's' : ''} for review
                  </button>
                )}
              </div>

              {/* ── Error / draft notice ── */}
              {errors.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                  <div>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>
                </div>
              )}
              {draft && (
                <div className="text-xs text-amber-audit bg-amber-900/20 border border-amber-800/40 rounded-lg p-3">
                  ⚠ {draft.length} draft record{draft.length > 1 ? 's' : ''} generated. Click "Load for review", edit, then save. AI output is never saved automatically.
                </div>
              )}
            </div>

            {/* ── RIGHT: reference panel ── */}
            {ref && (
              <div className="w-72 flex-shrink-0 flex flex-col gap-3 self-start text-xs">

                {/* What AI generates */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium mb-2">
                    <Lightbulb size={12} /> What the AI generates
                  </div>
                  <ul className="space-y-1.5">
                    {ref.outputs.map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-steel-400 leading-relaxed">
                        <span className="text-emerald-500 flex-shrink-0">✓</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ISO requirement */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium mb-2">
                    <BookOpen size={12} /> ISO 9001 requirement
                  </div>
                  <p className="text-steel-400 leading-relaxed">{ref.guidance}</p>
                </div>

                {/* Indian sector examples */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-amber-audit font-medium mb-1">
                    <Sparkles size={12} /> Indian sector examples
                  </div>
                  <p className="text-steel-600 italic leading-relaxed mb-2">Click to prefill all fields — then customise for your organisation.</p>
                  <div className="space-y-2">
                    {ref.examples.map((ex, i) => (
                      <button key={i}
                        onClick={() => setCtx({ name: ex.name, industry: ex.industry, products: ex.products, size: ex.size || '', customers: ex.customers || '', regulations: ex.regulations || '', extra: ex.extra || '' })}
                        className="w-full text-left border border-navy-600 hover:border-amber-800/50 bg-navy-900/50 hover:bg-navy-700/50 rounded-lg px-2.5 py-2 transition-colors group">
                        <div className="text-amber-audit/80 font-medium group-hover:text-amber-audit mb-0.5 text-xs">{ex.sector}</div>
                        <div className="text-steel-500 leading-relaxed line-clamp-2 text-xs">{ex.name} — {ex.industry}</div>
                        <div className="text-steel-600 text-xs mt-0.5 group-hover:text-steel-400">↑ Click to prefill</div>
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
