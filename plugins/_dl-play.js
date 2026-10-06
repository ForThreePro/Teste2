import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'

const handler = async (m, { conn, command, text }) => {
  if (!text) return conn.reply(m.chat, `Usa: .${command} bad bunny`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
    
    // buscar
    let link = text
    let title = text
    if (!/^https?:\/\//.test(text)) {
      const search = await yts(text)
      if (!search.videos.length) return conn.reply(m.chat, 'No hay resultados', m)
      link = search.videos[0].url
      title = search.videos[0].title
    }

    const isAudio = command === 'play'
    
    // descargar
    let downloadUrl = ''
    let usedApi = ''
    let videoTitle = title

    try {
      const apiUrl = isAudio 
        ? `https://api.delirius.online/download/ytmp3?url=${encodeURIComponent(link)}`
        : `https://api.delirius.online/download/ytmp4?url=${encodeURIComponent(link)}&format=360p`
      const res = await fetch(apiUrl).then(r => r.json())
      if (res.status && res.data?.download) {
        downloadUrl = res.data.download
        videoTitle = res.data.title || title
        usedApi = 'Delirius'
      }
    } catch {}

    if (!downloadUrl) {
      try {
        const apiUrl = isAudio
          ? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
          : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`
        const res = await fetch(apiUrl).then(r => r.json())
        if (res.status && res.result) {
          downloadUrl = isAudio ? res.result.mp3 : res.result.download_url
          videoTitle = res.result.title || title
          usedApi = 'FAA'
        }
      } catch {}
    }

    if (!downloadUrl) throw new Error('APIs caídas, intenta de nuevo')

    const fileRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(fileRes.data)
    const cleanTitle = videoTitle.replace(/[^\w\s-]/gi, '').trim()
    const size = (buffer.length / 1024 / 1024).toFixed(2)

    const txt = `*${cleanTitle}*\n🔌 API: *${usedApi}*\n⚖️ ${size} MB`

    if (command === 'play') {
      await conn.reply(m.chat, txt, m)
      // FIX IPHONE: documento + audio
      await conn.sendMessage(m.chat, { 
        document: buffer, 
        mimetype: 'audio/mpeg', 
        fileName: `${cleanTitle}.mp3` 
      }, { quoted: m })
      // también como audio normal para Android
      return conn.sendMessage(m.chat, { 
        audio: buffer, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m })
    }

    if (command === 'play2') {
      return conn.sendMessage(m.chat, { 
        video: buffer, 
        mimetype: 'video/mp4', 
        fileName: `${cleanTitle}.mp4`,
        caption: txt
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, `❌ Error: ${e.message}\nAPI falló`, m)
  }
}

handler.command = ['play', 'play2']
handler.help = ['play', 'play2']
handler.tags = ['dl']
export default handler