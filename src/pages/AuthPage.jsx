import { useState } from 'react'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
    if (mode === 'signup' && !form.fullName) { setError('Full name is required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password })
      } else {
        await signUp({ email: form.email, password: form.password, fullName: form.fullName })
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (e) {
      setError(e.message || 'An error occurred. Please try again.')
    }
    setLoading(false)
  }

  // Fix 2 — use existing supabase client, no dynamic import
  const handleReset = async () => {
    if (!form.email) { setError('Enter your email address to reset your password.'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setSuccess('Password reset email sent. Check your inbox.')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 border border-navy-600 mb-4">
            <Shield size={28} className="text-amber-audit" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">AuditIQ</h1>
          <p className="text-steel-400 text-sm mt-1">IT Audit Intelligence Platform</p>
        </div>

        <div className="card">
          {mode !== 'reset' && (
            <div className="flex mb-6 bg-navy-800 rounded-xl p-1">
              {[{ key: 'signin', label: 'Sign In' }, { key: 'signup', label: 'Create Account' }].map(t => (
                <button key={t.key} onClick={() => { setMode(t.key); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === t.key ? 'bg-navy-700 text-white' : 'text-steel-400 hover:text-steel-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {mode === 'reset' && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">Reset Password</h2>
              <p className="text-xs text-steel-400">Enter your email and we'll send a reset link.</p>
            </div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none" />
                  <input className="input-field" type="text" placeholder="e.g. Alex Morgan"
                    style={{ paddingLeft: '2.25rem' }} value={form.fullName}
                    onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs text-steel-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none" />
                <input className="input-field" type="email" placeholder="you@organisation.com"
                  style={{ paddingLeft: '2.25rem' }} value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'reset' ? handleReset() : handleSubmit())} />
              </div>
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none" />
                  <input className="input-field" type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-200">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {mode === 'signin' && (
                  <button onClick={() => { setMode('reset'); setError(''); setSuccess('') }}
                    className="text-xs text-steel-400 hover:text-amber-audit mt-1.5 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <div className="mt-4 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</div>}
          {success && <div className="mt-4 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-700 rounded-lg p-3">{success}</div>}

          <button onClick={mode === 'reset' ? handleReset : handleSubmit} disabled={loading}
            className="btn-primary w-full justify-center mt-6">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Please wait...</>
              : mode === 'signin' ? <><ArrowRight size={14} /> Sign In</>
              : mode === 'signup' ? <><ArrowRight size={14} /> Create Account</>
              : <><Mail size={14} /> Send Reset Link</>}
          </button>

          {mode === 'reset' && (
            <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
              className="w-full text-xs text-steel-400 hover:text-steel-200 mt-3 transition-colors">
              Back to Sign In
            </button>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-steel-500">
          ISO 19011 · 27001 · 27002 · 27005 · 9001
        </div>
      </div>
    </div>
  )
}
