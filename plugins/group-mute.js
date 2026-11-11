import moment from 'moment-timezone'
moment.locale('es')

let mutedUsers = new Set()

let handler = async (m, { conn, command, participants }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    let mentionedJid = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false
    if (!mentionedJid) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ USO ：✿ 。\n\n❌ Menciona o responde a un usuario\nEj: *.mute @user*` + foot, m) }

    if (participants.find(p=>p.id===mentionedJid)?.admin) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ No puedes silenciar admins` + foot, m) }
    if (mentionedJid===conn.user.jid) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ No puedo silenciarme` + foot, m) }

    if (command==="mute") {
        if (mutedUsers.has(mentionedJid)) { await react('⚠️'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ MUTE ：✿ 。\n\n⚠️ Ya está silenciado` + foot, m) }
        mutedUsers.add(mentionedJid); await react('🔇')
        return conn.sendMessage(m.chat, { text: head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ MUTE ：✿ 。\n\n🔇 Silenciado en el sistema: @${mentionedJid.split('@')[0]} 👻` + foot, mentions:[mentionedJid] }, { quoted:m })
    } else {
        if (!mutedUsers.has(mentionedJid)) { await react('⚠️'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ MUTE ：✿ 。\n\n⚠️ No está silenciado` + foot, m) }
        mutedUsers.delete(mentionedJid); await react('🔊')
        return conn.sendMessage(m.chat, { text: head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ UNMUTE ：✿ 。\n\n🔊 Liberado del silencio: @${mentionedJid.split('@')[0]} ❄️` + foot, mentions:[mentionedJid] }, { quoted:m })
    }
}

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender)) { try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {} }
}

handler.help = ['mute @user','unmute @user']
handler.tags = ['grupo']
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler