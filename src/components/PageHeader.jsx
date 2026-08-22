export default function PageHeader({ standard, clause, title, description, badges = [] }) {
  const badgeColors = {
    'TOD': 'bg-blue-900/40 text-blue-300 border-blue-700',
    'TOI': 'bg-purple-900/40 text-purple-300 border-purple-700',
    'TOE': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
    'Design': 'bg-blue-900/40 text-blue-300 border-blue-700',
    'Implementation': 'bg-purple-900/40 text-purple-300 border-purple-700',
    'Effectiveness': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
    'AI-Powered': 'bg-amber-900/40 text-amber-300 border-amber-700',
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {standard && (
          <span className="clause-tag">{standard}</span>
        )}
        {clause && (
          <span className="clause-tag">{clause}</span>
        )}
        {badges.map(b => (
          <span key={b} className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${badgeColors[b] || 'bg-navy-800 text-steel-300 border-navy-600'}`}>
            {b}
          </span>
        ))}
      </div>
      <h1 className="page-title">{title}</h1>
      {description && (
        <p className="text-steel-300 text-sm mt-2 max-w-3xl leading-relaxed">{description}</p>
      )}
    </div>
  )
}
