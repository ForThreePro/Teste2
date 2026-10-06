import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'
import yts from 'yt-search'

const isUrl = (t) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(t)

async function getFkontak(m, conn) {
  try {
    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
    let thumb = null
    if (pp) {
      const r = await axios.get(pp, { responseType: 'arraybuffer' }).catch(() => null)
      if (r) thumb = Buffer.from(r.data)
    }
    if (!thumb) {
      try { thumb = fs.readFileSync('./src/logo.jpg') } catch { thumb = null }
    }
    return {
      key: { fromMe: false, participant: '0@s.whatsapp.net' },
      message: {
        contactMessage: {
          displayName: m.pushName || 'LUX',
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nEND:VCARD`,
          jpegThumbnail: thumb
        }
      }
    }
  } catch {
    return m // si falla, usa el mensaje normal
  }
}

const handler = async (m, { conn, command, text }) => {
  const fkontak = await getFkontak(m, conn)
  
  if (!text) {
    return conn.sendMessage(m.chat, { 
      text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Usa: *.${command} bad bunny dtmf*` 
    }, { quoted: fkontak })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
    
    let link = text
    let searchInfo = null

    if (!isUrl(text)) {
      const search = await yts(text)
      if (!search.videos.length) throw new Error('No hay resultados')
      searchInfo = search.videos[0]
      link = searchInfo.url
    }

    const isAudio = command === 'play'
    let downloadUrl = ''
    let usedApi = ''
    let title = searchInfo?.title || 'lux'

    // API 1 Delirius
    try {
      const url = isAudio
        ? `https://api.delirius.online/download/ytmp3?url=${encodeURIComponent(link)}`
        : `https://api.delirius.online/download/ytmp4?url=${encodeURIComponent(link)}&format=360p`
      const j = await fetch(url).then(r => r.json())
      if (j.status && j.data?.download) {
        downloadUrl = j.data.download
        title = j.data.title || title
        usedApi = 'Delirius'
      }
    } catch {}

    // API 2 FAA
    if (!downloadUrl) {
      try {
        const url = isAudio
          ? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
          : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`
        const j = await fetch(url).then(r => r.json())
        if (j.status && j.result) {
          downloadUrl = isAudio ? j.result.mp3 : j.result.download_url
          title = j.result.title || title
          usedApi = 'FAA'
        }
      } catch {}
    }

    if (!downloadUrl) throw new Error('APIs caídas')

    // info bonita antes
    if (searchInfo) {
      const cap = `‧˚꒰👛୭ *_𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐃𝐋_*\n*𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎*\n\n╭───INFO ꒰🎧꒱────╮\n‧˚꒰🌼୭ Título: ${searchInfo.title}\n‧˚꒰🌼୭ Canal: ${searchInfo.author.name}\n‧˚꒰🌼୭ Duración: ${searchInfo.timestamp}\n‧˚꒰🌼୭ Vistas: ${searchInfo.views.toLocaleString()}\n╰─────── ݁ ˖Ი𐑼⋆────╯`.trim()
      try {
        const img = await fetch(searchInfo.thumbnail).then(r => r.arrayBuffer()).then(b => Buffer.from(b))
        await conn.sendMessage(m.chat, { image: img, caption: cap }, { quoted: fkontak })
      } catch {
        await conn.sendMessage(m.chat, { text: cap }, { quoted: fkontak })
      }
    }

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)
    const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim()
    const size = (buffer.length / 1024 / 1024).toFixed(2)

    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭───INFO ꒰🔌꒱────╮\n‧˚꒰🌼୭ Título: ${cleanTitle}\n‧˚꒰🌼୭ API usada: *${usedApi}*\n‧˚꒰🌼୭ Tamaño: ${size} MB\n╰─────── ݁ ˖Ი𐑼⋆────╯`.trim()

    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })

    if (command === 'play') {
      await conn.sendMessage(m.chat, { text: apiText }, { quoted: fkontak })
      // iPhone compatible
      await conn.sendMessage(m.chat, { 
        document: buffer, 
        mimetype: 'audio/mpeg', 
        fileName: `${cleanTitle}.mp3` 
      }, { quoted: fkontak })
      return conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: fkontak })
    }

    if (command === 'play2') {
      return conn.sendMessage(m.chat, { 
        video: buffer, 
        mimetype: 'video/mp4', 
        fileName: `${cleanTitle}.mp4`,
        caption: apiText
      }, { quoted: fkontak })
    }

  } catch (e) {
    console.log(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: fkontak })
  }
}

handler.command = ['play', 'play2']
handler.tags = ['descargas']
handler.help = ['play', 'play2']
export default handler