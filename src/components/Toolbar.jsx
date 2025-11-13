import React from 'react'

function exec(cmd, value=null){
  document.execCommand(cmd, false, value)
}

export default function Toolbar({onEncrypt, onDecrypt, onSummarize, onTags}){
  return (
    <div className="toolbar">
      <button className="btn" onClick={()=>exec('bold')}>B</button>
      <button className="btn" onClick={()=>exec('italic')}>I</button>
      <button className="btn" onClick={()=>exec('underline')}>U</button>
      <select className="btn" onChange={(e)=>exec('fontSize', e.target.value)} defaultValue="3">
        <option value="1">10px</option>
        <option value="2">12px</option>
        <option value="3">14px</option>
        <option value="4">18px</option>
        <option value="5">22px</option>
      </select>
      <div style={{flex:1}} />
      <button className="btn" onClick={()=>exec('justifyLeft')}>Left</button>
      <button className="btn" onClick={()=>exec('justifyCenter')}>Center</button>
      <button className="btn" onClick={()=>exec('justifyRight')}>Right</button>
      <button className="btn" onClick={onSummarize}>AI Summarize</button>
      <button className="btn" onClick={onTags}>Suggest Tags</button>
      <button className="btn" onClick={onEncrypt}>Lock</button>
      <button className="btn" onClick={onDecrypt}>Unlock</button>
    </div>
  )
}
