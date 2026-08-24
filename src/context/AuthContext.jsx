import { log, logError } from '../lib/logger'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!data) {
        // Profile row does not exist yet — upsert it
        const { data: upserted } = await supabase
          .from('profiles')
          .upsert({ id: userId, full_name: '', role: '', organisation: '' }, { onConflict: 'id' })
          .select()
          .maybeSingle()
        setProfile(upserted ?? { id: userId })
        // Listen for programme_members trigger (invite matching) then notify
        const channel = supabase.channel(`member-match-${userId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'programme_members', filter: `user_id=eq.${userId}` },
            () => { window.dispatchEvent(new Event('profile-ready')); supabase.removeChannel(channel) }
          ).subscribe()
        // Fallback after 3s if realtime doesn't respond
        setTimeout(() => { window.dispatchEvent(new Event('profile-ready')); supabase.removeChannel(channel) }, 3000)
      } else {
        setProfile(data)
      }
    } catch (e) {
      logError('Profile fetch error:', e)
      setProfile({ id: userId })
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, fullName, organisation }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, organisation } }
    })
    if (error) throw error
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
