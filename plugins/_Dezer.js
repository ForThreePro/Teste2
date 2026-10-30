import fetch from "node-fetch"
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import crypto from 'crypto'

const STELLAR_API = 'https://api.stellarwa.xyz/tools/whatmusic'
const STELLAR_KEY = 'api-b9YNP' // ✅ KEY CORRECTA

const handler = async (m, { conn, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime || !/audio|video/.test(mime)) {
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐑 ﹒ ${command.toUpperCase()}
> *Ventas | +51 927 174 369*

── *📝 USO* ╏ 🎃
1️⃣ ➛ Responde a un *audio* con: *.${command}*
2️⃣ ➛ Responde a un *video* con: *.${command}*

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━` }, { quoted: m })
    }

    try {
        await m.react('🎃')
        let buffer = await q.download()
        if (!buffer) throw new Error('No pude descargar el audio')

        let audioUrl = await subir(buffer, mime)
        if (!audioUrl) throw new Error('No se pudo subir el audio')

        console.log('[PHANTOM] Link subido:', audioUrl)

        let song = await detectarStellar(audioUrl)
        console.log('[PHANTOM] Stellar devolvió:', song)

        if (!song) throw new Error('Stellar no reconoció la canción. Prueba con un audio más claro, con música y sin que hables encima.')

        await m.react('✅')
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 ﹒ ${command.toUpperCase()}

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *🎵 CANCIÓN* ╏ 🎃
📌 ➛ *Título:* ${song.title}
👤 ➛ *Artista:* ${song.artist}
💿 ➛ *Álbum:* ${song.album}
🎼 ➛ *Género:* ${song.genres}
⏱️ ➛ *Duración:* ${song.duration}
📅 ➛ *Lanzamiento:* ${song.release_date}

── *🔗 ESCUCHAR* ╏ 🦇
${song.url.map(u => `> ${u}`).join('\n')}

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━` }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.react('💀')
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇\n\n❌ *Error:* ${e.message}` }, { quoted: m })
    }
}

// ⭐ FORMATO REAL DE STELLAR - data es un ARRAY
async function detectarStellar(audioUrl) {
    const apiUrl = `${STELLAR_API}?url=${encodeURIComponent(audioUrl)}&key=${STELLAR_KEY}`

    let res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(35000)
    })

    let json = await res.json()
    console.log('[PHANTOM] Stellar raw:', JSON.stringify(json).slice(0, 1000))

    // ✅ Stellar devuelve: { status: true, data: [ {title, artist...} ] }
    if (!json?.status || !Array.isArray(json.data) || !json.data.length) return null

    let d = json.data[0] // Primer resultado = el más preciso

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

// SUBIR SIN CONVERTIR - MANTIENE .opus
async function subir(buffer, whatsappMime = '') {
    let ext = 'opus', mime = 'audio/ogg'
    if (whatsappMime.includes('ogg') || whatsappMime.includes('opus')) { ext = 'opus'; mime = 'audio/ogg' }
    else if (whatsappMime.includes('mp3')) { ext = 'mp3'; mime = 'audio/mpeg' }
    else if (whatsappMime.includes('mp4') || whatsappMime.includes('m4a')) { ext = 'm4a'; mime = 'audio/mp4' }
    else if (whatsappMime.includes('video')) { ext = 'mp4'; mime = 'video/mp4' }
    else {
        let det = await fileTypeFromBuffer(buffer)
        if (det) { ext = det.ext; mime = det.mime }
    }

    let filename = crypto.randomBytes(5).toString('hex') + '.' + ext

    // 1. Catbox
    try {
        let blob = new Blob([buffer], { type: mime })
        let form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', blob, filename)
        let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        let url = (await res.text()).trim()
        if (url.startsWith('https://')) return url
    } catch (e) { console.log('Catbox falló:', e.message) }

    // 2. Uguu
    try {
        let blob = new Blob([buffer], { type: mime })
        let form = new FormData()
        form.append('files[]', blob, filename)
        let res = await fetch('https://uguu.se/upload', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        let json = await res.json()
        if (json?.files?.[0]?.url) return json.files[0].url
    } catch (e) { console.log('Uguu falló:', e.message) }

    return null
}

handler.help = ['whatmusic', 'detectar', 'song']
handler.tags = ['buscador']
handler.command = ['whatmusic', 'detectar', 'song', 'quees', 'quecancion']
export default handler