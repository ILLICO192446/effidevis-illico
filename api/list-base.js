export default async function handler(req, res){
  try{
    const need = ['GRAPH_TENANT_ID','GRAPH_CLIENT_ID','GRAPH_CLIENT_SECRET','GRAPH_DRIVE_ID','GRAPH_FOLDER_ID']
    const missing = need.filter(k => !process.env[k])
    if (missing.length){
      return res.status(200).json({ status:'need-config', message:`Variables manquantes: ${missing.join(', ')}` })
    }

    const tokenRes = await fetch(`https://login.microsoftonline.com/${process.env.GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GRAPH_CLIENT_ID,
        client_secret: process.env.GRAPH_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    })
    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token){
      return res.status(500).json({ status:'error', message:'Impossible d’obtenir un token Microsoft Graph', details: tokenJson })
    }

    const driveId = process.env.GRAPH_DRIVE_ID
    const folderId = process.env.GRAPH_FOLDER_ID
    const resp = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children?$select=id,name,@microsoft.graph.downloadUrl,file`, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    })
    const js = await resp.json()
    if (!js.value){
      return res.status(200).json({ status:'ok', items:[] })
    }
    const items = js.value
      .filter(it => it.file && String(it.file.mimeType||'').includes('pdf'))
      .map(it => ({ id: it.id, name: it.name, downloadUrl: it['@microsoft.graph.downloadUrl'] }))
    return res.status(200).json({ status:'ok', items })
  } catch(e){
    return res.status(500).json({ status:'error', message:String(e) })
  }
}