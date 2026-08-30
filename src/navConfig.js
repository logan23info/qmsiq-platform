export const navSections = [
  {
    id: 'core', label: 'Platform',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', tooltip: 'QMS audit programme overview — live stats and recent activity' },
      { id: 'programmes', label: 'All Programmes', path: '/programmes', icon: 'LayoutGrid', tooltip: 'Overview of all audit programmes — status, quick access, client switcher' },
      { id: 'wiki', label: 'How to Use (Wiki)', path: '/wiki', icon: 'BookOpen', tooltip: 'Platform guide — full audit and review workflow from planning to improvement' },
      { id: 'conduct', label: 'Conduct an Audit', path: '/conduct', icon: 'ClipboardList', tooltip: 'Auditor entry point — ISO 19011 methodology, fieldwork, findings, reports' },
      { id: 'review', label: 'Review Your QMS', path: '/review', icon: 'BarChart3', tooltip: 'Quality manager entry point — KPI, CAPA, risk, management review' },
      { id: 'faq', label: 'FAQ', path: '/faq', icon: 'HelpCircle', tooltip: 'Frequently asked questions about QMSiQ and ISO 9001 audit methodology' },
      { id: 'profile', label: 'My Profile', path: '/profile', icon: 'User', tooltip: 'Edit your name, role, organisation, and change password' },
      { id: 'team', label: 'Team Members', path: '/team', icon: 'Users', tooltip: 'Manage team access — invite members, assign roles, share your User ID' },
    ]
  },
  {
    id: 'audit-methodology', label: 'Conduct an Audit — Methodology',
    items: [
      { id: '19011-cl4', label: 'Clause 4 — Principles', path: '/iso19011/clause4', icon: 'Shield', tooltip: '7 principles of auditing per ISO 19011:2026' },
      { id: '19011-cl5', label: 'Clause 5 — Programme Mgmt', path: '/iso19011/clause5', icon: 'CalendarDays', tooltip: 'Audit programme objectives, resources, scheduling and monitoring' },
      { id: '19011-cl6-init', label: 'Clause 6.2 — Initiation', path: '/iso19011/clause6-initiation', icon: 'PlayCircle', tooltip: 'Audit initiation — mandate, scope, team assignment, feasibility' },
      { id: '19011-cl6-prep', label: 'Clause 6.3 — Preparation', path: '/iso19011/clause6-preparation', icon: 'ClipboardList', tooltip: 'Audit preparation — document review, audit plan, work assignments' },
      { id: '19011-tod', label: 'TOD — Test of Design', path: '/iso19011/tod', icon: 'PenTool', tooltip: 'Test of Design — confirming controls are properly designed' },
      { id: '19011-toi', label: 'TOI — Test of Implementation', path: '/iso19011/toi', icon: 'Eye', tooltip: 'Test of Implementation — walkthrough confirming control is in practice' },
      { id: '19011-toe', label: 'TOE — Test of Effectiveness', path: '/iso19011/toe', icon: 'BarChart3', tooltip: 'Test of Effectiveness — statistical sampling over audit period' },
      { id: '19011-findings', label: 'Finding Development (4Cs)', path: '/iso19011/findings', icon: 'AlertTriangle', tooltip: '4Cs framework — Condition, Criteria, Cause, Consequence' },
      { id: '19011-meetings', label: 'Meetings — Open & Close', path: '/iso19011/meetings', icon: 'Users', tooltip: 'Opening and closing meeting templates and guidance' },
      { id: '19011-reporting', label: 'Clause 6.5 — Reporting', path: '/iso19011/reporting', icon: 'FileText', tooltip: 'Audit report content, format, and distribution requirements' },
      { id: '19011-cl7', label: 'Clause 7 — Auditor Competence', path: '/iso19011/clause7', icon: 'GraduationCap', tooltip: 'Auditor knowledge, skills, personal attributes, and certifications' },
      { id: '19011-annexa', label: 'Annex A — Guidance', path: '/iso19011/annexa', icon: 'BookOpen', tooltip: 'Additional audit guidance — remote auditing, competence evaluation' },
    ]
  },
  {
    id: 'audit-types', label: 'Conduct an Audit — Audit Types',
    items: [
      { id: 'surveillance', label: 'Surveillance & Recertification', path: '/surveillance', icon: 'RefreshCw', tooltip: 'Surveillance (Year 1 & 2), recertification (Year 3), internal audit, and supplier audit guidance' },
    ]
  },
  {
    id: 'audit-execution', label: 'Conduct an Audit — Execution',
    items: [
      { id: 'pbc', label: 'PBC Evidence List ⭐ Live', path: '/fieldwork/pbc', icon: 'List', tooltip: 'Provided-by-client evidence tracking — status, priority, domain, notes' },
      { id: 'tracker', label: 'Fieldwork Tracker ⭐ Live', path: '/fieldwork/tracker', icon: 'CheckSquare', tooltip: 'Workpaper tracking — TOD/TOI/TOE phase management per control' },
      { id: 'findings', label: 'Finding Register ⭐ Live', path: '/fieldwork/findings', icon: 'AlertTriangle', tooltip: '4Cs finding documentation — raise, track, and close quality findings' },
      { id: 'workpapers', label: 'Workpaper Index', path: '/fieldwork/workpapers', icon: 'FolderOpen', tooltip: 'Workpaper register with formal sign-off (auditor + date)' },
      { id: 'library', label: 'Workpaper Library', path: '/fieldwork/library', icon: 'CloudUpload', tooltip: 'Cloud evidence storage — upload, download, delete audit files' },
      { id: 'report-builder', label: 'Audit Report Builder', path: '/reporting/builder', icon: 'FileText', tooltip: 'Pull live findings into a formal quality audit report — 6 sections' },
    ]
  },
  {
    id: 'review', label: 'Review Your QMS — ISO 9001',
    items: [
      { id: 'gap', label: 'Gap Analysis ⭐', path: '/fieldwork/gap-analysis', icon: 'CheckSquare', tooltip: 'ISO 9001:2015 clause-by-clause readiness assessment — RAG status with notes' },
      { id: 'supplier', label: 'Supplier Audit Template', path: '/fieldwork/supplier-audit', icon: 'Truck', tooltip: 'ISO 9001 Cl.8.4 supplier audit — loads 12 PBC items and 6 workpapers into your programme' },
      { id: 'risks', label: 'Risk Register ⭐ Live', path: '/reporting/risks', icon: 'AlertOctagon', tooltip: 'Quality risk register — process risks, supplier risks, customer risks' },
      { id: 'capa', label: 'CAPA Tracker ⭐ Live', path: '/reporting/capa', icon: 'CheckCircle', tooltip: 'Track corrective actions from nonconformity to verified closure' },
      { id: 'kpi', label: 'KPI Dashboard ⭐ Live', path: '/reporting/kpi', icon: 'Activity', tooltip: 'Live quality KPIs — CAPA closure, customer complaints, nonconformity rates' },
      { id: 'mgmt-review', label: 'Management Review Pack', path: '/reporting/management-review', icon: 'BarChart2', tooltip: 'ISO 9001 Cl.9.3 management review — all mandatory inputs and outputs' },
      { id: 'universe', label: 'Audit Universe ⭐ Live', path: '/reporting/universe', icon: 'Globe', tooltip: 'Risk-ranked annual QMS audit schedule with status tracking' },
    ]
  },
  {
    id: 'iso9001', label: 'Review Your QMS — ISO 9001 Reference',
    items: [
      { id: '9000', label: 'QMS Terminology Dictionary', path: '/iso9000', icon: 'BookMarked', tooltip: '44 key quality management terms from ISO 9000:2015 — searchable by category' },
      { id: '9001-cl4', label: 'Clause 4 — Context & Scope', path: '/iso9001/clause4', icon: 'Map', tooltip: 'Internal/external context, interested parties, QMS scope, process approach' },
      { id: '9001-cl5', label: 'Clause 5 — Leadership', path: '/iso9001/clause5', icon: 'Crown', tooltip: 'Top management commitment, quality policy, roles and responsibilities' },
      { id: '9001-cl6', label: 'Clause 6 — Planning', path: '/iso9001/clause6', icon: 'Target', tooltip: 'Risk-based thinking, quality objectives, planning of changes' },
      { id: '9001-cl7', label: 'Clause 7 — Support', path: '/iso9001/clause7', icon: 'Wrench', tooltip: 'Resources, competence, awareness, communication, document control' },
      { id: '9001-cl8', label: 'Clause 8 — Operations', path: '/iso9001/clause8', icon: 'Settings', tooltip: 'Operational planning, customer requirements, supplier control, production' },
      { id: '9001-cl9', label: 'Clause 9 — Performance', path: '/iso9001/clause9', icon: 'TrendingUp', tooltip: 'Customer satisfaction, KPIs, internal audit, management review' },
      { id: '9001-cl10', label: 'Clause 10 — Improvement', path: '/iso9001/clause10', icon: 'RefreshCw', tooltip: 'Nonconformity, corrective action, continual improvement' },
      { id: '9001-annex', label: 'Annex A & B — Clarification', path: '/iso9001/annex', icon: 'BookOpen', tooltip: 'Informative guidance — structure/terminology clarification and related ISO/TC 176 standards' },
    ]
  },
  {
    id: 'qms-implement', label: 'Implement Your QMS — ISO 9001',
    items: [
      { id: 'qms', label: 'Implementation Overview', path: '/qms', icon: 'CheckCircle', tooltip: 'ISO 9001:2015 implementation tracker — progress across all mandatory clauses' },
      { id: 'qms-context', label: 'Cl.4 — Context & Scope', path: '/qms/context', icon: 'Map', tooltip: 'Internal/external issues, QMS scope and exclusions (Cl.4.1–4.3)' },
      { id: 'qms-stakeholders', label: 'Cl.4 — Interested Parties', path: '/qms/stakeholders', icon: 'Users', tooltip: 'Stakeholder register — needs, expectations and relevance (Cl.4.2)' },
      { id: 'qms-policy', label: 'Cl.5 — Quality Policy', path: '/qms/policy', icon: 'FileText', tooltip: 'Quality policy statement — approved and communicated (Cl.5.2)' },
      { id: 'qms-objectives', label: 'Cl.6 — Quality Objectives', path: '/qms/objectives', icon: 'Target', tooltip: 'SMART quality objectives with measures, targets and owners (Cl.6.2)' },
      { id: 'qms-changes', label: 'Cl.6 — Change Register', path: '/qms/changes', icon: 'RefreshCw', tooltip: 'Planned QMS changes — reason, impact, owner and status (Cl.6.3)' },
      { id: 'qms-competence', label: 'Cl.7 — Competence Register', path: '/qms/competence', icon: 'GraduationCap', tooltip: 'Staff competence — required, evidence, gaps and training actions (Cl.7.2)' },
      { id: 'qms-documents', label: 'Cl.7 — Document Register', path: '/qms/documents', icon: 'FolderOpen', tooltip: 'Documented information register — procedures, forms, records (Cl.7.5)' },
      { id: 'qms-operational', label: 'Cl.8 — Operational Planning', path: '/qms/operational', icon: 'Settings', tooltip: 'Key process register — inputs, outputs, controls and risks (Cl.8.1)' },
      { id: 'qms-design', label: 'Cl.8.3 — Design & Development', path: '/qms/design', icon: 'PenTool', tooltip: 'Design and development projects — inputs, outputs, verification, validation (Cl.8.3)' },
      { id: 'qms-audit-schedule', label: 'Cl.9.2 — Audit Schedule', path: '/qms/audit-schedule', icon: 'CalendarDays', tooltip: 'Internal audit annual plan — scope, frequency, clause coverage (Cl.9.2)' },
      { id: 'qms-improvements', label: 'Cl.10.3 — Improvement Register', path: '/qms/improvements', icon: 'TrendingUp', tooltip: 'Proactive continual improvement register — source, benefit, owner (Cl.10.3)' },
    ]
  },
]

export default navSections
