import { Trash2, Edit2, Sparkles } from 'lucide-react'

const STATUS_COLORS = {
  Draft: 'text-amber-400 bg-amber-900/20',
  Complete: 'text-emerald-400 bg-emerald-900/20',
  Planned: 'text-blue-400 bg-blue-900/20',
  'In Progress': 'text-amber-400 bg-amber-900/20',
  Implemented: 'text-emerald-400 bg-emerald-900/20',
  Cancelled: 'text-steel-500 bg-navy-700',
  'On Track': 'text-emerald-400 bg-emerald-900/20',
  'At Risk': 'text-amber-400 bg-amber-900/20',
  Achieved: 'text-teal-400 bg-teal-900/20',
  Missed: 'text-red-400 bg-red-900/20',
  Approved: 'text-emerald-400 bg-emerald-900/20',
  Obsolete: 'text-steel-500 bg-navy-700',
}

export default function QMSRecordTable({ columns, rows, onEdit, onDelete, canEdit, canDelete }) {
  if (!rows.length) return (
    <div className="text-center py-12 text-steel-500 text-sm border border-navy-700 rounded-xl">
      No records yet — add manually or use AI draft generator above.
    </div>
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-navy-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-800 border-b border-navy-700">
            {columns.map(c => (
              <th key={c.key} className="px-3 py-2.5 text-left text-xs text-steel-400 font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {(canEdit || canDelete) && <th className="px-3 py-2.5 w-16" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-navy-700/50 hover:bg-navy-800/40 transition-colors">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2.5 text-steel-300 max-w-xs">
                  {c.key === 'status' ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row[c.key]] || 'text-steel-400'}`}>
                      {row[c.key]}
                    </span>
                  ) : c.key === 'ai_generated' ? (
                    row[c.key] ? <Sparkles size={11} className="text-amber-audit" title="AI generated draft" /> : null
                  ) : (
                    <span className="line-clamp-2">{row[c.key] || '—'}</span>
                  )}
                </td>
              ))}
              {(canEdit || canDelete) && (
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    {canEdit && (
                      <button onClick={() => onEdit(row)} aria-label="Edit record"
                        className="text-steel-500 hover:text-amber-audit p-1 rounded transition-colors">
                        <Edit2 size={12} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => onDelete(row)} aria-label="Delete record"
                        className="text-steel-500 hover:text-red-400 p-1 rounded transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
