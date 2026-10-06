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
      await conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 〕─╮\n│ ⏳ Subiendo a evogb...\n╰──────────╯`, m)
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    }

    if (!link) return conn.reply(m.chat, `Usa:.hdvid link`, m)

    const apiUrl = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json())

    console.log('HDVID JSON:', j)

    let resultUrl = j.result?.url || j.result || j.url
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.video
    if (!resultUrl) throw new Error(`API no dio video: ${JSON.stringify(j).slice(0,400)}`)

    // Descarga
    const res = await axios.get(resultUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://api-faa.my.id/' }
    })

    const buffer = Buffer.from(res.data)

    // VALIDACIÓN IMPORTANTE
    if (buffer.length < 10000) {
      throw new Error(`Video muy pequeño (${buffer.length} bytes), seguro es error: ${buffer.toString().slice(0,200)}`)
    }

    const cap = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│ 📈 HD VIDEO OK\n│ 🎬 Tamaño: ${(buffer.length/1024/1024).toFixed(2)} MB\n╰─〔 🌸 〕─╯`

    // Intenta enviar como video, si falla como documento
    try {
      await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `hdvid-lux.mp4`, caption: cap }, { quoted: m })
    } catch {
      await conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `hdvid-lux.mp4`, caption: cap }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n│\n│ Tip: Prueba con link directo.mp4\n│ no con evogb, FAA falla con evogb\n╰──────────╯`, m)
  }
}

handler.command = ['hdvid', 'hdvideo', 'mejorar']
export default handler