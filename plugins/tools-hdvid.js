import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import moment from 'moment-timezone'
import fetch from 'node-fetch'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let isVideo = /video/.test(mime)
    let videoUrl = text?.trim()

    if (!isVideo && (!videoUrl || !videoUrl.includes('http'))) {
        return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ USO ：✿ 。\n\nResponde a un video con *${usedPrefix + command}* o manda un link` + foot, m)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        // 1. Subir si es video - SIN mensajes de más, todo silencioso
        if (isVideo) {
            let media = await q.download()
            if (!media?.length) throw new Error('No se pudo descargar el video')
            if (media.length > 100 * 1024 * 1024) throw new Error(`Video muy pesado (${(media.length/1024/1024).toFixed(1)}MB)`)
            let link = await myCloud(media)
            if (!link.url) throw new Error('Sin URL de evogb')
            videoUrl = link.url
        }

        // 2. Crear job
        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let json = await res.json()
        if (!json.job_id) throw new Error('La API no creó el job')

        let jobId = json.job_id
        let resultUrl = json.result

        // ÚNICO MENSAJE DE PROCESANDO
        await conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ PROCESANDO ：✿ 。\n\n🎬 Mejorando tu video a HD...\n⏳ Puede demorar 1-3 minutos` + foot, m)

        // 3. Polling silencioso cada 3s, sin mandar mensajes, max 5 min
        let videoBuffer = null
        for (let i = 0; i < 100; i++) {
            await new Promise(r => setTimeout(r, 3000))
            let check = await fetch(resultUrl)
            let ct = check.headers.get('content-type') || ''
            if (ct.includes('video') || ct.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }
            let t = await check.text()
            try {
                let j = JSON.parse(t)
                if (j.state === 'failed') throw new Error(`La API falló: ${j.error || '500'}`)
                let finalUrl = j.url || j.result_url || j.download || j.data?.url
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http') && finalUrl !== resultUrl) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
            } catch (e) { if (e.message.includes('La API falló')) throw e }
        }

        if (!videoBuffer) throw new Error('La API demoró más de 5 min, intenta con un video más corto')

        // ÚNICO MENSAJE FINAL: EL VIDEO
        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*` + foot
        }, { quoted: m })

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ ERROR ：✿ 。\n\n❌ ${e.message}` + foot, m)
    }
}

async function myCloud(content) {
    const fileType = await fileTypeFromBuffer(content)
    const ext = fileType ? fileType.ext : 'mp4'
    const mime = fileType ? fileType.mime : 'video/mp4'
    const formData = new FormData()
    formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
    const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
    if (!response.ok) throw new Error('Error en el servidor de evogb')
    return await response.json()
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid', 'hdvideo', 'mejorarvideo', 'video-hd', 'calidadhd']
export default handler