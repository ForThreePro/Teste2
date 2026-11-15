import moment from 'moment-timezone'
import fetch from 'node-fetch'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    let input = text?.trim()
    if (!input) {
        return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 ﹒ USO ：✿ 。\n\n*${usedPrefix + command} https://api-faa.my.id/faa/result?id=XXXX*\n\nO solo el ID:\n*${usedPrefix + command} e5f1a123*` + foot, m)
    }

    // Si te pasan solo el ID, armamos la URL
    let resultUrl = input.includes('http') ? input : `https://api-faa.my.id/faa/result?id=${input}`

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        let check = await fetch(resultUrl)
        let ct = check.headers.get('content-type') || ''

        // Caso 1: Ya es video directo
        if (ct.includes('video') || ct.includes('octet')) {
            let buf = Buffer.from(await check.arrayBuffer())
            await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
            return await conn.sendMessage(m.chat, {
                video: buf,
                mimetype: 'video/mp4',
                caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*` + foot
            }, { quoted: m })
        }

        // Caso 2: Es JSON
        let t = await check.text()
        let j
        try { j = JSON.parse(t) } catch { throw new Error('La API no devolvió nada válido') }

        // Si trae URL final
        let finalUrl = j.url || j.result_url || j.download || j.data?.url || j.result
        if (finalUrl && typeof finalUrl === 'string' && finalUrl.includes('http') && finalUrl !== resultUrl) {
            let v = await fetch(finalUrl)
            let buf = Buffer.from(await v.arrayBuffer())
            await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
            return await conn.sendMessage(m.chat, {
                video: buf,
                mimetype: 'video/mp4',
                caption: head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n✅ *Video mejorado a HD*` + foot
            }, { quoted: m })
        }

        // Caso 3: Aún procesando o falló
        if (j.state === 'failed') throw new Error(`La API falló: ${j.error || '500'}`)
        if (j.state === 'processing' || j.status === false || j.status === 'processing') {
            return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐑 ﹒ ESPERA ：✿ 。\n\n⏳ *Aún se está procesando...*\n\nEspera 1 minuto más y vuelve a usar:\n*${usedPrefix + command} ${resultUrl}*\n\nO abre el link directo:\n${resultUrl}` + foot, m)
        }

        return conn.reply(m.chat, head + `\n⏳ Aún no está listo, intenta en 1 min.\n\n🔗 ${resultUrl}` + foot, m)

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, head + `\n❌ ${e.message}` + foot, m)
    }
}

handler.help = ['hddescargar']
handler.tags = ['tools']
handler.command = ['hddescargar', 'hdget', 'hdbajar', 'hdlink']
export default handler