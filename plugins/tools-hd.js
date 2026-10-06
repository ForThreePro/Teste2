import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'

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

async function buildContact(m, conn) {
  let thumb = null
  try {
    const ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    if (ppUrl) {
      const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
      thumb = Buffer.from(res.data, 'binary')
    }
  } catch {
    try { thumb = fs.readFileSync('./src/logo.jpg') } catch { thumb = null }
  }
  return {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      contactMessage: {
        displayName: m.pushName || 'Usuario',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName || 'Usuario'};;;\nFN:${m.pushName || 'Usuario'}\nitem1.TEL;waid=${(m.sender || '').replace(/[^0-9]/g, '')}:${m.sender || ''}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
        jpegThumbnail: thumb || null
      }
    }
  }
}

let handler = async (m, { conn, text }) => {
  const fkontak = await buildContact(m, conn)
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  try {
    if (/image/.test(mime) &&!link) {
      await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Subiendo a evogb.win...` }, { quoted: fkontak })
      let media = await q.download()
      let up = await myCloud(media)
      link = up.url
    }

    if (!link) {
      await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
      return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen o manda link\n\n‧˚꒰🌼୭ Ejemplo:.hdv3 https://link.jpg` }, { quoted: fkontak })
    }

    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Mejorando en HD v3...` }, { quoted: fkontak })

    const apiUrl = `https://api-faa.my.id/faa/hdv3?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())

    if (!j.status &&!j.result) throw new Error('API FAA v3 no devolvió resultado')

    let resultUrl = j.result?.url || j.result?.image || j.result || j.url || j.data
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.image
    if (!resultUrl?.startsWith('http')) throw new Error('API no devolvió link válido: ' + JSON.stringify(j).slice(0,200))

    const res = await axios.get(resultUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const buffer = Buffer.from(res.data)

    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰📈꒱────╮\n‧˚꒰🌼୭ Tipo: HDv3 Upscale\n‧˚꒰🌼୭ Origen: evogb.win\n‧˚꒰🌼୭ API: FAA-BOT\n‧˚꒰🌼୭ Peso: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Imagen mejorada v3`

    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
    await conn.sendMessage(m.chat, { image: buffer, caption: apiText }, { quoted: fkontak })
    await conn.sendMessage(m.chat, { document: buffer, mimetype: 'image/jpeg', fileName: `hdv3-lux.jpg` }, { quoted: fkontak })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: fkontak })
  }
}

handler.command = ['hdv3', 'hd3', 'mejorar3k']
handler.tags = ['tools']
handler.help = ['hdv3']
handler.group = true
export default handler