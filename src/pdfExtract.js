import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractTextFromPdfBlob(blob){
  const buf = await blob.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  let text = ''
  for (let p=1; p<=pdf.numPages; p++){
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    text += '\n' + content.items.map(i=>i.str).join(' ')
  }
  return text
}

export async function extractTextFromPdfFile(file){
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  let text = ''
  for (let p=1; p<=pdf.numPages; p++){
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    text += '\n' + content.items.map(i=>i.str).join(' ')
  }
  return text
}

export function normalizeLines(raw){
  const lines = raw.split(/\n|\r/g).map(l=>l.trim()).filter(Boolean)
  const items = []
  for (const l of lines){
    const money = [...l.matchAll(/\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?/g)].map(m=>m[0])
    if (money.length===0) continue
    const desc = l.replace(/\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?/g,'').replace(/\s{2,}/g,' ').trim()
    const total = parseNum(money[money.length-1])
    const pu = money.length>1 ? parseNum(money[money.length-2]) : null
    items.push({ description: desc || '(ligne)', pu, total })
  }
  return aggregate(items)
}

function parseNum(s){
  if (!s) return null
  const n = s.replace(/\s/g,'').replace(',','.')
  const v = parseFloat(n)
  return isNaN(v) ? null : v
}

function aggregate(items){
  const map=new Map()
  for (const it of items){
    const key = (it.description||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().slice(0,60)
    const e = map.get(key) || { description: it.description, pu: it.pu, total: 0, lines: 0 }
    e.total += it.total || 0
    e.lines += 1
    map.set(key, e)
  }
  return [...map.values()].filter(x=>x.total>0)
}