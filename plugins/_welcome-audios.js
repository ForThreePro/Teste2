import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const ownerNum = global.owner?.[0]?.[0] || '51927174369'

  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''

  // Detectar tipo: bye / kick desde command
  let type = ''
  if (command.includes('bye')) type = 'bye'
  else if (command.includes('kick')) type = 'kick'
  else return m.reply('❌ Comando no válido')

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // SET AUDIO - SOLO RESPONDIENDO
  if (command.startsWith('audio')) {
    await react('🎵')

    if (!m.quoted) {
      let uso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐔𝐃𝐈𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Debes responder a un audio

── *📖 USO* ╏ 🍕
➛ Envía o reenvía un audio
➛ Responde al audio con:.${command}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
    }

    if (!mime ||!/audio/.test(mime)) {
      await react('❌')
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ Responde a un audio válido pe`, { quoted: m })
    }

    let buffer = await q.download()
    chat[`audio${type}`] = buffer.toString('base64') // guardamos en base64

    let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐆𝐔𝐀𝐑𝐃𝐀𝐃𝐎 ﹒ ${type.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AUDIO GUARDADO\`\` ✅ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
✅ ➛ Audio de *${type}* guardado
🔊 ➛ Se reproducirá cuando alguien ${type === 'bye'? 'salga' : 'sea kickeado'}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
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

handler.help = ['audiobye', 'audiokick', 'delaudiobye', 'delaudiokick']
handler.tags = ['configuración']
handler.command = /^(audio(bye|kick)|delaudio(bye|kick))$/i
handler.group = true
handler.admin = true
export default handler