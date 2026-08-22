import { useState, useEffect } from 'react'
import { Users, UserPlus, Trash2, Crown, Eye, Edit2, Loader2, Check, Copy, Shield } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useProgramme } from '../context/ProgrammeContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

const roleConfig = {
  lead: { label: 'Lead', color: 'bg-amber-900/40 text-amber-300 border-amber-700', icon: Crown, desc: 'Full access — invite members, delete records, sign off workpapers' },
  auditor: { label: 'Auditor', color: 'bg-blue-900/40 text-blue-300 border-blue-700', icon: Edit2, desc: 'Create and edit findings, workpapers, risks, PBC items' },
  reviewer: { label: 'Reviewer', color: 'bg-purple-900/40 text-purple-300 border-purple-700', icon: Eye, desc: 'Read all records, sign off workpapers, close findings — cannot delete' },
}

async function getMembers(programmeId) {
  const { data, error } = await supabase
    .from('programme_members')
    .select('id, programme_id, user_id, role, invited_by, invited_email, joined_at')
    .eq('programme_id', programmeId)
    .order('joined_at', { ascending: true })
  if (error) throw error
  if (!data || data.length === 0) return []

  // Fetch profiles separately for each member
  const members = await Promise.all(data.map(async (m) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, organisation')
      .eq('id', m.user_id)
      .maybeSingle()
    return { ...m, profiles: profile || null }
  }))
  return members
}

async function getMyRole(programmeId, userId) {
  if (!programmeId || !userId) return null
  const { data } = await supabase
    .from('programme_members')
    .select('role')
    .eq('programme_id', programmeId)
    .eq('user_id', userId)
    .maybeSingle()
  return data?.role || null
}

async function addMember(programmeId, userId, role, invitedBy) {
  const { data, error } = await supabase
    .from('programme_members')
    .insert({ programme_id: programmeId, user_id: userId, role, invited_by: invitedBy })
    .select()
    .single()
  if (error) throw error
  return data
}

async function changeRole(memberId, role) {
  const { data, error } = await supabase
    .from('programme_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()
  if (error) throw error
  return data
}

async function removeMember(memberId) {
  const { error } = await supabase
    .from('programme_members')
    .delete()
    .eq('id', memberId)
  if (error) throw error
}

function RoleBadge({ role }) {
  const cfg = roleConfig[role] || roleConfig.auditor
  return <span className={`badge border text-xs ${cfg.color}`}>{cfg.label}</span>
}

export default function Team() {
  const { user } = useAuth()
  const { activeProgramme } = useProgramme()
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [myRole, setMyRole] = useState(null)
  const [userId, setUserId] = useState('')
  const [inviteRole, setInviteRole] = useState('auditor')
  const [adding, setAdding] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [copied, setCopied] = useState(false)

  const load = async () => {
    if (!activeProgramme || !user) return
    setLoading(true)
    try {
      const [mems, role] = await Promise.all([
        getMembers(activeProgramme.id),
        getMyRole(activeProgramme.id, user.id),
      ])
      setMembers(mems)
      setMyRole(role)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [activeProgramme?.id, user?.id])

  // Reload when tab becomes visible again
  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [activeProgramme?.id])

  const handleAdd = async () => {
    if (!userId.trim()) return
    setAdding(true)
    try {
      await addMember(activeProgramme.id, userId.trim(), inviteRole, user.id)
      toast(`Member added as ${inviteRole}`)
      setUserId('')
      await load()
    } catch (e) {
      toast(e.message?.includes('duplicate') ? 'User is already a member' : 'Failed: ' + e.message, 'error')
    }
    setAdding(false)
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await changeRole(memberId, newRole)
      setMembers(p => p.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      toast('Role updated')
    } catch (e) { toast('Update failed', 'error') }
  }

  const handleRemove = (member) => {
    setConfirmDel({
      title: 'Remove team member?',
      message: `${member.profiles?.full_name || 'This member'} will lose access to the programme.`,
      onConfirm: async () => {
        try {
          await removeMember(member.id)
          setMembers(p => p.filter(m => m.id !== member.id))
          toast('Member removed')
        } catch (e) { toast('Remove failed', 'error') }
      }
    })
  }

  const copyMyId = () => {
    navigator.clipboard.writeText(user?.id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isLead = myRole === 'lead'

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader standard="Platform" clause="Team" title="Team Members"
        description="Manage who has access to this audit programme. The Lead can invite members, assign roles, and remove access. Members see and collaborate on all shared data — findings, risks, workpapers, and PBC items."
        badges={[activeProgramme?.programme_id || 'No Programme', myRole ? `You: ${myRole}` : '']} />

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {Object.entries(roleConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={key} className={`card border-l-4 ${key === 'lead' ? 'border-l-amber-500' : key === 'auditor' ? 'border-l-blue-500' : 'border-l-purple-500'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={key === 'lead' ? 'text-amber-audit' : key === 'auditor' ? 'text-blue-400' : 'text-purple-400'} />
                <RoleBadge role={key} />
              </div>
              <p className="text-xs text-steel-400 leading-relaxed">{cfg.desc}</p>
            </div>
          )
        })}
      </div>

      {!activeProgramme ? (
        <div className="card text-center py-12">
          <Users size={28} className="text-steel-500 mx-auto mb-3" />
          <div className="text-white font-medium mb-1">No programme selected</div>
          <div className="text-xs text-steel-400">Select a programme from the header to manage its team</div>
        </div>
      ) : (
        <>
          {/* Member list */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Team Members</h2>
              <span className="badge badge-steel text-xs">{members.length} members</span>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 size={20} className="animate-spin text-amber-audit mx-auto mb-2" />
                <div className="text-xs text-steel-500">Loading members...</div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-steel-500 text-xs">No members yet — add your team below</div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className={`flex items-center gap-3 rounded-xl p-3 ${m.user_id === user?.id ? 'bg-navy-700 border border-navy-600' : 'bg-navy-800'}`}>
                    <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-amber-audit">
                        {(m.profiles?.full_name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">
                          {m.profiles?.full_name || 'Unknown user'}
                        </span>
                        {m.user_id === user?.id && <span className="badge bg-navy-600 text-steel-400 text-xs">You</span>}
                      </div>
                      <div className="text-xs text-steel-400 truncate">
                        {m.profiles?.organisation || m.profiles?.role || ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isLead && m.user_id !== user?.id ? (
                        <>
                          <select value={m.role}
                            onChange={e => handleRoleChange(m.id, e.target.value)}
                            className="input-field py-1 text-xs w-28">
                            <option value="auditor">Auditor</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="lead">Lead</option>
                          </select>
                          <button onClick={() => handleRemove(m)}
                            className="text-steel-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20">
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <RoleBadge role={m.role} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add member — lead only */}
          {isLead && (
            <div className="card mb-6">
              <h2 className="section-title mb-1">Add Team Member</h2>
              <p className="text-xs text-steel-400 mb-4 leading-relaxed">
                Ask your colleague to log in → go to <span className="text-amber-audit">My Profile</span> → copy their <span className="text-amber-audit">User ID</span>. Paste it below and assign their role.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input className="input-field flex-1 text-xs"
                  placeholder="Paste User ID (uuid)..."
                  value={userId}
                  onChange={e => setUserId(e.target.value)} />
                <select className="input-field text-xs w-32" value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}>
                  <option value="auditor">Auditor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="lead">Lead</option>
                </select>
                <button onClick={handleAdd} disabled={!userId.trim() || adding}
                  className="btn-primary text-xs py-2 px-4">
                  {adding ? <Loader2 size={13} className="animate-spin" /> : <><UserPlus size={13} /> Add</>}
                </button>
              </div>
            </div>
          )}

          {/* My User ID card */}
          <div className="card bg-navy-800/50 border border-navy-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={13} className="text-amber-audit" />
              <span className="text-xs font-semibold text-steel-300">Your User ID</span>
            </div>
            <p className="text-xs text-steel-400 mb-3 leading-relaxed">
              Share this with an Audit Lead to be added to their programme.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-steel-300 bg-navy-900 rounded-lg px-3 py-2 flex-1 truncate font-mono border border-navy-600">
                {user?.id}
              </code>
              <button onClick={copyMyId} className="btn-secondary text-xs py-2 flex-shrink-0">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        </>
      )}

      {confirmDel && <ConfirmModal {...confirmDel} onClose={() => setConfirmDel(null)} />}
    </div>
  )
}
