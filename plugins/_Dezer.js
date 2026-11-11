import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'
import moment from 'moment-timezone'
moment.locale('es')

import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const STELLAR_KEY = 'api-b9YNP'
const STELLAR_WHATMUSIC = 'https://api.stellarwa.xyz/tools/whatmusic'

const handler = async (m, { conn, command, text }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  let query = (text || '').trim()

  if (!query && (!mime || !/audio|video/.test(mime))) {
    return conn.reply(m.chat, 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ﹒ 𝐒𝐎𝐍𝐆
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
⚡ ࣪ ꕀ.song ˚. ᵎᵎ
> *"Detectando hasta la última canción"*

.⃟𖥔 ݁. 𖦹˙— \`\`SONG - DETECTAR Y DESCARGAR\`\` 💎 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
🎵 ➛ Detecta qué canción es de un audio/video
⬇️ ➛ La descarga en MP3

── *📖 USO* ╏ ⛓️
👻 ➛.song diles - bad bunny
🦂 ➛.song (respondiendo a audio)
❄️ ➛.song (respondiendo a video)

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })

    // ===== MEJORA 2 APLICADA: no duplicar ENCONTRADO + PREVIEW + DESCARGA =====
    let songDetectado = null
    let fromDetection = false

    if (!query && mime && /audio|video/.test(mime)) {
      let buffer = await q.download()
      if (!buffer) throw new Error('No pude descargar el audio/video')
      if (mime.includes('video')) {
        buffer = await extraerAudio(buffer)
        mime = 'audio/ogg'
      }
      let audioUrl = await subir(buffer, mime)
      if (!audioUrl) throw new Error('No se pudo subir el audio')

      let song = await detectarStellar(audioUrl)
      if (!song) throw new Error('Stellar no reconoció la canción')
      query = `${song.title} ${song.artist}`
      songDetectado = song
      fromDetection = true
      // Ya no mandamos ENCONTRADO aquí, se manda junto con la descarga al final
    }

    let link = query
    let info = null
    if (!/^https?:\/\//.test(query)) {
      const s = await yts(query)
      if (!s.videos.length) throw new Error('No se encontró nada')
      info = s.videos[0]
      link = info.url
    }

    const apiUrl = `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(link)}`
    const j = await fetch(apiUrl).then(r => r.json())
    if (!j.status || !j.result) throw new Error('API FAA está caída')

    const downloadUrl = j.result.mp3
    const title = (j.result.title || info?.title || 'phantom-plus').replace(/[^\w\s-]/gi, '').trim()

    // Solo mostrar PREVIEW si viene por texto, no si viene de detectar
    if (info && !fromDetection) {
      const preview = 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐏𝐑𝐄𝐕𝐈𝐄𝐖 ﹒ SONG
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`INFO\`\` 💎 —˙𖦹.꒷

── *📊 VIDEO* ╏ ❄️
🎧 ➛ Título: *${info.title}*
👤 ➛ Canal: *${info.author.name}*
⏰ ➛ Duración: *${info.timestamp}*
👀 ➛ Vistas: *${info.views.toLocaleString()}*
🔗 ➛ Link: ${info.url}

── *📥 ESTADO* ╏ ⛓️
⬇️ ➛ Enviando audio...
👻 ➛ Espera un momento

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`.trim()
      await conn.reply(m.chat, preview, m)
    }

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)
    const size = (buffer.length / 1024 / 1024).toFixed(2)

    // Si viene de detectar, 1 solo mensaje combinado: ENCONTRADO + DESCARGA
    let finalText
    if (fromDetection && songDetectado) {
      let spotify = songDetectado.url.find(u => u.includes('spotify')) || ''
      let deezer = songDetectado.url.find(u => u.includes('deezer')) || ''
      let escuchar = ''
      if (spotify) escuchar += `> ${spotify}\n`
      if (deezer) escuchar += `> ${deezer}`
      if (!escuchar) escuchar = `> No disponible`

      finalText = 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 ﹒ SONG
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *🎵 CANCIÓN* ╏ ❄️
📌 ➛ *Título:* ${songDetectado.title}
👤 ➛ *Artista:* ${songDetectado.artist}
💿 ➛ *Álbum:* ${songDetectado.album}
🎼 ➛ *Género:* ${songDetectado.genres}
⏱️ ➛ *Duración:* ${songDetectado.duration}
📅 ➛ *Lanzamiento:* ${songDetectado.release_date}

── *🔗 ESCUCHAR* ╏ ⛓️
${escuchar}

── *📊 DESCARGA* ╏ ❄️
🎵 ➛ Título: *${title}*
🔌 ➛ API: *FAA-BOT*
⚖️ ➛ Peso: *${size} MB*
✨ ➛ Estado: *Listo*

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`.trim()
    } else {
      finalText = 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 ﹒ AUDIO ❄️
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`INFO\`\` 💎 —˙𖦹.꒷

── *📊 DETALLES* ╏ ❄️
🎵 ➛ Título: *${title}*
🔌 ➛ API: *FAA-BOT*
⚖️ ➛ Peso: *${size} MB*
✨ ➛ Estado: *Listo*

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`.trim()
    }

    await conn.reply(m.chat, finalText, m)
    return conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n⛓️ Error: ${e.message}\n👻 No se encontró la canción\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`, m)
  }
}

async function detectarStellar(audioUrl) {
  const apiUrl = `${STELLAR_WHATMUSIC}?url=${encodeURIComponent(audioUrl)}&key=${STELLAR_KEY}`
  let res = await fetch(apiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(35000) })
  let json = await res.json()
  if (!json?.status || !Array.isArray(json.data) || !json.data.length) return null
  let d = json.data[0]
  return {
    title: d.title || 'Desconocido',
    artist: d.artist || 'Desconocido',
    album: d.album || 'No disponible',
    genres: d.genres || 'No disponible',
    duration: d.duration || 'No disponible',
    release_date: d.release_date || 'No disponible',
    url: Array.isArray(d.url) ? d.url : (d.url ? [d.url] : [])
  }
}

async function subir(buffer, whatsappMime = '') {
  let ext = 'opus', mime = 'audio/ogg'
  if (whatsappMime.includes('ogg') || whatsappMime.includes('opus')) { ext = 'opus'; mime = 'audio/ogg' }
  else if (whatsappMime.includes('mp3')) { ext = 'mp3'; mime = 'audio/mpeg' }
  else if (whatsappMime.includes('mp4') || whatsappMime.includes('m4a')) { ext = 'm4a'; mime = 'audio/mp4' }
  else if (whatsappMime.includes('video')) { ext = 'mp4'; mime = 'video/mp4' }
  else { let det = await fileTypeFromBuffer(buffer); if (det) { ext = det.ext; mime = det.mime } }
  let filename = crypto.randomBytes(5).toString('hex') + '.' + ext
  try {
    let blob = new Blob([buffer], { type: mime })
    let form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', blob, filename)
    let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
    let url = (await res.text()).trim()
    if (url.startsWith('https://')) return url
  } catch {}
  try {
    let blob = new Blob([buffer], { type: mime })
    let form = new FormData()
    form.append('files[]', blob, filename)
    let res = await fetch('https://uguu.se/upload', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
    let json = await res.json()
    if (json?.files?.[0]?.url) return json.files[0].url
  } catch {}
  return null
}

function extraerAudio(buffer) {
  return new Promise(resolve => {
    let tmpIn = path.join(os.tmpdir(), `vid_${Date.now()}.mp4`)
    fs.writeFileSync(tmpIn, buffer)
    let ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', '20', '-vn', '-c:a', 'libopus', '-b:a', '128k', '-f', 'ogg', 'pipe:1'])
    let chunks = []
    ff.stdout.on('data', c => chunks.push(c))
    ff.on('error', () => { try { fs.unlinkSync(tmpIn) } catch {}; resolve(buffer) })
    ff.on('close', (code) => {
      try { fs.unlinkSync(tmpIn) } catch {}
      if (code === 0 && chunks.length && Buffer.concat(chunks).length > 10000) resolve(Buffer.concat(chunks))
      else resolve(buffer)
    })
  })
}

handler.help = ['song <texto>']
handler.tags = ['descargas']
handler.command = ['song']
export default handler