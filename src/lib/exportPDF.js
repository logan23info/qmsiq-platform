// PDF Export — uses browser print + styled HTML
// jsPDF approach for structured audit report

export function exportReportPDF({ report, findings, programme }) {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const ratingColor = { 'Major NC': '#E24B4A', 'Minor NC': '#EF9F27', 'Observation': '#378ADD', 'Advisory': '#888780' }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Audit Report — ${report.clientOrganisation || programme?.name || 'QMS Audit'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #1a1a1a; background: white; }
    .page { padding: 30mm 25mm; max-width: 210mm; margin: 0 auto; }

    /* Cover */
    .cover { min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
    .cover-top { border-top: 6px solid #BA7517; padding-top: 24px; }
    .brand { font-size: 28pt; font-weight: bold; color: #BA7517; letter-spacing: -1px; }
    .brand-sub { font-size: 9pt; color: #888; margin-top: 2px; }
    .report-type { font-size: 14pt; color: #444; margin-top: 40px; font-weight: normal; }
    .report-title { font-size: 22pt; font-weight: bold; color: #1a1a1a; margin-top: 8px; line-height: 1.2; }
    .cover-meta { margin-top: 48px; border-left: 3px solid #BA7517; padding-left: 16px; }
    .cover-meta-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 9pt; }
    .cover-meta-label { color: #888; min-width: 120px; }
    .cover-meta-value { color: #1a1a1a; font-weight: 600; }
    .cover-bottom { border-top: 1px solid #e5e5e5; padding-top: 12px; font-size: 8pt; color: #aaa; }

    /* Sections */
    h1 { font-size: 16pt; font-weight: bold; color: #BA7517; margin: 32px 0 12px; border-bottom: 2px solid #BA7517; padding-bottom: 6px; page-break-after: avoid; }
    h2 { font-size: 12pt; font-weight: bold; color: #1a1a1a; margin: 20px 0 8px; page-break-after: avoid; }
    p { font-size: 10pt; color: #333; line-height: 1.6; margin-bottom: 10px; }
    .summary-box { background: #f9f6f0; border-left: 4px solid #BA7517; padding: 14px 16px; margin: 16px 0; }

    /* Stats row */
    .stats { display: flex; gap: 16px; margin: 20px 0; }
    .stat { flex: 1; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-value { font-size: 22pt; font-weight: bold; }
    .stat-label { font-size: 8pt; color: #888; margin-top: 4px; }
    .stat-major .stat-value { color: #E24B4A; }
    .stat-minor .stat-value { color: #EF9F27; }
    .stat-obs .stat-value { color: #378ADD; }
    .stat-total .stat-value { color: #BA7517; }

    /* Findings table */
    .finding { border: 1px solid #e5e5e5; border-radius: 8px; margin: 16px 0; overflow: hidden; page-break-inside: avoid; }
    .finding-header { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #f9f6f0; border-bottom: 1px solid #e5e5e5; }
    .finding-ref { font-size: 8pt; font-weight: bold; color: #BA7517; font-family: monospace; }
    .finding-title { font-size: 10pt; font-weight: bold; flex: 1; }
    .rating-badge { font-size: 7.5pt; font-weight: bold; padding: 3px 8px; border-radius: 4px; color: white; }
    .finding-body { padding: 12px 14px; }
    .finding-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 9pt; }
    .finding-label { font-weight: bold; color: #666; min-width: 80px; font-size: 8.5pt; }
    .finding-text { color: #333; flex: 1; line-height: 1.5; }
    .finding-action { background: #f0f7ee; padding: 10px 14px; border-top: 1px solid #e5e5e5; font-size: 9pt; }
    .finding-action strong { color: #2d6a2d; }

    /* Footer */
    .section-page { page-break-before: always; }
    footer { position: fixed; bottom: 15mm; left: 25mm; right: 25mm; font-size: 7.5pt; color: #aaa; border-top: 1px solid #e5e5e5; padding-top: 6px; display: flex; justify-content: space-between; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20mm 20mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Cover page -->
  <div class="cover">
    <div class="cover-top">
      <div class="brand">QMSiQ</div>
      <div class="brand-sub">Quality Management Audit Platform</div>
      <div class="report-type">ISO 9001:2015 Internal Audit Report</div>
      <div class="report-title">${report.clientOrganisation || programme?.name || 'Audit Report'}</div>
      <div class="cover-meta">
        ${report.clientOrganisation ? `<div class="cover-meta-row"><span class="cover-meta-label">Client organisation</span><span class="cover-meta-value">${report.clientOrganisation}</span></div>` : ''}
        <div class="cover-meta-row"><span class="cover-meta-label">Programme</span><span class="cover-meta-value">${programme?.programme_id || '—'}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Audit scope</span><span class="cover-meta-value">${report.scope || programme?.scope || 'ISO 9001:2015 — all clauses'}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Lead auditor</span><span class="cover-meta-value">${report.leadAuditor || programme?.lead_auditor || '—'}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Report date</span><span class="cover-meta-value">${date}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Standard</span><span class="cover-meta-value">ISO 9001:2015 · ISO 19011:2018</span></div>
      </div>
    </div>
    <div class="cover-bottom">
      Prepared using QMSiQ — Quality Management Audit Platform · ${date}
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="section-page">
    <h1>1. Executive Summary</h1>
    ${report.executiveSummary ? `<p>${report.executiveSummary}</p>` : '<p>This report presents the findings from the ISO 9001:2015 internal quality management system audit conducted in accordance with ISO 19011:2018 guidelines.</p>'}

    <!-- Finding stats -->
    <div class="stats">
      <div class="stat stat-major">
        <div class="stat-value">${findings.filter(f => f.rating === 'Major NC').length}</div>
        <div class="stat-label">Major NC</div>
      </div>
      <div class="stat stat-minor">
        <div class="stat-value">${findings.filter(f => f.rating === 'Minor NC').length}</div>
        <div class="stat-label">Minor NC</div>
      </div>
      <div class="stat stat-obs">
        <div class="stat-value">${findings.filter(f => f.rating === 'Observation').length}</div>
        <div class="stat-label">Observations</div>
      </div>
      <div class="stat stat-total">
        <div class="stat-value">${findings.filter(f => f.status !== 'Closed').length}</div>
        <div class="stat-label">Open findings</div>
      </div>
    </div>

    ${report.conclusion ? `<div class="summary-box"><p><strong>Overall conclusion:</strong> ${report.conclusion}</p></div>` : ''}

    <h2>2. Audit Scope & Methodology</h2>
    <p><strong>Scope:</strong> ${report.scope || 'ISO 9001:2015 — all applicable clauses'}</p>
    <p><strong>Methodology:</strong> Audit conducted per ISO 19011:2018 using a combination of document review (Test of Design), process walkthrough (Test of Implementation), and evidence sampling (Test of Effectiveness). Findings documented using the 4Cs framework (Condition, Criteria, Cause, Consequence).</p>
    ${report.methodology ? `<p>${report.methodology}</p>` : ''}
  </div>

  <!-- Findings -->
  <div class="section-page">
    <h1>3. Audit Findings</h1>
    ${findings.length === 0 ? '<p>No findings recorded for this audit programme.</p>' :
      findings.map((f, i) => `
      <div class="finding">
        <div class="finding-header">
          <span class="finding-ref">${f.finding_ref || `F-${String(i+1).padStart(3,'0')}`}</span>
          <span class="finding-title">${f.title || 'Untitled finding'}</span>
          <span class="rating-badge" style="background:${ratingColor[f.rating] || '#888'}">${f.rating || 'Observation'}</span>
          <span style="font-size:8pt;color:#888">${f.status || 'Open'}</span>
        </div>
        <div class="finding-body">
          ${f.clause_control ? `<div class="finding-row"><span class="finding-label">Clause/control</span><span class="finding-text">${f.clause_control}</span></div>` : ''}
          ${f.condition_text ? `<div class="finding-row"><span class="finding-label">Condition</span><span class="finding-text">${f.condition_text}</span></div>` : ''}
          ${f.criteria_text ? `<div class="finding-row"><span class="finding-label">Criteria</span><span class="finding-text">${f.criteria_text}</span></div>` : ''}
          ${f.cause_text ? `<div class="finding-row"><span class="finding-label">Cause</span><span class="finding-text">${f.cause_text}</span></div>` : ''}
          ${f.consequence_text ? `<div class="finding-row"><span class="finding-label">Consequence</span><span class="finding-text">${f.consequence_text}</span></div>` : ''}
        </div>
        ${f.agreed_action ? `
        <div class="finding-action">
          <strong>Agreed corrective action:</strong> ${f.agreed_action}
          ${f.action_owner ? ` · <strong>Owner:</strong> ${f.action_owner}` : ''}
          ${f.due_date ? ` · <strong>Due:</strong> ${new Date(f.due_date).toLocaleDateString('en-GB')}` : ''}
        </div>` : ''}
      </div>`).join('')}
  </div>

  <!-- Sign off -->
  <div class="section-page">
    <h1>4. Audit Sign-Off</h1>
    <p>This report has been prepared by the audit team and reflects the findings identified during the audit period. All findings should be actioned in accordance with the agreed corrective action plan and verified for effectiveness by the lead auditor.</p>
    <div style="margin-top:40px;display:flex;gap:40px;">
      <div style="flex:1;border-top:1px solid #ccc;padding-top:8px;">
        <div style="font-size:8.5pt;color:#888;">Lead Auditor · ${report.leadAuditor || programme?.lead_auditor || ''}</div>
      </div>
      <div style="flex:1;border-top:1px solid #ccc;padding-top:8px;">
        <div style="font-size:8.5pt;color:#888;">Date</div>
      </div>
      <div style="flex:1;border-top:1px solid #ccc;padding-top:8px;">
        <div style="font-size:8.5pt;color:#888;">Quality Manager / Client Representative</div>
      </div>
    </div>
  </div>

</div>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 500)
}
