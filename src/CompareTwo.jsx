import React, { useState } from 'react'
import { extractTextFromPdfFile, normalizeLines } from './pdfExtract'

export default function CompareTwo(){
  const [a,setA]=useState(null), [b,setB]=useState(null)
  const [rows,setRows]=useState([])

  async function handleCompare(){
    if(!a||!b) return
    const [ta,tb] = await Promise.all([extractTextFromPdfFile(a), extractTextFromPdfFile(b)])
    const na = normalizeLines(ta), nb = normalizeLines(tb)
    const index = new Map(nb.map(r => [key(r.description), r]))
    const out = na.map(r=>{
      const m = index.get(key(r.description))
      const totalB = m?.total || 0
      const ecart = totalB ? ((r.total-totalB)/totalB*100) : null
      return { desc:r.description, totalA:r.total, totalB, ecart }
    })
    setRows(out.sort((x,y)=>Math.abs(y.ecart||0)-Math.abs(x.ecart||0)))
  }

  return (
    <div>
      <h2>Comparer deux devis (PDF)</h2>
      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <label>Devis A (PDF) <input type='file' accept='application/pdf' onChange={e=>setA(e.target.files[0])}/></label>
        <label>Devis B (PDF) <input type='file' accept='application/pdf' onChange={e=>setB(e.target.files[0])}/></label>
        <button onClick={handleCompare} style={btn}>Comparer</button>
      </div>
      {rows.length>0 && (
        <table style={{width:'100%',marginTop:16,borderCollapse:'collapse'}}>
          <thead><tr>
            <th style={th}>Poste</th><th style={th}>Total A (€)</th><th style={th}>Total B (€)</th><th style={th}>Écart %</th>
          </tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={i} style={{background:i%2?'#fbfdff':'white'}}>
              <td style={td}>{r.desc}</td>
              <td style={tdR}>{fmt(r.totalA)}</td>
              <td style={tdR}>{fmt(r.totalB)}</td>
              <td style={{...tdR,color:(r.ecart||0)>10?'#b91c1c':(r.ecart||0)<-10?'#047857':'#334155'}}>
                {r.ecart!=null? r.ecart.toFixed(1)+' %':'—'}
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}
const key=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().slice(0,40)
const fmt=v=>v!=null? v.toLocaleString('fr-FR',{maximumFractionDigits:2}):'—'
const th={textAlign:'left',borderBottom:'1px solid #e5e7eb',padding:'8px 6px'}
const td={borderBottom:'1px solid #f1f5f9',padding:'8px 6px'}
const tdR={...td,textAlign:'right'}
const btn={padding:'8px 12px',borderRadius:8,background:'#1e40af',color:'white',border:'none',cursor:'pointer'}