import moment from 'moment-timezone'
moment.locale('es')

// ✅ FOTO DE MENÚ PHANTOM PLUS
const menuImg = 'https://files.evogb.win/9BFoEi.jpg'

let handler = async (m, { conn, command, args, isOwner, isAdmin, isROwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // Enviar con foto de menú + texto + mentions
  const sendMenu = async (texto) => {
    try {
      await conn.sendMessage(m.chat, { image: { url: menuImg }, caption: texto, mentions: [m.sender] }, { quoted: m })
    } catch {
      await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] }, { quoted: m })
    }
  }

  if (!args[0]) {
    await react('❌')
    let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ﹒ ON/OFF
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ Falta activar o desactivar
👻 ➛ PHANTOM PLUS dice: pon on o off pe

── *💡 USO* ╏ ⛓️
➛.welcome on / off
➛.antilink on / off
➛.nsfw on / off
➛.detect on / off

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return sendMenu(error)
  }

  let fail = false
  switch (type) {
    case 'welcome': case 'bienvenida':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.bienvenida = isEnable
      break
    case 'subbots': case 'serbot':
      if (!isROwner) { await react('🔒'); fail = true; break }
      bot.jadibotmd = isEnable
      break
    case 'antispam':
      if (!isOwner) { await react('🔒'); fail = true; break }
      bot.antiSpam = isEnable
      break
    case 'antilink':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.antiLink = isEnable
      break
    case 'antibot':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.antiBot = isEnable
      break
    case 'modoadmin':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.modoadmin = isEnable
      break
    case 'nsfw': case 'antinopor':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.nsfw = isEnable
      break
    case 'audios':
      chat.audios = isEnable
      break
    case 'autoread': case 'autoleer':
      if (!isROwner) { await react('🔒'); fail = true; break }
      global.opts['autoread'] = isEnable
      break
    case 'antiprivado':
      if (!isOwner) { await react('🔒'); fail = true; break }
      bot.antiPrivate = isEnable
      break
    case 'detect': case 'detector': case 'avisos':
      if (m.isGroup &&!isAdmin) { await react('🔒'); fail = true; break }
      chat.detect = isEnable
      break
    default:
      return
  }

  if (fail) {
    let lock = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
🔒 ➛ No tienes permisos para esto
👻 ➛ PHANTOM PLUS: solo admins pueden tocar esto

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return sendMenu(lock)
  }

  await react(isEnable? '❄️' : '🔴')

  let estadoTexto = isEnable? 'Activado' : 'Desactivado'
  let estadoEmoji = isEnable? '❄️' : '🔴'

  let statusTxt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` ⚙️ —˙𖦹.꒷

── *📊 ESTADO* ╏ ❄️
⚙️ ➛ Función: *${type}*
${estadoEmoji} ➛ Estado: *${estadoTexto}*
👑 ➛ Por: @${m.sender.split('@')[0]}
👻 ➛ PHANTOM PLUS ${isEnable? 'aprobó ❄️' : 'lo apagó 🔴'}

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`

  await sendMenu(statusTxt)
}

handler.help = ['welcome','antilink', 'antibot', 'modoadmin', 'subbots', 'nsfw', 'audios', 'antiprivado', 'antispam', 'autoread', 'detect'].map(v => v + ' on/off')
handler.tags = ['configuración']
handler.command = ['welcome', 'bienvenida', 'subbots', 'serbot', 'antispam', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado', 'detect', 'detector', 'avisos']

export default handler