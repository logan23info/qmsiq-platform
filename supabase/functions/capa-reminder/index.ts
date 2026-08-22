import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const today = new Date().toISOString().split('T')[0]
    const dueDate = sevenDaysFromNow.toISOString().split('T')[0]

    const { data: capas, error } = await supabase
      .from('findings')
      .select('*, audit_programmes(name, programme_id)')
      .eq('status', 'CAPA Raised')
      .lte('due_date', dueDate)
      .gte('due_date', today)

    if (error) throw error
    if (!capas || capas.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No CAPAs due in 7 days' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let sent = 0
    for (const capa of capas) {
      if (!capa.action_owner) continue
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${capa.action_owner}%`)
        .limit(1)
        .maybeSingle()
      if (!profile) continue
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      if (!user?.email) continue
      const daysUntilDue = Math.ceil(
        (new Date(capa.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      await supabase.auth.admin.inviteUserByEmail(user.email, {
        redirectTo: `${Deno.env.get('SITE_URL')}/reporting/capa`,
        data: {
          email_type: 'capa_reminder',
          capa_title: capa.title,
          days_until_due: daysUntilDue,
          due_date: capa.due_date,
        }
      }).catch(() => {})
      sent++
    }

    return new Response(JSON.stringify({ sent, total: capas.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})
