-- ============================================================
-- AuditIQ — Row Level Security (RLS) Policies
-- Apply in: Supabase → SQL Editor → Run
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbc_items ENABLE ROW LEVEL SECURITY;

-- ── profiles ─────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── audit_programmes ─────────────────────────────────────
DROP POLICY IF EXISTS "programmes_select" ON audit_programmes;
DROP POLICY IF EXISTS "programmes_insert" ON audit_programmes;
DROP POLICY IF EXISTS "programmes_update" ON audit_programmes;
DROP POLICY IF EXISTS "programmes_delete" ON audit_programmes;
CREATE POLICY "programmes_select" ON audit_programmes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "programmes_insert" ON audit_programmes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "programmes_update" ON audit_programmes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "programmes_delete" ON audit_programmes FOR DELETE USING (auth.uid() = user_id);

-- ── workpapers ───────────────────────────────────────────
DROP POLICY IF EXISTS "workpapers_select" ON workpapers;
DROP POLICY IF EXISTS "workpapers_insert" ON workpapers;
DROP POLICY IF EXISTS "workpapers_update" ON workpapers;
DROP POLICY IF EXISTS "workpapers_delete" ON workpapers;
CREATE POLICY "workpapers_select" ON workpapers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workpapers_insert" ON workpapers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workpapers_update" ON workpapers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workpapers_delete" ON workpapers FOR DELETE USING (auth.uid() = user_id);

-- ── findings ─────────────────────────────────────────────
DROP POLICY IF EXISTS "findings_select" ON findings;
DROP POLICY IF EXISTS "findings_insert" ON findings;
DROP POLICY IF EXISTS "findings_update" ON findings;
DROP POLICY IF EXISTS "findings_delete" ON findings;
CREATE POLICY "findings_select" ON findings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "findings_insert" ON findings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "findings_update" ON findings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "findings_delete" ON findings FOR DELETE USING (auth.uid() = user_id);

-- ── risk_register ────────────────────────────────────────
DROP POLICY IF EXISTS "risks_select" ON risk_register;
DROP POLICY IF EXISTS "risks_insert" ON risk_register;
DROP POLICY IF EXISTS "risks_update" ON risk_register;
DROP POLICY IF EXISTS "risks_delete" ON risk_register;
CREATE POLICY "risks_select" ON risk_register FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risks_insert" ON risk_register FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risks_update" ON risk_register FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "risks_delete" ON risk_register FOR DELETE USING (auth.uid() = user_id);

-- ── pbc_items ────────────────────────────────────────────
DROP POLICY IF EXISTS "pbc_select" ON pbc_items;
DROP POLICY IF EXISTS "pbc_insert" ON pbc_items;
DROP POLICY IF EXISTS "pbc_update" ON pbc_items;
DROP POLICY IF EXISTS "pbc_delete" ON pbc_items;
CREATE POLICY "pbc_select" ON pbc_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pbc_insert" ON pbc_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pbc_update" ON pbc_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pbc_delete" ON pbc_items FOR DELETE USING (auth.uid() = user_id);

-- ── Storage ──────────────────────────────────────────────
DROP POLICY IF EXISTS "storage_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete" ON storage.objects;
CREATE POLICY "storage_select" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
