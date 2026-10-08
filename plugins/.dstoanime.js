import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

async function myCloud(content) {
  const ft = await fileTypeFromBuffer(content)
  const form = new FormData()
  form.append("file", new Blob([content], { type: ft?.mime || 'image/jpeg' }), `${crypto.randomBytes(5).toString("hex")}.${ft?.ext || 'jpg'}`)
  const r = await fetch("https://evogb.win/api/upload", { method: "POST", body: form })
  const j = await r.json()
  return j.url || j.data?.url
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime) &&!link) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Responde a una foto\n\n꒰🌼୭.toanime` }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    if (/image/.test(mime) &&!link) {
      await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Subiendo...` }, { quoted: m })
      let media = await q.download()
      link = await myCloud(media)
    }

    await conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Convirtiendo a anime...` }, { quoted: m })

    const j = await fetch(`https://api-faa.my.id/faa/toanime?url=${encodeURIComponent(link)}`).then(r=>r.json())

    let url = j.result?.url || j.result?.image || j.result || j.url || j.data
    if (typeof url === 'object') url = url.url || url.image
    if (!url) throw new Error('API falló: ' + JSON.stringify(j).slice(0,150))

    const buf = Buffer.from((await axios.get(String(url).trim(), { responseType: 'arraybuffer' })).data)

    await conn.sendMessage(m.chat, { image: buf, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Anime listo\n‧˚꒰🌼୭ Peso: ${(buf.length/1024).toFixed(0)} KB` }, { quoted: m })

  } catch (e) {
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['toanime', 'anime']
handler.tags = ['ai']
handler.help = ['toanime']
handler.group = true
export default handler