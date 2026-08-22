import { useState, useRef, useEffect } from 'react'
import { Folder, Plus, ChevronDown, Check, Loader2, Save, Edit2, X } from 'lucide-react'
import { useProgramme } from '../context/ProgrammeContext'
import { useAuth } from '../context/AuthContext'
import { createProgramme, updateProgramme } from '../lib/supabase'

const STANDARDS = ['ISO 27001', 'ISO 27002', 'ISO 27005', 'ISO 9001', 'ISO 19011', 'IMS']

export default function ProgrammeSelector() {
  const { user } = useAuth()
  const { programmes, activeProgramme, setActiveProgramme, reload } = useProgramme()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('list') // list | new | edit
  const [form, setForm] = useState({ name: '', standards: ['ISO 27001'], audit_period_start: '', audit_period_end: '', lead_auditor: '', status: 'Planning' })
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setMode('list') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const startEdit = () => {
    if (!activeProgramme) return
    setForm({
      name: activeProgramme.name || '',
      standards: activeProgramme.standards || ['ISO 27001'],
      audit_period_start: activeProgramme.audit_period_start || '',
      audit_period_end: activeProgramme.audit_period_end || '',
      lead_auditor: activeProgramme.lead_auditor || '',
      status: activeProgramme.status || 'Planning',
    })
    setMode('edit')
  }

  const toggleStandard = (s) => setForm(p => ({
    ...p, standards: p.standards.includes(s) ? p.standards.filter(x => x !== s) : [...p.standards, s]
  }))

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      if (mode === 'new') {
        const prog = await createProgramme({ ...form, user_id: user.id })
        await reload()
        setActiveProgramme(prog)
      } else if (mode === 'edit') {
        const prog = await updateProgramme(activeProgramme.id, form)
        await reload()
        setActiveProgramme(prog)
      }
      setMode('list'); setOpen(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const FormView = ({ title }) => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">{title}</span>
        <button onClick={() => setMode('list')} className="text-steel-400 hover:text-steel-200"><X size={14} /></button>
      </div>
      <div><label className="block text-xs text-steel-400 mb-1">Programme Name *</label><input className="input-field text-xs py-1.5" placeholder="e.g. ISO 27001 Internal Audit 2025" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
      <div>
        <label className="block text-xs text-steel-400 mb-1">Standards in Scope</label>
        <div className="flex flex-wrap gap-1.5">
          {STANDARDS.map(s => (
            <button key={s} onClick={() => toggleStandard(s)} className={`text-xs px-2 py-1 rounded border transition-colors ${form.standards.includes(s) ? 'bg-amber-900/40 border-amber-700 text-amber-300' : 'bg-navy-800 border-navy-600 text-steel-400'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="block text-xs text-steel-400 mb-1">Start Date</label><input className="input-field text-xs py-1.5" type="date" value={form.audit_period_start} onChange={e => setForm(p => ({ ...p, audit_period_start: e.target.value }))} /></div>
        <div><label className="block text-xs text-steel-400 mb-1">End Date</label><input className="input-field text-xs py-1.5" type="date" value={form.audit_period_end} onChange={e => setForm(p => ({ ...p, audit_period_end: e.target.value }))} /></div>
      </div>
      <div><label className="block text-xs text-steel-400 mb-1">Lead Auditor</label><input className="input-field text-xs py-1.5" placeholder="e.g. Logan" value={form.lead_auditor} onChange={e => setForm(p => ({ ...p, lead_auditor: e.target.value }))} /></div>
      <div><label className="block text-xs text-steel-400 mb-1">Status</label>
        <select className="input-field text-xs py-1.5" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
          <option>Planning</option><option>In Progress</option><option>Complete</option><option>Closed</option>
        </select>
      </div>
      <button onClick={save} disabled={saving || !form.name} className="btn-primary text-xs w-full justify-center py-2">
        {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> {mode === 'new' ? 'Create Programme' : 'Save Changes'}</>}
      </button>
    </div>
  )

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(p => !p); setMode('list') }}
        className="flex items-center gap-2 bg-navy-800 border border-navy-600 rounded-lg px-3 py-1.5 hover:border-steel-400 transition-colors max-w-48">
        <Folder size={14} className="text-amber-audit flex-shrink-0" />
        <span className="text-xs text-white truncate">{activeProgramme?.programme_id || 'Select Programme'}</span>
        <ChevronDown size={12} className="text-steel-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-10 w-80 bg-navy-900 border border-navy-600 rounded-xl shadow-2xl overflow-hidden z-50">
          {mode === 'list' && (
            <>
              <div className="px-4 py-3 border-b border-navy-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Audit Programmes</span>
                <div className="flex gap-1">
                  {activeProgramme && <button onClick={startEdit} className="p-1 rounded hover:bg-navy-700 text-steel-400 hover:text-amber-audit transition-colors" title="Edit programme"><Edit2 size={13} /></button>}
                  <button onClick={() => { setForm({ name: '', standards: ['ISO 27001'], audit_period_start: '', audit_period_end: '', lead_auditor: '', status: 'Planning' }); setMode('new') }}
                    className="p-1 rounded hover:bg-navy-700 text-steel-400 hover:text-emerald-400 transition-colors" title="New programme"><Plus size={13} /></button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {programmes.length === 0
                  ? <div className="px-4 py-6 text-center text-xs text-steel-400">No programmes yet — click + to create one</div>
                  : programmes.map(p => (
                    <button key={p.id} onClick={() => { setActiveProgramme(p); setOpen(false) }}
                      className="w-full flex items-start justify-between px-4 py-2.5 hover:bg-navy-800 transition-colors text-left">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{p.programme_id}</span>
                          <span className={`badge text-xs ${p.status === 'In Progress' ? 'bg-amber-900/40 text-amber-300' : p.status === 'Complete' ? 'bg-emerald-900/40 text-emerald-300' : 'badge-steel'}`}>{p.status}</span>
                        </div>
                        <div className="text-xs text-steel-400 truncate mt-0.5">{p.name}</div>
                        {p.standards?.length > 0 && <div className="text-xs text-steel-500 mt-0.5">{p.standards.join(' · ')}</div>}
                      </div>
                      {activeProgramme?.id === p.id && <Check size={14} className="text-amber-audit flex-shrink-0 mt-1" />}
                    </button>
                  ))}
              </div>
            </>
          )}
          {(mode === 'new' || mode === 'edit') && <FormView title={mode === 'new' ? 'New Audit Programme' : `Edit ${activeProgramme?.programme_id}`} />}
        </div>
      )}
    </div>
  )
}
