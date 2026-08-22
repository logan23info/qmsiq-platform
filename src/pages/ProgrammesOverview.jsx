import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgramme } from '../context/ProgrammeContext'
import { Plus, Edit2, Calendar, User, CheckCircle2, AlertTriangle, Clock, Archive } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const statusConfig = {
  Planning:    { color: 'bg-blue-900/40 text-blue-300 border-blue-700',     icon: Clock },
  Active:      { color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700', icon: CheckCircle2 },
  'In Progress':{ color: 'bg-amber-900/40 text-amber-300 border-amber-700',  icon: AlertTriangle },
  Complete:    { color: 'bg-navy-700 text-steel-300 border-navy-600',        icon: CheckCircle2 },
  Archived:    { color: 'bg-navy-800 text-steel-500 border-navy-700',        icon: Archive },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Planning
  const Icon = cfg.icon
  return (
    <span className={`badge border text-xs flex items-center gap-1 ${cfg.color}`}>
      <Icon size={10} />
      {status}
    </span>
  )
}

export default function ProgrammesOverview() {
  const { programmes, activeProgramme, setActiveProgramme } = useProgramme()
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  const statuses = ['All', 'Planning', 'Active', 'In Progress', 'Complete', 'Archived']
  const filtered = filter === 'All' ? programmes : programmes.filter(p => p.status === filter)

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === 'All' ? programmes.length : programmes.filter(p => p.status === s).length
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader standard="Platform" clause="Programmes"
        title="All Audit Programmes"
        description="Overview of all your audit programmes across clients and engagements. Click any programme to make it active — all fieldwork pages will load that programme's data."
        badges={[`${programmes.length} programmes`, activeProgramme ? `Active: ${activeProgramme.programme_id}` : 'None active']} />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {['Active', 'In Progress', 'Planning', 'Complete'].map(s => (
          <div key={s} className="card text-center py-3">
            <div className={`text-2xl font-bold mb-1 ${
              s === 'Active' ? 'text-emerald-400' :
              s === 'In Progress' ? 'text-amber-400' :
              s === 'Planning' ? 'text-blue-400' : 'text-steel-400'
            }`}>{counts[s] || 0}</div>
            <div className="text-xs text-steel-400">{s}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === s ? 'bg-navy-700 border-steel-400 text-white' : 'bg-navy-800 border-navy-600 text-steel-400 hover:border-steel-500'
            }`}>
            {s} {counts[s] > 0 && <span className="ml-1 opacity-60">{counts[s]}</span>}
          </button>
        ))}
      </div>

      {/* Programme cards */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-steel-500 text-sm mb-3">No programmes found</div>
          <button onClick={() => navigate('/')} className="btn-primary text-xs">
            <Plus size={13} /> Create Programme
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {filtered.map(p => {
            const isActive = activeProgramme?.id === p.id
            return (
              <div key={p.id}
                onClick={() => { setActiveProgramme(p); navigate('/') }}
                className={`card cursor-pointer transition-all hover:border-amber-800/60 ${
                  isActive ? 'border border-amber-800/60 bg-amber-900/5' : 'hover:bg-navy-800/50'
                }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm truncate">{p.name || p.client_name}</span>
                      {isActive && <span className="badge badge-amber text-xs">Active</span>}
                    </div>
                    <span className="text-xs font-mono text-amber-audit">{p.programme_id}</span>
                  </div>
                  <StatusBadge status={p.status || 'Planning'} />
                </div>

                {/* Scope */}
                {(p.standards?.join(', ') || p.scope) && (
                  <div className="text-xs text-steel-400 mb-3 truncate">
                    {Array.isArray(p.standards) ? p.standards.join(' · ') : p.standards || p.scope}
                  </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap gap-3 text-xs text-steel-500">
                  {p.lead_auditor && (
                    <span className="flex items-center gap-1">
                      <User size={10} /> {p.lead_auditor}
                    </span>
                  )}
                  {(p.audit_period_start || p.audit_period_end) && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {p.audit_period_start ? new Date(p.audit_period_start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                      {p.audit_period_start && p.audit_period_end && ' → '}
                      {p.audit_period_end ? new Date(p.audit_period_end).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                  )}
                </div>

                {/* Quick links */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-navy-700">
                  {[
                    { label: 'Findings', path: '/fieldwork/findings' },
                    { label: 'Risks', path: '/reporting/risks' },
                    { label: 'Gap Analysis', path: '/fieldwork/gap-analysis' },
                  ].map(link => (
                    <button key={link.path}
                      onClick={e => { e.stopPropagation(); setActiveProgramme(p); navigate(link.path) }}
                      className="text-xs text-steel-500 hover:text-amber-audit transition-colors">
                      {link.label} →
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
