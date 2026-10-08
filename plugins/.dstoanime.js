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

function getUrl(j) {
  let out = j.result?.url || j.result?.video || j.result?.image || j.result || j.url || j.data
  if (typeof out === 'object') out = out.url || out.video || out.image || out.data
  return out? String(out).trim() : null
}

let handler = async (m, { conn, text, command }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una foto\n\n꒰🌼୭.${command} foto` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: command.includes('anime')? '🎨' : '🎬', key: m.key } })

    if (/image/.test(mime) &&!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Subiendo...` }, { quoted: m })
      let media = await q.download()
      link = await myCloud(media)
    }

    if (command == 'toanime' || command == 'anime') {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a anime...` }, { quoted: m })
      const j = await fetch(`https://api-faa.my.id/faa/toanime?url=${encodeURIComponent(link)}`).then(r=>r.json())
      const url = getUrl(j)
      if (!url) throw new Error('toanime falló: ' + JSON.stringify(j).slice(0,150))
      const buf = Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data)
      await conn.sendMessage(m.chat, { image: buf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Anime listo` }, { quoted: m })

    } else {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Generando video 20-40s...` }, { quoted: m })
      const j = await fetch(`https://api-faa.my.id/faa/img2video?url=${encodeURIComponent(link)}`).then(r=>r.json())
      const url = getUrl(j)
      if (!url) throw new Error('video falló: ' + JSON.stringify(j).slice(0,150))

      // FIX DEFINITIVO: siempre a buffer
      const { data } = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const buf = Buffer.from(data)
      if (buf.length < 10000) throw new Error('Video vacío')

      await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Video listo` }, { quoted: m })
    }

  } catch (e) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['toanime', 'anime', 'tovideo', 'img2video', 'img2vid']
handler.tags = ['ai']
handler.help = ['toanime', 'tovideo']
handler.group = true
export default handler