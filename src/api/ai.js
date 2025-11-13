const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

function getKey(){
  return process.env.REACT_APP_OPENAI_KEY || window.OPENAI_API_KEY || ''
}

async function callOpenAI(system, prompt, max_tokens=150){
  const key = getKey()
  if(!key) throw new Error('OpenAI API key not set. Set REACT_APP_OPENAI_KEY env var or window.OPENAI_API_KEY')
  const body = {
    model: 'gpt-4o-mini',
    messages: [{role:'system', content: system},{role:'user', content: prompt}],
    max_tokens
  }
  const res = await fetch(OPENAI_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
    body: JSON.stringify(body)
  })
  if(!res.ok) throw new Error('AI request failed: '+res.status)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function summarize(text){
  const system = 'You are a helpful assistant that summarizes text in 1-2 lines.'
  const prompt = `Summarize the following note in 1-2 lines:\n---\n${text}`
  return callOpenAI(system,prompt,80)
}

export async function suggestTags(text){
  const system = 'You are a tag-suggesting assistant that returns 3-5 short tags as a JSON array.'
  const prompt = `Suggest 3 to 5 short tags (single words or short phrases) for the following note. Return JSON array only.\n\n${text}`
  const out = await callOpenAI(system,prompt,80)
  try{ return JSON.parse(out) }catch(e){
    // fallback: split by commas
    return out.split(/,|\n/).map(s=>s.trim()).filter(Boolean).slice(0,5)
  }
}

export async function extractGlossary(text){
  const system = 'You are an assistant that extracts key terms and short definitions.'
  const prompt = `From the text below, extract up to 10 key terms and provide a one-line definition for each as JSON object map term->definition. Return only JSON.\n\n${text}`
  const out = await callOpenAI(system,prompt,300)
  try{ return JSON.parse(out) }catch(e){
    return {}
  }
}
