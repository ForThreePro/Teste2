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
  const j = await response.json()
  return j.url || j.data?.url
}

async function fetchSmart(url) {
  const res = await fetch(url)
  const ct = res.headers.get('content-type') || ''
  // Si es imagen/video directo
  if (ct.startsWith('image/') || ct.startsWith('video/')) {
    const buf = Buffer.from(await res.arrayBuffer())
    return { type: 'buf', data: buf }
  }
  // Si es json
  const text = await res.text()
  try {
    const j = JSON.parse(text)
    let out = j.result?.url || j.result?.image || j.result?.video || j.result?.data || j.result || j.url || j.data
    if (typeof out === 'object') out = out.url || out.image || out.video || out.data
    if (!out) return null
    out = String(out).trim()
    if (out.startsWith('http')) return { type: 'url', data: out }
    if (out.startsWith('data:')) return { type: 'buf', data: Buffer.from(out.split(',')[1], 'base64') }
    if (out.length > 300) return { type: 'buf', data: Buffer.from(out, 'base64') }
    return null
  } catch {
    // Si no es json ni imagen, puede ser base64 puro que vino como text
    if (text.length > 300) return { type: 'buf', data: Buffer.from(text, 'base64') }
    return null
  }
}

let handler = async (m, { conn, text, command }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n‧˚꒰🌼୭.${command}` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    if (/image/.test(mime) &&!link) {
      let media = await q.download()
      link = await myCloud(media)
    }

    if (command == 'toanime' || command == 'anime') {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a anime...` }, { quoted: m })
      const p = await fetchSmart(`https://api-faa.my.id/faa/toanime?url=${encodeURIComponent(link)}`)
      if (!p) throw new Error('toanime no devolvió nada')
      let buf = p.type === 'url'? Buffer.from((await axios.get(p.data,{responseType:'arraybuffer'})).data) : p.data
      await conn.sendMessage(m.chat, { image: buf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Anime listo` }, { quoted: m })

    } else {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a video... 30s` }, { quoted: m })
      let p = await fetchSmart(`https://api-faa.my.id/faa/img2video?url=${encodeURIComponent(link)}`)
      if (!p) p = await fetchSmart(`https://api.ryzendesu.vip/api/ai/img2video?url=${encodeURIComponent(link)}`)
      if (!p) throw new Error('Video API falló')

      if (p.type === 'url') {
        await conn.sendMessage(m.chat, { video: { url: p.data }, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Video generado` }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { video: p.data, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Video generado` }, { quoted: m })
      }
    }

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['toanime', 'anime', 'tovideo', 'img2video', 'img2vid']
handler.tags = ['tools']
handler.help = ['toanime', 'tovideo']
handler.group = true
export default handler