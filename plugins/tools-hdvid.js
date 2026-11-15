import moment from 'moment-timezone'
import fetch from 'node-fetch'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    if (!text || !text.includes('http')) {
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ USO ：✿ 。\n\n❌ Manda el link del video\n\n💡 Ejemplo:\n*${usedPrefix + command} https://files.evogb.win/EMbm6N.mp4*` + foot)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ PROCESANDO ：✿ 。\n\n🎬 Subiendo tu video a HD...\n⏳ Esto puede demorar 20-60 segundos` + foot }, { quoted: m })

        // 1. Crear el job
        let api = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(text)}`
        let res = await fetch(api)
        let json = await res.json()

        if (!json.status || !json.job_id) throw new Error('No dio job_id')
        let jobId = json.job_id
        let resultUrl = json.result // https://api-faa.my.id/faa/result?id=...

        // 2. Esperar el resultado - polling cada 5 seg, max 90 seg
        let videoBuffer = null
        for (let i = 0; i < 18; i++) {
            await new Promise(r => setTimeout(r, 5000))
            let check = await fetch(resultUrl)
            let contentType = check.headers.get('content-type') || ''

            // Si ya es video, listo
            if (contentType.includes('video') || contentType.includes('octet')) {
                videoBuffer = Buffer.from(await check.arrayBuffer())
                break
            }

            // Si es JSON, revisamos
            try {
                let j = await check.clone().json()
                console.log('Job:', jobId, 'intento', i, j)
                // Algunos devuelven { status: 'done', url: '...' } o { result: '...' }
                let finalUrl = j.url || j.result_url || j.download || j.data?.url
                if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http')) {
                    let v = await fetch(finalUrl)
                    videoBuffer = Buffer.from(await v.arrayBuffer())
                    break
                }
                if (j.status === 'failed' || j.status === 'error') throw new Error('Job falló')
            } catch (e) {
                // Si no es JSON, era video pero no detectamos bien
                if (e.message === 'Job falló') throw e
            }
        }

        if (!videoBuffer) throw new Error('Timeout - no terminó el job')

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*\n🆔 Job: ${jobId}\n📥 Formato: MP4` + foot
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ ERROR ：✿ 。\n\n❌ No se pudo mejorar el video\n\nProbablemente sigue procesando, intenta con el ID:\nhttps://api-faa.my.id/faa/result?id=${e.jobId || ''}` + foot)
    }
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid', 'hdvideo', 'mejorarvideo', 'video-hd', 'calidadhd']
export default handler