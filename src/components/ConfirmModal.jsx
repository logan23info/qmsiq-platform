// Styled confirmation modal — replaces window.confirm()
// Usage:
// const [confirm, setConfirm] = useState(null)
// <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />
// setConfirm({ title: 'Delete?', message: 'Cannot be undone.', onConfirm: () => doDelete() })

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', confirmClass = 'bg-red-600 hover:bg-red-500 text-white', onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try { await onConfirm() } catch (e) { console.error(e) }
    setLoading(false)
    onClose()
  }

  if (!onConfirm) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{title || 'Are you sure?'}</h3>
              <p className="text-sm text-steel-400 leading-relaxed">{message || 'This action cannot be undone.'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
            <button onClick={handle} disabled={loading}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${confirmClass} disabled:opacity-50`}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
