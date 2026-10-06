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
    if (!thumb) { try { thumb = fs.readFileSync('./src/logo.jpg') } catch {} }
    return {
      key: { fromMe: false, participant: '0@s.whatsapp.net' },
      message: { contactMessage: { displayName: m.pushName || 'LUX', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nEND:VCARD`, jpegThumbnail: thumb } }
    }
  } catch { return m }
}

const handler = async (m, { conn, command, text }) => {
  const fkontak = await getFkontak(m, conn)
  if (!text) return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Usa: *.${command} bad bunny*` }, { quoted: fkontak })
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
    const apiUrl = isAudio? `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}` : `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())
    if (!j.status ||!j.result) throw new Error('API FAA caída')
    const downloadUrl = isAudio? j.result.mp3 : j.result.download_url
    const title = j.result.title || searchInfo?.title || 'lux'

    if (searchInfo) {
      const cap = `‧˚꒰👛୭ *_𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐃𝐋_*\n*𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎*\n\n╭───INFO ꒰🎧꒱────╮\n‧˚꒰🌼୭ Título: ${searchInfo.title}\n‧˚꒰🌼୭ Duración: ${searchInfo.timestamp}\n╰─────── ݁ ˖Ი𐑼⋆────╯`.trim()
      try {
        const img = await fetch(searchInfo.thumbnail).then(r => r.arrayBuffer()).then(b => Buffer.from(b))
        await conn.sendMessage(m.chat, { image: img, caption: cap }, { quoted: fkontak })
      } catch { await conn.sendMessage(m.chat, { text: cap }, { quoted: fkontak }) }
    }

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)
    const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim()
    const size = (buffer.length / 1024 / 1024).toFixed(2)
    const apiText = `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n╭─INFO ꒰🔌꒱─╮\n‧˚ Título: ${cleanTitle}\n‧˚ API: *FAA*\n‧˚ Tamaño: ${size} MB\n╰───────`.trim()

    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })

    if (command === 'play') {
      await conn.sendMessage(m.chat, { text: apiText }, { quoted: fkontak })
      return conn.sendMessage(m.chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${cleanTitle}.mp3` }, { quoted: fkontak })
    }
    if (command === 'play2') {
      await conn.sendMessage(m.chat, { text: apiText }, { quoted: fkontak })
      return conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `${cleanTitle}.mp4` }, { quoted: fkontak })
    }
    if (command === 'play3') {
      return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${cleanTitle}.mp4`, caption: apiText, ptv: true }, { quoted: fkontak })
    }
  } catch (e) {
    console.log(e)
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ Error: ${e.message}` }, { quoted: fkontak })
  }
}
handler.command = ['play', 'play2', 'play3']
handler.tags = ['descargas']
export default handler