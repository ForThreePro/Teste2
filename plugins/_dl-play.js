import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'

const handler = async (m, { conn, command, text }) => {
  if (!text) return conn.reply(m.chat, 
`╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮
│
│  ꒰🍧꒱ Ejemplo:
│  .${command} bad bunny dtmf
│
╰────────────────╯`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    let link = text
    let info = null
    if (!/^https?:\/\//.test(text)) {
      const s = await yts(text)
      if (!s.videos.length) throw new Error('No se encontró nada')
      info = s.videos[0]
      link = info.url
    }

    const isAudio = command === 'play'
    const apiUrl = isAudio
      ? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
      : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`

    const j = await fetch(apiUrl).then(r => r.json())
    if (!j.status || !j.result) throw new Error('API FAA está caída')
    
    const downloadUrl = isAudio ? j.result.mp3 : j.result.download_url
    const title = (j.result.title || info?.title || 'lux').replace(/[^\w\s-]/gi, '').trim()

    if (info) {
      const preview = 
`╭─〔 👛 𝗬𝗧 - 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗜𝗖𝗢 〕─╮
│
│  🎧 *Título:* ${info.title}
│  👤 *Canal:* ${info.author.name}
│  ⏰ *Duración:* ${info.timestamp}
│  👀 *Vistas:* ${info.views.toLocaleString()}
│  🔗 *Link:* ${info.url}
│
╰─〔 🌼 Enviando ${isAudio ? 'audio' : 'video'}... 〕─╯`.trim()
      await conn.reply(m.chat, preview, m)
    }

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)
    const size = (buffer.length / 1024 / 1024).toFixed(2)
    const type = isAudio ? 'ᴀᴜᴅɪᴏ 🎧' : 'ᴠɪᴅᴇᴏ 🎬'

    const finalText = 
`╭─〔 👛 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 〕─╮
│
│  📂 *${type}*
│  ────────────────
│  🎵 *Título:* ${title}
│  🔌 *API:* FAA-BOT
│  ⚖️ *Peso:* ${size} MB
│  ✨ *Estado:* Listo
│
╰─〔 🌸 〕─╯`.trim()

    if (command === 'play') {
      await conn.reply(m.chat, finalText, m)
      return conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
    }

    if (command === 'play2') {
      return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: finalText }, { quoted: m })
    }

    if (command === 'play3') {
      return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: finalText, ptv: true }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, `╭─〔 ❌ Error 〕─╮\n│ ${e.message}\n╰──────────╯`, m)
  }
}

handler.command = ['play', 'play2', 'play3']
handler.tags = ['dl']
export default handler