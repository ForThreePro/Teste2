import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, args, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const ownerNum = global.owner?.[0]?.[0] || '51927174369'

  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  let q = m.quoted? q : m
  let mime = (q.msg || q).mimetype || ''

  // Detectar tipo: welcome / bye / kick desde command
  let type = ''
  if (command.includes('welcome')) type = 'welcome'
  else if (command.includes('bye')) type = 'bye'
  else if (command.includes('kick')) type = 'kick'
  else return m.reply('❌ Comando no válido')

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // SET AUDIO
  if (command.startsWith('audio')) {
    await react('🎵')

    // Si responde a un audio o manda audio
    if (mime && /audio/.test(mime)) {
      let buffer = await q.download()
      chat[`audio${type}`] = buffer.toString('base64') // guardamos en base64 para que no pese en el json
      let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐔𝐃𝐈𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GUARDADO\`\` ✅ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
✅ ➛ Audio de *${type}* guardado
🔊 ➛ Se reproducirá cuando pase el evento

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }

    // Si manda un link
    if (args[0] && args[0].startsWith('http')) {
      chat[`audio${type}`] = args[0]
      let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐔𝐃𝐈𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GUARDADO\`\` 🔗 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
✅ ➛ Link de audio *${type}* guardado
🔗 ➛ ${args[0]}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }

    await react('❌')
    let uso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐔𝐃𝐈𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` 🎵 —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛.${command} + Responde a un audio
➛.${command} <link del audio>

── *💡 EJEMPLOS* ╏ 🍕
➛ Responde a un audio + ${command}
➛.${command} https://link.com/audio.mp3

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
  }

  // DEL AUDIO
  if (command.startsWith('delaudio')) {
    if (!chat[`audio${type}`]) {
      await react('📭')
      let vacio = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐍𝐎 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` 📭 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
📭 ➛ No hay un audio de *${type}* configurado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
    }

    delete chat[`audio${type}`]
    await react('🗑️')
    let del = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINADO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🗑️ ➛ Audio de *${type}* eliminado
✅ ➛ Ya no se reproducirá

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: del }, { quoted: m })
  }
}

handler.help = ['audiowelcome', 'audiobye', 'audiokick', 'delaudiowelcome', 'delaudiobye', 'delaudiokick']
handler.tags = ['configuración']
handler.command = /^(audio(welcome|bye|kick)|delaudio(welcome|bye|kick))$/i
handler.group = true
handler.admin = true
export default handler