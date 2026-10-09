import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

if (!m.quoted) {
  let error = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ VER ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 💀 —˙𖦹.꒷

── *📝 AVISO* ╏ 🎃
❌ ➛ Responde a una imagen/video ViewOnce
👻 ➛ Fantasma: "Ni veo si no respondes"

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`
  return conn.reply(m.chat, error, m)
}

if (!m?.quoted || !m?.quoted?.viewOnce) {
  let error = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ VER ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 💀 —˙𖦹.꒷

── *📝 AVISO* ╏ 🎃
❌ ➛ El mensaje no es ViewOnce
💀 ➛ Fantasma dice: "Eso no se borra solo"

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`
  return conn.reply(m.chat, error, m)
}

let buffer = await m.quoted.download(false);

let ok = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐒𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 ﹒ VIEWONCE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` ✅ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🎃
✅ ➛ Imagen/Video desbloqueado
👻 ➛ Fantasma lo vio todo
🎃 ➛ Nada se esconde en la noche de brujas

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`

if (/videoMessage/.test(m.quoted.mtype)) {
  await conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || ok, m)
} else if (/imageMessage/.test(m.quoted.mtype)) {
  await conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || ok, m)
}}

handler.help = ['ver']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'ver'] 
handler.register = false 

export default handler