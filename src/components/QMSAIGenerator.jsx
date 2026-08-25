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
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState([])
  const [open, setOpen] = useState(true)
  const toast = useToast()

  const generate = async () => {
    if (!input.trim()) { toast('Describe your organisation first', 'error'); return }
    setLoading(true); setDraft(null); setErrors([])
    try {
      const raw = await callEdge(systemPrompt, input)
      if (raw.includes('INSUFFICIENT_DATA')) {
        setErrors(['Not enough detail — please describe your organisation, industry, and products/services more specifically.'])
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
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            maxLength={1000}
            placeholder={placeholder || 'Describe your organisation — industry, size, products/services, key processes...'}
            className="input-field w-full h-24 text-sm resize-none" />

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
