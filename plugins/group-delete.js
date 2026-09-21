import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (!m.quoted) {
    await react('❌')
    let error = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐑 ﹒ MENSAJE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Responde al mensaje que deseas eliminar
😼 ➛ Garfield dice: responde al mensaje pe

── *💡 EJEMPLO* ╏ 🍕
➛ Responde a un mensaje + .del
➛ Responde a un mensaje + .delete

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  await react('🗑️')

  try {
    let delet = m.message.extendedTextMessage.contextInfo.participant
    let bang = m.message.extendedTextMessage.contextInfo.stanzaId
    await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
  } catch {
    await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
  }

  let ok = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ﹒ MENSAJE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🗑️ ➛ Mensaje eliminado
👤 ➛ Por: @${m.sender.split('@')[0]}
😼 ➛ Garfield lo borró durmiendo

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
  conn.sendMessage(m.chat, { text: ok, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['del','delete']
handler.tags = ['grupo']
handler.command = /^del(ete)?$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler