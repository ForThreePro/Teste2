import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'

const handler = async (m, { conn, command, text }) => {
  if (!text) return conn.reply(m.chat, `‧˚꒰👛୭ *𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎*\n\n꒰🍧꒱ Usa: *.${command} bad bunny*`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    let link = text
    let info = null
    if (!/^https?:\/\//.test(text)) {
      const s = await yts(text)
      if (!s.videos.length) throw new Error('No resultados')
      info = s.videos[0]
      link = info.url
    }

    const isAudio = command === 'play'
    const apiUrl = isAudio
      ? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
      : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`

    const j = await fetch(apiUrl).then(r => r.json())
    if (!j.status || !j.result) throw new Error('API FAA caída')

    const downloadUrl = isAudio ? j.result.mp3 : j.result.download_url
    const title = (j.result.title || info?.title || 'lux').replace(/[^\w\s-]/gi, '').trim()

    // DISEÑO
    const txtInfo = info ? `‧˚꒰👛୭ *_𝐘𝐓 𝐃𝐋 - 𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🎧꒱────╮\n‧˚꒰🌼୭ Título: ${info.title}\n‧˚꒰🌼୭ Canal: ${info.author.name}\n‧˚꒰🌼୭ Duración: ${info.timestamp}\n‧˚꒰🌼୭ Vistas: ${info.views.toLocaleString()}\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n> ⏳ Descargando...` : `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Título: ${title}\n> ⏳ Descargando...`

    await conn.reply(m.chat, txtInfo, m)

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)
    const size = (buffer.length / 1024 / 1024).toFixed(2)

    const txtFinal = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🔌꒱────╮\n‧˚꒰🌼୭ Título: ${title}\n‧˚꒰🌼୭ API usada: *FAA*\n‧˚꒰🌼୭ Tamaño: ${size} MB\n╰─────── ݁ ˖Ი𐑼⋆────╯`.trim()

    if (command === 'play') {
      await conn.reply(m.chat, txtFinal, m)
      return conn.sendMessage(m.chat, { 
        audio: buffer, 
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    }

    if (command === 'play2') {
      return conn.sendMessage(m.chat, { 
        video: buffer, 
        mimetype: 'video/mp4', 
        fileName: `${title}.mp4`,
        caption: txtFinal
      }, { quoted: m })
    }

    if (command === 'play3') {
      return conn.sendMessage(m.chat, { 
        video: buffer, 
        mimetype: 'video/mp4', 
        fileName: `${title}.mp4`,
        caption: txtFinal,
        ptv: true
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, `‧˚꒰👛୭ Error: ${e.message}`, m)
  }
}

handler.command = ['play', 'play2', 'play3']
handler.help = ['play', 'play2', 'play3']
handler.tags = ['dl']
export default handler