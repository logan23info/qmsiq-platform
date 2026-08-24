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

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://qmsiq-platform.vercel.app'
    const resendKey = Deno.env.get('RESEND_API_KEY')

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const today = new Date().toISOString().split('T')[0]
    const dueDate = sevenDaysFromNow.toISOString().split('T')[0]

    // Fetch CAPAs due within next 7 days
    const { data: capas, error } = await supabase
      .from('findings')
      .select('id, finding_ref, title, due_date, action_owner, programme_id, audit_programmes(name, programme_id)')
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
    const errors: string[] = []

    for (const capa of capas) {
      if (!capa.action_owner) continue

      // Find profile by full_name match
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${capa.action_owner}%`)
        .limit(1)
        .maybeSingle()
      if (!profile) continue

      // Get email from auth
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      if (!user?.email) continue

      const daysUntilDue = Math.max(0, Math.ceil(
        (new Date(capa.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))

      const programmeName = (capa.audit_programmes as { name?: string })?.name || 'your audit programme'
      const capaUrl = `${siteUrl}/reporting/capa`

      if (resendKey) {
        // Use Resend for transactional email if key provided
        const emailBody = {
          from: 'QMSiQ <noreply@qmsiq.app>',
          to: [user.email],
          subject: `CAPA Reminder — ${capa.finding_ref} due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
          html: `
            <p>Hi ${profile.full_name},</p>
            <p>This is a reminder that the following CAPA is due in <strong>${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}</strong>.</p>
            <table style="border-collapse:collapse;width:100%;max-width:500px">
              <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Reference</td><td style="padding:8px">${capa.finding_ref}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${capa.title}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Programme</td><td style="padding:8px">${programmeName}</td></tr>
              <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Due date</td><td style="padding:8px">${capa.due_date}</td></tr>
            </table>
            <p><a href="${capaUrl}" style="background:#d97706;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">View CAPA Tracker</a></p>
            <p style="color:#888;font-size:12px;margin-top:24px">QMSiQ · Quality Management Audit Platform</p>
          `
        }
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(emailBody)
        })
        if (res.ok) sent++
        else errors.push(`Resend failed for ${user.email}: ${res.status}`)
      } else {
        // Fallback — generate a magic link email via Supabase Auth
        const { error: linkErr } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: user.email,
          options: { redirectTo: capaUrl }
        })
        if (!linkErr) sent++
        else errors.push(`Magic link failed for ${user.email}`)
      }
    }

    return new Response(JSON.stringify({ sent, total: capas.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})
