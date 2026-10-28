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
            return conn.sendMessage(m.chat, { text: `Responde a un audio/video con .${command}` }, { quoted: m })
        }

        await m.react('🎃')
        let buffer = await q.download()
        if (!buffer) throw new Error('Error al descargar el archivo')

        await m.reply(`Detectando... ${fecha}`)

        let clip = await prepareClip(buffer, CLIP_SECONDS)
        let url = await uploadUguu(clip)
        let song = await recognizeUrl(url)
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
        if (!audioData) throw new Error('No se pudo obtener el audio')

        const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim() || 'song'
        const duration = seconds || 200

        if (command === 'song') {
            await conn.sendMessage(m.chat, {
                image: thumb,
                caption: `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n\n📌 Título: *${title}*\n👤 Artista: *${author.name}*\n👁️ Vistas: *${vistas}*\n⏱️ Duración: *${timestamp}*\n🔗 Link: ${shortUrl}`
            }, { quoted: m })

            // ✅ FIX DEFINITIVO - MP3 REAL, NO M4A FALSO
            await conn.sendMessage(m.chat, {
                audio: audioData.buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${cleanTitle}.mp3`,
                seconds: duration
            }, { quoted: m })
        }

        if (command === 'letra') {
            await m.react('📝')
            const lyricsRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`).then(r => r.json())
            let lyrics = lyricsRes.lyrics || 'No se encontró la letra'
            if (lyrics.length > 1500) lyrics = lyrics.slice(0, 1500) + '\n\n...'

            await conn.sendMessage(m.chat, { text: `📌 *${title}* - *${author.name}*\n\n${lyrics}` }, { quoted: m })

            await conn.sendMessage(m.chat, {
                audio: audioData.buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${cleanTitle}.mp3`,
                seconds: duration
            }, { quoted: m })
        }

        await m.react('🎃')

    } catch (e) {
        await m.react('💀')
        return conn.sendMessage(m.chat, { text: `❌ ${e.message}` }, { quoted: m })
    }
}

async function recognizeUrl(audioUrl) {
    const res = await fetch(SONGFINDER_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'origin': 'https://songfinder.gg' },
        body: JSON.stringify({ url: audioUrl, startTime: 0, recaptchaToken: crypto.randomBytes(24).toString('base64url') })
    })
    const json = await res.json()
    if (!json?.success || !json?.track) throw new Error('No se encontró la canción')
    return json.track
}

async function uploadUguu(buffer) {
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'mp3', mime: 'audio/mpeg' }
    const blob = new Blob([buffer], { type: mime })
    const form = new FormData()
    form.append('files[]', blob, crypto.randomBytes(5).toString('hex') + '.' + ext)
    const res = await fetch(UGUU_UPLOAD, { method: 'POST', body: form })
    return (await res.json())?.files?.[0]?.url
}

function prepareClip(buffer, seconds = CLIP_SECONDS) {
    return new Promise(resolve => {
        const tmpIn = path.join(os.tmpdir(), `sf_${Date.now()}`)
        fs.writeFileSync(tmpIn, buffer)
        const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', tmpIn, '-t', String(seconds), '-vn', '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', 'pipe:1'])
        const chunks = []
        ff.stdout.on('data', c => chunks.push(c))
        ff.on('close', () => { try { fs.unlinkSync(tmpIn) } catch {} ; resolve(chunks.length ? Buffer.concat(chunks) : buffer) })
    })
}

async function getAudioBuffer(url) {
    try {
        const res = await fetch(`https://api.sventy.store/api/ytdl?url=${encodeURIComponent(url)}`).then(r => r.json())
        let dl = res.data?.download || null
        if (!dl) {
            console.log('[SONG] sventy no devolvió download', JSON.stringify(res).slice(0,500))
            return null
        }
        console.log('[SONG] Descargando de:', dl.slice(0,100))
        let audioRes = await fetch(dl)
        if (!audioRes.ok) return null
        let buf = Buffer.from(await audioRes.arrayBuffer())
        console.log('[SONG] Buffer original:', buf.length, 'bytes, primeros bytes:', buf.slice(0,10).toString('hex'))
        if (buf.length < 10000) return null
        return await convertToMp3(buf)
    } catch (e) {
        console.log('[SONG] Error getAudioBuffer:', e.message)
        return null
    }
}

// ✅ ESTE ES EL FIX QUE ARREGLA TU CAPTURA
function convertToMp3(buffer) {
    return new Promise(async (resolve) => {
        // Detectar formato real del buffer
        const detected = await fileTypeFromBuffer(buffer)
        console.log('[SONG] Formato detectado:', detected)

        // Si ya es MP3 de verdad, NO lo toques, mándalo tal cual
        if (detected?.ext === 'mp3') {
            console.log('[SONG] Ya es MP3, no convierto')
            return resolve({ buffer, mimetype: 'audio/mpeg', ext: 'mp3' })
        }

        // Si es otro formato, convertir a MP3 con extensión correcta en el temporal
        const inExt = detected?.ext || 'webm'
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
                    if (out.length > 10000) {
                        console.log('[SONG] Convertido a MP3 OK:', out.length)
                        return resolve({ buffer: out, mimetype: 'audio/mpeg', ext: 'mp3' })
                    }
                }
            } catch {}
            console.log('[SONG] ffmpeg falló con código', code, '- mando original como MP3 NO, mando error')
            // Si ffmpeg falló, NO mandamos el webm como mp3 porque daría el mismo error de tu captura
            // Mejor devolvemos null para que te diga "No se pudo obtener el audio" y veamos el log
            resolve(null)
        })
        ff.on('error', (err) => {
            console.log('[SONG] ffmpeg error:', err.message)
            resolve(null)
        })
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