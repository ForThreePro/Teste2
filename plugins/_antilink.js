import moment from 'moment-timezone'
moment.locale('es')

const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    if (!isAdmin &&!isOwner) {
        let noPermiso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ ANTILINK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PERMISO\`\` ❌ —˙𖦹.꒷

── *📝 RESULTADO* ╏ 🍕
⚠️ ➛ Solo los *administradores* pueden usar este comando

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.reply(m.chat, noPermiso, m)
    }

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (/on/i.test(args[0])) {
        chat.antiLink = true
        let menuOn = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ﹒ ANTILINK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ANTILINK\`\` ✅ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🛡️ ➛ Anti-Link: *ACTIVADO*
🔒 ➛ Elimina enlaces de grupos y canales

── *📖 NOTA* ╏ 🍕
👑 ➛ Los admins están exentos
🤖 ➛ El bot debe ser admin para eliminar

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.reply(m.chat, menuOn, m)
    } else if (/off/i.test(args[0])) {
        chat.antiLink = false
        let menuOff = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ﹒ ANTILINK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ANTILINK\`\` ❌ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔓 ➛ Anti-Link: *DESACTIVADO*
📢 ➛ Ahora se permiten enlaces

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.reply(m.chat, menuOff, m)
    } else {
        let menuUso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀 ﹒ ANTILINK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🛡️ ࣪ ꕀ.antilink ˚. ᵎᵎ
> *"Protegiendo el grupo de spam"*

.⃟𖥔 ݁. 𖦹˙— \`\`HERRAMIENTA\`\` 🛡️ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
🛡️ ➛ Elimina mensajes con links de grupos y canales
🛡️ ➛ Expulsa automáticamente al usuario

── *📖 USO* ╏ 🍕
1️⃣ ➛.antilink on ➛ Activar protección
2️⃣ ➛.antilink off ➛ Desactivar protección

── *⚠️ NOTAS* ╏ 🍕
👑 ➛ Solo admins
🔗 ➛ No elimina links del mismo grupo

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
━━━━━━━━━━━`
        return conn.reply(m.chat, menuUso, m)
    }
}

handler.help = ['antilink <on/off>']
handler.tags = ['config']
handler.command = /^(antilink|antilinks)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return!0
    const botNumber = conn.user.jid
    if (m.sender === botNumber || m.fromMe || m.isBaileys) return!0

    const chat = global.db.data.chats[m.chat]
    if (!chat?.antiLink) return!0

    const isGroupLink = linkRegex.exec(m.text)
    const isChannelLink = channelLinkRegex.exec(m.text)

    if ((isGroupLink || isChannelLink) &&!isAdmin) {
        if (!isBotAdmin) return!0

        if (isGroupLink) {
            const groupCode = await conn.groupInviteCode(m.chat).catch(() => null)
            if (groupCode && m.text.includes(groupCode)) return!0
        }

        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.reply(
            m.chat,
            `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐍𝐋𝐀𝐂𝐄 𝐏𝐑𝐎𝐇𝐈𝐁𝐈𝐃𝐎 ﹒ ANTILINK ：✿ 。

.⃟𖥔 ݁. 𖦹˙— \`\`EXPULSADO\`\` 🚫 —˙𖦹.꒷

── *📝 MOTIVO* ╏ 🍕
🚫 ➛ Enviar enlaces prohibidos
👤 ➛ Usuario: @${m.sender.split('@')[0]}

── *📊 ACCIÓN* ╏ 🍕
👢 ➛ Usuario eliminado del grupo

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`,
            m,
            { mentions: [m.sender] }
        )
        return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
    return!0
}

export default handler