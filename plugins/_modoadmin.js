import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

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
    return conn.sendMessage(m.chat, { text: `📌 Uso: *.modoadmin on/off*` }, { quoted: m })
  }
}

handler.help = ['modoadmin <on/off>']
handler.tags = ['configuración']
handler.command = /^(modoadmin|adminmode)$/i
handler.group = true
handler.admin = true // SOLO ADMIN PUEDE ACTIVAR/DESACTIVAR

handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isPrems }) {
    if (m.isBaileys || m.fromMe) return!0
    if (!m.isGroup) return!0

    let chat = global.db.data.chats[m.chat]
    if (!chat ||!chat.modoadmin) return!0

    // SI MODO ADMIN ESTA ACTIVO Y NO ES ADMIN/OWNER/PREMIUM
    if (!isAdmin &&!isOwner &&!isROwner &&!isPrems) {
        // BLOQUEAR SI USA CUALQUIER COMANDO
        if (m.text && /^[./#]/.test(m.text)) {
            // No dejar pasar NINGUN comando
            if (!/^modoadmin$/i.test(m.text.split(' ')[0].slice(1))) { // excepto si intenta activar modoadmin
                try {
                  await conn.sendMessage(m.chat, { react: { text: '🔒', key: m.key } })
                } catch {}
                return false // DETIENE TODO
            }
        }
    }
    return!0
}

// PRIORIDAD ALTA PARA QUE SE EJECUTE PRIMERO
handler.priority = 0
export default handler