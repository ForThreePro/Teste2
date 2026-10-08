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

function parseResult(j) {
  let out = j.result?.url || j.result?.image || j.result?.video || j.result?.data || j.result || j.url || j.data
  if (typeof out === 'object') out = out.url || out.image || out.video || out.data
  if (!out) return null
  out = String(out).trim()
  if (out.startsWith('http')) return { type: 'url', data: out }
  if (out.startsWith('data:')) return { type: 'buf', data: Buffer.from(out.split(',')[1], 'base64') }
  if (out.length > 300) return { type: 'buf', data: Buffer.from(out, 'base64') }
  return null
}

let handler = async (m, { conn, text, command }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n‧˚꒰🌼୭.${command} (responde a foto)` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    if (/image/.test(mime) &&!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Subiendo...` }, { quoted: m })
      let media = await q.download()
      link = await myCloud(media)
    }

    if (command == 'toanime' || command == 'anime') {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a anime...` }, { quoted: m })
      const j = await fetch(`https://api-faa.my.id/faa/toanime?url=${encodeURIComponent(link)}`).then(r=>r.json())
      console.log(j)
      const p = parseResult(j)
      if (!p) throw new Error('toanime no devolvió imagen')

      let buf = p.type === 'url'? Buffer.from((await axios.get(p.data,{responseType:'arraybuffer'})).data) : p.data
      await conn.sendMessage(m.chat, { image: buf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Anime listo\n‧˚꒰🌼୭ Peso: ${(buf.length/1024).toFixed(0)} KB` }, { quoted: m })

    } else if (command == 'tovideo' || command == 'img2video' || command == 'img2vid') {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a video... puede tardar 30s` }, { quoted: m })

      // Intenta 2 APIs de video
      let videoUrl = null
      let videoBuf = null
      try {
        const j = await fetch(`https://api-faa.my.id/faa/img2video?url=${encodeURIComponent(link)}`).then(r=>r.json())
        const p = parseResult(j)
        if (p) {
          if (p.type === 'url') videoUrl = p.data
          else videoBuf = p.data
        }
      } catch {}

      if (!videoUrl &&!videoBuf) {
        const j2 = await fetch(`https://api.ryzendesu.vip/api/ai/img2video?url=${encodeURIComponent(link)}`).then(r=>r.json()).catch(()=>null)
        const p2 = j2? parseResult(j2) : null
        if (p2) {
          if (p2.type === 'url') videoUrl = p2.data
          else videoBuf = p2.data
        }
      }

      if (!videoUrl &&!videoBuf) throw new Error('API de video no respondió')

      if (videoBuf) {
        await conn.sendMessage(m.chat, { video: videoBuf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Video generado` }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Video generado` }, { quoted: m })
      }
    }

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['toanime', 'anime', 'tovideo', 'img2video', 'img2vid']
handler.tags = ['tools', 'ai']
handler.help = ['toanime', 'tovideo']
handler.group = true
export default handler