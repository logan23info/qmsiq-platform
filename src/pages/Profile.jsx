import { useState, useEffect } from 'react'
import { User, Save, Loader2, CheckCircle2, Key } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ full_name: '', role: '', organisation: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || '', role: profile.role || '', organisation: profile.organisation || '' })
  }, [profile])

  const saveProfile = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...form, updated_at: new Date().toISOString() })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const changePassword = async () => {
    setPwError(''); setPwSaved(false)
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    setSavingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
      if (error) throw error
      setPwSaved(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 3000)
    } catch (e) { setPwError(e.message) }
    setSavingPw(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader standard="AuditIQ" clause="Account" title="Edit Profile" description="Update your name, role, and organisation. Change your password." badges={['Account', 'Settings']} />

      {/* Profile details */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={15} className="text-amber-audit" />
          <h2 className="section-title mb-0">Profile Details</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-steel-400 mb-1.5">Email Address</label>
            <input className="input-field opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-steel-400 mt-1">Email cannot be changed</p>
          </div>
          {[
            { key: 'full_name', label: 'Full Name', placeholder: 'e.g. Alex Morgan' },
            { key: 'role', label: 'Role / Title', placeholder: 'e.g. Lead IT Auditor, CISO, Compliance Manager' },
            { key: 'organisation', label: 'Organisation', placeholder: 'e.g. ABC Financial Services' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-steel-400 mb-1.5">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        {error && <div className="mt-4 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</div>}
        {saved && <div className="mt-4 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-lg p-3 flex items-center gap-2"><CheckCircle2 size={13} /> Profile saved successfully</div>}
        <button onClick={saveProfile} disabled={saving} className="btn-primary mt-5">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Profile</>}
        </button>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Key size={15} className="text-purple-400" />
          <h2 className="section-title mb-0">Change Password</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'newPw', label: 'New Password', placeholder: 'Minimum 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-steel-400 mb-1.5">{f.label}</label>
              <input className="input-field" type="password" placeholder={f.placeholder} value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        {pwError && <div className="mt-4 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">{pwError}</div>}
        {pwSaved && <div className="mt-4 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-lg p-3 flex items-center gap-2"><CheckCircle2 size={13} /> Password changed successfully</div>}
        <button onClick={changePassword} disabled={savingPw} className="btn-primary mt-5">
          {savingPw ? <><Loader2 size={14} className="animate-spin" /> Changing...</> : <><Key size={14} /> Change Password</>}
        </button>
      </div>
    </div>
  )
}
