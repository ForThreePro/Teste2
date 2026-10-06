import fetch from 'node-fetch'
import axios from 'axios'
import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"

async function uploadEvogb(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType?.ext || 'bin'
  const mime = fileType?.mime || 'application/octet-stream'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  const j = await response.json()
  return j.url
}

let handler = async (m, { conn, text }) => {
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let link = text?.trim()

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen para mejorar en HD\n\n‧˚꒰🌼୭ Ejemplo:.hd (respondiendo a imagen)` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

    if (!link) {
      let media = await q.download()
      link = await uploadEvogb(media)
    }

    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Mejorando en HD...` }, { quoted: m })

    const apiUrl = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())

    let resultUrl = j.result?.url || j.result?.image || j.result || j.url || j.data
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.image
    if (!resultUrl?.startsWith('http')) throw new Error('API hdv2 no devolvió link: ' + JSON.stringify(j).slice(0,300))

    const res = await axios.get(resultUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const buffer = Buffer.from(res.data)

    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰📈꒱────╮\n‧˚꒰🌼୭ Tipo: HDv2\n‧˚꒰🌼୭ API: FAA-BOT\n‧˚꒰🌼୭ Peso: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Imagen mejorada en HD`

    await conn.sendMessage(m.chat, { image: buffer, caption: apiText }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['hd']
handler.tags = ['tools']
handler.help = ['hd']
handler.group = true
export default handler