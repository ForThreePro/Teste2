import fetch from "node-fetch"
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const STELLAR_KEY = 'api-b9YNP'
const STELLAR_WHATMUSIC = 'https://api.stellarwa.xyz/tools/whatmusic'
const STELLAR_PLAY = 'https://api.stellarwa.xyz/dl/youtubeplay'

const handler = async (m, { conn, command, text, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let query = (text || '').trim()

    // ── MENU ──
    if (command === 'play' && !query && !q.text) {
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 ﹒ PLAY

── *📝 USO* ╏ 🎃
🎵 *.play Tu Mejor Error*
🎵 *.play Luigi 21 Plus - Tu Mejor Error*
🎵 *.song* (respondiendo a un audio/video)

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━` }, { quoted: m })
    }

    if ((command === 'song' || command === 'whatmusic') && !query && (!mime || !/audio|video/.test(mime))) {
        return conn.sendMessage(m.chat, { text: `Responde a un audio/video con *.${command}*` }, { quoted: m })
    }

    try {
        await m.react('🎃')

        // ── 1. SACAR EL NOMBRE DE LA CANCIÓN ──
        let searchQuery = query

        // Si es .song / .whatmusic respondiendo a audio/video → detectar con Stellar whatmusic
        if ((command === 'song' || command === 'whatmusic') && (!query || /audio|video/.test(mime))) {
            let audioUrl = null
            let buffer = await q.download()
            if (!buffer) throw new Error('No pude descargar el audio/video')
            if (mime.includes('video')) {
                buffer = await extraerAudio(buffer)
                mime = 'audio/ogg'
            }
            audioUrl = await subir(buffer, mime)
            if (!audioUrl) throw new Error('No se pudo subir el audio')

            let song = await detectarStellar(audioUrl)
            if (!song) throw new Error('Stellar no reconoció la canción')
            searchQuery = `${song.title} ${song.artist}`

            // Si es whatmusic → SOLO NOMBRE, no descarga
            if (command === 'whatmusic') {
                await m.react('✅')
                return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇\n\n📌 *Título:* ${song.title}\n👤 *Artista:* ${song.artist}\n💿 *Álbum:* ${song.album}\n🎼 *Género:* ${song.genres}\n⏱️ *Duración:* ${song.duration}` }, { quoted: m })
            }
        }

        if (!searchQuery) throw new Error('Escribe el nombre de la canción')

        await conn.sendMessage(m.chat, { text: `🎵 *Buscando:* ${searchQuery}\n⬇️ *Descargando con Stellar...*` }, { quoted: m })

        // ── 2. DESCARGAR MÚSICA CON STELLAR youtubeplay ──
        let audioData = await descargarStellarPlay(searchQuery)
        if (!audioData) throw new Error('Stellar no devolvió el audio. Intenta con otro nombre.')

        // ── 3. MANDAR SOLO EL AUDIO ──
        await conn.sendMessage(m.chat, {
            audio: audioData.buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${searchQuery}.mp3`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('💀')
        return conn.sendMessage(m.chat, { text: `❌ *Error:* ${e.message}` }, { quoted: m })
    }
}

// ⭐ PARA DESCARGAR LA MÚSICA - youtubeplay
// https://api.stellarwa.xyz/dl/youtubeplay?type=mp3&key=api-b9YNP&query=...
async function descargarStellarPlay(query) {
    const apiUrl = `${STELLAR_PLAY}?type=mp3&key=${STELLAR_KEY}&query=${encodeURIComponent(query)}`
    console.log('[PHANTOM] Play:', apiUrl)

    let res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) })
    let contentType = res.headers.get('content-type') || ''
    console.log('[PHANTOM] Play content-type:', contentType)

    // Caso 1: Stellar devuelve el MP3 directo
    if (contentType.includes('audio') || contentType.includes('octet')) {
        let buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 10000) return { buffer: buf }
        return null
    }

    // Caso 2: Stellar devuelve JSON con link
    let text = await res.text()
    console.log('[PHANTOM] Play JSON:', text.slice(0, 1500))
    let json
    try { json = JSON.parse(text) } catch { return null }

    // Stellar puede devolver: { data: { download, title } } o { result: { download } } o { download }
    let d = json.data || json.result || json
    let dl = d?.download || d?.url || d?.audio || d?.link || d?.mp3

    // Si url es array, tomar el primero
    if (Array.isArray(dl)) dl = dl[0]
    if (Array.isArray(d?.url)) dl = d.url[0]
    if (Array.isArray(d?.download)) dl = d.download[0]

    if (typeof dl === 'string' && dl.startsWith('http')) {
        console.log('[PHANTOM] Descargando mp3 de:', dl)
        let audioRes = await fetch(dl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        let buf = Buffer.from(await audioRes.arrayBuffer())
        if (buf.length > 10000) return { buffer: buf, title: d.title || query }
    }

    return null
}

// ⭐ PARA DETECTAR NOMBRE - whatmusic
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
        duration: d.duration || 'No disponible'
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

handler.help = ['play', 'song', 'whatmusic']
handler.tags = ['buscador']
handler.command = ['play', 'song', 'whatmusic', 'detectar']
export default handler