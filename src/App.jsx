import React, {useEffect, useState} from 'react'
import NotesList from './components/NotesList'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import {loadNotes, saveNotes, generateId} from './utils/storage'
import {encryptText, decryptText} from './utils/crypto'
import * as ai from './api/ai'

export default function App(){
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(()=>{
    const n = loadNotes()
    setNotes(n)
    if(n[0]) setActiveId(n[0].id)
  },[])

  useEffect(()=> saveNotes(notes), [notes])

  function createNote(){
    const id = generateId()
    const note = {id, title:'Untitled', content:'', plainText:'', createdAt:Date.now(), updatedAt:Date.now(), pinned:false, encrypted:false, summary:'', tags:[]}
    setNotes(s=>[note, ...s])
    setActiveId(id)
  }

  function updateNote(updated){
    setNotes(prev => prev.map(n=> n.id===updated.id? {...n, ...updated}: n))
  }

  function deleteNote(id){
    if(!confirm('Delete note?')) return
    setNotes(prev => prev.filter(n=>n.id!==id))
    if(activeId===id) setActiveId(null)
  }

  async function onEncrypt(){
    const n = notes.find(x=>x.id===activeId)
    if(!n) return alert('Select a note')
    const pw = prompt('Enter a password to lock this note')
    if(!pw) return
    const cipher = await encryptText(n.content || n.plainText || '', pw)
    updateNote({...n, content:'', encrypted:true, cipher})
    alert('Note locked')
  }

  async function onDecrypt(){
    const n = notes.find(x=>x.id===activeId)
    if(!n) return alert('Select a note')
    if(!n.encrypted) return alert('Note is not encrypted')
    const pw = prompt('Enter password to unlock')
    if(!pw) return
    try{
      const plain = await decryptText(n.cipher, pw)
      updateNote({...n, encrypted:false, content: plain, plainText: plain, cipher:undefined})
      alert('Unlocked')
    }catch(e){
      alert('Wrong password')
    }
  }

  async function onSummarize(){
    const n = notes.find(x=>x.id===activeId)
    if(!n) return alert('Select a note')
    const txt = n.plainText || ''
    try{
      const s = await ai.summarize(txt)
      updateNote({...n, summary: s})
      alert('Summary saved')
    }catch(e){
      alert('AI Summarize failed: '+e.message)
    }
  }

  async function onTags(){
    const n = notes.find(x=>x.id===activeId)
    if(!n) return alert('Select a note')
    try{
      const tags = await ai.suggestTags(n.plainText||'')
      updateNote({...n, tags})
      alert('Tags suggested: '+tags.join(', '))
    }catch(e){
      alert('Tag suggestion failed: '+e.message)
    }
  }

  async function onExtractGlossary(){
    const n = notes.find(x=>x.id===activeId)
    if(!n) return
    try{
      const gloss = await ai.extractGlossary(n.plainText||'')
      // highlight occurrences by wrapping terms in span with data-definition
      let html = n.content || ''
      Object.keys(gloss||{}).forEach(term=>{
        const def = gloss[term]
        const re = new RegExp('('+escapeRegExp(term)+')','gi')
        html = html.replace(re, `<span class=\"highlight\" data-definition=\"${escapeHtml(def)}\">$1</span>`)
      })
      updateNote({...n, content: html})
      alert('Glossary highlighted')
    }catch(e){
      alert('Glossary failed: '+e.message)
    }
  }

  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') }
  function escapeHtml(s){ return s.replace(/\"/g, '&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  function togglePin(id){
    const n = notes.find(x=>x.id===id)
    if(!n) return
    updateNote({...n, pinned:!n.pinned})
  }

  function handleSelect(id){
    setActiveId(id)
  }

  function handleEditorChange(updated){
    updateNote(updated)
  }

  function handleDelete(id){ deleteNote(id) }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">Shareable Notes</div>
        <input className="search" placeholder="Search notes..." value={query} onChange={(e)=>setQuery(e.target.value)} />
        <NotesList notes={notes} onSelect={handleSelect} activeId={activeId} onNew={createNote} onDelete={handleDelete} onTogglePin={togglePin} query={query} />
      </div>
      <div className="editor-area">
        <div className="title-row">
          <input className="title-input" value={(notes.find(n=>n.id===activeId)||{}).title||''} onChange={(e)=>{
            const n = notes.find(n=>n.id===activeId)
            if(n) updateNote({...n, title:e.target.value})
          }} />
          <div className="controls">
            <button className="btn" onClick={onExtractGlossary}>Highlight Terms</button>
          </div>
        </div>
        <Toolbar onEncrypt={onEncrypt} onDecrypt={onDecrypt} onSummarize={onSummarize} onTags={onTags} />
        <div style={{flex:1}}>
          <Editor note={notes.find(n=>n.id===activeId)||{}} onChange={handleEditorChange} />
        </div>
        <div style={{marginTop:8}} className="muted">Summary: {(notes.find(n=>n.id===activeId)||{}).summary||'—'}</div>
        <div style={{marginTop:6}}>
          Tags: {((notes.find(n=>n.id===activeId)||{}).tags||[]).map(t=>(<span key={t} className="tag">{t}</span>))}
        </div>
      </div>
    </div>
  )
}
