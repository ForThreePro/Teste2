import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  // Validación de permisos para el comando
  if (!isAdmin &&!isOwner) {
    let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ MODO ADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
🔒 ➛ Solo admins pueden usar este comando

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (/on/i.test(args[0])) {
    await react('🟢')
    chat.modoadmin = true
    let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ﹒ ACTIVADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTIVADO\`\` 🟢 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🟢 ➛ Modo Administrador Activado
👑 ➛ Solo admins pueden usar comandos

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
  } else if (/off/i.test(args[0])) {
    await react('🔴')
    chat.modoadmin = false
    let off = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ﹒ DESACTIVADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DESACTIVADO\`\` 🔴 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔴 ➛ Modo Administrador Desactivado
👥 ➛ Todos pueden usar comandos

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: off }, { quoted: m })
  } else {
    await react('❌')
    let uso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ﹒ MODO ADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` ⚙️ —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛.modoadmin on
➛.modoadmin off

── *📝 DESCRIPCIÓN* ╏ 🍕
🟢 ➛ on = Solo admins usan el bot
🔴 ➛ off = Todos usan el bot

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
  }
}

handler.help = ['modoadmin <on/off>']
handler.tags = ['configuración']
handler.command = /^(modoadmin|adminmode)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isPrems }) {
    if (m.isBaileys || m.fromMe) return!0

    let chat = global.db.data.chats[m.chat]
    if (!chat) return!0

    // Si estamos en un grupo
    if (m.isGroup) {
        // Si el modo admin está activo y el que escribe NO es admin/owner/premium
        if (chat.modoadmin &&!isAdmin &&!isOwner &&!isROwner &&!isPrems) {
            // Si el usuario intenta usar un comando, lo bloqueamos
            if (m.text && /^[./#]/.test(m.text)) {
                try {
                  await conn.sendMessage(m.chat, {
                    react: { text: '🔒', key: m.key }
                  })
                } catch {}
                return false // Detiene la ejecución de otros plugins
            }
        }
    }

    return!0
}

export default handler