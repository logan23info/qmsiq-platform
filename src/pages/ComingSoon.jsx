import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, Search, Shield } from 'lucide-react'
import { navSections } from '../navConfig'

function getPageInfo(pathname) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.path === pathname) return { label: item.label, section: section.label }
    }
  }
  return null
}

const quickLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'TOD — Test of Design', path: '/iso19011/tod' },
  { label: 'Finding Register ⭐', path: '/fieldwork/findings' },
  { label: 'Risk Register ⭐', path: '/iso27005/live-register' },
  { label: 'KPI Dashboard ⭐', path: '/reporting/kpi' },
  { label: 'SoA Builder', path: '/iso27001/soa' },
]

export default function ComingSoon() {
  const navigate = useNavigate()
  const location = useLocation()
  const pageInfo = getPageInfo(location.pathname)

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-800 border border-navy-600 mb-6">
        <Shield size={28} className="text-steel-500" />
      </div>

      {pageInfo ? (
        <>
          <div className="badge badge-steel text-xs mb-3">{pageInfo.section}</div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">{pageInfo.label}</h1>
          <p className="text-steel-400 text-sm mb-2">This module is part of the platform architecture.</p>
          <p className="text-steel-500 text-xs mb-8">Path: <span className="font-mono text-amber-audit">{location.pathname}</span></p>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-steel-400 text-sm mb-2">The page <span className="font-mono text-amber-audit">{location.pathname}</span> doesn't exist.</p>
          <p className="text-steel-500 text-xs mb-8">Check the URL or navigate using the sidebar.</p>
        </>
      )}

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
          <ArrowLeft size={14} /> Go Back
        </button>
        <button onClick={() => navigate('/')} className="btn-primary text-sm">
          <Home size={14} /> Dashboard
        </button>
      </div>

      <div className="card text-left">
        <h2 className="section-title mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickLinks.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="text-left text-xs text-steel-300 hover:text-white bg-navy-800 hover:bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 transition-colors">
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
