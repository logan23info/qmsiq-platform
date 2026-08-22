import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, ChevronDown, X } from 'lucide-react'
import { exportReportPDF } from '../lib/exportPDF'
import { exportFindingsXLSX, exportRisksXLSX, exportCAPAXLSX, exportGapAnalysisXLSX, exportPBCXLSX } from '../lib/exportXLSX'
import { useToast } from './Toast'

export default function ExportMenu({ type, data, report, programme, gapRatings, gapNotes }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const progName = programme?.name || programme?.programme_id || 'Export'

  const handleExport = (format) => {
    setOpen(false)
    try {
      if (type === 'report' && format === 'pdf') {
        exportReportPDF({ report, findings: data, programme })
        toast('PDF opened — use browser Print → Save as PDF')
      } else if (type === 'findings' && format === 'xlsx') {
        exportFindingsXLSX(data, progName)
        toast('Findings exported to Excel')
      } else if (type === 'risks' && format === 'xlsx') {
        exportRisksXLSX(data, progName)
        toast('Risk register exported to Excel')
      } else if (type === 'capa' && format === 'xlsx') {
        exportCAPAXLSX(data, progName)
        toast('CAPA tracker exported to Excel')
      } else if (type === 'gap' && format === 'xlsx') {
        exportGapAnalysisXLSX(gapRatings, gapNotes, progName)
        toast('Gap analysis exported to Excel')
      } else if (type === 'pbc' && format === 'xlsx') {
        exportPBCXLSX(data, progName)
        toast('PBC list exported to Excel')
      }
    } catch (e) {
      toast('Export failed: ' + e.message, 'error')
    }
  }

  const options = {
    report: [
      { format: 'pdf', label: 'Export PDF report', icon: FileText, desc: 'Full audit report with cover page, findings and sign-off' },
      { format: 'xlsx', label: 'Export findings to Excel', icon: FileSpreadsheet, desc: 'All findings with 4Cs data, ratings and CAPA details' },
    ],
    findings: [
      { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, desc: 'All findings with ratings, 4Cs, owners and due dates' },
    ],
    risks: [
      { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, desc: 'Full risk register with scores and treatment plans' },
    ],
    capa: [
      { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, desc: 'CAPA tracker with root causes, actions and status' },
    ],
    gap: [
      { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, desc: 'Gap analysis with RAG status, notes and readiness score' },
    ],
    pbc: [
      { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, desc: 'PBC evidence list with status and notes' },
    ],
  }

  const currentOptions = options[type] || []

  // If only one option, show a simple button
  if (currentOptions.length === 1) {
    const opt = currentOptions[0]
    const Icon = opt.icon
    return (
      <button onClick={() => handleExport(opt.format)}
        className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
        <Icon size={13} />
        Export
      </button>
    )
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
        <Download size={13} />
        Export
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-navy-900 border border-navy-600 rounded-xl shadow-lg w-72 overflow-hidden">
            <div className="p-2">
              {currentOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <button key={opt.format} onClick={() => handleExport(opt.format)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-navy-800 transition-colors text-left">
                    <Icon size={16} className={opt.format === 'pdf' ? 'text-red-400' : 'text-emerald-400'} />
                    <div>
                      <div className="text-xs font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-steel-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
