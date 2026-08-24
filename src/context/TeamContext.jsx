import { log, logError } from '../lib/logger'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useProgramme } from './ProgrammeContext'

const TeamContext = createContext({})

export function TeamProvider({ children }) {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const [myRole, setMyRole] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !activeProgramme) { setMyRole(null); setMembers([]); return }
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('programme_members')
          .select('*, profiles(full_name, organisation)')
          .eq('programme_id', activeProgramme.id)
        setMembers(data || [])
        const mine = (data || []).find(m => m.user_id === user.id)
        // If no member record found, user is the programme owner = lead
        setMyRole(mine?.role || (activeProgramme.user_id === user.id ? 'lead' : null))
      } catch (e) { logError(e) }
      setLoading(false)
    }
    load()
  }, [user, activeProgramme])

  const isLead = myRole === 'lead'
  const isAuditor = myRole === 'auditor' || myRole === 'lead'
  const isReviewer = myRole === 'reviewer' || myRole === 'auditor' || myRole === 'lead'
  const canEdit = isAuditor
  const canDelete = isLead || myRole === 'auditor'
  const canManageTeam = isLead

  return (
    <TeamContext.Provider value={{
      myRole, members, loading,
      isLead, isAuditor, isReviewer,
      canEdit, canDelete, canManageTeam,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
