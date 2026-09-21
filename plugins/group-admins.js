import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (!m.mentionedJid[0] &&!m.quoted) {
    await react('❌')
    let texto = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂𝐈𝐎𝐍 ﹒ PROMOTE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` 👑 —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛ Menciona a un usuario
➛ Responde al mensaje del usuario
😼 ➛ Garfield: menciona pe

── *💡 EJEMPLOS* ╏ 🍕
➛.promote @user
➛.demote @user

── *📝 AVISO* ╏ 🍕
🔒 ➛ Solo admins
😼 ➛ Solo los que traen lasaña

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
  }

  let user = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted.sender
  let action = command === 'promote' || command === 'promover' || command === 'daradmin'? 'promote' : 'demote'

  await react(action === 'promote'? '👑' : '📉')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action)
  } catch {
    await react('❌')
    let error = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ ADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ No se pudo completar la acción
🔒 ➛ Verifica permisos del bot
😴 ➛ Garfield dice: el bot no es admin pe

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let msgAccion = action === 'promote'
? `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎 ﹒ NUEVO ADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` 👑 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
👑 ➛ Nuevo Admin: @${user.split('@')[0]}
👤 ➛ Por: @${m.sender.split('@')[0]}
😼 ➛ Garfield aprobó al nuevo admin

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
    : `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐆𝐑𝐀𝐃𝐀𝐃𝐎 ﹒ QUITAR ADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` 📉 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
📉 ➛ Ya no es Admin: @${user.split('@')[0]}
👤 ➛ Por: @${m.sender.split('@')[0]}
😼 ➛ Garfield le quitó el poder

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`

  await conn.sendMessage(m.chat, { text: msgAccion, mentions: [user, m.sender] }, { quoted: m })
}

handler.help = ['promote @user', 'demote @user']
handler.tags = ['grupo']
handler.command = /^(promote|promover|daradmin|demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler