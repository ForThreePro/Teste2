import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    // Validación de permisos para el comando
    if (!isAdmin && !isOwner) {
        return conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ MODOADMIN
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ Solo los admins pueden usar este comando
👻 ➛ PHANTOM PLUS dice: no eres admin pe

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)
    }

    if (/on/i.test(args[0] || '')) {
        chat.modoadmin = true
        await conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ﹒ ON
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTIVADO\`\` ✅ —˙𖦹.꒷

── *📝 ESTADO* ╏ ❄️
✅ ➛ *Modo Administrador activado*
👻 ➛ Ahora solo los admins pueden usar el bot
⛓️ ➛ Modo PHANTOM PLUS activo

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)
    } else if (/off/i.test(args[0] || '')) {
        chat.modoadmin = false
        await conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ﹒ OFF
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DESACTIVADO\`\` ❌ —˙𖦹.꒷

── *📝 ESTADO* ╏ ❄️
❌ ➛ *Modo Administrador desactivado*
👻 ➛ Todos pueden usar el bot de nuevo

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)
    } else {
        await conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ﹒ HELP
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` 📖 —˙𖦹.꒷

── *📖 COMANDOS* ╏ ❄️
➛ *.modoadmin on* - Activa modo solo admins
➛ *.modoadmin off* - Desactiva modo

── *📊 ESTADO ACTUAL* ╏ ⛓️
${chat.modoadmin ? '✅ ➛ Activado - Solo admins' : '❌ ➛ Desactivado - Todos pueden usar'}

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`, m)
    }
}

handler.help = ['modoadmin <on/off>']
handler.tags = ['config']
handler.command = /^(modoadmin|adminmode)$/i

handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isPrems }) {
    if (m.isBaileys || m.fromMe) return true

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.modoadmin) return true

    // Dueño / ROwner / Premium siempre pasan
    if (isAdmin || isOwner || isROwner || isPrems) return true

    // Solo en grupos bloqueamos comandos
    if (m.isGroup) {
        let text = (m.text || '').trim()
        // Si parece comando, lo bloquea. Si es chat normal, lo deja pasar
        let prefixes = ['.', '/', '#', '!', '?']
        let isCommand = prefixes.some(p => text.startsWith(p))
        if (isCommand) return false
    }

    return true
}

export default handler