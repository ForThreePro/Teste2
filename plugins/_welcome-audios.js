import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''

  let type = ''
  if (command.includes('welcome')) type = 'welcome'
  else if (command.includes('bye')) type = 'bye'
  else if (command.includes('kick')) type = 'kick'
  else return m.reply('❌ Comando no válido')

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (command.startsWith('audio')) {
    await react('❄️')

    if (!m.quoted) {
      let uso = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐀𝐔𝐃𝐈𝐎 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ Debes responder a un audio
👻 ➛ PHANTOM PLUS dice: responde al audio pe

── *📖 USO* ╏ ⛓️
➛ Envía o reenvía un audio
➛ Responde al audio con:.${command}

── *💡 EJEMPLO* ╏ ❄️
➛ Manda un audio → responde → .${command}

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
    }

    if (!mime ||!/audio/.test(mime)) {
      await react('❌')
      return m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n❌ Responde a un audio válido pe - PHANTOM PLUS quiere escuchar\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`, { quoted: m })
    }

    let buffer = await q.download()
    chat[`audio${type}`] = buffer.toString('base64')

    let ok = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐆𝐔𝐀𝐑𝐃𝐀𝐃𝐎 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AUDIO GUARDADO\`\` ✅ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
✅ ➛ Audio de *${type}* guardado
🔊 ➛ Se reproducirá cuando alguien ${type === 'welcome'? 'entre' : type === 'bye'? 'salga' : 'sea kickeado'}
👻 ➛ PHANTOM PLUS aprobó el audio

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
  }

  if (command.startsWith('delaudio')) {
    await react('🗑️')
    if (!chat[`audio${type}`]) {
      let vacio = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐍𝐎 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` 📭 —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
📭 ➛ No hay un audio de *${type}* configurado
❄️ ➛ PHANTOM PLUS dice: no hay nada que borrar

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
      return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
    }

    delete chat[`audio${type}`]
    let del = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ﹒ ${type.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`AUDIO ELIMINADO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
🗑️ ➛ Audio de *${type}* eliminado
✅ ➛ Ya no se reproducirá
👻 ➛ PHANTOM PLUS lo borró

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
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