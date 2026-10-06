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
  const j = await response.json()
  return j.url
}

async function uploadCatbox(content) {
  const ft = await fileTypeFromBuffer(content)
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", new Blob([content], { type: ft?.mime || 'image/jpeg' }), `file.${ft?.ext || 'jpg'}`)
  const r = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: form })
  return (await r.text()).trim()
}

function getBufferFromJson(j) {
  let out = j.result?.url || j.result?.image || j.result?.data || j.result || j.url || j.data || j.image
  if (typeof out === 'object') out = out.url || out.image || out.data
  if (!out) return null
  out = String(out).trim()
  if (out.startsWith('http')) return { isUrl: true, data: out }
  if (out.startsWith('data:image')) return { isUrl: false, data: Buffer.from(out.split(',')[1], 'base64') }
  if (out.length > 300) return { isUrl: false, data: Buffer.from(out, 'base64') }
  return null
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    // 1 - Subir original
    let media
    if (!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 1/3 Subiendo...` }, { quoted: m })
      media = await q.download()
      try { link = await uploadCatbox(media) } catch { link = await uploadEvogb(media) }
    }

    // 2 - HDv2
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 2/3 Mejorando en HDv2...` }, { quoted: m })
    let hdLink = link
    let hdBuffer = media
    try {
      const hdJson = await fetch(`https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`).then(r => r.json())
      const parsedHD = getBufferFromJson(hdJson)
      if (parsedHD) {
        if (parsedHD.isUrl) {
          const r1 = await axios.get(parsedHD.data, { responseType: 'arraybuffer' })
          hdBuffer = Buffer.from(r1.data)
        } else {
          hdBuffer = parsedHD.data
        }
        try { hdLink = await uploadCatbox(hdBuffer) } catch { hdLink = await uploadEvogb(hdBuffer) }
      }
    } catch (e) {
      console.log('HD falló, sigo con original')
      hdLink = link
    }

    // 3 - Removebg (ahora soporta json)
    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ 3/3 Quitando fondo...` }, { quoted: m })
    const bgJson = await fetch(`https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(hdLink)}`).then(r => r.json())
    console.log(bgJson)

    const parsedBG = getBufferFromJson(bgJson)
    if (!parsedBG) throw new Error('Removebg json vacío: ' + JSON.stringify(bgJson).slice(0,200))

    let finalBuffer
    if (parsedBG.isUrl) {
      const r2 = await axios.get(parsedBG.data, { responseType: 'arraybuffer' })
      finalBuffer = Buffer.from(r2.data)
    } else {
      finalBuffer = parsedBG.data
    }

    const cap = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🪄꒱────╮\n‧˚꒰🌼୭ Tipo: HDv2 + Removebg (JSON)\n‧˚꒰🌼୭ Final: ${(finalBuffer.length/1024).toFixed(0)} KB\n╰─────── ݁ ˖Ი𐑼⋆────╯`

    await conn.sendMessage(m.chat, { image: finalBuffer, caption: cap }, { quoted: m })
    await conn.sendMessage(m.chat, { document: finalBuffer, mimetype: 'image/png', fileName: `hd-removebg-lux.png` }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler