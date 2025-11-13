import React from 'react'

export default function NotesList({notes, onSelect, activeId, onNew, onDelete, onTogglePin, query}){
  const list = [...notes].sort((a,b)=> (b.pinned?1:0) - (a.pinned?1:0) || (b.updatedAt||0)-(a.updatedAt||0))
  const filtered = list.filter(n=>{
    if(!query) return true
    const q = query.toLowerCase()
    return (n.title||'').toLowerCase().includes(q) || (n.plainText||'').toLowerCase().includes(q)
  })

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <strong>Notes</strong>
        <div>
          <button className="btn" onClick={onNew}>New</button>
        </div>
      </div>
      <div className="notes-list">
        {filtered.map(n=> (
          <div key={n.id} className={`note-item ${n.id===activeId?'active':''}`} onClick={()=>onSelect(n.id)}>
            <div>
              <div style={{display:'flex',alignItems:'center'}}>
                <div style={{fontWeight:700}}>{n.title||'Untitled'}</div>
                {n.pinned && <div className="pin">📌</div>}
              </div>
              <div className="muted">{n.summary|| (n.plainText||'').slice(0,80)}</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={(e)=>{e.stopPropagation(); onTogglePin(n.id)}}>{n.pinned? 'Unpin' : 'Pin'}</button>
              <button className="btn" onClick={(e)=>{e.stopPropagation(); onDelete(n.id)}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
