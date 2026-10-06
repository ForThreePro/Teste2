import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'

const handler = async (m, { conn, command, text }) => {
  if (!text) return conn.reply(m.chat, `Usa: .${command} bad bunny`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    let link = text
    let searchInfo = null
    if (!/^https?:\/\//.test(text)) {
      const s = await yts(text)
      if (!s.videos.length) return conn.reply(m.chat, 'No resultados', m)
      searchInfo = s.videos[0]
      link = searchInfo.url
    }

    const isAudio = command === 'play'
    const apiUrl = isAudio
      ? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
      : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`

    const j = await fetch(apiUrl).then(r => r.json())
    if (!j.status || !j.result) throw new Error('API FAA caída')
    
    const downloadUrl = isAudio ? j.result.mp3 : j.result.download_url
    const title = (j.result.title || searchInfo?.title || 'lux').replace(/[^\w\s-]/gi, '').trim()

    const txt = `‧˚꒰👛୭ *𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎*\n\n╭──INFO ꒰🔌꒱──╮\n‧˚ Título: ${title}\n‧˚ API: *FAA*\n╰───────`.trim()

    await conn.reply(m.chat, txt, m)

    if (command === 'play') {
      const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(res.data)
      return conn.sendMessage(m.chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
    }

    if (command === 'play2') {
      // iPhone fix: URL directa
      return conn.sendMessage(m.chat, { video: { url: downloadUrl }, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: txt }, { quoted: m })
    }

    if (command === 'play3') {
      const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(res.data)
      return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: txt, ptv: true }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, `Error: ${e.message}`, m)
  }
}

handler.command = ['play', 'play2', 'play3']
handler.tags = ['dl']
export default handler