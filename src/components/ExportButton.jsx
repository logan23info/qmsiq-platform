import { useState } from 'react'
import { Download, Loader2, FileText } from 'lucide-react'

// Improvement 6 — Export to PDF using browser print
export default function ExportButton({ title, contentId }) {
  const [exporting, setExporting] = useState(false)

  const exportToPDF = () => {
    setExporting(true)
    const originalTitle = document.title
    document.title = title || 'AuditIQ Export'

    // Add print styles
    const style = document.createElement('style')
    style.id = 'print-style'
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #${contentId || 'main-content'} { display: block !important; }
        .ai-panel { border: 1px solid #ccc; padding: 12px; margin-top: 16px; }
        .btn-primary, .btn-secondary, button { display: none !important; }
        .nav-item, aside, header { display: none !important; }
        * { color: #000 !important; background: #fff !important; }
        pre { white-space: pre-wrap; word-wrap: break-word; border: 1px solid #ccc; padding: 8px; }
      }
    `
    document.head.appendChild(style)

    setTimeout(() => {
      window.print()
      document.head.removeChild(style)
      document.title = originalTitle
      setExporting(false)
    }, 300)
  }

  return (
    <button
      onClick={exportToPDF}
      disabled={exporting}
      className="btn-secondary text-xs"
    >
      {exporting
        ? <><Loader2 size={12} className="animate-spin" /> Preparing...</>
        : <><FileText size={12} /> Export PDF</>}
    </button>
  )
}
