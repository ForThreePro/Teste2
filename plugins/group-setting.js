import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    let isClose = command === 'abrir' ? 'not_announcement' : 'announcement'
    let estado = command === 'abrir' ? 'ABIERTO 🟢❄️' : 'CERRADO 🔴❄️'

    try {
        // 1 - Revisar estado actual antes de cambiar
        let metadata = await conn.groupMetadata(m.chat).catch(() => null)
        let isAnnounce = metadata?.announce // true = cerrado, false = abierto

        if (command === 'abrir' && isAnnounce === false) {
            await react('⚠️')
            return await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ABRIR ：✿ 。\n\n⚠️ El grupo ya estaba ABIERTO 🟢❄️` + foot, mentions: [m.sender] }, { quoted: m })
        }
        if (command === 'cerrar' && isAnnounce === true) {
            await react('⚠️')
            return await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ CERRAR ：✿ 。\n\n⚠️ El grupo ya estaba CERRADO 🔴❄️` + foot, mentions: [m.sender] }, { quoted: m })
        }

        await conn.groupSettingUpdate(m.chat, isClose)
        await react(command === 'abrir' ? '🟢' : '🔴')
        await conn.sendMessage(m.chat, { text: head + `\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ${command === 'abrir' ? 'ABRIR' : 'CERRAR'} ：✿ 。\n\n${estado}\n👑 Por: @${m.sender.split('@')[0]} 👻` + foot, mentions: [m.sender] }, { quoted: m })
    } catch {
        await react('❌')
        await m.reply(head + `\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ No se pudo cambiar. ¿Soy admin?` + foot, m)
    }
}

handler.help = ['abrir','cerrar']
handler.tags = ['grupo']
handler.command = ['abrir','cerrar']
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler