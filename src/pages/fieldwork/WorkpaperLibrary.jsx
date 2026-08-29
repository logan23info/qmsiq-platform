import { useState, useEffect, useCallback } from 'react'
import { Upload, FileText, Download, Trash2, Loader2, FolderOpen, Search, X, CloudUpload } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useProgramme } from '../../context/ProgrammeContext'
import { getWorkpapers, createWorkpaper, deleteWorkpaper, deleteWorkpaperRecord, uploadFile, getSignedUrl, buildFilePath } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import ConfirmModal from '../../components/ConfirmModal'

const STANDARDS = ['ISO 19011', 'ISO 27001', 'ISO 27002', 'ISO 27005', 'General']
const PHASES = ['Pre-Audit', 'TOD', 'TOI', 'TOE', 'Finding', 'Meeting', 'Report', 'General']
const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg'

const phaseColors = {
  TOD: 'bg-blue-900/40 text-blue-300', TOI: 'bg-purple-900/40 text-purple-300',
  TOE: 'bg-emerald-900/40 text-emerald-300', Finding: 'bg-red-900/40 text-red-300',
  Report: 'bg-pink-900/40 text-pink-300', Meeting: 'bg-cyan-900/40 text-cyan-300',
  'Pre-Audit': 'bg-amber-900/40 text-amber-300', General: 'bg-navy-700 text-steel-400',
}

function UploadModal({ onClose, programme, user, onUploaded }) {
  const { toast } = useToast()
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ standard: 'ISO 27001', phase: 'TOD', clause_control: '', title: '', notes: '' })
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handleFile = (f) => {
    if (f.size > 52428800) { toast('File too large — max 50MB', 'error'); return }
    setFile(f)
    if (!form.title) setForm(p => ({ ...p, title: f.name.replace(/\.[^.]+$/, '') }))
  }

  const upload = async () => {
    if (!file || !form.standard || !form.phase) return
    setUploading(true)
    try {
      const wpRef = `WP-TMP-${Date.now()}`
      const filePath = buildFilePath({ userId: user.id, programmeId: programme.id, programmeRef: programme.programme_id, standard: form.standard, phase: form.phase, wpRef, originalName: file.name })
      await uploadFile({ file, filePath })
      const wp = await createWorkpaper({ user_id: user.id, programme_id: programme.id, title: form.title || file.name, standard: form.standard, clause_control: form.clause_control, phase: form.phase, notes: form.notes, file_path: filePath, file_name: file.name, file_size: file.size, status: 'Draft' })
      onUploaded(wp)
      onClose()
      toast(`${wp.workpaper_ref} uploaded successfully`)
    } catch (e) { toast('Upload failed: ' + e.message, 'error') }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Upload Evidence File</h2>
          <button onClick={onClose} className="text-steel-400 text-lg">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${drag ? 'border-amber-audit bg-amber-900/10' : 'border-navy-600 hover:border-steel-400'}`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <CloudUpload size={28} className={`mx-auto mb-2 ${drag ? 'text-amber-audit' : 'text-steel-500'}`} />
            {file ? (
              <div>
                <div className="text-sm font-medium text-white">{file.name}</div>
                <div className="text-xs text-steel-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-steel-300 mb-1">Drop file here or click to browse</div>
                <div className="text-xs text-steel-500">PDF, Word, Excel, PowerPoint, PNG, JPG — max 50MB</div>
              </div>
            )}
            <input id="file-input" type="file" accept={ACCEPTED} className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          </div>

          <div><label className="block text-xs text-steel-400 mb-1">Workpaper Title</label><input className="input-field" placeholder="Auto-filled from filename" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-steel-400 mb-1">Standard</label><select className="input-field" value={form.standard} onChange={e => setForm(p => ({ ...p, standard: e.target.value }))}>{STANDARDS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs text-steel-400 mb-1">Phase</label><select className="input-field" value={form.phase} onChange={e => setForm(p => ({ ...p, phase: e.target.value }))}>{PHASES.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div><label className="block text-xs text-steel-400 mb-1">Clause / Control (optional)</label><input className="input-field" placeholder="e.g. A.8.8, Clause 5.3" value={form.clause_control} onChange={e => setForm(p => ({ ...p, clause_control: e.target.value }))} /></div>
          <div><label className="block text-xs text-steel-400 mb-1">Notes (optional)</label><textarea className="textarea-field" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>

          <div className="flex gap-2">
            <button onClick={upload} disabled={uploading || !file} className="btn-primary flex-1 justify-center">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload File</>}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkpaperLibrary() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const { toast } = useToast()
  const [workpapers, setWorkpapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStandard, setFilterStandard] = useState('All')
  const [filterPhase, setFilterPhase] = useState('All')
  const [downloadingId, setDownloadingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async () => {
    if (!activeProgramme) return
    setLoading(true)
    try { setWorkpapers(await getWorkpapers(activeProgramme.id)) }
    catch (e) { console.error(e) }
    setLoading(false)
  }, [activeProgramme])

  useEffect(() => { load() }, [load])

  const download = async (wp) => {
    if (!wp.file_path) { toast('No file attached to this workpaper', 'warning'); return }
    setDownloadingId(wp.id)
    try {
      const url = await getSignedUrl(wp.file_path)
      window.open(url, '_blank')
      toast('Download link opened')
    } catch (e) { toast('Download failed: ' + e.message, 'error') }
    setDownloadingId(null)
  }

  const handleDelete = (wp) => {
    setConfirmDel({
      title: `Delete ${wp.workpaper_ref}?`,
      message: `"${wp.title}" will be permanently deleted from cloud storage.`,
      onConfirm: async () => {
        setDeletingId(wp.id)
        try {
          if (wp.file_path) await deleteWorkpaper(wp.id, wp.file_path)
          else await deleteWorkpaperRecord(wp.id)
          setWorkpapers(p => p.filter(w => w.id !== wp.id))
          toast(`${wp.workpaper_ref} deleted`, 'info')
        } catch (e) { toast('Delete failed: ' + e.message, 'error') }
        setDeletingId(null)
      }
    })
  }

  const filtered = workpapers.filter(w =>
    (filterStandard === 'All' || w.standard === filterStandard) &&
    (filterPhase === 'All' || w.phase === filterPhase) &&
    (!search || w.title?.toLowerCase().includes(search.toLowerCase()) || w.workpaper_ref?.toLowerCase().includes(search.toLowerCase()) || w.clause_control?.toLowerCase().includes(search.toLowerCase()))
  )

  const standards = ['All', ...new Set(workpapers.map(w => w.standard).filter(Boolean))]
  const phases = ['All', ...new Set(workpapers.map(w => w.phase).filter(Boolean))]

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader standard="Fieldwork" clause="Workpaper Library" title="Workpaper Library ☁️" description="Cloud evidence storage — all uploaded files and AI-generated workpapers saved to Supabase. Download via secure signed URL." badges={['Cloud', 'Supabase', activeProgramme?.programme_id || 'No Programme']} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: workpapers.length, color: 'text-white' },
          { label: 'Signed Off', value: workpapers.filter(w => w.status === 'Signed Off').length, color: 'text-emerald-400' },
          { label: 'In Review', value: workpapers.filter(w => w.status === 'In Review').length, color: 'text-amber-audit' },
          { label: 'Draft', value: workpapers.filter(w => w.status === 'Draft').length, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card-sm text-center"><div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div><div className="text-xs text-steel-400">{s.label}</div></div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input className="input-field pl-8 text-xs py-1.5" placeholder="Search workpapers, refs, controls..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-200"><X size={12} /></button>}
          </div>
          {[
            { label: 'Standard', value: filterStandard, setter: setFilterStandard, options: standards },
            { label: 'Phase', value: filterPhase, setter: setFilterPhase, options: phases },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-xs text-steel-400">{f.label}:</span>
              <select className="input-field py-1 text-xs" value={f.value} onChange={e => f.setter(e.target.value)}>{f.options.map(o => <option key={o}>{o}</option>)}</select>
            </div>
          ))}
          <button onClick={() => setShowModal(true)} disabled={!activeProgramme} className="btn-primary text-xs py-1.5">
            <Upload size={13} /> Upload File
          </button>
        </div>
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12">
          <FolderOpen size={32} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">No audit programme selected</div>
          <div className="text-xs text-steel-400">Select a programme from the header folder icon</div>
        </div>
      ) : loading ? (
        <div className="card text-center py-12"><Loader2 size={24} className="animate-spin text-steel-400 mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CloudUpload size={32} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">{workpapers.length === 0 ? 'No workpapers yet' : 'No workpapers match'}</div>
          <div className="text-xs text-steel-400 mb-4">{workpapers.length === 0 ? 'Upload evidence files or save AI outputs to library' : 'Try adjusting filters'}</div>
          {workpapers.length === 0 && <button onClick={() => setShowModal(true)} className="btn-primary text-xs mx-auto"><Upload size={12} /> Upload First File</button>}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-800/50">
                  {['Ref', 'Title', 'Standard', 'Clause', 'Phase', 'Status', 'File', ''].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-steel-400 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((wp, i) => (
                  <tr key={wp.id} className={`border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                    <td className="py-2.5 px-3 font-mono text-amber-audit font-semibold whitespace-nowrap">{wp.workpaper_ref}</td>
                    <td className="py-2.5 px-3 text-white max-w-xs truncate">{wp.title}</td>
                    <td className="py-2.5 px-3 text-steel-300 whitespace-nowrap">{wp.standard}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-mono whitespace-nowrap">{wp.clause_control}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><span className={`badge text-xs ${phaseColors[wp.phase] || 'badge-steel'}`}>{wp.phase}</span></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`badge border text-xs ${wp.status === 'Signed Off' ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700' : wp.status === 'In Review' ? 'bg-amber-900/40 text-amber-300 border-amber-700' : wp.status === 'Draft' ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'badge-steel'}`}>{wp.status}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {wp.file_path ? (
                        <button onClick={() => download(wp)} disabled={downloadingId === wp.id} className="flex items-center gap-1 text-steel-300 hover:text-amber-audit transition-colors">
                          {downloadingId === wp.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                          <span className="text-xs">{wp.file_name ? wp.file_name.slice(-20) : 'Download'}</span>
                        </button>
                      ) : <span className="text-steel-500 text-xs">AI output</span>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button onClick={() => handleDelete(wp)} disabled={deletingId === wp.id} className="text-steel-500 hover:text-red-400 transition-colors">
                        {deletingId === wp.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-navy-700 text-xs text-steel-500">
            {filtered.length} of {workpapers.length} workpapers — {activeProgramme?.programme_id}
          </div>
        </div>
      )}

      {confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
      {showModal && activeProgramme && (
        <UploadModal programme={activeProgramme} user={user} onClose={() => setShowModal(false)} onUploaded={wp => setWorkpapers(p => [wp, ...p])} />
      )}
    </div>
  )
}
