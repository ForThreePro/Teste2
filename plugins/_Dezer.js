import fetch from "node-fetch"
import yts from 'yt-search'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'
import { spawn } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import moment from 'moment-timezone'
moment.locale('es')

const SONGFINDER_API = 'https://songfinder.gg/api/recognize/url'
const UGUU_UPLOAD = 'https://uguu.se/upload'
const CLIP_SECONDS = 30

const handler = async (m, { conn, command }) => {
    try {
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        const ownerNum = global.owner?.[0]?.[0] || '51927174369'
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!mime || !/audio|video/.test(mime)) {
            let menuUso = `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}
> *Ventas | +51 927 174 369*

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🎃 ࣪ ꕀ.${command} ˚. ᵎᵎ
> *"Hasta el fantasma reconoce música en Halloween"*

.⃟𖥔 ݁. 𖦹˙— \`\`BUSCADOR HALLOWEEN\`\` 🔍 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🎃
🎵 ➛ Identifica canciones respondiendo a audios o videos
🎃 ➛.song = Descarga el audio embrujado
👻 ➛.letra = Muestra la letra + descarga el audio

── *📖 USO* ╏ 🦇
1️⃣ ➛ Responde a un audio con:.*${command}*
2️⃣ ➛ Responde a un video con:.*${command}*

── *⏱️ NOTA* ╏ 🕯️
📦 ➛ Analiza los primeros *${CLIP_SECONDS}s*
🦇 ➛ Phantom fantasma escucha mejor

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
*Owner:* @${ownerNum}
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: menuUso, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
        }

        await m.react('🎃')
        let buffer = await q.download()
        if (!buffer) throw new Error('Error al descargar el archivo')

        await m.reply(`‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓𝐀𝐍𝐃𝐎 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` 🎶 —˙𖦹.꒷

── *📊 PROCESO* ╏ 🎃
🕸️ ➛ Analizando ${CLIP_SECONDS}s de audio...
📤 ➛ Subiendo al cementerio temporal...
🎶 ➛ Invocando coincidencia...
👻 ➛ Phantom fantasma afinando oído...

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
━━━━━━━━━━━`)

        let clip = await prepareClip(buffer, CLIP_SECONDS)
        let url = await uploadConRespaldo(clip, mime)
        if (!url) throw new Error('No se pudo subir el audio (Uguu/Catbox caídos)')
        let song = await recognizeConRespaldo(url)
        if (!song) throw new Error('No se encontró la canción - prueba con un audio más claro, con voz y sin ruido')
        let searchQuery = `${song.title} ${song.artist}`.replace(/\[.*?\]|\(feat.*?\)/gi, '').trim()

        await m.react('🦇')
        let search = await yts(searchQuery)
        let result = search.videos[0]
        if (!result) throw new Error('No se encontró la canción en YouTube')

        const { title, thumbnail, timestamp, views, videoId, author, seconds } = result
        const shortUrl = `https://youtu.be/${videoId}`
        const thumb = (await conn.getFile(thumbnail)).data
        const vistas = formatViews(views)
        const audioData = await getAudioBuffer(shortUrl)
        if (!audioData) throw new Error('No se pudo obtener el audio de Sventy')

        const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim() || 'song'
        const duration = seconds || 200

        if (command === 'song') {
            await conn.sendMessage(m.chat, {
                image: thumb,
                caption: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 ﹒ SONG ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` 🎃 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🎃
📌 ➛ Título: *${title}*
👤 ➛ Artista: *${author.name}*
👁️ ➛ Vistas: *${vistas}*
⏱️ ➛ Duración: *${timestamp}*
🔗 ➛ Link: ${shortUrl}
👻 ➛ Encontrado por fantasma Phantom

── *📥 DESCARGA* ╏ 🦇
⬇️ ➛ Enviando audio embrujado...
🍬 ➛ Preparando dulce sonoro...

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━`
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
                audio: audioData.buffer,
                mimetype: audioData.mimetype,
                ptt: false,
                fileName: `${cleanTitle}.${audioData.ext}`,
                seconds: duration
            }, { quoted: m })
        }

        if (command === 'letra') {
            await m.react('📝')
            const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`).then(r => r.json())
            let lyrics = lyricsRes.lyrics || 'No se encontró la letra'
            if (lyrics.length > 1500) lyrics = lyrics.slice(0, 1500) + '\n\n...Letra muy larga, como siesta de fantasma 😴'

            await conn.sendMessage(m.chat, {
                text: `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐋𝐄𝐓𝐑𝐀 ﹒ LETRA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LETRA HALLOWEEN\`\` 🎤 —˙𖦹.꒷

── *📊 CANCIÓN* ╏ 🎃
📌 ➛ *${title}* - *${author.name}*
👻 ➛ Phantom fantasma tararea esto

── *📜 LETRA* ╏ 🕯️
\`\`${lyrics}\`\`

── *📥 DESCARGA* ╏ 🦇
⬇️ ➛ Enviando audio embrujado...

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━`
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
                audio: audioData.buffer,
                mimetype: audioData.mimetype,
                ptt: false,
                fileName: `${cleanTitle}.${audioData.ext}`,
                seconds: duration
            }, { quoted: m })
        }

        await m.react('🎃')

    } catch (e) {
        await m.react('💀')
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        let menuError = `‧˚꒰🎃୭ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗜𝗔 𓆪 🦇

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 💀 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🎃
❌ ➛ ${e.message}
😿 ➛ El fantasma no pudo reconocerlo, se asustó

── *💡 SOLUCIÓN* ╏ 🕯️
🔧 ➛ Usa un audio/video más claro
🔧 ➛ Asegúrate que tenga música con voz
🍬 ➛ Prueba con más volumen

━━━━━━━━━━━
🎃 *PHANTOM IA - VENTAS* 🦇
*Contacto:* +51 927 174 369
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
    }
}

// ✅ SUBIDA CON RESPALDO + FIX OPUS - NO MENTIR EN LA EXTENSIÓN
async function uploadConRespaldo(buffer, whatsappMime = '') {
    let ext = 'mp3'
    let mime = 'audio/mpeg'
    if (whatsappMime.includes('ogg') || whatsappMime.includes('opus')) {
        ext = 'ogg'; mime = 'audio/ogg'
    } else if (whatsappMime.includes('mp3') || whatsappMime.includes('mpeg')) {
        ext = 'mp3'; mime = 'audio/mpeg'
    } else if (whatsappMime.includes('mp4') || whatsappMime.includes('m4a')) {
        ext = 'm4a'; mime = 'audio/mp4'
    } else if (whatsappMime.includes('video')) {
        ext = 'mp4'; mime = 'video/mp4'
    } else {
        const detected = await fileTypeFromBuffer(buffer)
        if (detected) { ext = detected.ext; mime = detected.mime }
        else { ext = 'ogg'; mime = 'audio/ogg' }
    }
    const filename = crypto.randomBytes(5).toString('hex') + '.' + ext
    try {
        const blob = new Blob([buffer], { type: mime })
        const form = new FormData()
        form.append('files[]', blob, filename)
        const res = await fetch(UGUU_UPLOAD, { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        const json = await res.json()
        if (json?.files?.[0]?.url) return json.files[0].url
    } catch (e) { console.log('[PHANTOM] Uguu falló:', e.message) }
    try {
        const blob = new Blob([buffer], { type: mime })
        const form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', blob, filename)
        const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: AbortSignal.timeout(20000) })
        let url = (await res.text()).trim()
        if (url.startsWith('https://')) return url
    } catch (e) { console.log('[PHANTOM] Catbox falló:', e.message) }
    return null
}

// ✅ RECONOCIMIENTO CON 3 INTENTOS
async function recognizeConRespaldo(audioUrl) {
    for (let i = 1; i <= 3; i++) {
        try {
            const res = await fetch(SONGFINDER_API, {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'origin': 'https://songfinder.gg' },
                body: JSON.stringify({ url: audioUrl, startTime: 0, recaptchaToken: crypto.randomBytes(24).toString('base64url') }),
                signal: AbortSignal.timeout(30000)
            })
            const json = await res.json()
            if (json?.success && json?.track) return json.track
            await new Promise(r => setTimeout(r, 2000))
        } catch (e) { console.log(`[PHANTOM] SongFinder intento ${i} falló:`, e.message) }
    }
    return null
}

function prepareClip(buffer, seconds = CLIP_SECONDS) {
    return new Promise(resolve => {
        const tmpIn = path.join(os.tmpdir(), `sf_${Date.now()}`)
        fs.writeFileSync(tmpIn, buffer)
        const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', String(seconds), '-vn', '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
        const chunks = []
        let hasError = false
        ff.stdout.on('data', c => chunks.push(c))
        ff.on('error', () => { hasError = true; try { fs.unlinkSync(tmpIn) } catch {} ; resolve(buffer) })
        ff.on('close', (code) => {
            try { fs.unlinkSync(tmpIn) } catch {}
            if (!hasError && code === 0 && chunks.length && Buffer.concat(chunks).length > 10000) resolve(Buffer.concat(chunks))
            else resolve(buffer)
        })
    })
}

// ✅ FIX SVENTY - SIN FFMPEG OBLIGATORIO, MANDA BUFFER NO URL
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

handler.help = ['song', 'letra']
handler.tags = ['buscador', 'halloween']
handler.command = ['song', 'letra']
export default handler