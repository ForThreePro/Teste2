import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const ownerNum = global.owner?.[0]?.[0] || '51927174369'

  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  // Detectar tipo por command
  let type = ''
  if (command.includes('welcome')) type = 'welcome'
  else if (command.includes('bye')) type = 'bye'
  else if (command.includes('kick')) type = 'kick'
  else return m.reply('❌ Comando no válido')

  let key = `custom${type.charAt(0).toUpperCase() + type.slice(1)}`
  let keyAudio = `audio${type}`

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  await react('🗑️')

  let borradoTexto = false
  let borradoAudio = false

  // Borrar mensaje de texto
  if (chat[key]) {
    delete chat[key]
    borradoTexto = true
  }

  // Borrar audio también si existe
  if (chat[keyAudio]) {
    delete chat[keyAudio]
    borradoAudio = true
  }

  if (!borradoTexto &&!borradoAudio) {
    let vacio = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐍𝐎 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` 📭 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
📭 ➛ No hay mensaje ni audio de *${type}* configurado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
  }

  let detalles = []
  if (borradoTexto) detalles.push('📝 Mensaje')
  if (borradoAudio) detalles.push('🔊 Audio')

  let del = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`BORRADO EXITOSO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🗑️ ➛ ${detalles.join(' + ')} de *${type}* eliminado
✅ ➛ Volverá al mensaje/audio por defecto

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
  return conn.sendMessage(m.chat, { text: del }, { quoted: m })
}

handler.help = ['delwelcome', 'delbye', 'delkick']
handler.tags = ['configuración']
handler.command = /^(delwelcome|delbye|delkick)$/i
handler.group = true
handler.admin = true
export default handler