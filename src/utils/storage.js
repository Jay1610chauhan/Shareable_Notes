const STORAGE_KEY = 'shareable_notes_v1'

export function loadNotes(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw) return []
    return JSON.parse(raw)
  }catch(e){
    console.error('Failed load notes',e)
    return []
  }
}

export function saveNotes(notes){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function generateId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8)
}
