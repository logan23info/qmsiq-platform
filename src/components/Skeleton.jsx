// Skeleton loading placeholders — replace spinners on live pages
// Usage: <Skeleton rows={5} /> or <SkeletonCard count={4} />

export function Skeleton({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 bg-navy-800 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export function SkeletonCard({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${count} gap-3`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card-sm">
          <div className="h-8 w-12 bg-navy-700 rounded animate-pulse mb-2 mx-auto" />
          <div className="h-3 w-16 bg-navy-700 rounded animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-3 bg-navy-700 rounded animate-pulse" style={{ width: `${60 + (i * 20)}px` }} />
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={`flex gap-4 px-4 py-3 border-b border-navy-800 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
          <div className="h-4 w-16 bg-navy-700 rounded animate-pulse flex-shrink-0" />
          <div className="h-4 bg-navy-700 rounded animate-pulse flex-1" />
          <div className="h-4 w-20 bg-navy-700 rounded animate-pulse flex-shrink-0" />
          <div className="h-4 w-16 bg-navy-700 rounded animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
