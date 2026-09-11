import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let user = m.sender
    let nombre = conn.getName(user)
    let groupName = await conn.getName(m.chat)

    if (!m.isGroup) {
        let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ SALIR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Este comando solo funciona en grupos

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    // SOLO TU NUMERO: +51 927 174 369
    let miNumero = '51927174369@s.whatsapp.net'
    if (user!== miNumero) {
        let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ SALIR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
🔒 ➛ Este comando es exclusivo del dueño

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    // AGARRA TU FOTO DE PERFIL
    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = 'https://telegra.ph/file/24fa902ead26340eff1d2.jpg'
    }

    let texto = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐏𝐄𝐃𝐈𝐃𝐀 ﹒ ADIOS ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`SALIENDO\`\` 👋 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
👋 ➛ *${nombre}* se despide de: *${groupName}*

── *📝 MENSAJE* ╏ 🍕
✨ ➛ Gracias por la confianza depositada
✨ ➛ Cada momento compartido en este grupo
✨ ➛ Por elegirnos como su Bot #1 de WhatsApp 2026
🍕 ➛ Me llevo los mejores recuerdos
💌 ➛ Si necesitan volver a contar conmigo, aquí estaré

── *📞 SOPORTE* ╏ 🍕
📱 ➛ Soporte 24/7: *+51 927 174 369*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: texto,
        mentions: [user]
    })

    // COUNTDOWN ANTES DE SALIR
    await conn.sendMessage(m.chat, { text: `🍕 Saliendo en 3...` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `🍕 Saliendo en 2...` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `🍕 Saliendo en 1...` })
    await new Promise(r => setTimeout(r, 1000))

    await conn.groupParticipantsUpdate(m.chat, [user], "remove")
}

handler.help = ['salir']
handler.tags = ['propietario']
handler.command = /^salir$/i
handler.group = true
handler.botAdmin = true
export default handler