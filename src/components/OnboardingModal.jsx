import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, TrendingUp, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const options = [
  {
    id: 'audit',
    icon: Shield,
    color: 'text-teal-400',
    border: 'border-teal-700 bg-teal-900/10',
    title: 'Conduct an audit',
    desc: 'I need to plan and run an ISO 9001 internal audit, surveillance audit, or supplier audit using ISO 19011 methodology.',
    startPath: '/iso19011/clause4',
    startLabel: 'Start with ISO 19011 methodology →',
  },
  {
    id: 'review',
    icon: TrendingUp,
    color: 'text-purple-400',
    border: 'border-purple-700 bg-purple-900/10',
    title: 'Review my QMS',
    desc: 'I need to assess our ISO 9001 readiness, track risks and CAPA, monitor KPIs, or prepare a management review.',
    startPath: '/fieldwork/gap-analysis',
    startLabel: 'Start with gap analysis →',
  },
]

export default function OnboardingModal({ onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)

  const handleStart = async () => {
    if (!selected) return
    try {
      await supabase.from('profiles')
        .update({ onboarded: true, preferred_mode: selected })
        .eq('id', user.id)
    } catch (e) { /* column may not exist yet — ignore */ }
    const opt = options.find(o => o.id === selected)
    onClose()
    navigate(opt.startPath)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-steel-500 hover:text-white transition-colors">
          <X size={15} />
        </button>

        <div className="mb-5">
          <div className="text-xs text-steel-500 mb-1">Welcome to QMSiQ</div>
          <h2 className="text-lg font-bold text-white mb-1">What are you here to do?</h2>
          <p className="text-xs text-steel-400 leading-relaxed">
            QMSiQ covers two activities. Pick your starting point — you can switch anytime.
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {options.map(opt => {
            const Icon = opt.icon
            const isSelected = selected === opt.id
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)}
                className={`w-full text-left rounded-xl p-4 border-2 transition-all ${
                  isSelected ? opt.border + ' border-2' : 'border-navy-700 bg-navy-800 hover:border-navy-500'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={16} className={opt.color} />
                  <span className="font-semibold text-white text-sm">{opt.title}</span>
                  {isSelected && <span className={`ml-auto badge text-xs ${opt.color} bg-transparent border-0`}>Selected</span>}
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">{opt.desc}</p>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleStart} disabled={!selected}
            className="btn-primary flex-1 justify-center text-sm">
            Get started
          </button>
          <button onClick={onClose} className="btn-secondary text-sm">
            Explore first
          </button>
        </div>

        <p className="text-xs text-steel-600 text-center mt-3">
          You can switch between audit and review modes at any time from the sidebar.
        </p>
      </div>
    </div>
  )
}
