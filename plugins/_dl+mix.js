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
      await conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 〕─╮\n│ ⏳ Subiendo a evogb.win...\n╰──────────╯`, m)
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    }

    if (!link) return conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 〕─╮\n│ Usa:.hdvid link o responde a video\n╰──────────╯`, m)

    const apiUrl = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(link)}`

    const j = await fetch(apiUrl).then(r => r.json())
    console.log('HDVID RESPONSE:', j)

    if (!j.status &&!j.result) throw new Error('API FAA no devolvió resultado')

    let resultUrl = j.result?.url || j.result?.video || j.result?.hd || j.result || j.url || j.data
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.video

    if (!resultUrl ||!resultUrl.startsWith('http')) {
      throw new Error('API no devolvió link válido: ' + JSON.stringify(j).slice(0,300))
    }

    const res = await axios.get(resultUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)

    const cap = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│ 📈 *HD VIDEO*\n│ 🔌 API: FAA-BOT\n│ 🔗 Origen: ${link}\n│ 🎬 Calidad mejorada\n│\n╰─〔 🌸 Listo 〕─╯`

    await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `hdvid-lux.mp4`, caption: cap }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['hdvid', 'hdvideo', 'mejorar']
handler.tags = ['tools']
export default handler