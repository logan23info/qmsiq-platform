import { useState, useEffect } from 'react'
import { getQMSContext, getStakeholders, getQMSPolicy, getObjectives } from '../lib/supabase'

// Builds <priorContext> XML block for AI — same pattern as master build prompt
function buildContextBlock(data) {
  const parts = []
  if (data.ctx) {
    parts.push(`<clause id="4.1-4.3" title="Context and Scope">
Scope: ${data.ctx.scope || 'Not defined'}
Internal issues: ${data.ctx.internal_issues || 'Not defined'}
External issues: ${data.ctx.external_issues || 'Not defined'}
Exclusions: ${data.ctx.exclusions || 'None'}
</clause>`)
  }
  if (data.sth?.length) {
    const top = data.sth.slice(0, 8).map(s => `- ${s.name} (${s.category}): ${s.needs}`).join('\n')
    parts.push(`<clause id="4.2" title="Interested Parties">
${top}
</clause>`)
  }
  if (data.pol) {
    parts.push(`<clause id="5.2" title="Quality Policy">
${data.pol.policy_text || 'Not defined'}
</clause>`)
  }
  if (data.obj?.length) {
    const top = data.obj.slice(0, 6).map(o => `- ${o.objective} | Measure: ${o.measure} | Target: ${o.target}`).join('\n')
    parts.push(`<clause id="6.2" title="Quality Objectives">
${top}
</clause>`)
  }
  if (!parts.length) return null
  return `<priorContext>\n${parts.join('\n')}\n</priorContext>`
}

// Per-module config — what prior data to load
const MODULE_DEPS = {
  'ISO 9001:2015 Cl.4.1–4.3': [],
  'ISO 9001:2015 Cl.4.2':     ['ctx'],
  'ISO 9001:2015 Cl.5.2':     ['ctx', 'sth'],
  'ISO 9001:2015 Cl.6.2':     ['ctx', 'sth', 'pol'],
  'ISO 9001:2015 Cl.6.3':     ['ctx', 'obj'],
  'ISO 9001:2015 Cl.7.2':     ['ctx', 'obj'],
  'ISO 9001:2015 Cl.7.5':     ['ctx', 'pol', 'obj'],
  'ISO 9001:2015 Cl.8.1':     ['ctx', 'pol', 'obj'],
  'ISO 9001:2015 Cl.8.3':     ['ctx', 'obj'],
  'ISO 9001:2015 Cl.10.3':    ['ctx', 'pol', 'obj'],
}

export function useQMSContext(clause, programmeId) {
  const [priorContext, setPriorContext] = useState(null)
  const [priorLoading, setPriorLoading] = useState(false)
  const [orgProfile, setOrgProfile] = useState(null)

  useEffect(() => {
    const deps = MODULE_DEPS[clause] || []
    if (!programmeId || !deps.length) { setPriorContext(null); setPriorLoading(false); return }
    setPriorLoading(true)
    const fetches = {}
    if (deps.includes('ctx')) fetches.ctx = getQMSContext(programmeId)
    if (deps.includes('sth')) fetches.sth = getStakeholders(programmeId)
    if (deps.includes('pol')) fetches.pol = getQMSPolicy(programmeId)
    if (deps.includes('obj')) fetches.obj = getObjectives(programmeId)

    Promise.all(Object.entries(fetches).map(async ([k, p]) => [k, await p]))
      .then(entries => {
        const data = Object.fromEntries(entries)
        setPriorContext(buildContextBlock(data))
        // Expose org profile for pre-filling AI generator fields
        if (data.ctx) {
          setOrgProfile({
            name: data.ctx.org_name || '',
            industry: data.ctx.industry || '',
            products: data.ctx.products || '',
            size: data.ctx.org_size || '',
            customers: data.ctx.customers || '',
            regulations: data.ctx.regulations || '',
            extra: '',
          })
        }
        setPriorLoading(false)
      })
      .catch(() => setPriorLoading(false))
  }, [clause, programmeId])

  return { priorContext, priorLoading, orgProfile }
}

// Next module map for navigation continuity
export const NEXT_MODULE = {
  'ISO 9001:2015 Cl.4.1–4.3': { label: 'Interested Parties', path: '/qms/stakeholders' },
  'ISO 9001:2015 Cl.4.2':     { label: 'Quality Policy', path: '/qms/policy' },
  'ISO 9001:2015 Cl.5.2':     { label: 'Quality Objectives', path: '/qms/objectives' },
  'ISO 9001:2015 Cl.6.2':     { label: 'Change Register', path: '/qms/changes' },
  'ISO 9001:2015 Cl.6.3':     { label: 'Competence Register', path: '/qms/competence' },
  'ISO 9001:2015 Cl.7.2':     { label: 'Document Register', path: '/qms/documents' },
  'ISO 9001:2015 Cl.7.5':     { label: 'Operational Planning', path: '/qms/operational' },
  'ISO 9001:2015 Cl.8.1':     { label: 'Design & Development', path: '/qms/design' },
  'ISO 9001:2015 Cl.8.3':     { label: 'Audit Schedule', path: '/qms/audit-schedule' },
  'ISO 9001:2015 Cl.9.2':     { label: 'Continual Improvement', path: '/qms/improvements' },
  'ISO 9001:2015 Cl.10.3':    null,
}
