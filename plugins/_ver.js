import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

if (!m.quoted) {
  let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ VER
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ Responde a una imagen/video ViewOnce
👻 ➛ PHANTOM PLUS: "Ni veo si no respondes"

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
  return conn.reply(m.chat, error, m)
}

if (!m?.quoted || !m?.quoted?.viewOnce) {
  let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ VER
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ El mensaje no es ViewOnce
❄️ ➛ PHANTOM PLUS dice: "Eso no se borra solo"

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
  return conn.reply(m.chat, error, m)
}

let buffer = await m.quoted.download(false);

let ok = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐒𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 ﹒ VIEWONCE
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` ✅ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
✅ ➛ Imagen/Video/Audio desbloqueado
👻 ➛ PHANTOM PLUS lo vio todo
❄️ ➛ Nada se esconde del sistema PHANTOM PLUS

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`

if (/videoMessage/.test(m.quoted.mtype)) {
  await conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || ok, m)
} else if (/imageMessage/.test(m.quoted.mtype)) {
  await conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || ok, m)
} else if (/audioMessage/.test(m.quoted.mtype)) {
  await conn.sendFile(m.chat, buffer, 'media.mp3', ok, m)
} else {
  return conn.reply(m.chat, `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n❌ Tipo de ViewOnce no soportado\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`, m)
}}

handler.help = ['ver']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'ver'] 
handler.register = false 

export default handler