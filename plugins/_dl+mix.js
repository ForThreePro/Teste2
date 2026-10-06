import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'

async function uploadToCatbox(buffer, name = 'video.mp4') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, name)
  const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() })
  return res.data
}

const handler = async (m, { conn, text }) => {
  let videoUrl = text?.trim()
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  try {
    await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

    if (/video/.test(mime) && !videoUrl) {
      conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│  ⏳ Subiendo video...\n╰────────────────╯`, m)
      const buff = await q.download()
      videoUrl = await uploadToCatbox(buff, 'input.mp4')
    }

    if (!videoUrl) return conn.reply(m.chat, `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│  🎬 Responde a un video\n│  o usa: .hdvid https://link.mp4\n│\n╰────────────────╯`, m)

    const apiUrl = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
    const j = await fetch(apiUrl).then(r => r.json()).catch(() => null)

    // Si la API devuelve json con link
    let finalUrl = j?.result?.url || j?.result || j?.url || apiUrl
    if (typeof finalUrl !== 'string' || !finalUrl.startsWith('http')) finalUrl = apiUrl

    const res = await axios.get(finalUrl, { responseType: 'arraybuffer' }).catch(async () => {
      // si falla, prueba directo con la api como buffer
      return await axios.get(apiUrl, { responseType: 'arraybuffer' })
    })
    
    const buffer = Buffer.from(res.data)

    const caption = `╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮\n│\n│  📈 *HD VIDEO*\n│  🔌 API: FAA-BOT\n│  🎬 Calidad mejorada a HD\n│\n╰─〔 🌸 Listo 〕─╯`

    return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `hd-lux.mp4`, caption }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['hdvid', 'hdvideo', 'mejorar', 'remini']
handler.tags = ['tools']
export default handler