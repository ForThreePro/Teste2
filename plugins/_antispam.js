import moment from 'moment-timezone'
moment.locale('es')

const userSpamData = {}

let handler = async (m, { conn, args, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const ownerNum = global.owner?.[0]?.[0] || '51927174369'
  let bot = global.db.data.settings[conn.user.jid] || {}

  if (!isOwner) return global.dfail('owner', m, conn)

  if (/on/i.test(args[0])) {
    bot.antiSpam = true
    let menuOn = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ANTISPAM\`\` ✅ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🛡️ ➛ Anti-Spam: *ACTIVADO*
📦 ➛ Filtra: *Stickers y Emojis*

── *📖 NOTA* ╏ 🍕
👑 ➛ Los owners están exentos
🤖 ➛ El bot debe ser admin para eliminar

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.reply(m.chat, menuOn, m)
  } else if (/off/i.test(args[0])) {
    bot.antiSpam = false
    let menuOff = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ANTISPAM\`\` ❌ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔓 ➛ Anti-Spam: *DESACTIVADO*
📢 ➛ Ahora se permiten stickers/emojis sin límite

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.reply(m.chat, menuOff, m)
  } else {
    let menuUso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐄𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🛡️ ࣪ ꕀ.antispam ˚. ᵎᵎ
> *"Odio cuando spamean stickers"*

.⃟𖥔 ݁. 𖦹˙— \`\`HERRAMIENTA\`\` 🛡️ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
🛡️ ➛ Detecta spam de stickers y emojis
🛡️ ➛ Avisa a los 4 mensajes y expulsa a los 6

── *📖 USO* ╏ 🍕
1️⃣ ➛.antispam on ➛ Activar protección
2️⃣ ➛.antispam off ➛ Desactivar protección

── *⚠️ NOTAS* ╏ 🍕
👑 ➛ Solo owner
⏱️ ➛ Ventana: 6 segundos

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
━━━━━━━━━━━`
    return conn.reply(m.chat, menuUso, m)
  }
}

handler.help = ['antispam on/off']
handler.tags = ['config']
handler.command = /^(antispam)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}

  if (!bot.antiSpam || m.fromMe) return

  const sender = m.sender
  const currentTime = Date.now()
  const timeWindow = 6000
  const warnLimit = 4
  const kickLimit = 6

  const isEmojiOnly = m.text? /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Component})+$/u.test(m.text.trim()) : false
  const isSticker = m.mtype === 'stickerMessage'

  if (!isSticker &&!isEmojiOnly) return

  if (!userSpamData[sender] || (currentTime - userSpamData[sender].startTime > timeWindow)) {
    userSpamData[sender] = {
      startTime: currentTime,
      messageCount: 1
    }
  } else {
    userSpamData[sender].messageCount++
  }

  const count = userSpamData[sender].messageCount

  if (isOwner || isROwner) {
    if (count === warnLimit) {
      await conn.reply(m.chat, `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`OWNER\`\` 👑 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
Hey creador, tranquilo... 🌀
No satures con tanto sticker/emoji.

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`, m)
    }
    return
  }

  if (m.isGroup && (isAdmin || isPrems ||!isBotAdmin)) return

  if (count === warnLimit) {
    await conn.reply(m.chat, `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ADVERTENCIA\`\` ⚔️ —˙𖦹.꒷

── *📝 MOTIVO* ╏ 🍕
⚔️ ➛ *@${sender.split('@')[0]}*, ¡Corta el spam de stickers/emojis!
📊 ➛ (${count}/${kickLimit})

── *⚠️ CONSECUENCIA* ╏ 🍕
👢 ➛ Al llegar a ${kickLimit} serás eliminado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`, m, { mentions: [sender] })
  }
  else if (count >= kickLimit) {
    await conn.reply(m.chat, `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎 ﹒ ANTISPAM ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXPULSADO\`\` 👺 —˙𖦹.꒷

── *📝 MOTIVO* ╏ 🍕
👺 ➛ *@${sender.split('@')[0]}* fue eliminado
📊 ➛ Flood de stickers/emojis

── *📊 ACCIÓN* ╏ 🍕
👢 ➛ Usuario eliminado del grupo

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`, m, { mentions: [sender] })
    if (m.isGroup) {
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
    }
    delete userSpamData[sender]
  }
}

export default handler