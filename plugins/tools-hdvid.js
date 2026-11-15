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

        if (isVideo) {
            await conn.reply(m.chat, head + `\n📥 Descargando video...` + foot, m)
            let media = await q.download()
            if (!media?.length) throw new Error('No se pudo descargar el video')
            if (media.length > 100 * 1024 * 1024) throw new Error(`Video muy pesado (${(media.length/1024/1024).toFixed(1)}MB), máximo 100MB`)
            await conn.reply(m.chat, head + `\n📤 Subiendo video a evogb.win...` + foot, m)
            let link = await myCloud(media)
            if (!link.url) throw new Error('Sin URL de evogb')
            videoUrl = link.url
        }

        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let json = await res.json()
        if (!json.job_id) throw new Error('La API no creó el job: ' + JSON.stringify(json).slice(0, 300))

        let jobId = json.job_id
        let resultUrl = json.result
        await conn.reply(m.chat, head + `\n🎬 Procesando tu video a HD...\n🆔 Job: ${jobId}\n\n⏳ *Puede demorar 2-5 minutos*\nNo es error, el HD tarda. Te lo mando cuando esté listo.\n\n🔗 Puedes verlo aquí:\n${resultUrl}` + foot, m)

        // AHORA: 60 intentos x 5s = 300s = 5 MINUTOS
        let videoBuffer = null
        let lastState = ''
        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 5000))
            let check = await fetch(resultUrl)
            let ct = check.headers.get('content-type') || ''
            if (ct.includes('video') || ct.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }
            let t = await check.text()
            try {
                let j = JSON.parse(t)
                lastState = j.state || j.status || ''
                console.log(`Intento ${i} - ${(i+1)*5}s -`, t.slice(0, 200))
                // Solo cortar si dice failed de verdad
                if (j.state === 'failed') throw new Error(`La API falló: ${j.error || '500'}`)
                let finalUrl = j.url || j.result_url || j.download || j.data?.url
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http') && finalUrl !== resultUrl) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
            } catch (e) { if (e.message.includes('La API falló')) throw e }

            // Aviso cada 30s para que no se vea colgado
            if ((i+1) % 6 === 0) {
                await conn.reply(m.chat, head + `\n⏳ Sigue procesando... ${(i+1)*5}s / 300s\nEstado: ${lastState || 'processing'}` + foot, m)
            }
        }

        if (!videoBuffer) throw new Error(`Timeout 5 minutos. El job sigue en la API, revisa aquí:\n${resultUrl}\n\nEl video es muy largo o la API está lenta, intenta con uno más corto.`)

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*\n🆔 Job: ${jobId}` + foot
        }, { quoted: m })

    } catch (e) {
        console.log('ERROR HDVID:', e.message)
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