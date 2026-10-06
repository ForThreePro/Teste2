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
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una imagen para HD\n\n‧˚꒰🌼୭ Ejemplo:.hd` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

    if (!link) {
      let media = await q.download()
      link = await uploadEvogb(media)
    }

    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Mejorando en HDv2...` }, { quoted: m })

    const apiUrl = `https://api-faa.my.id/faa/hdv2?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())
    console.log(j)

    let resultUrl = j.result?.url || j.result?.image || j.result || j.url || j.data
    if (typeof resultUrl === 'object') resultUrl = resultUrl.url || resultUrl.image
    if (!resultUrl?.startsWith('http')) throw new Error('API no devolvió link: ' + JSON.stringify(j).slice(0,200))

    const res = await axios.get(resultUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)

    await conn.sendMessage(m.chat, { image: buffer, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ HDv2 listo • ${(buffer.length/1024/1024).toFixed(2)} MB` }, { quoted: m })

  } catch (e) {
    console.error(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['hd']
handler.tags = ['tools']
handler.help = ['hd']
export default handler