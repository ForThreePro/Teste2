import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

async function uploadEvogb(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType?.ext || 'bin'
  const mime = fileType?.mime || 'application/octet-stream'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  if (!response.ok) throw new Error('Error en evogb.win')
  const j = await response.json()
  return j.url
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen\n\n‧˚꒰🌼୭.removebg = HD + Removebg automático` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    // 1. Obtener imagen original y subir a evogb
    if (!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 1/3 Subiendo...` }, { quoted: m })
      let media = await q.download()
      link = await uploadEvogb(media)
    }

    // 2. HDv2
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 2/3 Mejorando en HDv2...` }, { quoted: m })
    const hdApi = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`
    const hdJson = await fetch(hdApi).then(r => r.json())
    let hdUrl = hdJson.result?.url || hdJson.result || hdJson.url || hdJson.data
    if (typeof hdUrl === 'object') hdUrl = hdUrl.url || hdUrl.image
    if (!hdUrl?.startsWith('http')) throw new Error('HDv2 falló: ' + JSON.stringify(hdJson).slice(0,150))

    const hdRes = await axios.get(hdUrl, { responseType: 'arraybuffer' })
    const hdBuffer = Buffer.from(hdRes.data)

    // Subir el HD para hacer removebg
    const hdLink = await uploadEvogb(hdBuffer)

    // 3. Removebg con la imagen en HD
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 3/3 Quitando fondo en HD...` }, { quoted: m })
    const bgApi = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(hdLink)}`
    const bgJson = await fetch(bgApi).then(r => r.json())
    let bgUrl = bgJson.result?.url || bgJson.result || bgJson.url || bgJson.data
    if (typeof bgUrl === 'object') bgUrl = bgUrl.url || bgUrl.image
    if (!bgUrl?.startsWith('http')) throw new Error('Removebg falló: ' + JSON.stringify(bgJson).slice(0,150))

    const bgRes = await axios.get(bgUrl, { responseType: 'arraybuffer' })
    const finalBuffer = Buffer.from(bgRes.data)

    const cap = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🪄꒱────╮\n‧˚꒰🌼୭ Proceso: HDv2 + Removebg\n‧˚꒰🌼୭ HD: ${(hdBuffer.length/1024/1024).toFixed(2)} MB\n‧˚꒰🌼୭ Final: ${(finalBuffer.length/1024).toFixed(0)} KB\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ HD + Fondo eliminado`

    await conn.sendMessage(m.chat, { image: finalBuffer, caption: cap }, { quoted: m })
    await conn.sendMessage(m.chat, { document: finalBuffer, mimetype: 'image/png', fileName: `hd-removebg-lux.png` }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error en cadena: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler