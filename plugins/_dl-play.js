import fetch from 'node-fetch'
import axios from 'axios'
import yts from 'yt-search'
import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, command, text }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  if (!text) return conn.reply(m.chat, 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐘𝐓 ﹒ ${command.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
❄️ ࣪ ꕀ.${command} bad bunny dtmf ˚. ᵎᵎ

.⃟𖥔 ݁. 𖦹˙— \`\`EJEMPLO\`\` ❄️ —˙𖦹.꒷
✨ ➛.play diles - bad bunny
💅 ➛.play2 diles - video
👑 ➛.play3 diles - video nota

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })

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

    // FIX IGUAL QUE PLAY1: la API puede devolver JSON o el archivo directo
    const apiRes = await fetch(apiUrl)
    const ctApi = apiRes.headers.get('content-type') || ''
    let buffer
    let title = (info?.title || 'phantom').replace(/[^\w\s-]/gi, '').trim()

    if (ctApi.includes('application/json')) {
      const j = await apiRes.json()
      if (!j.status || !j.result) throw new Error('API FAA está caída')
      const downloadUrl = isAudio ? j.result.mp3 : j.result.download_url
      if (!downloadUrl) throw new Error('API FAA no devolvió link')
      title = (j.result.title || info?.title || 'phantom').replace(/[^\w\s-]/gi, '').trim()
      const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
      buffer = Buffer.from(res.data)
    } else {
      // La API devolvió el MP3/MP4 directo (ftypmp)
      buffer = Buffer.from(await apiRes.arrayBuffer())
    }

    if (!buffer || buffer.length < 1000) throw new Error('Archivo vacío de la API')

    if (info) {
      const preview = 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐏𝐑𝐄𝐕𝐈𝐄𝐖 ﹒ ${command.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`INFO\`\` ❄️ —˙𖦹.꒷

── *📊 VIDEO* ╏ ❄️
🎧 ➛ Título: *${info.title}*
👤 ➛ Canal: *${info.author.name}*
⏰ ➛ Duración: *${info.timestamp}*
👀 ➛ Vistas: *${info.views.toLocaleString()}*
🔗 ➛ Link: ${info.url}

── *📥 ESTADO* ╏ ⛓️
⬇️ ➛ Enviando ${isAudio ? 'audio PHANTOM PLUS' : 'video PHANTOM PLUS'}...
✨ ➛ Espera un momento

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`.trim()
      await conn.reply(m.chat, preview, m)
    }

    const size = (buffer.length / 1024 / 1024).toFixed(2)
    const type = isAudio ? 'AUDIO PHANTOM PLUS ❄️' : 'VIDEO PHANTOM PLUS 🎬'

    const finalText = 
`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 ﹒ ${type}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`INFO\`\` ❄️ —˙𖦹.꒷

── *📊 DETALLES* ╏ ❄️
🎵 ➛ Título: *${title}*
🔌 ➛ API: *FAA-BOT*
⚖️ ➛ Peso: *${size} MB*
✨ ➛ Estado: *Lista - PHANTOM PLUS*

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`.trim()

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
    return conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n❌ ➛ Error: ${e.message}\n❄️ ➛ PHANTOM PLUS no encontró la canción`, m)
  }
}

handler.help = ['play <texto>', 'play2 <texto>', 'play3 <texto>']
handler.tags = ['descargas']
handler.command = ['play', 'play2', 'play3']
export default handler