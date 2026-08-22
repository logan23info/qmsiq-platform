import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getProgrammes } from '../lib/supabase'

const ProgrammeContext = createContext({})

export function ProgrammeProvider({ children }) {
  const { user } = useAuth()
  const [programmes, setProgrammes] = useState([])
  const [activeProgramme, setActiveProgrammeState] = useState(null)
  const [loading, setLoading] = useState(false)

  const setActiveProgramme = useCallback((prog) => {
    setActiveProgrammeState(prog)
    // Fix 5 — persist active programme to localStorage
    if (prog) localStorage.setItem('auditiq-active-programme', prog.id)
    else localStorage.removeItem('auditiq-active-programme')
  }, [])

  // Fix 2 — reload function for ProgrammeSelector edit
  const reload = useCallback(async () => {
    if (!user) return
    try {
      const data = await getProgrammes(user.id)
      setProgrammes(data || [])
      return data || []
    } catch (e) { console.error(e); return [] }
  }, [user])

  useEffect(() => {
    if (!user) { setProgrammes([]); setActiveProgrammeState(null); return }
    const load = async () => {
      setLoading(true)
      try {
        const data = await getProgrammes(user.id)
        setProgrammes(data || [])
        // Fix 5 — restore active programme from localStorage
        const savedId = localStorage.getItem('auditiq-active-programme')
        if (savedId && data?.length > 0) {
          const found = data.find(p => p.id === savedId)
          setActiveProgrammeState(found || data[0])
        } else if (data?.length > 0) {
          setActiveProgrammeState(data[0])
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <ProgrammeContext.Provider value={{ programmes, activeProgramme, setActiveProgramme, loading, reload }}>
      {children}
    </ProgrammeContext.Provider>
  )
}

export const useProgramme = () => useContext(ProgrammeContext)
