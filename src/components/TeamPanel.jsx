import { useState, useEffect } from 'react'
import { Users, UserPlus, Trash2, Crown, Eye, Edit2, Loader2, X, Check } from 'lucide-react'
import { getProgrammeMembers, addMemberByUserId, updateMemberRole, removeMember, getMyRole } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'

const roleConfig = {
  lead: { label: 'Lead', color: 'bg-amber-900/40 text-amber-300', icon: Crown, desc: 'Full access — invite, delete, sign off' },
  auditor: { label: 'Auditor', color: 'bg-blue-900/40 text-blue-300', icon: Edit2, desc: 'Create & edit findings, workpapers, risks, PBC' },
  reviewer: { label: 'Reviewer', color: 'bg-purple-900/40 text-purple-300', icon: Eye, desc: 'Read all, sign off workpapers, close findings' },
}

function RoleBadge({ role }) {
  const cfg = roleConfig[role] || roleConfig.auditor
  return <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
}

export default function TeamPanel({ programmeId, onClose }) {
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [myRole, setMyRole] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('auditor')
  const [inviting, setInviting] = useState(false)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  useEffect(() => {
    if (!programmeId) return
    load()
  }, [programmeId])

  const load = async () => {
    setLoading(true)
    try {
      const [mems, role] = await Promise.all([
        getProgrammeMembers(programmeId),
        getMyRole(programmeId),
      ])
      setMembers(mems || [])
      setMyRole(role)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const lookupUser = async () => {
    if (!inviteEmail.trim()) return
    setLookupLoading(true)
    setLookupResult(null)
    try {
      // Search profiles by matching email pattern in auth
      // We use a function call approach — look up via profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, organisation')
        .limit(50)

      // Filter locally since we can't query auth.users email directly
      // In production you'd have email stored in profiles or use an edge function
      if (data && data.length > 0) {
        setLookupResult({ found: false, message: 'Enter the user ID directly or ask your colleague to share their User ID from Profile → Settings.' })
      }
    } catch (e) {
      setLookupResult({ found: false, message: 'Lookup failed. Use User ID method.' })
    }
    setLookupLoading(false)
  }

  const addByUserId = async (userId) => {
    if (!userId?.trim()) return
    setInviting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await addMemberByUserId(programmeId, userId.trim(), inviteRole, user.id)
      toast(`Member added as ${inviteRole}`)
      setInviteEmail('')
      await load()
    } catch (e) {
      toast(e.message?.includes('duplicate') ? 'User already a member' : 'Add failed: ' + e.message, 'error')
    }
    setInviting(false)
  }

  const changeRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole)
      setMembers(p => p.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      toast('Role updated')
    } catch (e) { toast('Role update failed', 'error') }
  }

  const removeMemberHandler = async (member) => {
    if (!window.confirm(`Remove ${member.profiles?.full_name || 'this member'} from the programme?`)) return
    try {
      await removeMember(member.id)
      setMembers(p => p.filter(m => m.id !== member.id))
      toast('Member removed')
    } catch (e) { toast('Remove failed', 'error') }
  }

  const isLead = myRole === 'lead'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-600 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-amber-audit" />
            <h2 className="font-semibold text-white">Team Members</h2>
            <span className="badge badge-steel text-xs">{members.length} members</span>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Role legend */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(roleConfig).map(([key, cfg]) => {
              const Icon = cfg.icon
              return (
                <div key={key} className="bg-navy-800 rounded-lg p-2.5 text-center">
                  <RoleBadge role={key} />
                  <div className="text-xs text-steel-400 mt-1.5 leading-snug">{cfg.desc}</div>
                </div>
              )
            })}
          </div>

          {/* Member list */}
          {loading ? (
            <div className="text-center py-6"><Loader2 size={20} className="animate-spin text-steel-400 mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-navy-800 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-audit">
                      {(m.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {m.profiles?.full_name || 'Unknown user'}
                    </div>
                    <div className="text-xs text-steel-400 truncate">
                      {m.profiles?.organisation || m.profiles?.role || ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLead && m.role !== 'lead' ? (
                      <select value={m.role}
                        onChange={e => changeRole(m.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-navy-700 border border-navy-600 text-steel-300">
                        <option value="auditor">Auditor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="lead">Lead</option>
                      </select>
                    ) : (
                      <RoleBadge role={m.role} />
                    )}
                    {isLead && m.role !== 'lead' && (
                      <button onClick={() => removeMemberHandler(m)}
                        className="text-steel-500 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add member — lead only */}
          {isLead && (
            <div className="border-t border-navy-700 pt-4">
              <div className="text-xs font-semibold text-steel-300 mb-3 flex items-center gap-2">
                <UserPlus size={13} className="text-emerald-audit" />
                Add Team Member by User ID
              </div>
              <div className="bg-navy-800 rounded-xl p-3 mb-3">
                <p className="text-xs text-steel-400 leading-relaxed">
                  Ask your colleague to log in to QMSiQ → go to their <span className="text-amber-audit">Profile page</span> → copy their <span className="text-amber-audit">User ID</span>. Paste it below.
                </p>
              </div>
              <div className="space-y-2">
                <input className="input-field text-xs"
                  placeholder="Paste User ID (uuid format)..."
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)} />
                <div className="flex gap-2">
                  <select className="input-field text-xs flex-1" value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}>
                    <option value="auditor">Auditor</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="lead">Lead</option>
                  </select>
                  <button onClick={() => addByUserId(inviteEmail)}
                    disabled={!inviteEmail.trim() || inviting}
                    className="btn-primary text-xs py-1.5 px-4">
                    {inviting ? <Loader2 size={13} className="animate-spin" /> : <><UserPlus size={13} /> Add</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLead && (
            <div className="border-t border-navy-700 pt-4">
              <p className="text-xs text-steel-500 text-center">Only the Lead can add or remove team members.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
