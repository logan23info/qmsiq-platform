import { useState, useEffect } from 'react'
import PageHeader from '../../components/PageHeader'
import QMSAIGenerator from '../../components/QMSAIGenerator'
import { useProgramme } from '../../context/ProgrammeContext'
import { useTeam } from '../../context/TeamContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { getQMSPolicy, saveQMSPolicy } from '../../lib/supabase'
import { Save, Sparkles } from 'lucide-react'

const SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 QMS implementation consultant. [SOURCE OF TRUTH] Organisation context only. [OUTPUT] JSON — single object: {policy_text, version}. policy_text must reference: customer focus, continual improvement, and regulatory compliance — without quoting clause text. Max 150 words. version: "1.0 DRAFT". approved_by and approved_date: leave blank — human must complete. [FABRICATION GUARD] No specific performance targets. No named individuals.`
const REQUIRED = ['policy_text']
const EMPTY = Object.fromEntries(['policy_text', 'approved_by', 'approved_date', 'version', 'communicated'].map(k => [k, '']))

export default function QualityPolicy() {
  const { activeProgramme } = useProgramme()
  const { isReviewer } = useTeam()
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isOwner = activeProgramme?.user_id === user?.id
  const canEdit = isOwner || !isReviewer

  useEffect(() => {
    if (!activeProgramme) return
    getQMSPolicy(activeProgramme.id).then(d => { if (d) setForm(f => ({ ...f, ...d })) })
  }, [activeProgramme])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!activeProgramme) return
    setSaving(true)
    try {
      await saveQMSPolicy(activeProgramme.id, user.id, { ...form, status: 'Complete' })
      toast('Quality Policy saved')
    } catch(e) { toast(e.message, 'error') }
    setSaving(false)
  }

  const onGenerated = ([record]) => {
    if (record) setForm(f => ({ ...f, ...record }))
  }

  if (!activeProgramme) return <div className="text-center py-16 text-steel-500">Select a programme first.</div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="Quality Policy" subtitle="ISO 9001:2015 Cl.5.2" />
      {canEdit && <QMSAIGenerator clause="ISO 9001:2015 Cl.5.2" systemPrompt={SYSTEM_PROMPT} requiredFields={REQUIRED} placeholder="Describe your organisation — name, industry, what you make or deliver, your key quality commitments..." onGenerated={onGenerated} />}
      {form.ai_generated && form.status === 'Draft' && (
        <div className="flex items-center gap-2 text-xs text-amber-audit bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2 mb-4">
          <Sparkles size={12} /> AI draft — review content below then click Save to confirm.
        </div>
      )}
      <div className="card space-y-4">
                <div><label className='block text-xs text-steel-400 mb-1'>Quality policy statement *</label><textarea maxLength={2000} value={form['policy_text'] || ''} onChange={e => set('policy_text', e.target.value)} disabled={!canEdit} className='input-field w-full h-32 text-sm resize-none' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>Approved by (top management name/title)</label><input type='text' maxLength={200} value={form['approved_by'] || ''} onChange={e => set('approved_by', e.target.value)} disabled={!canEdit} className='input-field w-full text-sm' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>Approval date</label><input type='date' maxLength={200} value={form['approved_date'] || ''} onChange={e => set('approved_date', e.target.value)} disabled={!canEdit} className='input-field w-full text-sm' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>Version</label><input type='text' maxLength={200} value={form['version'] || ''} onChange={e => set('version', e.target.value)} disabled={!canEdit} className='input-field w-full text-sm' /></div>
        <div><label className='block text-xs text-steel-400 mb-1'>Communicated to organisation? (yes/no)</label><input type='text' maxLength={200} value={form['communicated'] || ''} onChange={e => set('communicated', e.target.value)} disabled={!canEdit} className='input-field w-full text-sm' /></div>
        {canEdit && <button onClick={save} disabled={saving} className="btn-primary text-sm"><Save size={13} /> Save</button>}
      </div>
    </div>
  )
}
