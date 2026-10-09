import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let user = m.sender
    let nombre = conn.getName(user)
    let groupName = await conn.getName(m.chat)

    if (!m.isGroup) {
        let error = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ SALIR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 💀 —˙𖦹.꒷

── *📝 AVISO* ╏ 🎃
❌ ➛ Este comando solo funciona en grupos
💀 ➛ El fantasma no sale de su tumba, solo de grupos

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let miNumero = '51927174369@s.whatsapp.net'
    if (user !== miNumero) {
        let error = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐀𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ SALIR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ 🎃
🔒 ➛ Este comando es exclusivo del dueño
👻 ➛ Solo fantasma mayor puede irse a asustar

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = 'https://files.evogb.win/YhR5LZ.jpg'
    }

    let texto = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇

⤷ ┇ 𝐃𝐄𝐒𝐏𝐄𝐃𝐈𝐃𝐀 ﹒ ADIOS ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`SALIENDO\`\` 👋 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🎃
👋 ➛ *${nombre}* se despide de: *${groupName}*
👻 ➛ Fantasma se va por más dulces

── *📝 MENSAJE* ╏ 🦇
✨ ➛ Gracias por la confianza depositada
✨ ➛ Cada momento compartido en este grupo
✨ ➛ Por elegirnos como su Bot #1 de WhatsApp 2026
🎃 ➛ Me llevo los mejores recuerdos y olor a calabaza
💌 ➛ Si necesitan volver a contar conmigo, aquí estaré
🌙 ➛ Odio los sustos malos, pero amo este grupo

── *📞 SOPORTE* ╏ 🕯️
📱 ➛ Soporte 24/7: *+51 927 174 369*
🍬 ➛ Soporte con dulces incluido

━━━━━━━━━━━
🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇
━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: texto,
        mentions: [user]
    })

    await conn.sendMessage(m.chat, { text: `👻 Saliendo en 3... Fantasma terminando dulces` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `🎃 Saliendo en 2... Guardando disfraz` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `💀 Saliendo en 1... Boo! Adiós!` })
    await new Promise(r => setTimeout(r, 1000))

    await conn.groupParticipantsUpdate(m.chat, [user], "remove")
}

handler.help = ['salir']
handler.tags = ['owner']
handler.command = /^salir$/i
handler.group = true
handler.botAdmin = true
export default handler