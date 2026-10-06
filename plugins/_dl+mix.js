import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'

async function uploadToCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'image.jpg')
  const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() })
  return res.data
}

const handler = async (m, { conn, text }) => {
  let imgUrl = text?.trim()

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  
  try {
    await conn.sendMessage(m.chat, { react: { text: '🪄', key: m.key } })

    if (/image/.test(mime) && !imgUrl) {
      const buff = await q.download()
      imgUrl = await uploadToCatbox(buff)
    }

    if (!imgUrl) return conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│  🖼️ Responde a una imagen\n│  o usa: .removebg https://link.jpg\n│\n╰────────────────╯`, m)

    const apiUrl = `https://api-faa.my.id/faa/removebg?url=${encodeURIComponent(imgUrl)}`
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)

    const caption = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│  ✨ *Removebg*\n│  🔌 API: FAA-BOT\n│  🖼️ Fondo eliminado\n│\n╰─〔 🌸 Listo 〕─╯`

    await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m })
    await conn.sendMessage(m.chat, { document: buffer, mimetype: 'image/png', fileName: `removebg-lux.png` }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['removebg', 'nobg', 'quitarfondo']
handler.tags = ['tools']
export default handler