import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, role, programmeId, programmeName, inviterName } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    )
    const { data: { user: caller } } = await supabaseUser.auth.getUser()
    if (!caller) throw new Error('Unauthorized')

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let targetUserId: string

    if (existingUser) {
      // User already registered — just add to programme_members directly
      targetUserId = existingUser.id
    } else {
      // New user — send invite email
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${Deno.env.get('SITE_URL')}/`,
        data: {
          invited_to_programme: programmeId,
          invited_role: role,
          programme_name: programmeName,
          invited_by_name: inviterName,
        }
      })
      if (error) throw error
      targetUserId = data.user.id
    }

    // Upsert programme_members record
    const { error: memberError } = await supabaseAdmin
      .from('programme_members')
      .upsert({
        programme_id: programmeId,
        user_id: targetUserId,
        role: role,
        invited_by: caller.id,
        invited_email: email,
      }, { onConflict: 'programme_id,user_id' })

    if (memberError) throw memberError

    return new Response(JSON.stringify({
      success: true,
      userId: targetUserId,
      existingUser: !!existingUser,
      message: existingUser
        ? `${email} already registered — added to programme as ${role}`
        : `Invite email sent to ${email}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
