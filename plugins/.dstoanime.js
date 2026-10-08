import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

async function myCloud(content) {
  const ft = await fileTypeFromBuffer(content)
  const form = new FormData()
  form.append("file", new Blob([content], { type: ft?.mime || 'image/jpeg' }), `${crypto.randomBytes(5).toString("hex")}.${ft?.ext || 'jpg'}`)
  const r = await fetch("https://evogb.win/api/upload", { method: "POST", body: form })
  const j = await r.json()
  return j.url || j.data?.url
}

async function faaBuffer(apiUrl) {
  const res = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const ct = res.headers.get('content-type') || ''

  // FIX: si devuelve imagen directa (PNG) no intentes JSON
  if (ct.includes('image')) {
    const buf = Buffer.from(await res.arrayBuffer())
    return buf
  }

  const j = await res.json().catch(async () => {
    const txt = await res.text()
    if (txt.trim().startsWith('<!DOCTYPE')) throw new Error('API caída (HTML)')
    throw new Error('Respuesta no JSON: ' + txt.slice(0,100))
  })

  let url = j.result?.url || j.result?.image || j.result || j.url || j.data
  if (typeof url === 'object') url = url.url || url.image
  if (!url ||!String(url).startsWith('http')) throw new Error('API no dio url: ' + JSON.stringify(j).slice(0,120))

  const { data } = await axios.get(String(url).trim(), { responseType: 'arraybuffer' })
  return Buffer.from(data)
}

let handler = async (m, { conn, text, command }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una foto\n\n꒰🌼୭.${command}` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    if (/image/.test(mime) &&!link) {
      let media = await q.download()
      link = await myCloud(media)
    }

    const map = {
      toanime: 'toanime',
      anime: 'toanime',
      tocartoon: 'tocartoon',
      cartoon: 'tocartoon',
      topixar: 'topixar',
      pixar: 'topixar'
    }

    const endpoint = map[command] || 'toanime'
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a ${endpoint}...` }, { quoted: m })

    const buf = await faaBuffer(`https://api-faa.my.id/faa/${endpoint}?url=${encodeURIComponent(link)}`)

    await conn.sendMessage(m.chat, { image: buf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ ${endpoint} listo\n‧˚꒰🌼୭ ${(buf.length/1024).toFixed(0)} KB` }, { quoted: m })

  } catch (e) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error ${command}: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['toanime', 'anime', 'tocartoon', 'cartoon', 'topixar', 'pixar']
handler.tags = ['ai']
handler.help = ['toanime', 'tocartoon', 'topixar']
handler.group = true
export default handler