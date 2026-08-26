import * as XLSX from 'xlsx'

function autoWidth(ws, data) {
  const cols = Object.keys(data[0] || {})
  ws['!cols'] = cols.map(col => ({
    wch: Math.max(col.length, ...data.map(r => String(r[col] || '').length), 10)
  }))
}

function headerStyle() {
  return { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '854F0B' } }, alignment: { horizontal: 'left' } }
}

export function exportFindingsXLSX(findings, programmeName) {
  const rows = findings.map((f, i) => ({
    'Ref': f.finding_ref || `F-${String(i+1).padStart(3,'0')}`,
    'Title': f.title || '',
    'Rating': f.rating || '',
    'Status': f.status || '',
    'Standard': f.standard || 'ISO 9001:2015',
    'Clause / Control': f.clause_control || '',
    'Condition': f.condition_text || '',
    'Criteria': f.criteria_text || '',
    'Cause': f.cause_text || '',
    'Consequence': f.consequence_text || '',
    'Agreed Action': f.agreed_action || '',
    'Action Owner': f.action_owner || '',
    'Due Date': f.due_date || '',
    'Management Response': f.management_response || '',
    'Raised Date': f.created_at ? new Date(f.created_at).toLocaleDateString('en-GB') : '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  autoWidth(ws, rows)

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  XLSX.utils.book_append_sheet(wb, ws, 'Findings')

  // Summary sheet
  const ratings = ['Major NC', 'Minor NC', 'Observation', 'Advisory']
  const summary = ratings.map(r => ({
    'Rating': r,
    'Total': findings.filter(f => f.rating === r).length,
    'Open': findings.filter(f => f.rating === r && f.status !== 'Closed').length,
    'Closed': findings.filter(f => f.rating === r && f.status === 'Closed').length,
  }))
  summary.push({
    'Rating': 'TOTAL',
    'Total': findings.length,
    'Open': findings.filter(f => f.status !== 'Closed').length,
    'Closed': findings.filter(f => f.status === 'Closed').length,
  })
  const wsSummary = XLSX.utils.json_to_sheet(summary)
  autoWidth(wsSummary, summary)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  XLSX.writeFile(wb, `QMSiQ_Findings_${programmeName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportRisksXLSX(risks, programmeName) {
  const rows = risks.map((r, i) => ({
    'Ref': r.risk_ref || `R-${String(i+1).padStart(3,'0')}`,
    'Asset / Process': r.asset || '',
    'Threat': r.threat || '',
    'Vulnerability': r.vulnerability || '',
    'Likelihood': r.likelihood || '',
    'Impact': r.impact || '',
    'Inherent Score': r.inherent_score || '',
    'Controls Applied': r.controls_applied || '',
    'Residual Likelihood': r.residual_likelihood || '',
    'Residual Impact': r.residual_impact || '',
    'Residual Score': r.residual_score || '',
    'Treatment': r.treatment || '',
    'Risk Owner': r.risk_owner || '',
    'Review Date': r.review_date || '',
    'Status': r.status || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  autoWidth(ws, rows)
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Register')
  XLSX.writeFile(wb, `QMSiQ_Risks_${programmeName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportCAPAXLSX(capas, programmeName) {
  const rows = capas.map((c, i) => ({
    'Ref': c.finding_ref || `CAPA-${String(i+1).padStart(3,'0')}`,
    'Title': c.title || '',
    'Rating': c.rating || '',
    'Root Cause': c.cause_text || '',
    'Agreed Action': c.agreed_action || '',
    'Action Owner': c.action_owner || '',
    'Due Date': c.due_date || '',
    'Status': c.status || '',
    'Management Response': c.management_response || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  autoWidth(ws, rows)
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  XLSX.utils.book_append_sheet(wb, ws, 'CAPA Tracker')
  XLSX.writeFile(wb, `QMSiQ_CAPA_${programmeName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportGapAnalysisXLSX(ratings, notes, programmeName) {
  const clauses = [
    { ref: '4.1', clause: '4', title: 'Understanding the organisation & its context' },
    { ref: '4.2', clause: '4', title: 'Understanding needs & expectations of interested parties' },
    { ref: '4.3', clause: '4', title: 'Determining the scope of the QMS' },
    { ref: '4.4', clause: '4', title: 'QMS & its processes' },
    { ref: '5.1', clause: '5', title: 'Leadership & commitment' },
    { ref: '5.2', clause: '5', title: 'Quality policy' },
    { ref: '5.3', clause: '5', title: 'Roles, responsibilities & authorities' },
    { ref: '6.1', clause: '6', title: 'Actions to address risks & opportunities' },
    { ref: '6.2', clause: '6', title: 'Quality objectives & planning' },
    { ref: '6.3', clause: '6', title: 'Planning of changes' },
    { ref: '7.1', clause: '7', title: 'Resources' },
    { ref: '7.2', clause: '7', title: 'Competence' },
    { ref: '7.3', clause: '7', title: 'Awareness' },
    { ref: '7.4', clause: '7', title: 'Communication' },
    { ref: '7.5', clause: '7', title: 'Documented information' },
    { ref: '8.1', clause: '8', title: 'Operational planning & control' },
    { ref: '8.2', clause: '8', title: 'Requirements for products & services' },
    { ref: '8.3', clause: '8', title: 'Design & development' },
    { ref: '8.4', clause: '8', title: 'Control of externally provided processes & products' },
    { ref: '8.5', clause: '8', title: 'Production & service provision' },
    { ref: '8.6', clause: '8', title: 'Release of products & services' },
    { ref: '8.7', clause: '8', title: 'Control of nonconforming outputs' },
    { ref: '9.1', clause: '9', title: 'Monitoring, measurement, analysis & evaluation' },
    { ref: '9.2', clause: '9', title: 'Internal audit' },
    { ref: '9.3', clause: '9', title: 'Management review' },
    { ref: '10.1', clause: '10', title: 'Continual improvement' },
    { ref: '10.2', clause: '10', title: 'Nonconformity & corrective action' },
  ]

  const statusLabel = { green: 'Conforms', amber: 'Partial', red: 'Not in place', na: 'N/A' }

  const rows = clauses.map(c => {
    const id = `cl${c.ref.replace('.', '')}`
    const rating = ratings[id] || ratings[`cl${c.clause}`] || ''
    return {
      'Clause': c.ref,
      'Requirement': c.title,
      'Status': statusLabel[rating] || 'Not assessed',
      'RAG': rating ? rating.toUpperCase() : '',
      'Notes': notes[id] || notes[`cl${c.clause}`] || '',
    }
  })

  // Calculate score
  const assessed = rows.filter(r => r.RAG && r.RAG !== 'NA')
  const green = assessed.filter(r => r.RAG === 'GREEN').length
  const amber = assessed.filter(r => r.RAG === 'AMBER').length
  const score = assessed.length ? Math.round(((green + amber * 0.5) / assessed.length) * 100) : 0

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  autoWidth(ws, rows)
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Gap Analysis')

  // Score summary
  const scoreSummary = [
    { 'Metric': 'Readiness Score', 'Value': `${score}%` },
    { 'Metric': 'Conforms (Green)', 'Value': green },
    { 'Metric': 'Partial (Amber)', 'Value': amber },
    { 'Metric': 'Not in place (Red)', 'Value': assessed.filter(r => r.RAG === 'RED').length },
    { 'Metric': 'Not Applicable', 'Value': rows.filter(r => r.RAG === 'NA').length },
    { 'Metric': 'Not assessed', 'Value': rows.filter(r => !r.RAG).length },
    { 'Metric': 'Total requirements', 'Value': rows.length },
    { 'Metric': 'Assessment date', 'Value': new Date().toLocaleDateString('en-GB') },
    { 'Metric': 'Programme', 'Value': programmeName || '' },
  ]
  const wsScore = XLSX.utils.json_to_sheet(scoreSummary)
  autoWidth(wsScore, scoreSummary)
  XLSX.utils.book_append_sheet(wb, wsScore, 'Score Summary')

  XLSX.writeFile(wb, `QMSiQ_GapAnalysis_${programmeName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportPBCXLSX(items, programmeName) {
  const rows = items.map((p, i) => ({
    'Ref': p.pbc_ref || `PBC-${String(i+1).padStart(3,'0')}`,
    'Description': p.description || '',
    'Control Ref': p.control_ref || '',
    'Phase': p.phase || '',
    'Domain': p.domain || '',
    'Priority': p.priority || '',
    'Status': p.status || '',
    'Date Received': p.received_date || '',
    'Notes': p.notes || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  autoWidth(ws, rows)
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
  XLSX.utils.book_append_sheet(wb, ws, 'PBC List')
  XLSX.writeFile(wb, `QMSiQ_PBC_${programmeName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

// ─── QMS Implementation exports ───────────────────────────
export function exportStakeholdersXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Stakeholder': r.name, 'Category': r.category, 'Needs & Expectations': r.needs,
    'Relevance': r.relevance, 'Review Date': r.review_date, 'AI Generated': r.ai_generated ? 'Yes' : 'No'
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Interested Parties')
  XLSX.writeFile(wb, `QMSiQ_Stakeholders_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportObjectivesXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Objective': r.objective, 'Measure': r.measure, 'Target': r.target,
    'Owner': r.owner, 'Process Area': r.process_area, 'Due Date': r.due_date,
    'Status': r.status, 'AI Generated': r.ai_generated ? 'Yes' : 'No'
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Quality Objectives')
  XLSX.writeFile(wb, `QMSiQ_Objectives_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportChangesXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Description': r.description, 'Reason': r.reason, 'Impact': r.impact,
    'Owner': r.owner, 'Planned Date': r.planned_date, 'Status': r.status
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Change Register')
  XLSX.writeFile(wb, `QMSiQ_Changes_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportCompetenceXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Person / Role': r.person_name, 'Function': r.role, 'Competence Required': r.competence_required,
    'Evidence': r.evidence, 'Gap': r.gap, 'Training Action': r.action, 'Review Date': r.review_date
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Competence Register')
  XLSX.writeFile(wb, `QMSiQ_Competence_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportDocumentsXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Ref': r.doc_ref, 'Title': r.title, 'Type': r.doc_type, 'Version': r.version,
    'Owner': r.owner, 'Review Date': r.review_date, 'Status': r.status
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Document Register')
  XLSX.writeFile(wb, `QMSiQ_Documents_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportOperationalXLSX(rows, prog) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.filter(r=>!r._pending).map(r=>({
    'Process': r.process_name, 'Description': r.description, 'Inputs': r.inputs,
    'Outputs': r.outputs, 'Controls': r.controls, 'Owner': r.owner,
    'Key Risk': r.risk, 'Status': r.status
  })))
  autoWidth(ws, rows); ws['!freeze'] = { xSplit:0, ySplit:1 }
  XLSX.utils.book_append_sheet(wb, ws, 'Operational Planning')
  XLSX.writeFile(wb, `QMSiQ_Operational_${prog||'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`)
}
