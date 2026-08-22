export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) return
  const headers = columns.map(c => c.label)
  const rows = data.map(row =>
    columns.map(c => {
      const val = String(row[c.key] ?? '')
      const escaped = val.replace(/"/g, '""')
      return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') ? `"${escaped}"` : escaped
    })
  )
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const FINDING_COLUMNS = [
  { label: 'Ref', key: 'finding_ref' }, { label: 'Title', key: 'title' },
  { label: 'Standard', key: 'standard' }, { label: 'Clause/Control', key: 'clause_control' },
  { label: 'Rating', key: 'rating' }, { label: 'Status', key: 'status' },
  { label: 'Condition', key: 'condition_text' }, { label: 'Criteria', key: 'criteria_text' },
  { label: 'Cause', key: 'cause_text' }, { label: 'Consequence', key: 'consequence_text' },
  { label: 'Management Response', key: 'management_response' },
  { label: 'Agreed Action', key: 'agreed_action' },
  { label: 'Action Owner', key: 'action_owner' }, { label: 'Due Date', key: 'due_date' },
]

export const RISK_COLUMNS = [
  { label: 'Ref', key: 'risk_ref' }, { label: 'Asset', key: 'asset' },
  { label: 'Threat', key: 'threat' }, { label: 'Vulnerability', key: 'vulnerability' },
  { label: 'Likelihood', key: 'likelihood' }, { label: 'Impact', key: 'impact' },
  { label: 'Inherent Score', key: 'inherent_score' },
  { label: 'Controls Applied', key: 'controls_applied' },
  { label: 'Residual Likelihood', key: 'residual_likelihood' },
  { label: 'Residual Impact', key: 'residual_impact' },
  { label: 'Residual Score', key: 'residual_score' },
  { label: 'Treatment', key: 'treatment' }, { label: 'Risk Owner', key: 'risk_owner' },
  { label: 'Review Date', key: 'review_date' },
]

export const PBC_COLUMNS = [
  { label: 'Ref', key: 'pbc_ref' }, { label: 'Control Reference', key: 'control_ref' },
  { label: 'Evidence Required', key: 'description' }, { label: 'Phase', key: 'phase' },
  { label: 'Domain', key: 'domain' }, { label: 'Priority', key: 'priority' },
  { label: 'Status', key: 'status' }, { label: 'Received Date', key: 'received_date' },
  { label: 'Notes', key: 'notes' },
]

export const WORKPAPER_COLUMNS = [
  { label: 'Ref', key: 'workpaper_ref' }, { label: 'Title', key: 'title' },
  { label: 'Standard', key: 'standard' }, { label: 'Clause/Control', key: 'clause_control' },
  { label: 'Phase', key: 'phase' }, { label: 'Auditor', key: 'auditor' },
  { label: 'Status', key: 'status' }, { label: 'Notes', key: 'notes' },
]
