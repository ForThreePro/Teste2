import moment from 'moment-timezone'
import fetch from 'node-fetch'
import FormData from 'form-data'
moment.locale('es')

async function uploadVideo(buffer) {
    // Intento 1: Catbox
    try {
        let form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', buffer, { filename: 'phantom.mp4', contentType: 'video/mp4' })
        let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
        let url = (await res.text()).trim()
        if (url.includes('http')) return url
    } catch (e) { console.log('Catbox falló:', e.message) }

    // Intento 2: TmpFiles - si Catbox falla
    try {
        let form2 = new FormData()
        form2.append('file', buffer, { filename: 'phantom.mp4', contentType: 'video/mp4' })
        let res2 = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form2 })
        let j2 = await res2.json()
        if (j2.data?.url) return j2.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    } catch (e) { console.log('TmpFiles falló:', e.message) }

    throw new Error('No se pudo subir el video a ningún host')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let isVideo = /video/.test(mime)
    let videoUrl = text?.trim()

    if (!isVideo && (!videoUrl || !videoUrl.includes('http'))) {
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ USO ：✿ 。\n\nResponde a un video con *${usedPrefix + command}* o manda un link` + foot)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        // PASO 1: Subir si es video de WhatsApp
        if (isVideo) {
            await m.reply(head + `\n📤 Subiendo video...` + foot)
            let buffer = await q.download()
            console.log('Video descargado:', buffer.length, 'bytes')
            videoUrl = await uploadVideo(buffer)
            console.log('Video subido a:', videoUrl)
            await m.reply(head + `\n✅ Subido: ${videoUrl}` + foot)
        }

        // PASO 2: Crear job
        await m.reply(head + `\n🎬 Creando job con:\n${videoUrl}` + foot)
        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let txt = await res.text()
        console.log('Respuesta hdvid:', txt)
        let json
        try { json = JSON.parse(txt) } catch { throw new Error('La API no devolvió JSON: ' + txt.slice(0, 200)) }

        if (!json.job_id) throw new Error('Sin job_id. Respuesta: ' + txt.slice(0, 300))
        let jobId = json.job_id
        let resultUrl = json.result
        await m.reply(head + `\n🆔 Job creado: ${jobId}\n🔗 ${resultUrl}` + foot)

        // PASO 3: Polling
        let videoBuffer = null
        let lastResp = ''
        for (let i = 0; i < 18; i++) {
            await new Promise(r => setTimeout(r, 5000))
            let check = await fetch(resultUrl)
            let ct = check.headers.get('content-type') || ''
            console.log(`Intento ${i} - Content-Type:`, ct)

            if (ct.includes('video') || ct.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }
            let t = await check.text()
            lastResp = t.slice(0, 500)
            console.log(`Intento ${i} - Body:`, lastResp)
            try {
                let j = JSON.parse(t)
                let finalUrl = j.url || j.result_url || j.result || j.download || j.data?.url || j.data
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http') && finalUrl !== resultUrl) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
                if (j.status === 'failed' || j.status === 'error') throw new Error('Job falló en API: ' + t.slice(0, 300))
            } catch (e) { if (e.message.includes('Job falló')) throw e }
            await m.reply(head + `\n⏳ Procesando... (${(i+1)*5}s)\nÚltima respuesta: ${lastResp}` + foot)
        }

        if (!videoBuffer) throw new Error('Timeout 90s. Última respuesta: ' + lastResp)

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*\n🆔 Job: ${jobId}` + foot
        }, { quoted: m })

    } catch (e) {
        console.log('ERROR HDVID:', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ ERROR DETALLADO ：✿ 。\n\n❌ *Paso donde falló:*\n${e.message}` + foot)
    }
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid', 'hdvideo', 'mejorarvideo', 'video-hd', 'calidadhd']
export default handler