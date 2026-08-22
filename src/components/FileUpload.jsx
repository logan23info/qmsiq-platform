import { useState, useRef } from 'react'
import { Upload, File, CheckCircle2, AlertCircle, Loader2, Download, Trash2, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { uploadFile, buildFilePath, getSignedUrl, createWorkpaper } from '../lib/supabase'

const STANDARDS = ['ISO 19011', 'ISO 27001', 'ISO 27002', 'ISO 27005', 'ISO 9001', 'IMS']
const PHASES = ['TOD', 'TOI', 'TOE', 'Finding', 'Meeting', 'Report', 'Planning', 'PBC Evidence']
const CLAUSES = {
  'ISO 19011': ['Clause 4', 'Clause 5', 'Clause 6.2', 'Clause 6.3', 'TOD', 'TOI', 'TOE', 'Findings', 'Meetings', 'Clause 6.5', 'Clause 7'],
  'ISO 27001': ['Clause 4', 'Clause 5', 'Clause 6', 'Clause 7', 'Clause 8', 'Clause 9', 'Clause 10'],
  'ISO 27002': ['A.5 Organizational', 'A.6 People', 'A.7 Physical', 'A.8 Technological'],
  'ISO 27005': ['Asset Register', 'Risk Register', 'Risk Treatment Plan', 'Scenarios'],
  'ISO 9001': ['Clause 5', 'Clause 7', 'Clause 8', 'Clause 9', 'Clause 10'],
  'IMS': ['Cross-Walk', 'Joint Worksheets'],
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png', 'image/jpeg',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export default function FileUpload({ onUploaded }) {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const fileRef = useRef(null)

  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const [error, setError] = useState('')

  const [meta, setMeta] = useState({
    title: '',
    standard: 'ISO 27001',
    clause_control: '',
    phase: 'TOD',
    auditor: '',
    notes: '',
  })

  function handleFile(f) {
    setError('')
    setUploaded(null)
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('File type not supported. Use PDF, Word, Excel, PowerPoint, PNG, JPG, or TXT.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Maximum size is 50MB.')
      return
    }
    setFile(f)
    if (!meta.title) setMeta(p => ({ ...p, title: f.name.replace(/\.[^/.]+$/, '') }))
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleUpload() {
    if (!file) { setError('Select a file first'); return }
    if (!meta.title) { setError('Workpaper title is required'); return }
    if (!activeProgramme) { setError('Select an audit programme first'); return }

    setUploading(true)
    setError('')

    try {
      // Build structured path
      const filePath = buildFilePath({
        userId: user.id,
        programmeId: activeProgramme.id,
        programmeRef: activeProgramme.programme_id,
        standard: meta.standard,
        phase: meta.phase,
        wpRef: 'WP-TEMP', // will be replaced by DB trigger
        originalName: file.name,
      })

      // Upload to Supabase storage
      await uploadFile({ file, filePath })

      // Create workpaper record (DB trigger auto-assigns WP-NNN)
      const wp = await createWorkpaper({
        user_id: user.id,
        programme_id: activeProgramme.id,
        title: meta.title,
        standard: meta.standard,
        clause_control: meta.clause_control,
        phase: meta.phase,
        auditor: meta.auditor,
        notes: meta.notes,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        status: 'Draft',
      })

      // Rename file with proper WP ref
      const finalPath = filePath.replace('WP-TEMP', wp.workpaper_ref)
      // Note: Supabase doesn't have rename — path already includes the ref on next upload
      // The workpaper_ref from the DB is the canonical ID

      setUploaded({ ...wp, file_path: filePath })
      setFile(null)
      setMeta({ title: '', standard: 'ISO 27001', clause_control: '', phase: 'TOD', auditor: '', notes: '' })
      if (fileRef.current) fileRef.current.value = ''
      onUploaded?.(wp)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload() {
    if (!uploaded?.file_path) return
    try {
      const url = await getSignedUrl(uploaded.file_path)
      window.open(url, '_blank')
    } catch (err) {
      setError('Could not generate download link.')
    }
  }

  const clauseOptions = CLAUSES[meta.standard] || []

  return (
    <div className="space-y-4">
      {!activeProgramme && (
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 flex gap-2">
          <AlertCircle size={14} className="text-amber-audit flex-shrink-0 mt-0.5" />
          <span className="text-xs text-amber-200/80">Select an audit programme from the header before uploading files.</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-amber-audit bg-amber-900/10' :
          file ? 'border-emerald-600 bg-emerald-900/10' :
          'border-navy-600 hover:border-steel-500 hover:bg-navy-800/30'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            <File size={28} className="text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-white mb-1">{file.name}</div>
            <div className="text-xs text-steel-400">{(file.size / 1024).toFixed(0)} KB — click to change</div>
          </>
        ) : (
          <>
            <Upload size={28} className="text-steel-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-white mb-1">Drop file here or click to browse</div>
            <div className="text-xs text-steel-400">PDF, Word, Excel, PowerPoint, PNG, JPG, TXT — max 50MB</div>
          </>
        )}
      </div>

      {/* Metadata */}
      {file && (
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white">Workpaper Details</h3>

          <div>
            <label className="block text-xs text-steel-400 mb-1">Workpaper Title *</label>
            <input className="input-field" placeholder="e.g. Access Control Policy — TOD Design Review" value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-steel-400 mb-1">Standard</label>
              <select className="input-field" value={meta.standard} onChange={e => setMeta(p => ({ ...p, standard: e.target.value, clause_control: '' }))}>
                {STANDARDS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Clause / Control</label>
              <select className="input-field" value={meta.clause_control} onChange={e => setMeta(p => ({ ...p, clause_control: e.target.value }))}>
                <option value="">Select...</option>
                {clauseOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-steel-400 mb-1">Phase</label>
              <select className="input-field" value={meta.phase} onChange={e => setMeta(p => ({ ...p, phase: e.target.value }))}>
                {PHASES.map(ph => <option key={ph}>{ph}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-steel-400 mb-1">Auditor</label>
            <input className="input-field" placeholder="e.g. John Smith, CISA" value={meta.auditor} onChange={e => setMeta(p => ({ ...p, auditor: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs text-steel-400 mb-1">Notes (optional)</label>
            <textarea className="textarea-field" rows={2} placeholder="e.g. TOD concluded — design adequate. Proceeding to TOI." value={meta.notes} onChange={e => setMeta(p => ({ ...p, notes: e.target.value }))} />
          </div>

          {/* File path preview */}
          {activeProgramme && (
            <div className="bg-navy-800 border border-navy-600 rounded-lg p-3">
              <div className="text-xs text-steel-400 mb-1">File will be saved as:</div>
              <div className="text-xs font-mono text-amber-audit break-all">
                {user.id.slice(0, 8)}.../{activeProgramme.id.slice(0, 8)}.../{meta.standard.replace(/[^a-zA-Z0-9]/g, '_')}/{meta.phase}/WP-NNN_{meta.standard.replace(/[^a-zA-Z0-9]/g, '_')}_{meta.phase}_{file?.name?.replace(/\.[^/.]+$/, '').slice(0, 20) || 'filename'}_{new Date().toISOString().split('T')[0]}.{file?.name?.split('.').pop()}
              </div>
            </div>
          )}

          {error && <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</div>}

          <button onClick={handleUpload} disabled={uploading || !activeProgramme} className="btn-primary w-full justify-center">
            {uploading
              ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
              : <><Upload size={14} /> Upload to Audit Programme</>}
          </button>
        </div>
      )}

      {/* Success */}
      {uploaded && (
        <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-emerald-300 mb-1">
                Uploaded — {uploaded.workpaper_ref}
              </div>
              <div className="text-xs text-steel-300 mb-1">{uploaded.title}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="badge badge-steel">{uploaded.standard}</span>
                <span className="badge badge-steel">{uploaded.phase}</span>
                <span className="badge badge-steel">{uploaded.clause_control}</span>
              </div>
            </div>
            <button onClick={handleDownload} className="btn-secondary py-1.5 px-2.5 text-xs flex-shrink-0">
              <ExternalLink size={11} /> Open
            </button>
          </div>
        </div>
      )}

      {error && !file && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">{error}</div>
      )}
    </div>
  )
}
