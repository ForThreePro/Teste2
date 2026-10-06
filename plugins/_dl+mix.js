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
  if (!response.ok) throw new Error('Error en evogb')
  return await response.json()
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  try {
    await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

    if (/video/.test(mime) &&!link) {
      await conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│ ⏳ Subiendo a evogb.win...\n╰────────────────╯`, m)
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    }

    if (!link) return conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│ 🎬 Usa:\n│.hdvid https://link.mp4\n│ o responde a un video\n│\n╰────────────────╯`, m)

    const apiUrl = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(link)}`

    // La API puede devolver el video directo o json
    let buffer
    try {
      const j = await fetch(apiUrl).then(r => r.json())
      const finalUrl = j?.result?.url || j?.result || j?.url
      if (finalUrl && finalUrl.startsWith('http')) {
        const r = await axios.get(finalUrl, { responseType: 'arraybuffer' })
        buffer = Buffer.from(r.data)
      } else {
        throw new Error('no json')
      }
    } catch {
      const r = await axios.get(apiUrl, { responseType: 'arraybuffer' })
      buffer = Buffer.from(r.data)
    }

    const cap = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│ 📈 *HD VID*\n│ 🔗 Origen: ${link}\n│ 🔌 API: FAA-BOT\n│ 🖥️ Host: evogb.win\n│ 🎬 Mejorado a HD\n│\n╰─〔 🌸 Listo 〕─╯`

    await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `hdvid-lux.mp4`, caption: cap }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['hdvid', 'hdvideo', 'mejorar']
handler.tags = ['tools']
export default handler