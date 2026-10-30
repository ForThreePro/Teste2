
import fetch from "node-fetch"
import yts from 'yt-search'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

const STELLAR_API = 'https://api.stellarwa.xyz/tools/whatmusic'
const STELLAR_KEY = 'api-b9YNP'

const handler = async (m, { conn, command, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let texto = (text || '').trim()
    let linkEnTexto = (texto.match(/https?:\/\/[^\s]+/) || [])[0] || ''
    let linkEnQuoted = ''
    if (q.text) linkEnQuoted = (q.text.match(/https?:\/\/[^\s]+/) || [])[0] || ''
    let link = linkEnTexto || linkEnQuoted

    if ((!mime || !/audio|video/.test(mime)) && !link) {
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐑 ﹒ ${command.toUpperCase()}
> *Ventas | +51 927 174 369*

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *📝 USO* ╏ 🎃
1️⃣ ➛ Responde a un *audio* con: *.${command}*
2️⃣ ➛ Responde a un *video* con: *.${command}*
3️⃣ ➛ Manda un *link* con: *.${command} https://...opus*

── *📌 QUÉ HACE* ╏ 🦇
🎵 ➛ Detecta la canción
⬇️ ➛ Te la manda en AUDIO

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━` }, { quoted: m })
    }

    try {
        await m.react('🎃')
        await conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇\n\n🎵 Detectando canción...\n🕸️ Analizando audio...` }, { quoted: m })

        let audioUrl = null
        let buffer = null

        // ── CASO LINK ──
        if (link && (!mime || !/audio|video/.test(mime))) {
            if (/\.(opus|mp3|ogg|m4a|wav|mp4|webm)(\?|$)/i.test(link)) {
                audioUrl = link
            } else {
                try {
                    let res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) })
                    let buf = Buffer.from(await res.arrayBuffer())
                    if (buf.length < 1000) throw new Error('Link vacío')
                    try { buf = await extraerAudio(buf) } catch {}
                    audioUrl = await subir(buf, res.headers.get('content-type') || '')
                } catch (e) {
                    throw new Error('No pude descargar ese link. Asegúrate que sea un link directo a audio (.mp3/.opus/.ogg)')
                }
            }
        }

        // ── CASO AUDIO / VIDEO ──
        if (!audioUrl) {
            buffer = await q.download()
            if (!buffer) throw new Error('No pude descargar el audio/video')
            if (mime.includes('video')) {
                buffer = await extraerAudio(buffer)
                mime = 'audio/ogg'
            }
            audioUrl = await subir(buffer, mime)
            if (!audioUrl) throw new Error('No se pudo subir el audio')
        }

        // ── 1. STELLAR DETECTA ──
        let song = await detectarStellar(audioUrl)
        if (!song) throw new Error('Stellar no reconoció la canción. Prueba con un audio más claro.')

        await m.react('🦇')
        await conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇\n\n✅ *Encontrado:* ${song.title} - ${song.artist}\n⬇️ *Descargando audio...*\n🎵 Espérame un toque...` }, { quoted: m })

        // ── 2. BUSCAR EN YOUTUBE POR NOMBRE DETECTADO ──
        let searchQuery = `${song.title} ${song.artist}`.replace(/\[.*?\]|\(feat.*?\)/gi, '').trim()
        let search = await yts(searchQuery)
        let result = search.videos[0]
        if (!result) throw new Error('Detecté la canción pero no la encontré en YouTube: ' + searchQuery)

        const { title, thumbnail, timestamp, views, videoId, author, seconds } = result
        const shortUrl = `https://youtu.be/${videoId}`
        const thumb = (await conn.getFile(thumbnail)).data
        const vistas = formatViews(views)

        // ── 3. DESCARGAR AUDIO CON SVENTY ──
        const audioData = await getAudioBuffer(shortUrl)
        if (!audioData) throw new Error('No se pudo descargar el audio de YouTube')

        const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim() || song.title
        const duration = seconds || 200

        // ── 4. MANDAR INFO + AUDIO ──
        await conn.sendMessage(m.chat, {
            image: thumb,
            caption: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 ﹒ ${command.toUpperCase()}

.⃟𖥔 ݁. 𖦹˙— \`\`¿QUÉ CANCIÓN ES?\`\` 🎵 —˙𖦹.꒷

── *🎵 CANCIÓN* ╏ 🎃
📌 ➛ *Título:* ${song.title}
👤 ➛ *Artista:* ${song.artist}
💿 ➛ *Álbum:* ${song.album}
🎼 ➛ *Género:* ${song.genres}
⏱️ ➛ *Duración:* ${song.duration}
👁️ ➛ *Vistas:* ${vistas}
🔗 ➛ *Link:* ${shortUrl}

── *📥 AUDIO* ╏ 🦇
⬇️ ➛ Enviando audio abajo...

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━`
        }, { quoted: m })

        // ✅ ACÁ MANDA EL AUDIO, NO SOLO EL TEXTO
        await conn.sendMessage(m.chat, {
            audio: audioData.buffer,
            mimetype: audioData.mimetype,
            ptt: false,
            fileName: `${cleanTitle}.${audioData.ext}`,
            seconds: duration
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('💀')
        return conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇\n\n❌ *Error:* ${e.message}` }, { quoted: m })
    }
}

// ⭐ STELLAR - { status:true, data:[ {title, artist...} ] }
async function detectarStellar(audioUrl) {
    const apiUrl = `${STELLAR_API}?url=${encodeURIComponent(audioUrl)}&key=${STELLAR_KEY}`
    let res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(35000)
    })
    let json = await res.json()
    console.log('[PHANTOM] Stellar raw:', JSON.stringify(json).slice(0, 1000))
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
    else {
        let det = await fileTypeFromBuffer(buffer)
        if (det) { ext = det.ext; mime = det.mime }
    }
    let filename = crypto.randomBytes(5).toString('hex') + '.' + ext
    try {
        let blob = new Blob([buffer], { type: mime })
        let form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', blob, filename)
        let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        let url = (await res.text()).trim()
        if (url.startsWith('https://')) return url
    } catch (e) { console.log('Catbox falló:', e.message) }
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

// ✅ DESCARGAR AUDIO DE YOUTUBE CON SVENTY - DEVUELVE BUFFER, NO LINK
async function getAudioBuffer(url) {
    try {
        const res = await fetch(`https://api.sventy.store/api/ytdl?url=${encodeURIComponent(url)}`).then(r => r.json())
        let dl = res.data?.download || res.download || res.url || null
        if (!dl) return null
        let audioRes = await fetch(dl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (!audioRes.ok) return null
        let buf = Buffer.from(await audioRes.arrayBuffer())
        if (buf.length < 10000) return null
        const detected = await fileTypeFromBuffer(buf)
        if (detected?.ext === 'mp3') return { buffer: buf, mimetype: 'audio/mpeg', ext: 'mp3' }
        if (detected?.ext === 'm4a' || detected?.ext === 'mp4') return { buffer: buf, mimetype: 'audio/mp4', ext: 'm4a' }
        if (detected?.ext === 'webm' || detected?.ext === 'opus') {
            const converted = await convertToMp3(buf, detected.ext)
            if (converted) return converted
            return { buffer: buf, mimetype: 'audio/webm', ext: 'webm' }
        }
        const converted = await convertToMp3(buf, detected?.ext || 'webm')
        if (converted) return converted
        return { buffer: buf, mimetype: 'audio/mpeg', ext: 'mp3' }
    } catch (e) { console.log('[PHANTOM] Error getAudioBuffer:', e.message); return null }
}

function convertToMp3(buffer, inExt = 'webm') {
    return new Promise((resolve) => {
        const tmpIn = path.join(os.tmpdir(), `song_in_${Date.now()}.${inExt}`)
        const tmpOut = path.join(os.tmpdir(), `song_out_${Date.now()}.mp3`)
        fs.writeFileSync(tmpIn, buffer)
        const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', '-ac', '2', tmpOut])
        ff.on('close', (code) => {
            try { fs.unlinkSync(tmpIn) } catch {}
            try {
                if (code === 0 && fs.existsSync(tmpOut)) {
                    let out = fs.readFileSync(tmpOut)
                    fs.unlinkSync(tmpOut)
                    if (out.length > 10000) return resolve({ buffer: out, mimetype: 'audio/mpeg', ext: 'mp3' })
                }
            } catch {}
            resolve(null)
        })
        ff.on('error', () => resolve(null))
    })
}

function formatViews(views) {
    if (views === undefined) return "No disponible"
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
    return views.toString()
}

handler.help = ['whatmusic', 'detectar', 'song']
handler.tags = ['buscador']
handler.command = ['whatmusic', 'detectar', 'song', 'quees', 'quecancion']
export default handler