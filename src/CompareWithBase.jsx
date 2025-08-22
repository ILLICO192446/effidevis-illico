import React, { useEffect, useState } from 'react'
import { extractTextFromPdfBlob, normalizeLines } from './pdfExtract'

export default function CompareWithBase(){
  const [file,setFile]=useState(null)
  const [base,setBase]=useState([])
  const [info,setInfo]=useState('')

  useEffect(()=>{
    fetch('/api/list-base').then(r=>r.json()).then(d=>{
      if(d.status==='ok') setBase(d.items)
      else setInfo(d.message||'Configurez les variables GRAPH_* sur Vercel.')
    }).catch(()=>setInfo('API non configurée.'))
  }, [])

  async function compare(downloadUrl){
    if(!file) return
    const [localText, baseBlob] = await Promise.all([
      file ? extractTextFromPdfBlob(file) : '',
      fetch(downloadUrl).then(r=>r.blob())
    ])
    const baseText = await extractTextFromPdfBlob(baseBlob)
    const nLocal = normalizeLines(localText)
    const nBase = normalizeLines(baseText)
    const sumLocal = nLocal.reduce((a,b)=>a+(b.total||0),0)
    const sumBase = nBase.reduce((a,b)=>a+(b.total||0),0)
    alert(`Total devis: ${sumLocal.toLocaleString('fr-FR')} €\nTotal base: ${sumBase.toLocaleString('fr-FR')} €`)
  }

  return (
    <div>
      <h2>Comparer un devis avec la BASE (OneDrive)</h2>
      <p style={{color:'#475569'}}>Téléversez votre PDF, puis choisissez un PDF de la base.</p>
      <input type='file' accept='application/pdf' onChange={e=>setFile(e.target.files[0])}/>
      {info && <p style={{color:'#b45309'}}>{info}</p>}

      {base.length>0 && (
        <ul style={{marginTop:12}}>
          {base.map(it => (
            <li key={it.id} style={{margin:'6px 0'}}>
              <button onClick={()=>compare(it.downloadUrl)} style={{padding:'6px 10px',borderRadius:8}}>
                Comparer avec: {it.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}