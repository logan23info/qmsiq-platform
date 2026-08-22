import { useState } from 'react'
import { Sparkles, Send, Copy, Download, Loader2, ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { createWorkpaper } from '../lib/supabase'

// Improvement 4 — Markdown rendering
function MarkdownOutput({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { elements.push(<div key={i} className="h-2" />); i++; continue }
    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.slice(2)}</h1>); i++; continue }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-sm font-bold text-steel-100 mt-3 mb-1 border-b border-navy-700 pb-1">{line.slice(3)}</h2>); i++; continue }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-xs font-bold text-amber-audit mt-2 mb-1">{line.slice(4)}</h3>); i++; continue }
    if (line.startsWith('- ') || line.startsWith('* ')) { elements.push(<div key={i} className="flex items-start gap-2 ml-2 my-0.5"><span className="text-amber-audit mt-0.5 flex-shrink-0">▸</span><span className="text-xs text-steel-200 leading-relaxed">{line.slice(2)}</span></div>); i++; continue }
    if (/^\d+\.\s/.test(line)) { const num = line.match(/^(\d+)\./)[1]; elements.push(<div key={i} className="flex items-start gap-2 ml-2 my-0.5"><span className="text-amber-audit font-mono text-xs flex-shrink-0 w-4">{num}.</span><span className="text-xs text-steel-200 leading-relaxed">{line.replace(/^\d+\.\s/, '')}</span></div>); i++; continue }
    if (line.startsWith('**') && line.endsWith('**')) { elements.push(<p key={i} className="text-xs font-bold text-white my-0.5">{line.slice(2, -2)}</p>); i++; continue }
    if (line.startsWith('---') || line.startsWith('===')) { elements.push(<hr key={i} className="border-navy-700 my-2" />); i++; continue }
    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-navy-700 px-1 rounded text-amber-audit text-xs">$1</code>')
    elements.push(<p key={i} className="text-xs text-steel-200 leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />)
    i++
  }
  return <div className="space-y-0.5">{elements}</div>
}

async function callAI(systemPrompt, userMessage) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (groqKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
      body: JSON.stringify({ model: 'openai/gpt-oss-20b', max_tokens: 1500, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] })
    })
    if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err?.error?.message || `Groq error ${response.status}`) }
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
  if (openaiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1500, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] })
    })
    if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err?.error?.message || `OpenAI error ${response.status}`) }
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
  if (anthropicKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-calls': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] })
    })
    if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err?.error?.message || `Anthropic error ${response.status}`) }
    const data = await response.json()
    return data.content?.map(b => b.text || '').join('\n') || ''
  }
  throw new Error('NO_KEY')
}

function detectContext() {
  const path = window.location.pathname
  let standard = 'General', phase = 'TOD', clause = ''
  if (path.includes('iso19011')) standard = 'ISO 19011'
  else if (path.includes('iso27001')) standard = 'ISO 27001'
  else if (path.includes('iso27002')) standard = 'ISO 27002'
  else if (path.includes('iso27005')) standard = 'ISO 27005'
  else if (path.includes('iso9001')) standard = 'ISO 9001'
  else if (path.includes('ims')) standard = 'IMS'
  else if (path.includes('reporting')) standard = 'Reporting'
  else if (path.includes('fieldwork')) standard = 'Fieldwork'
  if (path.includes('/tod')) { phase = 'TOD'; clause = 'TOD' }
  else if (path.includes('/toi')) { phase = 'TOI'; clause = 'TOI' }
  else if (path.includes('/toe')) { phase = 'TOE'; clause = 'TOE' }
  else if (path.includes('/findings')) { phase = 'Finding'; clause = 'Findings' }
  else if (path.includes('/meetings')) { phase = 'Meeting'; clause = 'Meetings' }
  else if (path.includes('clause4')) clause = 'Clause 4'
  else if (path.includes('clause5')) clause = 'Clause 5'
  else if (path.includes('clause6')) clause = 'Clause 6'
  else if (path.includes('clause7')) clause = 'Clause 7'
  else if (path.includes('clause8')) clause = 'Clause 8'
  else if (path.includes('clause9')) clause = 'Clause 9'
  else if (path.includes('clause10')) clause = 'Clause 10'
  else if (path.includes('register')) clause = 'Risk Register'
  else if (path.includes('assets')) clause = 'Asset Register'
  else if (path.includes('rtp')) clause = 'Risk Treatment Plan'
  else if (path.includes('scenarios')) clause = 'Scenarios'
  else if (path.includes('organizational')) clause = 'A.5 Organizational'
  else if (path.includes('people')) clause = 'A.6 People'
  else if (path.includes('physical')) clause = 'A.7 Physical'
  else if (path.includes('technological')) clause = 'A.8 Technological'
  return { standard, phase, clause }
}

export default function AIPanel({ title, systemPrompt, placeholder, contextFields = [] }) {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const [inputs, setInputs] = useState({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [renderMode, setRenderMode] = useState('formatted') // formatted | raw

  const buildUserMessage = () => {
    let msg = ''
    contextFields.forEach(f => { if (inputs[f.id]) msg += `${f.label}: ${inputs[f.id]}\n` })
    if (inputs.query) msg += `\nRequest: ${inputs.query}`
    return msg || 'Generate the artifact for this module.'
  }

  const generate = async () => {
    setLoading(true); setError(''); setOutput(''); setSaved(null); setSaveError('')
    try { setOutput(await callAI(systemPrompt, buildUserMessage())) }
    catch (e) {
      if (e.message === 'NO_KEY') setError('No AI key configured. Add VITE_GROQ_API_KEY to Vercel → Settings → Environment Variables.')
      else if (e.message.includes('429') || e.message.includes('quota')) setError('Rate limit reached. Wait 30 seconds and try again.')
      else if (e.message.includes('401') || e.message.includes('403')) setError('Invalid API key. Check your key in Vercel → Settings → Environment Variables.')
      else setError(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  const saveToLibrary = async () => {
    if (!output) return
    if (!user) { setSaveError('Sign in to save workpapers.'); return }
    if (!activeProgramme) { setSaveError('Select an audit programme first — click the folder icon in the header.'); return }
    setSaving(true); setSaveError('')
    try {
      const { standard, phase, clause } = detectContext()
      const wpTitle = inputs[contextFields[0]?.id] ? `${title} — ${inputs[contextFields[0].id]}` : title
      const wp = await createWorkpaper({ user_id: user.id, programme_id: activeProgramme.id, title: wpTitle, standard, clause_control: clause, phase, notes: `AI-generated via ${title}`, ai_generated_content: output, status: 'Draft' })
      setSaved(wp)
    } catch (e) { setSaveError(`Save failed: ${e.message}`) }
    setSaving(false)
  }

  const copy = () => navigator.clipboard.writeText(output)
  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/\s+/g, '_')}.txt`; a.click(); URL.revokeObjectURL(url)
  }

  const activeProvider = import.meta.env.VITE_GROQ_API_KEY ? 'Groq · GPT-OSS 20B' : import.meta.env.VITE_OPENAI_API_KEY ? 'GPT-4o mini' : import.meta.env.VITE_ANTHROPIC_API_KEY ? 'Claude' : 'No AI key'

  return (
    <div className="ai-panel mt-6">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between mb-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles size={15} className="text-amber-audit" />
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="badge badge-amber">AI-Powered</span>
          <span className="badge badge-steel text-xs">{activeProvider}</span>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-steel-400" /> : <ChevronUp size={14} className="text-steel-400" />}
      </button>

      {!collapsed && (
        <div className="mt-4 space-y-3">
          {contextFields.map(f => (
            <div key={f.id}>
              <label className="block text-xs text-steel-400 mb-1">{f.label}</label>
              {f.type === 'textarea' ? <textarea className="textarea-field" rows={3} placeholder={f.placeholder} value={inputs[f.id] || ''} onChange={e => setInputs(p => ({ ...p, [f.id]: e.target.value }))} />
                : f.type === 'select' ? (
                  <select className="input-field" value={inputs[f.id] || ''} onChange={e => setInputs(p => ({ ...p, [f.id]: e.target.value }))}>
                    <option value="">Select...</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : <input className="input-field" type="text" placeholder={f.placeholder} value={inputs[f.id] || ''} onChange={e => setInputs(p => ({ ...p, [f.id]: e.target.value }))} />}
            </div>
          ))}

          <div>
            <label className="block text-xs text-steel-400 mb-1">Specific Request (optional)</label>
            <textarea className="textarea-field" rows={2} placeholder={placeholder} value={inputs.query || ''} onChange={e => setInputs(p => ({ ...p, query: e.target.value }))} />
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Send size={14} /> Generate Artifact</>}
          </button>

          {error && <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3 leading-relaxed">{error}</div>}

          {output && (
            <div className="mt-3">
              {/* Action bar */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-navy-800 rounded-lg p-0.5">
                  <button onClick={() => setRenderMode('formatted')} className={`text-xs px-2.5 py-1 rounded transition-colors ${renderMode === 'formatted' ? 'bg-navy-600 text-white' : 'text-steel-400 hover:text-steel-200'}`}>Formatted</button>
                  <button onClick={() => setRenderMode('raw')} className={`text-xs px-2.5 py-1 rounded transition-colors ${renderMode === 'raw' ? 'bg-navy-600 text-white' : 'text-steel-400 hover:text-steel-200'}`}>Raw</button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={copy} className="btn-secondary py-1 px-2.5 text-xs"><Copy size={11} /> Copy</button>
                  <button onClick={download} className="btn-secondary py-1 px-2.5 text-xs"><Download size={11} /> Download</button>
                  <button onClick={saveToLibrary} disabled={saving || !!saved}
                    className={`py-1 px-2.5 text-xs inline-flex items-center gap-1 rounded-lg border transition-colors font-medium ${saved ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300' : 'bg-navy-800 border-navy-600 text-steel-200 hover:bg-navy-700'}`}>
                    {saving ? <><Loader2 size={11} className="animate-spin" /> Saving...</>
                      : saved ? <><CheckCircle2 size={11} /> {saved.workpaper_ref}</>
                      : <><Save size={11} /> Save to Library</>}
                  </button>
                </div>
              </div>

              {saveError && <div className="text-xs text-amber-400 bg-amber-900/20 border border-amber-800 rounded-lg p-2 mb-2">{saveError}</div>}
              {saved && (
                <div className="text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-lg p-2 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Saved as <span className="font-mono font-bold">{saved.workpaper_ref}</span> in {activeProgramme?.programme_id} — view in Fieldwork → Workpaper Library
                </div>
              )}

              {/* Output — Improvement 4: Markdown rendering */}
              <div className="bg-navy-950 border border-navy-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                {renderMode === 'formatted'
                  ? <MarkdownOutput text={output} />
                  : <pre className="text-xs text-steel-200 whitespace-pre-wrap font-mono">{output}</pre>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
