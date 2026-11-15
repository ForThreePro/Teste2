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
            let media = await q.download()
            if (!media?.length) throw new Error('No se pudo descargar el video')
            if (media.length > 100 * 1024 * 1024) throw new Error('Video muy pesado')
            let link = await myCloud(media)
            if (!link.url) throw new Error('Sin URL de evogb')
            videoUrl = link.url
        }

        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(videoUrl)}`
        let res = await fetch(api)
        let json = await res.json()
        if (!json.job_id) throw new Error('La API no creó el job')

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        // SOLO 1 MENSAJE CON EL LINK, SIN ESPERAR
        return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ JOB CREADO ：✿ 。\n\n✅ *Tu video se está mejorando*\n\n🆔 Job: \`${json.job_id}\`\n🔗 Link HD:\n${json.result}\n\n⏳ Espera 1-2 min y luego usa:\n*${usedPrefix}hddescargar ${json.result}*\n\nO abre el link directo en tu navegador.` + foot, m)

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, head + `\n❌ ${e.message}` + foot, m)
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