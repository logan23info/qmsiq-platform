export const navSections = [
  {
    id: 'core', label: 'Platform',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', tooltip: 'QMS audit programme overview — live stats and recent activity' },
      { id: 'wiki', label: 'How to Use (Wiki)', path: '/wiki', icon: 'BookOpen', tooltip: 'Platform guide — full audit workflow from planning to reporting' },
      { id: 'faq', label: 'FAQ', path: '/faq', icon: 'HelpCircle', tooltip: 'Frequently asked questions about the platform and QMS audit methodology' },
      { id: 'profile', label: 'My Profile', path: '/profile', icon: 'User', tooltip: 'Edit your name, role, organisation, and change password' },
    ]
  },
  {
    id: 'iso19011', label: 'ISO 19011 — Audit Methodology',
    items: [
      { id: '19011-cl4', label: 'Clause 4 — Principles', path: '/iso19011/clause4', icon: 'Shield', tooltip: '7 principles of auditing per ISO 19011:2018' },
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
    id: 'iso9000', label: 'ISO 9000 — Terminology',
    items: [
      { id: '9000', label: 'QMS Terminology Dictionary', path: '/iso9000', icon: 'BookMarked', tooltip: '44 key quality management terms from ISO 9000:2015 — searchable by category' },
    ]
  },
  {
    id: 'iso9001', label: 'ISO 9001 — QMS',
    items: [
      { id: '9001-cl4', label: 'Clause 4 — Context & Scope', path: '/iso9001/clause4', icon: 'Map', tooltip: 'Internal/external context, interested parties, QMS scope, process approach' },
      { id: '9001-cl5', label: 'Clause 5 — Leadership', path: '/iso9001/clause5', icon: 'Crown', tooltip: 'Top management commitment, quality policy, roles and responsibilities' },
      { id: '9001-cl6', label: 'Clause 6 — Planning', path: '/iso9001/clause6', icon: 'Target', tooltip: 'Risk-based thinking, quality objectives, planning of changes' },
      { id: '9001-cl7', label: 'Clause 7 — Support', path: '/iso9001/clause7', icon: 'Wrench', tooltip: 'Resources, competence, awareness, communication, document control' },
      { id: '9001-cl8', label: 'Clause 8 — Operations', path: '/iso9001/clause8', icon: 'Settings', tooltip: 'Operational planning, customer requirements, supplier control, production' },
      { id: '9001-cl9', label: 'Clause 9 — Performance', path: '/iso9001/clause9', icon: 'TrendingUp', tooltip: 'Customer satisfaction, KPIs, internal audit, management review' },
      { id: '9001-cl10', label: 'Clause 10 — Improvement', path: '/iso9001/clause10', icon: 'RefreshCw', tooltip: 'Nonconformity, corrective action, continual improvement' },
    ]
  },
  {
    id: 'ims', label: 'IMS — QMS × ISMS',
    items: [
      { id: 'ims-crosswalk', label: '9001 × 27001 Alignment', path: '/ims/crosswalk', icon: 'GitMerge', tooltip: '18 shared clauses between ISO 9001 and ISO 27001 with documentation savings' },
      { id: 'ims-worksheets', label: 'Joint Audit Worksheets', path: '/ims/worksheets', icon: 'FileCheck', tooltip: 'Pre-built worksheets covering Supplier, Management Review, CAPA, Document Control' },
    ]
  },
  {
    id: 'fieldwork', label: 'Fieldwork Operations',
    items: [
      { id: 'pbc', label: 'PBC Master List ⭐ Live', path: '/fieldwork/pbc', icon: 'List', tooltip: 'Provided-by-client evidence tracking — status, priority, domain, notes' },
      { id: 'tracker', label: 'Fieldwork Tracker ⭐ Live', path: '/fieldwork/tracker', icon: 'CheckSquare', tooltip: 'Workpaper tracking — TOD/TOI/TOE phase management per control' },
      { id: 'findings', label: 'Finding Register ⭐ Live', path: '/fieldwork/findings', icon: 'AlertTriangle', tooltip: '4Cs finding documentation — raise, track, and close quality findings' },
      { id: 'workpapers', label: 'Workpaper Index', path: '/fieldwork/workpapers', icon: 'FolderOpen', tooltip: 'Workpaper register with formal sign-off (auditor + date)' },
      { id: 'library', label: 'Workpaper Library ☁️', path: '/fieldwork/library', icon: 'CloudUpload', tooltip: 'Cloud evidence storage — upload, download, delete audit files' },
    ]
  },
  {
    id: 'reporting', label: 'Reporting & Governance',
    items: [
      { id: 'report-builder', label: 'Audit Report Builder', path: '/reporting/builder', icon: 'FileText', tooltip: 'Pull live findings into a formal quality audit report — 6 sections' },
      { id: 'mgmt-review', label: 'Management Review Pack', path: '/reporting/management-review', icon: 'BarChart2', tooltip: 'ISO 9001 Cl.9.3 management review — all mandatory inputs and outputs' },
      { id: 'kpi', label: 'KPI Dashboard ⭐ Live', path: '/reporting/kpi', icon: 'Activity', tooltip: 'Live quality KPIs — CAPA closure, customer complaints, nonconformity rates' },
      { id: 'capa', label: 'CAPA Tracker ⭐ Live', path: '/reporting/capa', icon: 'CheckCircle', tooltip: 'Track corrective actions from nonconformity to verified closure' },
      { id: 'universe', label: 'Audit Universe ⭐ Live', path: '/reporting/universe', icon: 'Globe', tooltip: 'Risk-ranked annual QMS audit schedule with status tracking' },
      { id: 'risks', label: 'Risk Register ⭐ Live', path: '/reporting/risks', icon: 'AlertOctagon', tooltip: 'Quality risk register — process risks, supplier risks, customer risks' },
    ]
  },
]

export default navSections
