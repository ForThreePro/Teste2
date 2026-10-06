import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

async function uploadEvogb(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType?.ext || 'bin'
  const mime = fileType?.mime || 'application/octet-stream'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  if (!response.ok) throw new Error('Error en evogb.win')
  const j = await response.json()
  return j.url
}

async function uploadCatbox(content) {
  const ft = await fileTypeFromBuffer(content)
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", new Blob([content], { type: ft?.mime || 'image/jpeg' }), `file.${ft?.ext || 'jpg'}`)
  const r = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: form })
  return (await r.text()).trim()
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n‧˚꒰🌼୭ Ejemplo:.removebg (respondiendo a imagen)` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    // 1 - Subir original
    let media
    if (!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 1/3 Subiendo...` }, { quoted: m })
      media = await q.download()
      try { link = await uploadCatbox(media) } catch { link = await uploadEvogb(media) }
    }

    // 2 - HDv2
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 2/3 Mejorando en HDv2...` }, { quoted: m })
    let hdUrl, hdBuffer, hdLink
    try {
      const hdApi = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`
      const hdJson = await fetch(hdApi).then(r => r.json())
      if (hdJson.status === false) throw new Error(hdJson.error)
      hdUrl = hdJson.result?.url || hdJson.result?.image || hdJson.result || hdJson.url
      if (typeof hdUrl === 'object') hdUrl = hdUrl.url || hdUrl.image
      if (!hdUrl?.startsWith('http')) throw new Error('HD no devolvió link')

      const r1 = await axios.get(hdUrl, { responseType: 'arraybuffer' })
      hdBuffer = Buffer.from(r1.data)
      try { hdLink = await uploadCatbox(hdBuffer) } catch { hdLink = await uploadEvogb(hdBuffer) }
    } catch (e) {
      console.log('HD falló, usando original:', e.message)
      hdLink = link // si falla HD, usa la original
      hdBuffer = media
    }

    // 3 - Removebg sobre el HD
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 3/3 Quitando fondo...` }, { quoted: m })
    const bgApi = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(hdLink)}`
    const bgJson = await fetch(bgApi).then(r => r.json())
    let bgUrl = bgJson.result?.url || bgJson.result?.image || bgJson.result || bgJson.url || bgJson.data
    if (typeof bgUrl === 'object') bgUrl = bgUrl.url || bgUrl.image
    if (!bgUrl?.startsWith('http')) throw new Error('Removebg no devolvió link')

    const r2 = await axios.get(bgUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const finalBuffer = Buffer.from(r2.data)

    const cap = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🪄꒱────╮\n‧˚꒰🌼୭ Tipo: HDv2 + Removebg\n‧˚꒰🌼୭ HD: ${hdBuffer? (hdBuffer.length/1024/1024).toFixed(2)+' MB' : 'omitido'}\n‧˚꒰🌼୭ Final: ${(finalBuffer.length/1024).toFixed(0)} KB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Fondo eliminado en HD`

    await conn.sendMessage(m.chat, { image: finalBuffer, caption: cap }, { quoted: m })
    await conn.sendMessage(m.chat, { document: finalBuffer, mimetype: 'image/png', fileName: `hd-removebg-lux.png` }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler