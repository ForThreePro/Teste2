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
  return await response.json()
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (/image/.test(mime) &&!link) {
    try {
      await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Subiendo a evogb.win...` }, { quoted: m })
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    } catch (e) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error al subir: ${e.message}` }, { quoted: m })
    }
  }

  if (!link) {
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen o manda link\n\n‧˚꒰🌼୭ Ejemplo:.removebg https://link.jpg` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    const apiUrl = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())
    console.log(j)

    if (!j.status &&!j.result) throw new Error('API FAA no devolvió resultado: ' + JSON.stringify(j).slice(0,200))

    // Soporta link, data URI y base64 puro (JSON)
    let resultData = j.result?.url || j.result?.image || j.result?.data || j.result || j.url || j.data || j.image
    if (typeof resultData === 'object') resultData = resultData.url || resultData.image || resultData.data
    if (!resultData) throw new Error('API vacía')

    let buffer
    const str = String(resultData).trim()

    if (str.startsWith('http')) {
      // Si es link
      const res = await axios.get(str, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
      buffer = Buffer.from(res.data)
    } else if (str.startsWith('data:image')) {
      // Si es data:image/png;base64,...
      buffer = Buffer.from(str.split(',')[1], 'base64')
    } else {
      // Si es base64 puro
      buffer = Buffer.from(str, 'base64')
    }

    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🪄꒱────╮\n‧˚꒰🌼୭ Tipo: Removebg\n‧˚꒰🌼୭ Origen: evogb.win\n‧˚꒰🌼୭ API: FAA-BOT\n‧˚꒰🌼୭ Peso: ${(buffer.length / 1024).toFixed(0)} KB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Fondo eliminado`

    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
    await conn.sendMessage(m.chat, { image: buffer, caption: apiText }, { quoted: m })
    await conn.sendMessage(m.chat, { document: buffer, mimetype: 'image/png', fileName: `removebg-lux.png` }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg', 'quitarfondo']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler