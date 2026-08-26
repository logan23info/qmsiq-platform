import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useNavigate } from 'react-router-dom'
import { useQMSContext, NEXT_MODULE } from '../../hooks/useQMSContext'
import { ArrowRight } from 'lucide-react'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getQMSContext, saveQMSContext } from '../../lib/supabase'
import { Save, Sparkles } from 'lucide-react'

const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Use ONLY the structured organisation context provided — Organisation, Industry, Products/services, Size, Customers, Regulations, Additional context. [DETERMINISM] If industry or products are missing, return exactly: INSUFFICIENT_DATA [OUTPUT] JSON only, no markdown, no preamble — single object: {"internal_issues":"bullet list 
 separated, max 5 SWOT internal factors specific to this org","external_issues":"bullet list 
 separated, max 5 PESTLE factors specific to this industry","scope":"2-3 sentences describing what the QMS covers based on the products and sites","exclusions":""} [FABRICATION GUARD] No invented market share, revenue, or financial data. No named competitors. No specific regulatory citations unless the user provided them. Targets and numbers must use [SAMPLE] placeholder.`
const REQUIRED = ['internal_issues', 'external_issues', 'scope']
const EMPTY = Object.fromEntries(['internal_issues', 'external_issues', 'scope', 'exclusions', 'org_name', 'industry', 'products', 'org_size', 'customers', 'regulations'].map(k => [k, '']))

export default function ContextForm() {
  const { activeProgramme } = useProgramme()
  const navigate = useNavigate()
  const { priorContext, priorLoading, orgProfile } = useQMSContext('ISO 9001:2015 Cl.4.1–4.3', activeProgramme?.id)
  const nextModule = NEXT_MODULE['ISO 9001:2015 Cl.4.1–4.3']
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer

  useEffect(() => {
    if (!activeProgramme) return
    getQMSContext(activeProgramme.id).then(d => { if (d) setForm(f => ({ ...f, ...d })) })
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!activeProgramme) return
    setSaving(true)
    try {
      // Save org profile fields alongside context so later clauses can pre-fill
      await saveQMSContext(activeProgramme.id, user.id, {
        ...form,
        status: 'Complete',
      })
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
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.4.1–4.3" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — industry, size, main products or services, key locations..." onGenerated={onGenerated} priorContext={priorContext} orgProfile={orgProfile} onContextChange={fields => setForm(f => ({ ...f, org_name: fields.name || f.org_name, industry: fields.industry || f.industry, products: fields.products || f.products, org_size: fields.size || f.org_size, customers: fields.customers || f.customers, regulations: fields.regulations || f.regulations }))} />}
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
        <div className="flex items-center gap-3">
          {canEdit && <button onClick={save} disabled={saving} className="btn-primary text-sm"><Save size={13} /> Save</button>}
          {nextModule && <button onClick={() => navigate(nextModule.path)} className="btn-secondary text-sm flex items-center gap-1.5">
            Next: {nextModule.label} <ArrowRight size={13} />
          </button>}
        </div>
      </div>
    </div>
  )
}
