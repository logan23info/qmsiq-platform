import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
    .from('audit_programmes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
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
