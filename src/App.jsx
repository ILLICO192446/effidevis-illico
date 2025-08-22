import React, { useState } from 'react'
import CompareTwo from './CompareTwo.jsx'
import CompareWithBase from './CompareWithBase.jsx'

export default function App(){
  const [tab,setTab]=useState('two')
  return (
    <div style={{fontFamily:'ui-sans-serif,system-ui',padding:24,maxWidth:1100,margin:'0 auto'}}>
      <h1 style={{marginBottom:8}}>EFFIDevis 🔎</h1>
      <p style={{color:'#555',marginTop:0}}>Comparer deux devis PDF, ou un devis avec la base OneDrive.</p>
      <div style={{display:'flex',gap:12,margin:'16px 0'}}>
        <button onClick={()=>setTab('two')} style={btn(tab==='two')}>Devis A vs Devis B</button>
        <button onClick={()=>setTab('base')} style={btn(tab==='base')}>Devis vs Base (OneDrive)</button>
      </div>
      {tab==='two'? <CompareTwo/> : <CompareWithBase/>}
    </div>
  )
}
const btn=(active)=>({padding:'10px 14px',borderRadius:10,border:'1px solid #cdd',cursor:'pointer',background:active?'#1e40af':'#f6f7fb',color:active?'white':'#1e293b'})