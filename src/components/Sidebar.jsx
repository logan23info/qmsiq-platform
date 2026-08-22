import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User,
  LayoutDashboard, Shield, CalendarDays, PlayCircle, ClipboardList,
  PenTool, Eye, BarChart3, AlertTriangle, Users, FileText, GraduationCap,
  BookOpen, BookMarked, Map, Crown, Target, Wrench, Settings, TrendingUp,
  RefreshCw, Building2, UserCheck, Lock, Cpu, Sparkles, Database,
  AlertOctagon, ShieldCheck, Zap, Star, GitMerge, FileCheck, List,
  CheckSquare, FolderOpen, BarChart2, Activity, CheckCircle, Globe,
  X, LogOut, HelpCircle, CloudUpload
} from 'lucide-react'
import { navSections } from '../navConfig'
import { useAuth } from '../context/AuthContext'
import Tooltip from './Tooltip'

const iconMap = {
  LayoutDashboard, Shield, CalendarDays, PlayCircle, ClipboardList,
  PenTool, Eye, BarChart3, AlertTriangle, Users, FileText, GraduationCap,
  BookOpen, BookMarked, Map, Crown, Target, Wrench, Settings, TrendingUp,
  RefreshCw, Building2, UserCheck, Lock, Cpu, Sparkles, Database,
  AlertOctagon, ShieldCheck, Zap, Star, GitMerge, FileCheck, List,
  HelpCircle, CloudUpload
}

const sectionColors = {
  iso19011: 'text-amber-audit', iso9000: 'text-steel-400', iso9001: 'text-emerald-400',
  ims: 'text-cyan-400', fieldwork: 'text-orange-400', reporting: 'text-pink-400', core: 'text-steel-400',
}

// Tooltip descriptions for nav items
const navTooltips = {
  '/': 'Live dashboard — workpapers, findings, risks, KPIs',
  '/wiki': 'Step-by-step guide to using QMSiQ',
  '/faq': 'Frequently asked questions and troubleshooting',

  '/iso19011/clause4': 'Auditor independence declaration — sign before audit begins',
  '/iso19011/clause5': 'Audit programme objectives, risks, and annual schedule',
  '/iso19011/clause6-initiation': 'Lead auditor appointment letter and auditee contact',
  '/iso19011/clause6-preparation': 'Formal audit plan, document review, work assignment',
  '/iso19011/tod': 'Test of Design — does the control exist and is it designed correctly?',
  '/iso19011/toi': 'Test of Implementation — one walkthrough to confirm control is in use',
  '/iso19011/toe': 'Test of Effectiveness — statistical sample over the audit period',
  '/iso19011/findings': 'Finding development — 4Cs: Condition, Criteria, Cause, Consequence',
  '/iso19011/meetings': 'Opening and closing meeting agendas, attendance, minutes',
  '/iso19011/reporting': 'ISO 19011 Cl. 6.5 — formal audit report generation',
  '/iso19011/clause7': 'Auditor competence — education, training, skills, experience',
  '/iso19011/annexa': 'Supplemental guidance — audit methods, remote auditing, sampling',

















  '/iso9001/clause5': 'QMS leadership, quality policy, roles and responsibilities',
  '/iso9001/clause7': 'QMS support — resources, calibration, document control',
  '/iso9001/clause8': 'QMS operations — product/service requirements, SDLC, supplier control',
  '/iso9001/clause9': 'QMS performance — customer satisfaction, internal audit, management review',
  '/iso9001/clause10': 'QMS improvement — nonconformity, CAPA, continual improvement',
  '/ims/crosswalk': 'ISO 27001 × ISO 9001 clause alignment — joint documentation savings',
  '/ims/worksheets': 'Joint audit worksheets — change management, vendor, SDLC',
  '/fieldwork/pbc': '⭐ PBC evidence tracker — tag by phase, domain, track receipt',
  '/fieldwork/tracker': '⭐ TOD/TOI/TOE progress per control with completion bar',
  '/fieldwork/findings': '⭐ Live finding register — 4Cs, ratings, management response',
  '/fieldwork/workpapers': '⭐ Live workpaper index — sign-off tracking and status',
  '/fieldwork/library': '☁️ Cloud file storage — drag & drop evidence upload',
  '/reporting/builder': 'AI-powered ISO 19011 Cl. 6.5 audit report generator',
  '/reporting/management-review': '⭐ ISO 27001 Cl. 9.3 management review pack with live data',
  '/reporting/kpi': '⭐ 8 live KPIs — CAPA rate, findings, risks, PBC, sign-off',
  '/reporting/capa': '⭐ CAPA closure tracker — overdue alerts, closure rate',
  '/reporting/universe': '⭐ Risk-ranked annual audit schedule — track all audit areas',
}

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, profile } = useAuth()
  const [collapsed, setCollapsed] = useState({})

  const toggle = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))

  const handleNav = (path) => {
    navigate(path)
    if (window.innerWidth < 1024) onClose?.()
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        flex flex-col overflow-hidden transition-transform duration-300 ease-in-out
        bg-navy-900 border-r border-navy-700
        fixed top-0 left-0 h-full w-64 z-50
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:h-screen lg:w-64 lg:translate-x-0 lg:z-auto lg:flex-shrink-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700 flex-shrink-0">
          <div>
            <div className="font-display text-lg font-bold text-white tracking-tight">QMSiQ</div>
            <div className="text-xs text-steel-400 mt-0.5">Quality Management Audit Platform</div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-navy-800 text-steel-400">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map(section => (
            <div key={section.id}>
              <button onClick={() => toggle(section.id)}
                className={`nav-section w-full text-left flex items-center justify-between hover:text-steel-200 transition-colors ${sectionColors[section.id] || 'text-steel-400'}`}>
                <span>{section.label}</span>
                <span className="text-xs normal-case font-normal opacity-60">{collapsed[section.id] ? '▸' : '▾'}</span>
              </button>
              {!collapsed[section.id] && (
                <div className="space-y-0.5 mb-1">
                  {section.items.map(item => {
                    const Icon = iconMap[item.icon]
                    const isActive = location.pathname === item.path
                    const tip = navTooltips[item.path]
                    return (
                      <Tooltip key={item.id} text={tip} position="right">
                        <button
                          onClick={() => handleNav(item.path)}
                          className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
                        >
                          {Icon && <Icon size={14} className="flex-shrink-0" />}
                          <span className="truncate">{item.label}</span>
                        </button>
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          <div className="h-8" />
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-navy-700 flex-shrink-0">
          {profile && (
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">{profile.full_name || profile.email}</div>
                <div className="text-xs text-steel-400 truncate">{profile.role || 'Auditor'}</div>
              </div>
              <Tooltip text="Sign out of QMSiQ">
                <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-red-900/30 text-steel-400 hover:text-red-400 transition-colors flex-shrink-0">
                  <LogOut size={14} />
                </button>
              </Tooltip>
            </div>
          )}
          <div className="text-xs text-steel-400 text-center">ISO 19011 · 27001 · 27002 · 27005 · 9001</div>
        </div>
      </aside>
    </>
  )
}
