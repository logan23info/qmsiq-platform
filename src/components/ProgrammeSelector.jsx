import { useState, useCallback } from 'react'
import { Plus, FolderOpen, Edit2, X, Loader2, Check, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { getProgrammes, createProgramme, updateProgramme } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'

const ROLES = ['auditor', 'reviewer', 'lead']
const roleColors = {
  lead: 'bg-amber-900/40 text-amber-300',
  auditor: 'bg-blue-900/40 text-blue-300',
  reviewer: 'bg-purple-900/40 text-purple-300',
}

const emptyForm = {
  name: '', scope: '', audit_period_start: '', audit_period_end: '',
  lead_auditor: '', status: 'Planning',
}

export default function ProgrammeSelector({ onClose }) {
  const { user } = useAuth()
  const { programmes, activeProgramme, setActiveProgramme, reload } = useProgramme()
  const { toast } = useToast()
  const [mode, setMode] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [invites, setInvites] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('auditor')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addInvite = () => {
    const email = inviteEmail.trim()
    if (!email || !email.includes('@')) return
    if (invites.find(i => i.email === email)) return
    setInvites(p => [...p, { email, role: inviteRole }])
    setInviteEmail('')
  }

  const sendInvites = async (programmeId) => {
    for (const invite of invites) {
      try {
        await supabase.from('programme_members').insert({
          programme_id: programmeId,
          user_id: user.id,
          role: invite.role,
          invited_by: user.id,
          invited_email: invite.email,
        })
      } catch (e) { console.error('Invite failed:', invite.email, e) }
    }
    if (invites.length > 0) toast(`${invites.length} invite${invites.length > 1 ? 's' : ''} sent`)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        user_id: user.id,
        programme_id: mode === 'new' ? `PROG-${Date.now().toString(36).toUpperCase()}` : undefined,
        client_name: form.name,
        standards: form.scope ? [form.scope] : ['ISO 9001:2015'],
        audit_period_start: form.audit_period_start || null,
        audit_period_end: form.audit_period_end || null,
        lead_auditor: form.lead_auditor || '',
        status: form.status,
      }

      if (mode === 'new') {
        const prog = await createProgramme(payload)
        await sendInvites(prog.id)
        const updated = await reload()
        const created = updated?.find(p => p.id === prog.id)
        if (created) setActiveProgramme(created)
        toast('Programme created')
      } else {
        delete payload.user_id
        delete payload.programme_id
        const prog = await updateProgramme(activeProgramme.id, payload)
        await sendInvites(activeProgramme.id)
        await reload()
        setActiveProgramme(prog)
        toast('Programme updated')
      }
      setForm(emptyForm); setInvites([]); onClose?.()
    } catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }

  const startEdit = (p) => {
    setForm({
      name: p.client_name || '',
      scope: Array.isArray(p.standards) ? p.standards.join(', ') : (p.standards || ''),
      audit_period_start: p.audit_period_start || '',
      audit_period_end: p.audit_period_end || '',
      lead_auditor: p.lead_auditor || '',
      status: p.status || 'Planning',
    })
    setInvites([])
    setMode('edit')
  }

  const reset = () => { setMode('list'); setForm(emptyForm); setInvites([]) }

  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
          <div className="p-5 border-b border-navy-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">
              {mode === 'new' ? 'New Audit Programme' : 'Edit Programme'}
            </h2>
            <button onClick={reset} className="text-steel-400 hover:text-white"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">

            <div>
              <label className="block text-xs text-steel-400 mb-1">Programme Name *</label>
              <input className="input-field"
                placeholder="e.g. ISO 9001 Internal Audit 2025"
                value={form.name}
                onChange={e => set('name', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-steel-400 mb-1">Audit Scope</label>
              <input className="input-field"
                placeholder="e.g. ISO 9001:2015 — all clauses, 3 sites"
                value={form.scope}
                onChange={e => set('scope', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-steel-400 mb-1">Start Date</label>
                <input className="input-field" type="date"
                  value={form.audit_period_start}
                  onChange={e => set('audit_period_start', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1">End Date</label>
                <input className="input-field" type="date"
                  value={form.audit_period_end}
                  onChange={e => set('audit_period_end', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-steel-400 mb-1">Lead Auditor</label>
                <input className="input-field"
                  placeholder="e.g. Logan"
                  value={form.lead_auditor}
                  onChange={e => set('lead_auditor', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1">Status</label>
                <select className="input-field" value={form.status}
                  onChange={e => set('status', e.target.value)}>
                  {['Planning','Active','In Progress','Complete','Archived'].map(s =>
                    <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Team invite */}
            <div className="border-t border-navy-700 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={13} className="text-emerald-audit" />
                <span className="text-xs font-semibold text-steel-300">Invite Team Members</span>
              </div>
              <p className="text-xs text-steel-500 mb-3">
                Enter email + role. They get access when they register with that email.
              </p>
              <div className="space-y-2 mb-2">
                <input className="input-field w-full text-xs"
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInvite()} />
                <div className="flex gap-2">
                  <select className="input-field text-xs flex-1" value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                  <button onClick={addInvite} disabled={!inviteEmail.trim()}
                    className="btn-primary text-xs px-4">+ Add</button>
                </div>
              </div>
              {invites.length > 0 && (
                <div className="space-y-1.5">
                  {invites.map(inv => (
                    <div key={inv.email} className="flex items-center gap-2 bg-navy-800 rounded-lg px-3 py-2">
                      <span className="text-xs text-steel-300 flex-1 truncate">{inv.email}</span>
                      <span className={`badge text-xs ${roleColors[inv.role]}`}>{inv.role}</span>
                      <button onClick={() => setInvites(p => p.filter(i => i.email !== inv.email))}
                        className="text-steel-500 hover:text-red-400 ml-1"><X size={12} /></button>
                    </div>
                  ))}
                  <p className="text-xs text-steel-500">{invites.length} member{invites.length > 1 ? 's' : ''} will be added on save</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={saving || !form.name.trim()}
                className="btn-primary flex-1 justify-center">
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Check size={14} /> {mode === 'new' ? 'Create Programme' : 'Save Changes'}</>}
              </button>
              <button onClick={reset} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List mode
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FolderOpen size={15} className="text-amber-audit" />
            <h2 className="font-semibold text-white">Audit Programmes</h2>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white"><X size={16} /></button>
        </div>

        {/* Skip option */}
        <div className="px-4 pt-3 pb-0">
          <button onClick={onClose}
            className="w-full text-xs text-steel-500 hover:text-steel-300 text-center py-1 transition-colors">
            Continue without selecting a programme →
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {programmes.length === 0 ? (
            <div className="text-center py-6 text-steel-500 text-xs">
              No programmes yet — create one below
            </div>
          ) : (
            programmes.map(p => (
              <div key={p.id}
                onClick={() => { setActiveProgramme(p); onClose?.() }}
                className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors ${activeProgramme?.id === p.id ? 'bg-navy-700 border border-amber-800/40' : 'bg-navy-800 hover:bg-navy-700'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white truncate">{p.client_name}</span>
                    <span className="font-mono text-xs text-amber-audit">{p.programme_id}</span>
                    {activeProgramme?.id === p.id && <span className="badge badge-amber text-xs">Active</span>}
                  </div>
                  <div className="text-xs text-steel-500 mt-0.5 truncate">
                    {p.standards?.join(' · ') || p.standard || ''}{p.status ? ` · ${p.status}` : ''}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); startEdit(p) }}
                  className="text-steel-500 hover:text-white p-1.5 rounded-lg hover:bg-navy-600 flex-shrink-0 transition-colors">
                  <Edit2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-navy-700 flex-shrink-0">
          <button onClick={() => { setForm(emptyForm); setInvites([]); setMode('new') }}
            className="btn-primary w-full justify-center">
            <Plus size={14} /> New Programme
          </button>
        </div>
      </div>
    </div>
  )
}
