import fetch from 'node-fetch'
import axios from 'axios'
import fs from 'fs'
import yts from 'yt-search'

const isUrl = (text) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i.test(text)
const MAX_BYTES = 50 * 1024 * 1024
const MAX_DURATION = 10 * 60

const api = {
  url2: 'https://api.delirius.online',
  url3: 'https://api-faa.my.id',
  key: 'NEX-Shizuka'
}

async function buildContact(m, conn) {
  let thumb = null
  try {
    const ppUrl = await conn.profilePictureUrl(m.sender, 'image')
    if (ppUrl) {
      const res = await axios.get(ppUrl, { responseType: 'arraybuffer' })
      thumb = Buffer.from(res.data, 'binary')
    }
  } catch {
    try { thumb = fs.readFileSync('./src/logo.jpg') } catch { thumb = null }
  }
  return {
    key: { fromMe: false, participant: '0@s.whatsapp.net' },
    message: {
      contactMessage: {
        displayName: m.pushName || 'Usuario',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName || 'Usuario'};;;\nFN:${m.pushName || 'Usuario'}\nitem1.TEL;waid=${(m.sender || '').replace(/[^0-9]/g, '')}:${m.sender || ''}\nitem1.X-ABLabel:Cel\nEND:VCARD`,
        jpegThumbnail: thumb || null
      }
    }
  }
}

function getDurationSeconds(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  if (typeof value === 'string') {
    if (/^\d+$/.test(value)) return Number(value)
    const parts = value.split(':').map(Number)
    if (parts.some(isNaN)) return 0
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 1) return parts[0]
  }
  return 0
}

async function downloadWithApi(link, isAudio) {
  // API DELIRIUS
  try {
    const endpoint = isAudio? `${api.url2}/download/ytmp3?url=${encodeURIComponent(link)}` : `${api.url2}/download/ytmp4?url=${encodeURIComponent(link)}&format=360p`
    const res = await fetch(endpoint)
    const json = await res.json()
    if (json.status && json.data?.download) {
      return { title: json.data.title, downloadUrl: json.data.download }
    }
  } catch (e) { console.log('delirius fail:', e.message) }

  // API FAA
  try {
    const fallbackUrl = isAudio? `${api.url3}/faa/ytmp3?url=${encodeURIComponent(link)}` : `${api.url3}/faa/ytmp4?url=${encodeURIComponent(link)}`
    const res = await fetch(fallbackUrl)
    const json = await res.json()
    if (json.status && json.result) {
      const result = json.result
      return { title: result.title, downloadUrl: isAudio? result.mp3 : result.download_url }
    }
  } catch (e) { console.log('faa fail:', e.message) }

  throw new Error('Las 2 APIs fallaron')
}

const handler = async (m, { conn, command, text }) => {
  const fkontak = await buildContact(m, conn)
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Ingresa el nombre o link, preciosa` }, { quoted: fkontak })
  }
  try {
    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
    let link = text
    let selectedItem = null

    if (!isUrl(text)) {
      const search = await yts(text)
      if (!search.videos?.length) throw new Error('No hay resultados')
      selectedItem = search.videos.find(v => {
        const s = getDurationSeconds(v.seconds || v.timestamp)
        return s > 0 && s <= MAX_DURATION
      }) || search.videos[0]
      link = selectedItem.url

      const caption = `‧˚꒰👛୭ *_𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐃𝐋_*\n*𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎*\n\n╭───INFO ꒰🎧꒱────╮\n‧˚꒰🌼୭ Título: ${selectedItem.title}\n‧˚꒰🌼୭ Canal: ${selectedItem.author?.name}\n‧˚꒰🌼୭ Duración: ${selectedItem.timestamp}\n╰─────── ݁ ˖Ი𐑼⋆────╯\n\n꒰🍧꒱ Descargando...`.trim()

      if (selectedItem.thumbnail) {
        try {
          const r = await fetch(selectedItem.thumbnail)
          const img = Buffer.from(await r.arrayBuffer())
          await conn.sendMessage(m.chat, { image: img, caption }, { quoted: fkontak })
        } catch {
          await conn.sendMessage(m.chat, { text: caption }, { quoted: fkontak })
        }
      }
    } else {
      const search = await yts(text)
      selectedItem = search.videos?.[0] || { title: 'YouTube' }
      link = text
    }

    const isAudio = command === 'play'
    const { title, downloadUrl } = await downloadWithApi(link, isAudio)

    // ARREGLO DEL ERROR DE AUDIO: bajar como buffer
    const fileRes = await axios.get(downloadUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
    const buffer = Buffer.from(fileRes.data)

    if (buffer.length > MAX_BYTES) {
      return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Pesa mucho ${(buffer.length / 1024 / 1024).toFixed(2)} MB` }, { quoted: fkontak })
    }

    const cleanTitle = (title || selectedItem?.title || 'lux').replace(/[^\w\s-]/gi, '').trim()
    await conn.sendMessage(m.chat, { react: { text: '👛', key: m.key } })

    if (isAudio) {
      return conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${cleanTitle}.mp3` }, { quoted: fkontak })
    }
    return conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${cleanTitle}.mp4`, caption: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*` }, { quoted: fkontak })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `‧˚꒰👛୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰🍧꒱ Error: ${e.message}` }, { quoted: fkontak })
  }
}

handler.command = ['play', 'play2']
handler.tags = ['descargas']
handler.help = ['play', 'play2']
handler.group = true
export default handler