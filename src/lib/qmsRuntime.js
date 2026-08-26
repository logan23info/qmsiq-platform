/**
 * QMS Runtime Module — ISO 9001:2015 Clause/NC Assessment
 * Shared by FindingRegister and CAPATracker
 * Per master build prompt: prompt_version, model, retrieved_context_ids, timestamp on every output
 * Temperature: 0.2 enforced via Edge Function system prompt
 */

import CLAUSES from '../data/iso9001_clauses.json'

export const PROMPT_VERSION = 'qms-runtime-v1.0'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// ─── Context retrieval ────────────────────────────────────────
// Option C: static clause data + user-provided evidence text
export function retrieveContext(clauseIds = [], evidenceText = '') {
  const clauses = clauseIds
    .map(id => CLAUSES.clauses[id])
    .filter(Boolean)

  if (!clauses.length && !evidenceText.trim()) return { context: '', retrieved_context_ids: [] }

  const clauseContext = clauses.map(c =>
    `<clause id="${c.id}" title="${c.title}" process_area="${c.process_area}">
${c.description}
Mandatory evidence: ${c.mandatory_evidence.join('; ')}
Common NCs: ${c.common_ncs.join('; ')}
</clause>`
  ).join('\n')

  const evidenceContext = evidenceText.trim()
    ? `\n<evidence_provided_by_auditor>\n${evidenceText.trim()}\n</evidence_provided_by_auditor>`
    : ''

  return {
    context: `<context>\n${clauseContext}${evidenceContext}\n</context>`,
    retrieved_context_ids: clauses.map(c => c.id)
  }
}

// ─── System prompt — per project doc schema ───────────────────
export const QMS_RUNTIME_SYSTEM_PROMPT = `[ROLE] ISO 9001:2015 Lead QMS Auditor embedded in audit-platform.
[TEMPERATURE] 0.2 — deterministic, no guessing.
[SOURCE OF TRUTH] Use ONLY the <context> provided — no prior-knowledge clause text. Do not invent clause requirements not present in context.
[SCOPE] Clause mapping + process area (design, procurement, production, delivery, CAPA) + nonconformity class (Major NC | Minor NC | Observation | OFI | Conforming) + root cause vs symptom.
[STEPS]
1. Map observation to clause ID(s) present in context
2. Classify: Conforming | Minor NC | Major NC | Observation | OFI | INSUFFICIENT_EVIDENCE
3. Determine severity: Low | Medium | High | Critical
4. Determine confidence: High | Medium | Low
5. Extract evidence_excerpt — exact quote from context that supports the finding (under 30 words)
6. If any NC: determine root_cause (required — never omit)
7. Generate corrective_actions with target_role, sla_days, verification_required
[CONSTRAINTS]
- JSON only. No markdown. No preamble. No explanation outside the JSON.
- Cite only clause IDs present in context — never invent clause text.
- root_cause is REQUIRED for any classification that is not Conforming or OFI.
- Return INSUFFICIENT_EVIDENCE as the classification if context is empty or no exact clause match.
- Never state or imply output is final — all findings are DRAFT requiring human auditor sign-off.
[OUTPUT SCHEMA]
{
  "assessment": {
    "clause_id": "string — from context only",
    "clause_title": "string — from context only",
    "process_area": "string",
    "classification": "Conforming|Minor NC|Major NC|Observation|OFI|INSUFFICIENT_EVIDENCE",
    "severity": "Low|Medium|High|Critical|N/A",
    "confidence": "High|Medium|Low",
    "evidence_excerpt": "string — exact snippet from context under 30 words, or null"
  },
  "audit_finding": "string — factual observation using 4Cs: Condition observed, Criteria (clause), Cause, Consequence",
  "root_cause": "string — required for any NC, null for Conforming/OFI/INSUFFICIENT_EVIDENCE",
  "corrective_actions": [
    {
      "step": 1,
      "action": "string",
      "target_role": "string",
      "sla_days": number,
      "verification_required": true|false
    }
  ],
  "prompt_version": "${PROMPT_VERSION}",
  "model": "string — to be filled by runtime",
  "retrieved_context_ids": ["string"],
  "timestamp": "string — ISO 8601"
}`

// ─── Schema validation (Zod-equivalent, manual) ───────────────
// Per project doc: validate before saving, block if required fields missing
export function validateQMSOutput(raw, retrievedContextIds) {
  const errors = []
  let parsed

  try {
    const text = raw.replace(/```json|```/g, '').trim()
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON object found')
    parsed = JSON.parse(text.slice(start, end + 1))
  } catch {
    return { valid: false, errors: ['AI returned invalid JSON — please retry'], parsed: null }
  }

  // INSUFFICIENT_EVIDENCE — valid short-circuit
  if (parsed.assessment?.classification === 'INSUFFICIENT_EVIDENCE') {
    return {
      valid: true,
      insufficient: true,
      errors: [],
      parsed: {
        ...parsed,
        prompt_version: PROMPT_VERSION,
        retrieved_context_ids: retrievedContextIds,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Required fields
  if (!parsed.assessment?.clause_id) errors.push('Missing clause_id')
  if (!parsed.assessment?.classification) errors.push('Missing classification')
  if (!parsed.assessment?.severity) errors.push('Missing severity')
  if (!parsed.audit_finding) errors.push('Missing audit_finding')

  // root_cause required for any NC
  const nc = ['Minor NC', 'Major NC']
  if (nc.includes(parsed.assessment?.classification) && !parsed.root_cause) {
    errors.push('root_cause is required for NC findings')
  }

  // corrective_actions must be array
  if (!Array.isArray(parsed.corrective_actions)) {
    errors.push('corrective_actions must be an array')
  }

  if (errors.length) return { valid: false, errors, parsed: null }

  // Stamp metadata
  parsed.prompt_version = PROMPT_VERSION
  parsed.retrieved_context_ids = retrievedContextIds
  parsed.timestamp = new Date().toISOString()

  return { valid: true, insufficient: false, errors: [], parsed }
}

// ─── Edge Function call with determinism header ───────────────
export async function callQMSRuntime(userMessage, context) {
  const systemPrompt = `${QMS_RUNTIME_SYSTEM_PROMPT}\n\n${context}`
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ systemPrompt, userMessage })
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || `Error ${res.status}`)
  return data.content || ''
}

// ─── Helpers ──────────────────────────────────────────────────
export function getClauseOptions() {
  return Object.values(CLAUSES.clauses).map(c => ({
    id: c.id,
    label: `Cl.${c.id} — ${c.title}`,
    process_area: c.process_area,
  }))
}

export function getClause(id) {
  return CLAUSES.clauses[id] || null
}

export const CLASSIFICATION_COLORS = {
  'Major NC': 'text-red-400 bg-red-900/20 border-red-700',
  'Minor NC': 'text-orange-400 bg-orange-900/20 border-orange-700',
  'Observation': 'text-amber-400 bg-amber-900/20 border-amber-700',
  'OFI': 'text-blue-400 bg-blue-900/20 border-blue-700',
  'Conforming': 'text-emerald-400 bg-emerald-900/20 border-emerald-700',
  'INSUFFICIENT_EVIDENCE': 'text-steel-400 bg-navy-700 border-navy-600',
}

export const SEVERITY_COLORS = {
  Critical: 'text-red-400',
  High: 'text-orange-400',
  Medium: 'text-amber-400',
  Low: 'text-emerald-400',
  'N/A': 'text-steel-500',
}
