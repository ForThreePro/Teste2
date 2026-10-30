import fetch from "node-fetch"
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const STELLAR_API = 'https://api.stellarwa.xyz/tools/whatmusic'
const STELLAR_KEY = 'proyectsV2'

const handler = async (m, { conn, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    // 1. DETECTA VIDEO Y AUDIO
    if (!mime || !/audio|video/.test(mime)) {
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐑 ﹒ ${command.toUpperCase()}
> *Ventas | +51 927 174 369*

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *📝 USO* ╏ 🎃
1️⃣ ➛ Responde a un *audio* con: *.${command}*
2️⃣ ➛ Responde a un *video* con: *.${command}*

── *📌 EJEMPLO* ╏ 🦇
> Responde a un audio de WhatsApp / TikTok / Reel

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━` }, { quoted: m })
    }

    try {
        await m.react('🎃')

        await conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

🎵 Detectando canción...
🕸️ Analizando audio...` }, { quoted: m })

        // 2. DESCARGAR AUDIO / VIDEO DE WHATSAPP
        let buffer = await q.download()
        if (!buffer) throw new Error('No pude descargar el audio/video')

        // 3. RECORTAR A 15s - Stellar solo necesita un pedazo
        let clip = await recortar(buffer, 15)

        // 4. SUBIR PARA TENER LINK PÚBLICO
        let audioUrl = await subir(clip, mime)
        if (!audioUrl) throw new Error('No se pudo subir el audio a Catbox/Uguu')

        console.log('[PHANTOM] Link subido:', audioUrl)

        // 5. MANDAR A STELLAR
        let song = await detectarStellar(audioUrl)
        console.log('[PHANTOM] Stellar devolvió:', song)

        if (!song) throw new Error('Stellar no reconoció la canción. Prueba con un audio más claro, con música y sin que hables encima.')

        await m.react('✅')

        // 6. SOLO DEVUELVE EL NOMBRE - NADA MÁS
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 ﹒ ${command.toUpperCase()}

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *🎵 CANCIÓN* ╏ 🎃
📌 ➛ *Título:* ${song.title}
👤 ➛ *Artista:* ${song.artist}
💿 ➛ *Álbum:* ${song.album || 'No disponible'}

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━` }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.react('💀')
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

❌ *Error:* ${e.message}

🔧 Prueba con un audio más claro y con más volumen.

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━` }, { quoted: m })
    }
}

// ⭐ STELLAR - SOLO DETECTA
async function detectarStellar(audioUrl) {
    const urls = [
        `${STELLAR_API}?key=${STELLAR_KEY}&url=${encodeURIComponent(audioUrl)}`,
        `${STELLAR_API}?url=${encodeURIComponent(audioUrl)}&key=${STELLAR_KEY}`,
    ]

    for (let apiUrl of urls) {
        try {
            let res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) })
            let text = await res.text()
            console.log('[PHANTOM] Stellar raw:', text.slice(0, 1000))

            let json
            try { json = JSON.parse(text) } catch { continue }

            // Stellar puede devolver en diferentes formatos, normalizamos todo
            let d = json.result || json.data || json.response || json

            // Caso Shazam: result.track.title / result.track.subtitle
            if (d?.track) d = { title: d.track.title, artist: d.track.subtitle, album: d.track.sections?.[0]?.metadata?.[0]?.text, cover: d.track.images?.coverart }

            let title = d?.title || d?.song || d?.name || d?.trackTitle
            let artist = d?.artist || d?.artists || d?.singer || d?.author || d?.subtitle || ''

            // Si artist viene como array
            if (Array.isArray(artist)) artist = artist.map(a => a.name || a).join(', ')

            if (title) {
                return {
                    title: String(title).trim(),
                    artist: String(artist || 'Desconocido').trim(),
                    album: d?.album || d?.album_name || '',
                    cover: d?.cover || d?.image || d?.thumbnail || ''
                }
            }
        } catch (e) {
            console.log('[PHANTOM] Stellar intento falló:', e.message)
        }
    }
    return null
}

// SUBIR A UGUU / CATBOX - CON EXTENSIÓN CORRECTA
async function subir(buffer, whatsappMime = '') {
    let ext = 'mp3', mime = 'audio/mpeg'
    if (whatsappMime.includes('ogg') || whatsappMime.includes('opus')) { ext = 'ogg'; mime = 'audio/ogg' }
    else if (whatsappMime.includes('mp3')) { ext = 'mp3'; mime = 'audio/mpeg' }
    else if (whatsappMime.includes('mp4') || whatsappMime.includes('m4a')) { ext = 'm4a'; mime = 'audio/mp4' }
    else if (whatsappMime.includes('video')) { ext = 'mp4'; mime = 'video/mp4' }
    else {
        let det = await fileTypeFromBuffer(buffer)
        if (det) { ext = det.ext; mime = det.mime }
    }

    let filename = crypto.randomBytes(5).toString('hex') + '.' + ext

    // Intento 1: Catbox (más estable)
    try {
        let blob = new Blob([buffer], { type: mime })
        let form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', blob, filename)
        let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        let url = (await res.text()).trim()
        if (url.startsWith('https://')) return url
    } catch (e) { console.log('Catbox falló:', e.message) }

    // Intento 2: Uguu
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

// RECORTAR CON FFMPEG - SI FALLA DEVUELVE EL ORIGINAL
function recortar(buffer, segundos = 15) {
    return new Promise(resolve => {
        let tmpIn = path.join(os.tmpdir(), `ph_${Date.now()}`)
        fs.writeFileSync(tmpIn, buffer)
        let ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', String(segundos), '-vn', '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
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

handler.help = ['whatmusic', 'detectar', 'song']
handler.tags = ['buscador']
handler.command = ['whatmusic', 'detectar', 'song', 'quees', 'quecancion']
export default handler