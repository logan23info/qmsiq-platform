import { log, logError } from './logger'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  logError('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
/**
 * @typedef {{ id: string, full_name: string, role: string, organisation: string, updated_at?: string }} Profile
 * @typedef {{ id: string, user_id: string, programme_id: string, name: string, standards: string[], status: string, programme_type: string, lead_auditor: string, audit_period_start?: string, audit_period_end?: string }} Programme
 * @typedef {{ id: string, programme_id: string, user_id: string, title: string, workpaper_ref: string, standard: string, clause_control: string, phase: string, status: string, notes?: string, ai_generated_content?: string, file_path?: string }} Workpaper
 * @typedef {{ id: string, programme_id: string, user_id: string, finding_ref: string, title: string, status: string, rating: string, clause: string, description?: string, evidence?: string }} Finding
 * @typedef {{ id: string, programme_id: string, user_id: string, risk_ref: string, title: string, likelihood: string, impact: string, status: string, description?: string, treatment?: string }} Risk
 * @typedef {{ id: string, programme_id: string, user_id: string, pbc_ref: string, description: string, status: string, priority: string, domain?: string }} PBCItem
 * @typedef {{ id: string, programme_id: string, user_id: string, role: string, invited_email?: string, invited_by?: string, joined_at?: string }} Member
 */


// ─── FILE PATH BUILDER ────────────────────────────────────────
// Structure: {userId}/{programmeId}/{standard}/{phase}/{prefix}_{filename}
export function buildFilePath({ userId, programmeId, programmeRef, standard, phase, wpRef, originalName }) {
  const safeStandard = standard.replace(/[^a-zA-Z0-9]/g, '_')
  const safePhase = phase.replace(/[^a-zA-Z0-9]/g, '_')
  const ext = originalName.split('.').pop()
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
  const date = new Date().toISOString().split('T')[0]
  const fileName = `${wpRef}_${safeStandard}_${safePhase}_${baseName}_${date}.${ext}`
  return `${userId}/${programmeId}/${safeStandard}/${safePhase}/${fileName}`
}

// ─── UPLOAD FILE ─────────────────────────────────────────────
export async function uploadFile({ file, filePath }) {
  const { data, error } = await supabase.storage
    .from('workpapers')
    .upload(filePath, file, { upsert: false })
  if (error) throw error
  return data
}

// ─── GET SIGNED URL ──────────────────────────────────────────
export async function getSignedUrl(filePath) {
  const { data, error } = await supabase.storage
    .from('workpapers')
    .createSignedUrl(filePath, 3600) // 1 hour expiry
  if (error) throw error
  return data.signedUrl
}

// ─── DELETE FILE ─────────────────────────────────────────────
export async function deleteFile(filePath) {
  const { error } = await supabase.storage
    .from('workpapers')
    .remove([filePath])
  if (error) throw error
}

// ─── AUDIT PROGRAMMES ────────────────────────────────────────
export async function getProgrammes(userId) {
  // Fetch programmes owned by user
  const { data: owned, error: ownedErr } = await supabase
    .from('audit_programmes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (ownedErr) throw ownedErr

  // Fetch programmes user is a member of (invited)
  const { data: memberships } = await supabase
    .from('programme_members')
    .select('programme_id, role')
    .eq('user_id', userId)

  let shared = []
  if (memberships && memberships.length > 0) {
    const ownedIds = (owned || []).map(p => p.id)
    const memberIds = memberships
      .map(m => m.programme_id)
      .filter(id => !ownedIds.includes(id))

    if (memberIds.length > 0) {
      const { data: memberProgs } = await supabase
        .from('audit_programmes')
        .select('*')
        .in('id', memberIds)
        .order('created_at', { ascending: false })

      // Tag each with member role
      shared = (memberProgs || []).map(p => {
        const membership = memberships.find(m => m.programme_id === p.id)
        return { ...p, _memberRole: membership?.role }
      })
    }
  }

  return [...(owned || []), ...shared]
}

export async function createProgramme(programme) {
  const { data, error } = await supabase
    .from('audit_programmes')
    .insert(programme)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProgramme(id, updates) {
  const { data, error } = await supabase
    .from('audit_programmes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── WORKPAPERS ──────────────────────────────────────────────
export async function getWorkpapers(programmeId) {
  const { data, error } = await supabase
    .from('workpapers')
    .select('*')
    .eq('programme_id', programmeId)
    .order('workpaper_ref', { ascending: true })
  if (error) throw error
  return data
}

export async function createWorkpaper(workpaper) {
  const { data, error } = await supabase
    .from('workpapers')
    .insert(workpaper)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkpaper(id, updates) {
  const { data, error } = await supabase
    .from('workpapers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkpaper(id, filePath) {
  if (filePath) await deleteFile(filePath)
  const { error } = await supabase
    .from('workpapers')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── FINDINGS ────────────────────────────────────────────────
export async function getFindings(programmeId) {
  const { data, error } = await supabase
    .from('findings')
    .select('*')
    .eq('programme_id', programmeId)
    .order('finding_ref', { ascending: true })
  if (error) throw error
  return data
}

export async function createFinding(finding) {
  const { data, error } = await supabase
    .from('findings')
    .insert(finding)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFinding(id, updates) {
  const { data, error } = await supabase
    .from('findings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── RISK REGISTER ───────────────────────────────────────────
export async function getRisks(programmeId) {
  const { data, error } = await supabase
    .from('risk_register')
    .select('*')
    .eq('programme_id', programmeId)
    .order('risk_ref', { ascending: true })
  if (error) throw error
  return data
}

export async function createRisk(risk) {
  const { data, error } = await supabase
    .from('risk_register')
    .insert(risk)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── PBC ITEMS ───────────────────────────────────────────────
export async function getPBCItems(programmeId) {
  const { data, error } = await supabase
    .from('pbc_items')
    .select('*')
    .eq('programme_id', programmeId)
    .order('pbc_ref', { ascending: true })
  if (error) throw error
  return data
}

export async function createPBCItem(item) {
  const { data, error } = await supabase
    .from('pbc_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePBCItem(id, updates) {
  const { data, error } = await supabase
    .from('pbc_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Delete & Update functions ─────────────────────────
export async function updateRisk(id, updates) {
  const { data, error } = await supabase.from('risk_register').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRisk(id) {
  const { error } = await supabase.from('risk_register').delete().eq('id', id)
  if (error) throw error
}

export async function deleteFinding(id) {
  const { error } = await supabase.from('findings').delete().eq('id', id)
  if (error) throw error
}

export async function deletePBCItem(id) {
  const { error } = await supabase.from('pbc_items').delete().eq('id', id)
  if (error) throw error
}

export async function deleteWorkpaperRecord(id) {
  const { error } = await supabase.from('workpapers').delete().eq('id', id)
  if (error) throw error
}

// ── Team / Programme Members ─────────────────────────────

export async function getProgrammeMembers(programmeId) {
  const { data, error } = await supabase
    .from('programme_members')
    .select('id, programme_id, user_id, role, invited_by, invited_email, joined_at')
    .eq('programme_id', programmeId)
    .order('joined_at', { ascending: true })
  if (error) throw error
  if (!data || data.length === 0) return []
  const userIds = data.map(m => m.user_id).filter(Boolean)
  const { data: profiles } = await supabase
    .from('profiles').select('id, full_name, role, organisation').in('id', userIds)
  const pm = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  return data.map(m => ({ ...m, profiles: pm[m.user_id] || null }))
}

export async function inviteMember(programmeId, email, role = 'auditor', invitedBy) {
  // First check if user exists in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (
      await supabase.auth.admin?.getUserByEmail?.(email)
    )?.data?.user?.id)
    .single()

  // Look up user by checking auth — find by email via a lookup
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(100)

  // Insert membership record with email for later matching on login
  const { data, error } = await supabase
    .from('programme_members')
    .insert({
      programme_id: programmeId,
      user_id: invitedBy, // placeholder — updated when they accept
      role,
      invited_by: invitedBy,
      invited_email: email,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addMemberByUserId(programmeId, userId, role = 'auditor', invitedBy) {
  const { data, error } = await supabase
    .from('programme_members')
    .insert({
      programme_id: programmeId,
      user_id: userId,
      role,
      invited_by: invitedBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMemberRole(memberId, role) {
  const { data, error } = await supabase
    .from('programme_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from('programme_members')
    .delete()
    .eq('id', memberId)
  if (error) throw error
}

export async function getMyRole(programmeId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('programme_members')
    .select('role')
    .eq('programme_id', programmeId)
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data?.role
}

// ─── GAP ANALYSIS ─────────────────────────────────────────────
export async function getGapAnalysis(programmeId) {
  const { data } = await supabase.from('gap_analysis').select('*').eq('programme_id', programmeId).maybeSingle()
  return data
}

export async function upsertGapAnalysis(programmeId, userId, ratings, knownUpdatedAt = null) {
  // Optimistic locking — if someone else saved since we loaded, warn rather than silently overwrite
  if (knownUpdatedAt) {
    const { data: current } = await supabase.from('gap_analysis').select('updated_at').eq('programme_id', programmeId).maybeSingle()
    if (current?.updated_at && current.updated_at !== knownUpdatedAt) {
      throw new Error('CONFLICT: Gap analysis was updated by another team member. Reload to see the latest version before saving.')
    }
  }
  const { data, error } = await supabase.from('gap_analysis').upsert(
    { programme_id: programmeId, user_id: userId, ratings, updated_at: new Date().toISOString() },
    { onConflict: 'programme_id' }
  ).select().single()
  if (error) throw error
  return data
}

// ─── AUDIT UNIVERSE PBC ────────────────────────────────────────
export async function getAuditUniverseItems(programmeId) {
  const { data, error } = await supabase.from('pbc_items').select('*').eq('programme_id', programmeId).eq('domain', 'AuditUniverse').order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createAuditUniverseItem(entry) {
  const { data, error } = await supabase.from('pbc_items').insert({ ...entry, domain: 'AuditUniverse' }).select().single()
  if (error) throw error
  return data
}

export async function updateAuditUniverseItem(id, updates) {
  const { data, error } = await supabase.from('pbc_items').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ─── PROFILE ──────────────────────────────────────────────────
export async function upsertProfile(userId, updates) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ─── BULK INSERT ──────────────────────────────────────────────
export async function bulkInsertPBCItems(rows) {
  const { error } = await supabase.from('pbc_items').insert(rows)
  if (error) throw error
}

export async function bulkInsertWorkpapers(rows) {
  const { error } = await supabase.from('workpapers').insert(rows)
  if (error) throw error
}

export async function deleteProgramme(id) {
  const { error } = await supabase.from('audit_programmes').delete().eq('id', id)
  if (error) throw error
}

// ─── QMS IMPLEMENTATION ────────────────────────────────────────

// Generic helpers — used by all 7 QMS modules
async function qmsGet(table, programmeId) {
  const { data } = await supabase.from(table).select('*').eq('programme_id', programmeId).order('created_at')
  return data || []
}
async function qmsGetOne(table, programmeId) {
  const { data } = await supabase.from(table).select('*').eq('programme_id', programmeId).maybeSingle()
  return data
}
async function qmsUpsertOne(table, programmeId, userId, updates) {
  const { data, error } = await supabase.from(table).upsert(
    { programme_id: programmeId, user_id: userId, ...updates, updated_at: new Date().toISOString() },
    { onConflict: 'programme_id' }
  ).select().single()
  if (error) throw error
  return data
}
async function qmsInsert(table, programmeId, userId, record) {
  const { data, error } = await supabase.from(table).insert(
    { programme_id: programmeId, user_id: userId, ...record, updated_at: new Date().toISOString() }
  ).select().single()
  if (error) throw error
  return data
}
async function qmsUpdate(table, id, updates) {
  const { data, error } = await supabase.from(table).update(
    { ...updates, updated_at: new Date().toISOString() }
  ).eq('id', id).select().single()
  if (error) throw error
  return data
}
async function qmsDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

// ── Context (Cl.4.1–4.3) — one-row ─────────────────────────
export const getQMSContext = (pid) => qmsGetOne('qms_context', pid)
export const saveQMSContext = (pid, uid, data) => qmsUpsertOne('qms_context', pid, uid, data)

// ── Stakeholders (Cl.4.2) ───────────────────────────────────
export const getStakeholders = (pid) => qmsGet('qms_stakeholders', pid)
export const createStakeholder = (pid, uid, r) => qmsInsert('qms_stakeholders', pid, uid, r)
export const updateStakeholder = (id, r) => qmsUpdate('qms_stakeholders', id, r)
export const deleteStakeholder = (id) => qmsDelete('qms_stakeholders', id)

// ── Policy (Cl.5.2) — one-row ───────────────────────────────
export const getQMSPolicy = (pid) => qmsGetOne('qms_policy', pid)
export const saveQMSPolicy = (pid, uid, data) => qmsUpsertOne('qms_policy', pid, uid, data)

// ── Objectives (Cl.6.2) ─────────────────────────────────────
export const getObjectives = (pid) => qmsGet('qms_objectives', pid)
export const createObjective = (pid, uid, r) => qmsInsert('qms_objectives', pid, uid, r)
export const updateObjective = (id, r) => qmsUpdate('qms_objectives', id, r)
export const deleteObjective = (id) => qmsDelete('qms_objectives', id)

// ── Changes (Cl.6.3) ────────────────────────────────────────
export const getChanges = (pid) => qmsGet('qms_changes', pid)
export const createChange = (pid, uid, r) => qmsInsert('qms_changes', pid, uid, r)
export const updateChange = (id, r) => qmsUpdate('qms_changes', id, r)
export const deleteChange = (id) => qmsDelete('qms_changes', id)

// ── Competence (Cl.7.2) ─────────────────────────────────────
export const getCompetence = (pid) => qmsGet('qms_competence', pid)
export const createCompetence = (pid, uid, r) => qmsInsert('qms_competence', pid, uid, r)
export const updateCompetence = (id, r) => qmsUpdate('qms_competence', id, r)
export const deleteCompetence = (id) => qmsDelete('qms_competence', id)

// ── Documents (Cl.7.5) ──────────────────────────────────────
export const getDocuments = (pid) => qmsGet('qms_documents', pid)
export const createDocument = (pid, uid, r) => qmsInsert('qms_documents', pid, uid, r)
export const updateDocument = (id, r) => qmsUpdate('qms_documents', id, r)
export const deleteDocument = (id) => qmsDelete('qms_documents', id)

// ─── QMS XLSX export helpers ───────────────────────────────
export async function getAllQMSData(programmeId) {
  const [ctx, sth, pol, obj, chg, cmp, doc] = await Promise.all([
    qmsGetOne('qms_context', programmeId),
    qmsGet('qms_stakeholders', programmeId),
    qmsGetOne('qms_policy', programmeId),
    qmsGet('qms_objectives', programmeId),
    qmsGet('qms_changes', programmeId),
    qmsGet('qms_competence', programmeId),
    qmsGet('qms_documents', programmeId),
  ])
  return { ctx, sth, pol, obj, chg, cmp, doc }
}
