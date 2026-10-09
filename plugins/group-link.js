import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    try {
        await react('🔗')
        let link = await conn.groupInviteCode(m.chat)
        let groupMetadata = await conn.groupMetadata(m.chat)

        let texto = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐋𝐈𝐍𝐊 ﹒ DEL GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`INVITACIÓN\`\` 🔗 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🎃
👥 ➛ Grupo: *${groupMetadata.subject}*
👻 ➛ Fantasma te pasa el link

── *🔗 ENLACE* ╏ 🦇
https://chat.whatsapp.com/${link}

── *📝 NOTAS* ╏ 🕯️
🔒 ➛ Solo admins pueden resetear el link
⚠️ ➛ No lo compartas con desconocidos
🎃 ➛ Lux X Yallico lo aprueba

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    } catch (e) {
        await react('💀')
        let error = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ LINK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 💀 —˙𖦹.꒷

── *📝 AVISO* ╏ 🎃
❌ ➛ No pude obtener el link
🔒 ➛ ¿Soy admin del grupo?
👻 ➛ Fantasma dice: hazme admin pe

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'linkgroup', 'grouplink']
handler.group = true
handler.admin = true

export default handler