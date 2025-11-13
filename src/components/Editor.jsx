import React, {useEffect, useRef, useState} from 'react'
import {decryptText, encryptText} from '../utils/crypto'

export default function Editor({note, onChange, onGrammarCheck, glossary}){
  const ref = useRef()
  const [showTooltip, setShowTooltip] = useState(null)

  useEffect(()=>{
    if(ref.current && note){
      ref.current.innerHTML = note.content || ''
    }
  },[note?.id])

  function handleInput(){
    const html = ref.current.innerHTML
    // store plainText for search and summary
    const plain = ref.current.innerText
    onChange({...note, content: html, plainText: plain, updatedAt: Date.now()})
  }

  function handleHover(e){
    const t = e.target
    if(t && t.dataset && t.dataset.definition){
      const rect = t.getBoundingClientRect()
      setShowTooltip({left: rect.right+8, top: rect.top + window.scrollY, text: t.dataset.definition})
    } else setShowTooltip(null)
  }

  return (
    <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column'}}>
      <div contentEditable={!note?.encrypted} className="editor" ref={ref} onInput={handleInput} onMouseOver={handleHover} onMouseOut={()=>setShowTooltip(null)}></div>
      {showTooltip && (
        <div className="tooltip" style={{left:showTooltip.left, top:showTooltip.top}}>{showTooltip.text}</div>
      )}
    </div>
  )
}
