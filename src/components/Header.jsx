import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Search, X, ArrowRight, LogOut, User, Sun, Moon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { navSections } from '../navConfig'
import ProgrammeSelector from './ProgrammeSelector'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Tooltip from './Tooltip'
import { useProgramme } from '../context/ProgrammeContext'
import { getFindings, getPBCItems } from '../lib/supabase'

function getPageTitle(pathname) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.path === pathname) return item.label
    }
  }
  return 'Dashboard'
}

const allPages = navSections.flatMap(s => s.items.map(item => ({ ...item, section: s.label })))

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { activeProgramme } = useProgramme()
  const title = getPageTitle(location.pathname)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  // Item 1 — Live notifications from Supabase
  useEffect(() => {
    if (!activeProgramme) return
    const load = async () => {
      try {
        const [findings, pbc] = await Promise.all([
          getFindings(activeProgramme.id),
          getPBCItems(activeProgramme.id),
        ])
        const notifs = []
        const today = new Date()

        // Overdue findings
        findings.filter(f => f.due_date && new Date(f.due_date) < today && f.status !== 'Closed')
          .slice(0, 3).forEach(f => notifs.push({
            id: `f-${f.id}`, title: `Overdue: ${f.finding_ref}`,
            desc: f.title, time: `Due ${f.due_date}`, type: 'danger',
            path: '/fieldwork/findings'
          }))

        // Critical/High open findings
        findings.filter(f => ['Critical', 'High'].includes(f.rating) && f.status === 'Open')
          .slice(0, 2).forEach(f => notifs.push({
            id: `fh-${f.id}`, title: `${f.rating} Finding Open`,
            desc: f.title, time: f.finding_ref, type: 'warning',
            path: '/fieldwork/findings'
          }))

        // PBC outstanding
        const outstanding = pbc.filter(p => p.status === 'Not Started').length
        if (outstanding > 0) notifs.push({
          id: 'pbc-out', title: `${outstanding} PBC Items Not Started`,
          desc: 'Evidence requests outstanding from auditee', time: activeProgramme.programme_id,
          type: 'info', path: '/fieldwork/pbc'
        })

        // If no real notifs, show programme info
        if (notifs.length === 0) notifs.push({
          id: 'all-good', title: 'All clear',
          desc: 'No overdue actions or critical findings', time: 'Now', type: 'success',
          path: '/'
        })

        setNotifications(notifs.slice(0, 5))
      } catch (e) { console.error(e) }
    }
    load()
  }, [activeProgramme])

  const unreadCount = notifications.filter(n => n.type === 'danger' || n.type === 'warning').length

  const searchResults = searchQuery.length > 1
    ? allPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.section.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : []

  // Item 4 — Ctrl+K search shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(p => !p)
        setNotifOpen(false)
        setUserOpen(false)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); setUserOpen(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearchNav = (path) => { navigate(path); setSearchOpen(false); setSearchQuery('') }

  const notifColors = { danger: 'bg-red-500', warning: 'bg-amber-audit', info: 'bg-blue-500', success: 'bg-emerald-500' }

  return (
    <header className="h-14 bg-navy-900 border-b border-navy-700 flex items-center px-4 gap-3 flex-shrink-0 relative z-30">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-navy-800 text-steel-400 hover:text-steel-200 transition-colors">
        <Menu size={18} />
      </button>

      <ProgrammeSelector />

      <div className="flex-1 min-w-0 hidden sm:block">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
      </div>

      {/* Search — Item 4: Ctrl+K shortcut shown */}
      <div className="relative" ref={searchRef}>
        <button onClick={() => { setSearchOpen(!searchOpen); setNotifOpen(false); setUserOpen(false) }}
          className="hidden sm:flex items-center gap-1.5 bg-navy-800 border border-navy-600 rounded-lg px-3 py-1.5 hover:border-steel-400 transition-colors">
          <Search size={13} className="text-steel-400" />
          <span className="text-xs text-steel-400 w-24 text-left">Search...</span>
          <span className="text-xs text-steel-600 ml-1 font-mono">⌘K</span>
        </button>
        <button onClick={() => { setSearchOpen(!searchOpen); setNotifOpen(false); setUserOpen(false) }} className="sm:hidden p-2 rounded-lg hover:bg-navy-800 text-steel-400">
          <Search size={16} />
        </button>

        {searchOpen && (
          <div className="absolute right-0 top-10 w-80 bg-navy-900 border border-navy-600 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-navy-700">
              <Search size={13} className="text-steel-400 flex-shrink-0" />
              <input autoFocus type="text" placeholder="Search all modules..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-white placeholder-steel-400 outline-none" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-steel-400 hover:text-steel-200"><X size={12} /></button>}
            </div>
            {searchQuery.length > 1 ? (
              <div className="max-h-72 overflow-y-auto py-1">
                {searchResults.length > 0 ? searchResults.map(r => (
                  <button key={r.path} onClick={() => handleSearchNav(r.path)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-navy-800 transition-colors text-left group">
                    <div className="min-w-0"><div className="text-sm text-white truncate">{r.label}</div><div className="text-xs text-steel-400 truncate">{r.section}</div></div>
                    <ArrowRight size={12} className="text-steel-400 group-hover:text-steel-200 flex-shrink-0 ml-2" />
                  </button>
                )) : <div className="px-3 py-4 text-xs text-steel-400 text-center">No modules found for "{searchQuery}"</div>}
              </div>
            ) : (
              <div className="py-2">
                <div className="px-3 py-1.5 text-xs text-steel-400 uppercase tracking-wide font-medium">Quick access</div>
                {[
                  { label: 'TOD — Test of Design', path: '/iso19011/tod' },
                  { label: 'Risk Register', path: '/iso27005/live-register' },
                  { label: 'PBC Master List', path: '/fieldwork/pbc' },
                  { label: 'Finding Register', path: '/fieldwork/findings' },
                  { label: 'KPI Dashboard', path: '/reporting/kpi' },
                ].map(q => (
                  <button key={q.path} onClick={() => handleSearchNav(q.path)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-navy-800 transition-colors group">
                    <span className="text-sm text-steel-300 group-hover:text-white">{q.label}</span>
                    <ArrowRight size={12} className="text-steel-400 group-hover:text-steel-200 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-navy-800 text-steel-400 hover:text-steel-200 transition-colors">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications — Item 1: Live from Supabase */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => { setNotifOpen(p => !p); setSearchOpen(false); setUserOpen(false) }}
          className="p-2 rounded-lg hover:bg-navy-800 text-steel-400 hover:text-steel-200 transition-colors relative">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">{unreadCount}</span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-10 w-80 bg-navy-900 border border-navy-600 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <span className="text-xs text-steel-400">{activeProgramme?.programme_id || 'No programme'}</span>
            </div>
            <div className="divide-y divide-navy-800 max-h-80 overflow-y-auto">
              {notifications.map(n => (
                <button key={n.id} onClick={() => { navigate(n.path); setNotifOpen(false) }}
                  className="w-full px-4 py-3 text-left hover:bg-navy-800 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${notifColors[n.type]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white">{n.title}</div>
                      <div className="text-xs text-steel-400 mt-0.5 truncate">{n.desc}</div>
                    </div>
                    <span className="text-xs text-steel-500 flex-shrink-0 whitespace-nowrap">{n.time}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-navy-700 flex items-center justify-between">
              <span className="text-xs text-steel-400">Live from audit data</span>
              <button onClick={() => { navigate('/fieldwork/findings'); setNotifOpen(false) }} className="text-xs text-amber-audit hover:text-amber-300">View findings →</button>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative" ref={userRef}>
        <button onClick={() => { setUserOpen(p => !p); setSearchOpen(false); setNotifOpen(false) }}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800 transition-colors">
          <div className="w-7 h-7 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center">
            <User size={14} className="text-steel-400" />
          </div>
        </button>
        {userOpen && (
          <div className="absolute right-0 top-10 w-56 bg-navy-900 border border-navy-600 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-navy-700">
              <div className="text-xs font-semibold text-white truncate">{profile?.full_name || user?.email || 'Auditor'}</div>
              <div className="text-xs text-steel-400 truncate mt-0.5">{user?.email}</div>
              <div className="text-xs text-steel-400 mt-0.5">{profile?.role || 'Auditor'}</div>
            </div>
            <div className="p-1">
              <button onClick={() => { navigate('/profile'); setUserOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-steel-300 hover:bg-navy-800 transition-colors">
                <User size={14} /> Edit Profile
              </button>
              <button onClick={() => { toggleTheme(); setUserOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-steel-300 hover:bg-navy-800 transition-colors">
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
