import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

async function myCloud(content) {
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

function parseResult(j) {
  let out = j.result?.url || j.result?.image || j.result?.data || j.result || j.url || j.data || j.image
  if (typeof out === 'object') out = out.url || out.image || out.data
  if (!out) return null
  out = String(out).trim()
  if (out.startsWith('http')) return { type: 'url', data: out }
  if (out.startsWith('data:image')) return { type: 'buf', data: Buffer.from(out.split(',')[1], 'base64') }
  if (out.length > 300) return { type: 'buf', data: Buffer.from(out, 'base64') }
  return null
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n꒰🌼୭.removebg = HDv2 + quita fondo` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    if (/image/.test(mime) &&!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 1/3 Subiendo...` }, { quoted: m })
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    }

    // 2 - HDv2
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 2/3 HDv2...` }, { quoted: m })
    let hdLink = link
    let hdBuf = null
    try {
      const j1 = await fetch(`https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`).then(r=>r.json())
      const p1 = parseResult(j1)
      if (p1) {
        hdBuf = p1.type === 'url'? Buffer.from((await axios.get(p1.data,{responseType:'arraybuffer'})).data) : p1.data
        hdLink = (await myCloud(hdBuf)).url || (await myCloud(hdBuf))
        if (typeof hdLink === 'object') hdLink = hdLink.url
      }
    } catch { hdLink = link }

    // 3 - Removebg
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 3/3 Quitando fondo...` }, { quoted: m })
    const j2 = await fetch(`https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(hdLink)}`).then(r=>r.json())
    const p2 = parseResult(j2)
    if (!p2) throw new Error('Removebg falló: ' + JSON.stringify(j2).slice(0,150))

    let finalBuffer = p2.type === 'url'? Buffer.from((await axios.get(p2.data,{responseType:'arraybuffer'})).data) : p2.data

    await conn.sendMessage(m.chat, { image: finalBuffer, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ HD + Fondo eliminado\n‧˚꒰🌼୭ Peso: ${(finalBuffer.length/1024).toFixed(0)} KB` }, { quoted: m })
    await conn.sendMessage(m.chat, { document: finalBuffer, mimetype: 'image/png', fileName: `hd-removebg-lux.png` }, { quoted: m })

  } catch (e) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler