import moment from 'moment-timezone'
import fetch from 'node-fetch'
import FormData from 'form-data'
moment.locale('es')

// Subir video a Catbox para sacar link público
async function uploadVideo(buffer, filename = 'video.mp4') {
    let form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename })
    let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
    let url = await res.text()
    if (!url.includes('http')) throw new Error('No se pudo subir el video')
    return url.trim()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    // Detectar si es respondiendo a un video o video enviado con el comando
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let isVideo = /video/.test(mime)
    let videoUrl = text?.trim()

    if (!isVideo && (!videoUrl || !videoUrl.includes('http'))) {
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ USO ：✿ 。\n\n❌ Responde a un video o manda un link\n\n💡 Forma 1 - Respondiendo:\nResponde a un video con *${usedPrefix + command}*\n\n💡 Forma 2 - Con link:\n*${usedPrefix + command} https://files.evogb.win/EMbm6N.mp4*` + foot)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        // Si es video de WhatsApp, subirlo para obtener URL
        if (isVideo) {
            await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ SUBIENDO ：✿ 。\n\n📤 Subiendo tu video...\n⏳ Un momento` + foot }, { quoted: m })
            let buffer = await q.download()
            videoUrl = await uploadVideo(buffer, 'phantom.mp4')
        }

        await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ PROCESANDO ：✿ 。\n\n🎬 Mejorando tu video a HD...\n⏳ Puede demorar 20-60 segundos` + foot }, { quoted: m })

        // 1. Crear job
        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let json = await res.json()
        if (!json.status || !json.job_id) throw new Error('No dio job_id')

        let jobId = json.job_id
        let resultUrl = json.result // https://api-faa.my.id/faa/result?id=...

        // 2. Polling cada 5 seg, max 90 seg
        let videoBuffer = null
        for (let i = 0; i < 18; i++) {
            await new Promise(r => setTimeout(r, 5000))
            let check = await fetch(resultUrl)
            let contentType = check.headers.get('content-type') || ''

            if (contentType.includes('video') || contentType.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }

            try {
                let j = await check.clone().json()
                let finalUrl = j.url || j.result_url || j.download || j.data?.url
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http')) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
                if (j.status === 'failed' || j.status === 'error') throw new Error('Job falló')
            } catch (e) {
                if (e.message === 'Job falló') throw e
            }
        }

        if (!videoBuffer) throw new Error('Timeout')

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*\n🆔 Job: ${jobId}\n📥 Formato: MP4` + foot
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ ERROR ：✿ 。\n\n❌ No se pudo mejorar el video, intenta de nuevo o con otro video` + foot)
    }
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid', 'hdvideo', 'mejorarvideo', 'video-hd', 'calidadhd']
export default handler