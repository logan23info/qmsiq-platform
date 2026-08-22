import { useState, useEffect, useCallback } from 'react'
import { Plus, FolderOpen, Edit2, X, Loader2, Check, UserPlus, Trash2 } from 'lucide-react'
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
  const [mode, setMode] = useState('list') // list | new | edit
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Team invite state
  const [invites, setInvites] = useState([]) // [{email, role}]
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('auditor')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return
    if (invites.find(i => i.email === inviteEmail.trim())) return
    setInvites(p => [...p, { email: inviteEmail.trim(), role: inviteRole }])
    setInviteEmail('')
  }

  const removeInvite = (email) => setInvites(p => p.filter(i => i.email !== email))

  const sendInvites = async (programmeId) => {
    if (invites.length === 0) return
    // Store pending invites in programme_members with invited_email
    // When user registers/logs in with that email, they get access
    for (const invite of invites) {
      try {
        await supabase.from('programme_members').insert({
          programme_id: programmeId,
          user_id: user.id, // placeholder — overwritten when they accept
          role: invite.role,
          invited_by: user.id,
          invited_email: invite.email,
        })
      } catch (e) { console.error('Invite failed for', invite.email, e) }
    }
    toast(`${invites.length} invite${invites.length > 1 ? 's' : ''} sent`)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (mode === 'new') {
        const prog = await createProgramme({
          user_id: user.id,
          programme_id: `PROG-${Date.now().toString(36).toUpperCase()}`,
          client_name: form.name,
          scope: form.scope,
          standard: form.scope || 'ISO 9001:2015',
          start_date: form.audit_period_start || null,
          end_date: form.audit_period_end || null,
          lead_auditor: form.lead_auditor,
          status: form.status,
        })
        await sendInvites(prog.id)
        const updated = await reload()
        const created = updated?.find(p => p.id === prog.id)
        if (created) setActiveProgramme(created)
        toast('Programme created' + (invites.length > 0 ? ` + ${invites.length} invite${invites.length > 1 ? 's' : ''} sent` : ''))
      } else {
        const prog = await updateProgramme(activeProgramme.id, {
          client_name: form.name,
          scope: form.scope,
          standard: form.scope || 'ISO 9001:2015',
          start_date: form.audit_period_start || null,
          end_date: form.audit_period_end || null,
          lead_auditor: form.lead_auditor,
          status: form.status,
        })
        await sendInvites(activeProgramme.id)
        await reload()
        setActiveProgramme(prog)
        toast('Programme updated')
      }
      setForm(emptyForm)
      setInvites([])
      onClose?.()
    } catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }

  const startEdit = (p) => {
    setForm({
      name: p.client_name || '',
      scope: p.scope || p.standard || '',
      audit_period_start: p.start_date || '',
      audit_period_end: p.end_date || '',
      lead_auditor: p.lead_auditor || '',
      status: p.status || 'Planning',
    })
    setInvites([])
    setMode('edit')
  }

  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
          <div className="p-5 border-b border-navy-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">
              {mode === 'new' ? 'New Audit Programme' : 'Edit Programme'}
            </h2>
            <button onClick={() => { setMode('list'); setForm(emptyForm); setInvites([]) }}
              className="text-steel-400 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">

            {/* Programme Name */}
            <div>
              <label className="block text-xs text-steel-400 mb-1">Programme Name *</label>
              <input className="input-field" placeholder="e.g. ISO 9001 Internal Audit 2025"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* Scope — free text, no array conversion */}
            <div>
              <label className="block text-xs text-steel-400 mb-1">Audit Scope</label>
              <input className="input-field" placeholder="e.g. ISO 9001:2015 — all clauses, 3 sites"
                value={form.scope} onChange={e => set('scope', e.target.value)} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-steel-400 mb-1">Start Date</label>
                <input className="input-field" type="date"
                  value={form.audit_period_start} onChange={e => set('audit_period_start', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1">End Date</label>
                <input className="input-field" type="date"
                  value={form.audit_period_end} onChange={e => set('audit_period_end', e.target.value)} />
              </div>
            </div>

            {/* Lead Auditor + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-steel-400 mb-1">Lead Auditor</label>
                <input className="input-field" placeholder="e.g. Logan"
                  value={form.lead_auditor} onChange={e => set('lead_auditor', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1">Status</label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  {['Planning', 'Active', 'In Progress', 'Complete', 'Archived'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Team Invite Section */}
            <div className="border-t border-navy-700 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={13} className="text-emerald-audit" />
                <label className="text-xs font-semibold text-steel-300">Invite Team Members</label>
              </div>
              <p className="text-xs text-steel-500 mb-3">
                Enter email addresses and assign roles. They'll be added to this programme when they register.
              </p>

              {/* Invite input row */}
              <div className="flex gap-2 mb-3">
                <input className="input-field flex-1 text-xs"
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInvite()} />
                <select className="input-field text-xs w-28" value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <button onClick={addInvite} disabled={!inviteEmail.trim()}
                  className="btn-secondary text-xs py-1.5 px-3">
                  Add
                </button>
              </div>

              {/* Invite list */}
              {invites.length > 0 && (
                <div className="space-y-1.5">
                  {invites.map(inv => (
                    <div key={inv.email} className="flex items-center gap-2 bg-navy-800 rounded-lg px-3 py-2">
                      <span className="text-xs text-steel-300 flex-1 truncate">{inv.email}</span>
                      <span className={`badge text-xs ${roleColors[inv.role]}`}>{inv.role}</span>
                      <button onClick={() => removeInvite(inv.email)}
                        className="text-steel-500 hover:text-red-400 transition-colors ml-1">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-steel-500 pt-1">
                    {invites.length} team member{invites.length > 1 ? 's' : ''} will be invited when programme is saved
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={save} disabled={saving || !form.name.trim()}
                className="btn-primary flex-1 justify-center">
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Check size={14} /> {mode === 'new' ? 'Create Programme' : 'Save Changes'}</>}
              </button>
              <button onClick={() => { setMode('list'); setForm(emptyForm); setInvites([]) }}
                className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List mode
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={15} className="text-amber-audit" />
            <h2 className="font-semibold text-white">Audit Programmes</h2>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-2">
          {programmes.map(p => (
            <div key={p.id}
              onClick={() => { setActiveProgramme(p); onClose?.() }}
              className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors ${activeProgramme?.id === p.id ? 'bg-navy-700 border border-amber-800/40' : 'bg-navy-800 hover:bg-navy-700'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{p.client_name}</span>
                  {activeProgramme?.id === p.id && <span className="badge badge-amber text-xs">Active</span>}
                </div>
                <div className="text-xs text-steel-500 mt-0.5">
                  {p.scope || p.standard || ''}{p.status ? ` · ${p.status}` : ''}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); startEdit(p) }}
                className="text-steel-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-navy-600 flex-shrink-0">
                <Edit2 size={13} />
              </button>
            </div>
          ))}
          {programmes.length === 0 && (
            <div className="text-center py-6 text-steel-500 text-xs">No programmes yet — create one below</div>
          )}
          <button onClick={() => { setForm(emptyForm); setInvites([]); setMode('new') }}
            className="btn-primary w-full justify-center mt-2">
            <Plus size={14} /> New Programme
          </button>
        </div>
      </div>
    </div>
  )
}
