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

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

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

    let j = null
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(apiUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        if (r.status === 429) {
          await sleep(3000 * (i+1))
          continue
        }
        j = await r.json()
        break
      } catch { await sleep(2000) }
    }

    if (!j) throw new Error('API con limite 429, espera 1 min')
    console.log('HDVID:', j)

    let resultUrl = j.result?.url || j.result?.video || j.result || j.url
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url
    if (!resultUrl?.startsWith('http')) throw new Error('Sin link HD: ' + JSON.stringify(j).slice(0,200))

    // Descargar con reintento
    let buffer = null
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(resultUrl, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        buffer = Buffer.from(res.data)
        break
      } catch (e) {
        if (e.response?.status === 429) await sleep(3000)
        else throw e
      }
    }

    const cap = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│ 📈 HD VIDEO\n│ 🔌 API: FAA-BOT\n│ 🎬 Mejorado\n╰─〔 🌸 〕─╯`

    await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `hdvid-lux.mp4`, caption: cap }, { quoted: m })

  } catch (e) {
    console.log(e)
    if (e.message.includes('429')) {
      return conn.reply(m.chat, `╭─〔 ⏳ Limite 〕─╮\n│ La API FAA está saturada (429)\n│ Espera 1-2 min y vuelve a intentar\n╰──────────╯`, m)
    }
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['hdvid', 'hdvideo', 'mejorar']
export default handler