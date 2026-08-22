import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react'

const ToastContext = createContext({})

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
}
const colors = {
  success: 'bg-emerald-900 border-emerald-700 text-emerald-100',
  error: 'bg-red-900 border-red-700 text-red-100',
  info: 'bg-navy-800 border-navy-600 text-steel-100',
  warning: 'bg-amber-900 border-amber-700 text-amber-100',
}
const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type, exiting: false }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 250)
    }, duration)
  }, [])

  const dismiss = (id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 250)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type] || Info
          return (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm max-w-sm pointer-events-auto ${colors[t.type]} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}>
              <Icon size={16} className={`flex-shrink-0 ${iconColors[t.type]}`} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
