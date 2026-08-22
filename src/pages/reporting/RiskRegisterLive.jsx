import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, Save, Trash2, Search, X, Shield, FileDown } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { getRisks, createRisk, updateRisk, deleteRisk } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import AIPanel from '../../components/AIPanel'
import { exportToCSV, RISK_COLUMNS } from '../../utils/exportCSV'
import ConfirmModal from '../../components/ConfirmModal'

const getRiskLevel = (score) => {
  if (score >= 20) return { label: 'Critical', color: 'text-red-400 bg-red-900/30 border-red-700' }
  if (score >= 12) return { label: 'High', color: 'text-orange-400 bg-orange-900/30 border-orange-700' }
  if (score >= 6) return { label: 'Medium', color: 'text-amber-audit bg-amber-900/30 border-amber-700' }
  return { label: 'Low', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700' }
}

function NewRiskModal({ programmeId, userId, onCreated, onClose }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ asset: '', threat: '', vulnerability: '', likelihood: 3, impact: 3, controls_applied: '', residual_likelihood: 2, residual_impact: 2, treatment: 'Mitigate', risk_owner: '', review_date: '' })
  const [saving, setSaving] = useState(false)
  const inherent = form.likelihood * form.impact
  const residual = form.residual_likelihood * form.residual_impact
  const save = async () => {
    if (!form.asset || !form.threat) return
    setSaving(true)
    try { const r = await createRisk({ ...form, user_id: userId, programme_id: programmeId, status: 'Open' }); onCreated(r); onClose(); toast('Risk added — ' + r.risk_ref) }
    catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between"><h2 className="font-semibold text-white">New Risk — Asset × Threat × Vulnerability</h2><button onClick={onClose} className="text-steel-400 text-lg">×</button></div>
        <div className="p-5 space-y-4">
          {[{ key:'asset', label:'Asset *', ph:'e.g. Customer PII Database' }, { key:'threat', label:'Threat *', ph:'e.g. Ransomware attack' }, { key:'vulnerability', label:'Vulnerability', ph:'e.g. Unpatched systems' }].map(f => (
            <div key={f.key}><label className="block text-xs text-steel-400 mb-1">{f.label}</label><input className="input-field" placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} /></div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-sm">
              <div className="text-xs font-semibold text-red-400 mb-3">Inherent: <span className="text-white font-bold">{inherent}</span> — {getRiskLevel(inherent).label}</div>
              {[{ key:'likelihood', label:'Likelihood (1–5)' }, { key:'impact', label:'Impact (1–5)' }].map(f => (
                <div key={f.key} className="mb-2"><label className="block text-xs text-steel-400 mb-1">{f.label}: <span className="text-white">{form[f.key]}</span></label><input type="range" min="1" max="5" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: parseInt(e.target.value) }))} className="w-full accent-red-500" /></div>
              ))}
            </div>
            <div className="card-sm">
              <div className="text-xs font-semibold text-emerald-400 mb-3">Residual: <span className="text-white font-bold">{residual}</span> — {getRiskLevel(residual).label}</div>
              {[{ key:'residual_likelihood', label:'Likelihood (1–5)' }, { key:'residual_impact', label:'Impact (1–5)' }].map(f => (
                <div key={f.key} className="mb-2"><label className="block text-xs text-steel-400 mb-1">{f.label}: <span className="text-white">{form[f.key]}</span></label><input type="range" min="1" max="5" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: parseInt(e.target.value) }))} className="w-full accent-emerald-500" /></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Controls Applied</label><input className="input-field" placeholder="e.g. A.8.7, A.8.8" value={form.controls_applied} onChange={e => setForm(p => ({ ...p, controls_applied: e.target.value }))} /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Treatment</label><select className="input-field" value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))}><option>Mitigate</option><option>Accept</option><option>Transfer</option><option>Avoid</option></select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Risk Owner</label><input className="input-field" placeholder="e.g. CISO" value={form.risk_owner} onChange={e => setForm(p => ({ ...p, risk_owner: e.target.value }))} /></div>
            <div><label className="block text-xs text-steel-400 mb-1">Review Date</label><input className="input-field" type="date" value={form.review_date} onChange={e => setForm(p => ({ ...p, review_date: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2"><button onClick={save} disabled={saving || !form.asset || !form.threat} className="btn-primary flex-1 justify-center">{saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Risk</>}</button><button onClick={onClose} className="btn-secondary">Cancel</button></div>
        </div>
      </div>
    </div>
  )
}

export default function RiskRegisterLive() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const { toast } = useToast()
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setRisks(await getRisks(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const handleDelete = (id, ref) => {
    setConfirmDel({
      title: `Delete ${ref}?`,
      message: 'This risk entry will be permanently removed from the register.',
      onConfirm: async () => {
        try { await deleteRisk(id); setRisks(p => p.filter(r => r.id !== id)); toast(`${ref} deleted`, 'info') }
        catch (e) { toast('Delete failed', 'error') }
      }
    })
  }

  const updateTreatment = async (id, treatment) => {
    setUpdatingId(id)
    try { const u = await updateRisk(id, { treatment }); setRisks(p => p.map(r => r.id === id ? u : r)); toast('Treatment updated') }
    catch (e) { toast('Update failed', 'error') }
    setUpdatingId(null)
  }

  const filtered = risks.filter(r =>
    (filter === 'All' || getRiskLevel(r.residual_score || r.residual_likelihood * r.residual_impact).label === filter) &&
    (!search || r.asset?.toLowerCase().includes(search.toLowerCase()) || r.threat?.toLowerCase().includes(search.toLowerCase()) || r.risk_ref?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="ISO 27005" clause="Risk Register" title="Risk Register ⭐ Live" description="Persistent risk register — Asset × Threat × Vulnerability. All entries saved to Supabase per audit programme." badges={['Live Data', 'ISO 27005', activeProgramme?.programme_id || 'No Programme']} />

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input className="input-field pl-8 text-xs py-1.5" placeholder="Search asset, threat, ref..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400"><X size={12} /></button>}
          </div>
          {['All','Critical','High','Medium','Low'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${filter === f ? 'bg-navy-700 border-steel-400 text-white' : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-400'}`}>{f}</button>
          ))}
          <button onClick={() => exportToCSV(filtered, `Risks_${activeProgramme?.programme_id}`, RISK_COLUMNS)} disabled={filtered.length === 0} className="btn-secondary text-xs py-1.5"><FileDown size={12} /> Export CSV</button>
          <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs py-1.5"><Plus size={13} /> Add Risk</button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12"><Shield size={28} className="text-steel-500 mx-auto mb-3" /><div className="text-white font-medium">No programme selected</div></div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-navy-700 bg-navy-800/50">{['Ref','Asset','Threat','Inherent','Controls','Residual','Treatment','Owner',''].map(h => <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={9} className="py-12 text-center text-steel-400">{risks.length === 0 ? 'No risks yet — click Add Risk' : 'No risks match filter'}</td></tr>
                  : filtered.map((r, i) => {
                    const iScore = r.inherent_score || (r.likelihood * r.impact)
                    const rScore = r.residual_score || (r.residual_likelihood * r.residual_impact)
                    const iLevel = getRiskLevel(iScore)
                    const rLevel = getRiskLevel(rScore)
                    return (
                      <tr key={r.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                        <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold">{r.risk_ref}</td>
                        <td className="py-2.5 px-3 text-white font-medium max-w-xs truncate">{r.asset}</td>
                        <td className="py-2.5 px-3 text-steel-300 max-w-xs truncate">{r.threat}</td>
                        <td className="py-2.5 px-3"><span className={`badge border text-xs font-bold ${iLevel.color}`}>{iScore}</span></td>
                        <td className="py-2.5 px-3 text-blue-400 font-mono">{r.controls_applied}</td>
                        <td className="py-2.5 px-3"><span className={`badge border text-xs font-bold ${rLevel.color}`}>{rScore}</span></td>
                        <td className="py-2.5 px-3">
                          <select className="input-field py-0.5 text-xs w-24" value={r.treatment} disabled={updatingId === r.id} onChange={e => updateTreatment(r.id, e.target.value)}>
                            <option>Mitigate</option><option>Accept</option><option>Transfer</option><option>Avoid</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-steel-300">{r.risk_owner}</td>
                        <td className="py-2.5 px-3"><button onClick={() => handleDelete(r.id, r.risk_ref)} className="text-steel-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button></td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">{filtered.length} of {risks.length} risks — {activeProgramme?.programme_id}</div>
        </div>
      )}
      {confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
      {showModal && <NewRiskModal programmeId={activeProgramme?.id} userId={user?.id} onCreated={r => setRisks(p => [...p, r])} onClose={() => setShowModal(false)} />}

      <div className="mt-6">
        <AIPanel
          title="AI — Risk Assessment & Treatment Guidance"
          systemPrompt="You are an ISO 27005:2022 risk assessment specialist. Generate risk assessment workpapers, suggest ISO 27002 controls for specific risks, produce risk treatment justifications, and create risk acceptance statements. Use Asset × Threat × Vulnerability methodology."
          placeholder="e.g. Generate a risk assessment for ransomware threat against customer PII database on AWS RDS"
          contextFields={[
            { id: 'risk', label: 'Risk Scenario', type: 'textarea', placeholder: 'e.g. Asset: Customer DB, Threat: Ransomware, Vulnerability: Unpatched OS' },
            { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Risk Assessment Workpaper', 'Control Recommendations', 'Risk Treatment Justification', 'Risk Acceptance Statement', 'Residual Risk Summary'] },
            { id: 'org', label: 'Organisation Context', type: 'text', placeholder: 'e.g. AWS cloud, financial services, GDPR applicable' },
          ]}
        />
      </div>
    </div>
  )
}
