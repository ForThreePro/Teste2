import moment from 'moment-timezone'
import fetch from 'node-fetch'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    if (!text) {
        return m.reply(head + `\n⤷ ┇ 𝐐𝐑 ﹒ USO ：✿ 。\n\n❌ Escribe el texto o link para el QR\n\n💡 Ejemplo:\n*${usedPrefix + command} Bad Bunny*\n*${usedPrefix + command} https://google.com*` + foot)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        // Parámetro exacto de tu link: ?text=
        let api = `https://api-faa.my.id/faa/qr-create?text=${encodeURIComponent(text)}`
        let res = await fetch(api)
        if (!res.ok) throw new Error('API no responde')

        let buffer = Buffer.from(await res.arrayBuffer())

        await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: head + `\n⤷ ┇ 𝐐𝐑 ﹒ GENERADO ：✿ 。\n\n📝 *Texto:* ${text}\n\n✅ Escanea el código para abrirlo` + foot
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(head + `\n⤷ ┇ 𝐐𝐑 ﹒ ERROR ：✿ 。\n\n❌ No se pudo crear el QR, la API está caída` + foot)
    }
}

handler.help = ['qr']
handler.tags = ['tools']
handler.command = ['qr', 'qrcode', 'qrcreate', 'crearqr']
export default handler