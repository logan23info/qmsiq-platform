import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { systemPrompt, userMessage } = await req.json()
    if (!systemPrompt || !userMessage) {
      return new Response(JSON.stringify({ error: 'systemPrompt and userMessage are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const groqKey = Deno.env.get('GROQ_API_KEY')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    let content = ''

    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({ model: 'openai/gpt-oss-20b', max_tokens: 1500, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] })
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Groq ${res.status}`) }
      const data = await res.json()
      content = data.choices?.[0]?.message?.content || ''
    } else if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1500, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] })
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `OpenAI ${res.status}`) }
      const data = await res.json()
      content = data.choices?.[0]?.message?.content || ''
    } else if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] })
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Anthropic ${res.status}`) }
      const data = await res.json()
      content = data.content?.map((b: { text?: string }) => b.text || '').join('\n') || ''
    } else {
      throw new Error('NO_KEY')
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
