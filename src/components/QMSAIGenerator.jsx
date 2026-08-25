import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from './Toast'

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
        <div className="p-4 bg-navy-900 space-y-3">
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
