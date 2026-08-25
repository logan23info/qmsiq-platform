import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getQMSContext, saveQMSContext } from '../../lib/supabase'
import { Save, Sparkles } from 'lucide-react'

const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the organisation context in the user message. [DETERMINISM] Return INSUFFICIENT_DATA if context is too vague. [OUTPUT] JSON only — single object: {internal_issues, external_issues, scope, exclusions}. internal_issues and external_issues: bullet list of max 5 points each. scope: 2-3 sentences. exclusions: blank if none. [FABRICATION GUARD] No invented market data. No financial figures. No clause text verbatim.`
const REQUIRED = ['internal_issues', 'external_issues', 'scope']
const EMPTY = Object.fromEntries(['internal_issues', 'external_issues', 'scope', 'exclusions'].map(k => [k, '']))

export default function ContextForm() {
  const { activeProgramme } = useProgramme()
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const canEdit = !isReviewer

  useEffect(() => {
    if (!activeProgramme) return
    getQMSContext(activeProgramme.id).then(d => { if (d) setForm(f => ({ ...f, ...d })) })
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!activeProgramme) return
    setSaving(true)
    try {
      await saveQMSContext(activeProgramme.id, user.id, { ...form, status: 'Complete' })
      toast('Context & Scope saved')
    } catch(e) { toast(e.message, 'error') }
    setSaving(false)
  }

  const onGenerated = ([record]) => {
    if (record) setForm(f => ({ ...f, ...record }))
  }

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="Context & Scope" subtitle="ISO 9001:2015 Cl.4.1–4.3" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.4.1–4.3" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — industry, size, main products or services, key locations..." onGenerated={onGenerated} />}
      {form.ai_generated && form.status === 'Draft' && (
        <div className="flex items-center gap-2 text-xs text-amber-audit bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2 mb-4">
          <Sparkles size={12} /> AI draft — review content below then click Save to confirm.
        </div>
      )}
      <div className="card space-y-4">
                <div><label className='block text-xs text-steel-400 mb-1'>Internal issues (SWOT internal factors) *</label><textarea maxLength={2000} value={form['internal_issues'] || ''} onChange={e => set('internal_issues', e.target.value)} disabled={!canEdit} className='input-field w-full h-32 text-sm resize-none' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>External issues (PESTLE external factors) *</label><textarea maxLength={2000} value={form['external_issues'] || ''} onChange={e => set('external_issues', e.target.value)} disabled={!canEdit} className='input-field w-full h-32 text-sm resize-none' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>QMS scope — products, services, sites *</label><textarea maxLength={2000} value={form['scope'] || ''} onChange={e => set('scope', e.target.value)} disabled={!canEdit} className='input-field w-full h-32 text-sm resize-none' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>Justified exclusions (Cl.8 only, if any)</label><textarea maxLength={2000} value={form['exclusions'] || ''} onChange={e => set('exclusions', e.target.value)} disabled={!canEdit} className='input-field w-full h-32 text-sm resize-none' /></div>
        {canEdit && <button onClick={save} disabled={saving} className="btn-primary text-sm"><Save size={13} /> Save</button>}
      </div>
    </div>
  )
}
