import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Shield, Clock } from 'lucide-react'
import {
  retrieveContext, callQMSRuntime, validateQMSOutput,
  getClauseOptions, CLASSIFICATION_COLORS, SEVERITY_COLORS, PROMPT_VERSION
} from '../lib/qmsRuntime'
import { useToast } from './Toast'

const CLAUSE_OPTIONS = getClauseOptions()

export default function QMSRuntimePanel({ mode = 'finding', onGenerated }) {
  // mode: 'finding' (FindingRegister) | 'capa' (CAPATracker)
  const [open, setOpen] = useState(true)
  const [selectedClauses, setSelectedClauses] = useState([])
  const [evidenceText, setEvidenceText] = useState('')
  const [observationText, setObservationText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState([])
  const toast = useToast()

  const toggleClause = (id) => {
    setSelectedClauses(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id].slice(0, 3) // max 3 clauses
    )
  }

  const generate = async () => {
    if (!observationText.trim()) { toast('Describe your observation first', 'error'); return }
    setLoading(true); setResult(null); setErrors([])
    try {
      const { context, retrieved_context_ids } = retrieveContext(selectedClauses, evidenceText)

      const userMessage = mode === 'finding'
        ? `AUDIT OBSERVATION:\n${observationText}\n\nCLAUSES UNDER REVIEW: ${selectedClauses.length ? selectedClauses.join(', ') : 'To be determined from context'}`
        : `NONCONFORMITY DESCRIPTION:\n${observationText}\n\nGenerate corrective action plan only. Classification and finding already confirmed by auditor. Focus on root cause, corrective actions, SLA and verification.`

      const raw = await callQMSRuntime(userMessage, context)
      const { valid, insufficient, errors: errs, parsed } = validateQMSOutput(raw, retrieved_context_ids)

      if (!valid) { setErrors(errs); setLoading(false); return }
      if (insufficient) {
        setErrors(['INSUFFICIENT_EVIDENCE — the observation does not match any clause in the provided context. Add more evidence detail or select a specific clause.'])
        setLoading(false); return
      }
      setResult(parsed)
    } catch (e) { setErrors([e.message]) }
    setLoading(false)
  }

  const confirm = () => {
    if (!result) return
    onGenerated(result)
    setResult(null)
    setObservationText('')
    setEvidenceText('')
    setSelectedClauses([])
    toast('AI draft loaded — review and confirm before saving as audit record')
  }

  return (
    <div className="border border-navy-700 rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-navy-800 text-left hover:bg-navy-700 transition-colors">
        <Sparkles size={14} className="text-amber-audit" />
        <span className="text-sm font-medium text-white">
          {mode === 'finding' ? 'AI — QMS Clause/NC Assessment' : 'AI — Corrective Action Plan'}
        </span>
        <span className="ml-2 text-xs text-steel-600 font-mono">{PROMPT_VERSION}</span>
        <span className="ml-auto text-xs text-steel-500 mr-2">DRAFT — human sign-off required</span>
        {open ? <ChevronUp size={13} className="text-steel-500" /> : <ChevronDown size={13} className="text-steel-500" />}
      </button>

      {open && (
        <div className="p-4 bg-navy-900 space-y-4">

          {/* Clause selector */}
          <div>
            <label className="block text-xs font-medium text-steel-400 mb-2">
              <BookOpen size={11} className="inline mr-1" />
              Select ISO 9001 clause(s) — max 3 {selectedClauses.length > 0 && <span className="text-amber-audit">({selectedClauses.join(', ')} selected)</span>}
            </label>
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto pr-1">
              {CLAUSE_OPTIONS.map(c => (
                <button key={c.id}
                  onClick={() => toggleClause(c.id)}
                  className={`text-left text-xs px-2 py-1.5 rounded-lg border transition-colors truncate ${
                    selectedClauses.includes(c.id)
                      ? 'bg-amber-900/30 border-amber-700 text-amber-300'
                      : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-navy-500 hover:text-steel-200'
                  }`}>
                  Cl.{c.id} <span className="text-steel-600">— {c.process_area}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audit observation */}
          <div>
            <label className="block text-xs font-medium text-steel-400 mb-1">
              Audit observation <span className="text-red-400">*</span>
              <span className="text-steel-600 font-normal ml-1">— what did you find? (Condition)</span>
            </label>
            <textarea
              value={observationText}
              onChange={e => setObservationText(e.target.value)}
              maxLength={1000}
              placeholder={mode === 'finding'
                ? 'e.g. During walkthrough of the production floor, 3 of 5 operators interviewed were unable to describe the quality policy or their contribution to quality objectives...'
                : 'e.g. Customer complaint received regarding 12 defective units delivered. Root cause suspected to be inadequate incoming inspection...'}
              className="input-field w-full h-20 text-sm resize-none"
            />
          </div>

          {/* Evidence / procedure text (Option C) */}
          <div>
            <label className="block text-xs font-medium text-steel-400 mb-1">
              <Shield size={11} className="inline mr-1" />
              Evidence / procedure text (optional — paste relevant procedure or policy text)
              <span className="text-steel-600 font-normal ml-1">— this becomes the auditor-provided context</span>
            </label>
            <textarea
              value={evidenceText}
              onChange={e => setEvidenceText(e.target.value)}
              maxLength={2000}
              placeholder="Paste relevant extract from the organisation's quality manual, procedure, or policy — e.g. QP-003 Cl.4.2: All staff shall complete annual quality awareness training..."
              className="input-field w-full h-20 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={generate} disabled={loading || !observationText.trim()}
              className={`btn-primary text-sm flex items-center gap-2 ${!observationText.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {loading ? 'Assessing...' : 'Generate assessment'}
            </button>
            {result && (
              <button onClick={confirm} className="btn-secondary text-sm flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" /> Load draft
              </button>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <div>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>
            </div>
          )}

          {/* Result preview */}
          {result && (
            <div className="border border-navy-600 rounded-xl overflow-hidden text-xs">
              {/* Assessment header */}
              <div className="bg-navy-800 px-3 py-2 flex items-center gap-3 flex-wrap">
                <span className={`badge border text-xs px-2 py-0.5 ${CLASSIFICATION_COLORS[result.assessment.classification]}`}>
                  {result.assessment.classification}
                </span>
                <span className={`font-medium ${SEVERITY_COLORS[result.assessment.severity]}`}>
                  {result.assessment.severity} severity
                </span>
                <span className="text-steel-500">
                  Cl.{result.assessment.clause_id} — {result.assessment.clause_title}
                </span>
                <span className="text-steel-600 ml-auto">
                  Confidence: {result.assessment.confidence}
                </span>
              </div>

              <div className="p-3 space-y-2.5 bg-navy-900/50">
                {/* Finding */}
                <div>
                  <div className="text-steel-500 mb-0.5 font-medium">Audit finding (4Cs)</div>
                  <div className="text-steel-300 leading-relaxed">{result.audit_finding}</div>
                </div>

                {/* Evidence excerpt */}
                {result.assessment.evidence_excerpt && (
                  <div>
                    <div className="text-steel-500 mb-0.5 font-medium">Evidence excerpt</div>
                    <div className="text-steel-400 italic border-l-2 border-navy-600 pl-2 leading-relaxed">"{result.assessment.evidence_excerpt}"</div>
                  </div>
                )}

                {/* Root cause */}
                {result.root_cause && (
                  <div>
                    <div className="text-steel-500 mb-0.5 font-medium">Root cause</div>
                    <div className="text-steel-300 leading-relaxed">{result.root_cause}</div>
                  </div>
                )}

                {/* Corrective actions */}
                {result.corrective_actions?.length > 0 && (
                  <div>
                    <div className="text-steel-500 mb-1 font-medium">Corrective actions</div>
                    <div className="space-y-1.5">
                      {result.corrective_actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 bg-navy-800 rounded-lg px-2.5 py-2">
                          <span className="text-amber-audit font-medium flex-shrink-0">{a.step}.</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-steel-300">{a.action}</div>
                            <div className="flex gap-3 mt-0.5 text-steel-500">
                              <span>{a.target_role}</span>
                              <span className="flex items-center gap-0.5"><Clock size={10} /> {a.sla_days}d</span>
                              {a.verification_required && <span className="text-amber-audit">Verification required</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit trail metadata */}
                <div className="flex gap-3 text-steel-600 flex-wrap pt-1 border-t border-navy-700">
                  <span>v{result.prompt_version}</span>
                  <span>Ctx: [{result.retrieved_context_ids?.join(', ')}]</span>
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>

                <div className="text-amber-audit/60 italic">
                  ⚠ DRAFT — human auditor sign-off required before this becomes an audit record
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
