// Usage:
// <Tooltip text="This is the tooltip">
//   <button>Hover me</button>
// </Tooltip>
// Optional: position="right" | "bottom" (default: top)

export default function Tooltip({ text, children, position = 'top' }) {
  if (!text) return children
  return (
    <span className="tooltip-wrap">
      {children}
      <span className={`tooltip ${position !== 'top' ? `tooltip-${position}` : ''}`}>{text}</span>
    </span>
  )
}
