import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { useProgramme } from '../../context/ProgrammeContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { CheckCircle2, Plus, Loader2, ArrowRight } from 'lucide-react'

const PBC_TEMPLATE = [
  { pbc_ref: 'SUP-001', description: 'Approved supplier list — current version with evaluation criteria and approval status', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOD', domain: 'Supplier Control', priority: 'High' },
  { pbc_ref: 'SUP-002', description: 'Supplier qualification procedure — documented process for initial approval', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOD', domain: 'Supplier Control', priority: 'High' },
  { pbc_ref: 'SUP-003', description: 'Supplier evaluation records — last 12 months performance assessments', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOE', domain: 'Supplier Control', priority: 'High' },
  { pbc_ref: 'SUP-004', description: 'Supplier scorecards / KPIs — quality, delivery, and service metrics', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOE', domain: 'Performance', priority: 'High' },
  { pbc_ref: 'SUP-005', description: 'Purchase orders — sample of 10 recent orders with quality requirements specified', control_ref: 'ISO 9001 Cl.8.4.3', phase: 'TOE', domain: 'Requirements', priority: 'High' },
  { pbc_ref: 'SUP-006', description: 'Supplier agreements / contracts — quality clauses, inspection requirements, CAPA obligations', control_ref: 'ISO 9001 Cl.8.4.3', phase: 'TOD', domain: 'Requirements', priority: 'High' },
  { pbc_ref: 'SUP-007', description: 'Incoming inspection records — goods receipt quality checks, last 3 months', control_ref: 'ISO 9001 Cl.8.4.2', phase: 'TOE', domain: 'Inspection', priority: 'Medium' },
  { pbc_ref: 'SUP-008', description: 'Supplier nonconformance records — defects, rejections, returns, last 12 months', control_ref: 'ISO 9001 Cl.8.4.2', phase: 'TOE', domain: 'Nonconformance', priority: 'High' },
  { pbc_ref: 'SUP-009', description: 'Supplier corrective action requests (SCARs) — raised and closed, last 12 months', control_ref: 'ISO 9001 Cl.8.4.2', phase: 'TOE', domain: 'CAPA', priority: 'High' },
  { pbc_ref: 'SUP-010', description: 'Sub-contractor list — any sub-contractors used by supplier, controls in place', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOD', domain: 'Supplier Control', priority: 'Medium' },
  { pbc_ref: 'SUP-011', description: 'Supplier audit reports — any previous audits conducted of this supplier', control_ref: 'ISO 9001 Cl.8.4.1', phase: 'TOE', domain: 'Audit History', priority: 'Medium' },
  { pbc_ref: 'SUP-012', description: 'Certificates of conformity / test reports — for last 5 deliveries', control_ref: 'ISO 9001 Cl.8.4.2', phase: 'TOE', domain: 'Inspection', priority: 'Medium' },
]

const FIELDWORK_TEMPLATE = [
  { clause: 'Cl.8.4.1', title: 'Supplier selection and approval', tod: 'Approved supplier list exists with documented criteria. Qualification procedure documented.', toi: 'Walk through how a new supplier is approved. Verify criteria applied consistently.', toe: 'Sample 5 suppliers — confirm all meet approval criteria with evidence on file.' },
  { clause: 'Cl.8.4.1', title: 'Supplier performance monitoring', tod: 'Supplier KPIs defined. Scorecard or review process documented.', toi: 'Review last 3 supplier performance reviews. Confirm meetings held and documented.', toe: 'Trend analysis over 12 months — are underperforming suppliers escalated and actioned?' },
  { clause: 'Cl.8.4.2', title: 'Incoming inspection and acceptance', tod: 'Incoming inspection procedure documented. Acceptance criteria defined per product/material.', toi: 'Observe or walk through incoming inspection process. Confirm records completed.', toe: 'Sample 10 goods receipts — confirm inspection performed and documented for all.' },
  { clause: 'Cl.8.4.2', title: 'Supplier nonconformance control', tod: 'SCAR process documented. Escalation criteria defined.', toi: 'Walk through how a supplier defect is raised, communicated, and tracked.', toe: 'Review all SCARs raised in last 12 months — are root causes addressed and verified effective?' },
  { clause: 'Cl.8.4.3', title: 'Communication of requirements', tod: 'Purchase order template includes quality requirements. Contractual quality clauses documented.', toi: 'Review 3 recent POs — confirm quality requirements clearly specified to supplier.', toe: 'Sample 5 deliveries — do CoCs/test reports match PO requirements specified?' },
  { clause: 'Cl.8.4.1', title: 'Sub-contractor control', tod: 'Policy for controlling sub-contractors used by suppliers documented.', toi: 'Identify key suppliers using sub-contractors. Confirm flow-down of requirements.', toe: 'Verify at least 2 critical suppliers have addressed sub-contractor risk appropriately.' },
]

export default function SupplierAudit() {
  const { activeProgramme } = useProgramme()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [done, setDone] = useState(false)

  const loadTemplate = async () => {
    if (!activeProgramme) return toast('Select a programme first', 'error')
    if (!supplierName.trim()) return toast('Enter supplier name first', 'error')
    setLoading(true)
    try {
      // Insert PBC items
      const pbcRows = PBC_TEMPLATE.map(p => ({
        ...p,
        programme_id: activeProgramme.id,
        user_id: user.id,
        description: `[${supplierName}] ${p.description}`,
        status: 'Not Started',
      }))
      const { error: pbcErr } = await supabase.from('pbc_items').insert(pbcRows)
      if (pbcErr) throw pbcErr

      // Insert workpapers
      const wpRows = FIELDWORK_TEMPLATE.map((w, i) => ({
        programme_id: activeProgramme.id,
        user_id: user.id,
        workpaper_ref: `SUP-WP-${String(i+1).padStart(2,'0')}`,
        title: `[${supplierName}] ${w.title}`,
        standard: 'ISO 9001:2015',
        clause_control: w.clause,
        phase: 'TOD',
        status: 'Planned',
        notes: `TOD: ${w.tod}\n\nTOI: ${w.toi}\n\nTOE: ${w.toe}`,
      }))
      const { error: wpErr } = await supabase.from('workpapers').insert(wpRows)
      if (wpErr) throw wpErr

      setDone(true)
      toast(`Supplier audit template loaded for ${supplierName} — ${pbcRows.length} PBC items + ${wpRows.length} workpapers`)
    } catch (e) { toast('Failed: ' + e.message, 'error') }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="ISO 9001:2015" clause="Cl. 8.4"
        title="Supplier Audit Template"
        description="Pre-built supplier audit template for ISO 9001 Cl.8.4 — External Provider Control. Loads 12 PBC evidence requests and 6 fieldwork workpapers directly into your active programme. Covers selection, performance monitoring, incoming inspection, SCAR management, and sub-contractor control."
        badges={['ISO 9001 Cl.8.4', 'Supplier Audit', `${PBC_TEMPLATE.length} PBC items`, `${FIELDWORK_TEMPLATE.length} workpapers`]} />

      {/* Load template card */}
      <div className="card mb-6 border border-amber-800/40 bg-amber-900/5">
        <h2 className="section-title mb-3">Load template into active programme</h2>
        {!activeProgramme ? (
          <div className="text-xs text-steel-400 py-2">Select a programme from the header first.</div>
        ) : done ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">Template loaded for {supplierName}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigate('/fieldwork/pbc')} className="btn-primary text-xs">
                View PBC list <ArrowRight size={12} />
              </button>
              <button onClick={() => navigate('/fieldwork/workpapers')} className="btn-secondary text-xs">
                View workpapers <ArrowRight size={12} />
              </button>
              <button onClick={() => { setDone(false); setSupplierName('') }} className="btn-secondary text-xs">
                Load for another supplier
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-steel-400 mb-1">Supplier name</label>
              <div className="flex gap-2">
                <input className="input-field flex-1"
                  placeholder="e.g. Acme Components Ltd"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)} />
                <button onClick={loadTemplate} disabled={loading || !supplierName.trim()}
                  className="btn-primary text-xs px-4">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <><Plus size={13} /> Load template</>}
                </button>
              </div>
            </div>
            <p className="text-xs text-steel-500">
              Loads into: <span className="text-amber-audit">{activeProgramme.name || activeProgramme.programme_id}</span>
              {' '}· {PBC_TEMPLATE.length} PBC items + {FIELDWORK_TEMPLATE.length} workpapers
            </p>
          </div>
        )}
      </div>

      {/* PBC template preview */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">PBC evidence requests — Cl.8.4</h2>
        <div className="space-y-2">
          {PBC_TEMPLATE.map(p => (
            <div key={p.pbc_ref} className="flex items-start gap-3 bg-navy-800 rounded-xl px-3 py-2.5">
              <span className="text-xs font-mono text-amber-audit flex-shrink-0 w-16">{p.pbc_ref}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-steel-300 leading-snug">{p.description}</div>
                <div className="text-xs text-steel-500 mt-0.5">{p.control_ref} · {p.phase} · {p.domain}</div>
              </div>
              <span className={`badge text-xs flex-shrink-0 ${p.priority === 'High' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'}`}>
                {p.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fieldwork template preview */}
      <div className="card mb-6">
        <h2 className="section-title mb-3">Fieldwork workpapers — TOD / TOI / TOE</h2>
        <div className="space-y-3">
          {FIELDWORK_TEMPLATE.map((w, i) => (
            <div key={i} className="bg-navy-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="clause-tag">{w.clause}</span>
                <span className="text-xs font-semibold text-white">{w.title}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[['TOD', w.tod], ['TOI', w.toi], ['TOE', w.toe]].map(([phase, text]) => (
                  <div key={phase} className="bg-navy-700 rounded-lg p-2">
                    <div className={`text-xs font-bold mb-1 ${phase === 'TOD' ? 'text-blue-400' : phase === 'TOI' ? 'text-amber-audit' : 'text-emerald-400'}`}>{phase}</div>
                    <div className="text-xs text-steel-400 leading-snug">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AIPanel title="Generate Supplier Audit Artifacts"
        systemPrompt="You are an ISO 9001:2015 Cl.8.4 supplier audit specialist. Generate supplier audit plans, SCARs, supplier evaluation reports, incoming inspection procedures, and approved supplier criteria. Align to ISO 9001:2015 Cl.8.4.1, 8.4.2, and 8.4.3."
        placeholder="e.g. Generate a SCAR for a supplier who delivered 15% defective components in the last quarter with no root cause analysis provided"
        contextFields={[
          { id: 'supplier', label: 'Supplier name & product', type: 'text', placeholder: 'e.g. Acme Ltd — electrical components' },
          { id: 'artifact', label: 'Artifact required', type: 'select', options: ['Supplier audit plan', 'Supplier evaluation report', 'SCAR (corrective action request)', 'Incoming inspection procedure', 'Supplier qualification criteria', 'Supplier audit checklist', 'Supplier risk assessment'] },
          { id: 'context', label: 'Issue / context', type: 'text', placeholder: 'e.g. 3 failed deliveries, no root cause, critical component for production' },
        ]} />
    </div>
  )
}
