import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'
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

let handler = async (m, { conn, text, command }) => {
  const fkontak = await buildContact(m, conn)
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let link = text?.trim()

  if (!/image/.test(mime) &&!link) {
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n‧˚꒰🌼୭ Comandos:\n.hdv4 - HD v4 (mejor)\n.hdv3 - HD v3\n.hdv2 - HD v2\n.superhd - Super HD` }, { quoted: fkontak })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

    if (!link) {
      let media = await q.download()
      link = await uploadEvogb(media)
    }

    // Definir endpoint según comando
    let apiUrl = ''
    let tipo = ''
    const cmd = command.toLowerCase()

    if (cmd === 'hdv4' || cmd === 'hd4' || cmd === 'hd') {
      apiUrl = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(link)}`
      tipo = 'HDv4'
    } else if (cmd === 'hdv3' || cmd === 'hd3') {
      apiUrl = `https://api-faa.my.id/faa/hdv3?image=${encodeURIComponent(link)}`
      tipo = 'HDv3'
    } else if (cmd === 'hdv2' || cmd === 'hd2') {
      apiUrl = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`
      tipo = 'HDv2'
    } else if (cmd === 'superhd' || cmd === 'shd') {
      apiUrl = `https://api-faa.my.id/faa/superhd?url=${encodeURIComponent(link)}`
      tipo = 'SuperHD'
    } else {
      apiUrl = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(link)}`
      tipo = 'HDv4'
    }

    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Mejorando en ${tipo}...\n꒰🌐꒱ API: ${apiUrl.split('?')[0]}` }, { quoted: fkontak })

    const j = await fetch(apiUrl).then(r => r.json())
    console.log(`${tipo} response:`, j)

    let resultUrl = j.result?.url || j.result?.image || j.result || j.url || j.data || j.resultUrl
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.image
    if (!resultUrl?.startsWith('http')) throw new Error(`${tipo} no devolvió link: ${JSON.stringify(j).slice(0,300)}`)

    const res = await axios.get(resultUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const buffer = Buffer.from(res.data)

    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰📈꒱────╮\n‧˚꒰🌼୭ Tipo: ${tipo}\n‧˚꒰🌼୭ API: FAA-BOT\n‧˚꒰🌼୭ Peso: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Imagen mejorada en ${tipo}`

    await conn.sendMessage(m.chat, { image: buffer, caption: apiText }, { quoted: fkontak })
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: fkontak })
  }
}

handler.command = ['hdv4', 'hdv3', 'hdv2', 'superhd', 'hd', 'hd4', 'hd3', 'hd2', 'shd']
handler.tags = ['tools']
handler.help = ['hdv4', 'hdv3', 'hdv2', 'superhd']
handler.group = true
export default handler