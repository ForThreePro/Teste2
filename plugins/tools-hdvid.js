import moment from 'moment-timezone'
import fetch from 'node-fetch'
import FormData from 'form-data'
moment.locale('es')

async function uploadVideo(buffer) {
    // 1. Catbox - el que mejor lee la API de Faa
    try {
        let form = new FormData()
        form.append('reqtype', 'fileupload')
        form.append('fileToUpload', buffer, { filename: 'phantom.mp4', contentType: 'video/mp4' })
        let res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, headers: form.getHeaders() })
        let url = (await res.text()).trim()
        console.log('Catbox:', url)
        if (url.includes('http') && url.includes('catbox')) return url
    } catch (e) { console.log('Catbox falló:', e.message) }

    // 2. 0x0.st - directo y sin bloqueo
    try {
        let form = new FormData()
        form.append('file', buffer, { filename: 'phantom.mp4', contentType: 'video/mp4' })
        let res = await fetch('https://0x0.st', { method: 'POST', body: form, headers: form.getHeaders() })
        let url = (await res.text()).trim()
        console.log('0x0:', url)
        if (url.includes('http')) return url
    } catch (e) { console.log('0x0 falló:', e.message) }

    // 3. Transfer.sh - último intento bueno
    try {
        let res = await fetch('https://transfer.sh/phantom.mp4', { method: 'PUT', body: buffer, headers: { 'Content-Type': 'video/mp4' } })
        let url = (await res.text()).trim()
        console.log('Transfer:', url)
        if (url.includes('http')) return url
    } catch (e) { console.log('Transfer falló:', e.message) }

    throw new Error('No se pudo subir a un host compatible con la API')
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

        if (isVideo) {
            await m.reply(head + `\n📤 Subiendo video...` + foot)
            let buffer = await q.download()
            videoUrl = await uploadVideo(buffer)
            console.log('URL final para API:', videoUrl)
        }

        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let json = await res.json()
        if (!json.job_id) throw new Error('La API no creó el job. Respuesta: ' + JSON.stringify(json).slice(0, 300))

        let jobId = json.job_id
        let resultUrl = json.result
        await m.reply(head + `\n🎬 Procesando tu video a HD...\n🆔 Job: ${jobId}\n⏳ Espera 30-60s, te lo mando cuando esté listo` + foot)

        let videoBuffer = null
        for (let i = 0; i < 18; i++) {
            await new Promise(r => setTimeout(r, 5000))
            let check = await fetch(resultUrl)
            let ct = check.headers.get('content-type') || ''

            if (ct.includes('video') || ct.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }

            let t = await check.text()
            console.log(`Intento ${i}:`, t.slice(0, 300))
            try {
                let j = JSON.parse(t)
                // Si la API dice failed, cortar de una vez, no esperar 90s
                if (j.state === 'failed' || j.status === false && j.state) {
                    throw new Error(`La API no pudo procesar el video.\nHost usado: ${videoUrl}\nError API: ${j.error || '500'}\n\nIntenta de nuevo, a veces TmpFiles falla. Con Catbox / 0x0 sí funciona.`)
                }
                let finalUrl = j.url || j.result_url || j.download || j.data?.url
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http') && finalUrl !== resultUrl) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
            } catch (e) { if (e.message.includes('La API no pudo')) throw e }
        }

        if (!videoBuffer) throw new Error('Timeout, la API demoró más de 90s')

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*\n🆔 Job: ${jobId}` + foot
        }, { quoted: m })

    } catch (e) {
        console.log('ERROR HDVID:', e.message)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ ERROR ：✿ 。\n\n❌ ${e.message}` + foot)
    }
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid', 'hdvideo', 'mejorarvideo', 'video-hd', 'calidadhd']
export default handler