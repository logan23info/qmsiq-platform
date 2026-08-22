import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { navSections } from '../navConfig'

function getLabel(pathname) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.path === pathname) return { label: item.label, section: section.label }
    }
  }
  return null
}

const sectionPaths = {
  'ISO 19011 — Audit Methodology': '/iso19011/clause4',
  'ISO 27000 — Terminology': '/iso27000',
  'ISO 27001 — ISMS': '/iso27001/clause4',
  'ISO 27002 — Controls': '/iso27002/organizational',
  'ISO 27005 — Risk': '/iso27005/assets',
  'ISO 9001 — QMS': '/iso9001/clause5',
  'IMS Cross-Walk': '/ims/crosswalk',
  'Fieldwork Operations': '/fieldwork/tracker',
  'Reporting & Governance': '/reporting/builder',
  'Platform': '/',
}

export default function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname === '/') return null

  const found = getLabel(location.pathname)
  if (!found) return null

  const crumbs = [
    { label: 'Dashboard', path: '/', icon: true },
    { label: found.section, path: sectionPaths[found.section] || '/' },
    { label: found.label, path: location.pathname, active: true },
  ].filter((c, i, arr) => !(i === 1 && c.path === arr[2].path))

  return (
    <nav className="flex items-center gap-1 text-xs text-steel-500 mb-4 flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={11} className="text-steel-600 flex-shrink-0" />}
          {crumb.active ? (
            <span className="text-steel-300 font-medium truncate max-w-xs">{crumb.label}</span>
          ) : (
            <button onClick={() => navigate(crumb.path)} className="hover:text-amber-audit transition-colors flex items-center gap-1 flex-shrink-0">
              {crumb.icon && <Home size={11} />}
              {!crumb.icon && crumb.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
