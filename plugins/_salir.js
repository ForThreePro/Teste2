import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let user = m.sender
    let nombre = conn.getName(user)
    let groupName = await conn.getName(m.chat)

    if (!m.isGroup) {
        let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ SALIR
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ Este comando solo funciona en grupos
👻 ➛ PHANTOM PLUS solo sale de grupos

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let miNumero = '51927174369@s.whatsapp.net'
    if (user !== miNumero) {
        let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ SALIR
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
🔒 ➛ Este comando es exclusivo del dueño
👻 ➛ Solo PHANTOM PLUS mayor puede irse

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = 'https://files.evogb.win/YhR5LZ.jpg'
    }

    let texto = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐒𝐏𝐄𝐃𝐈𝐃𝐀 ﹒ ADIOS
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`SALIENDO\`\` 👋 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
👋 ➛ *${nombre}* se despide de: *${groupName}*
👻 ➛ PHANTOM PLUS se va por nuevos sistemas

── *📝 MENSAJE* ╏ ⛓️
✨ ➛ Gracias por la confianza depositada
✨ ➛ Cada momento compartido en este grupo
✨ ➛ Por elegirnos como su Bot #1 de WhatsApp 2026
❄️ ➛ Me llevo los mejores recuerdos del sistema
💌 ➛ Si necesitan volver a contar conmigo, aquí estaré
⚡ ➛ PHANTOM PLUS siempre vuelve

── *📞 SOPORTE* ╏ ❄️
📱 ➛ Soporte 24/7: *+51 927 174 369*
❄️ ➛ Soporte PHANTOM PLUS incluido

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: texto,
        mentions: [user]
    })

    await conn.sendMessage(m.chat, { text: `👻 Saliendo en 3... PHANTOM PLUS cerrando sistema` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `❄️ Saliendo en 2... Guardando sesión` })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, { text: `⚡ Saliendo en 1... Adiós!` })
    await new Promise(r => setTimeout(r, 1000))

    await conn.groupParticipantsUpdate(m.chat, [user], "remove")
}

handler.help = ['salir']
handler.tags = ['owner']
handler.command = /^salir$/i
handler.group = true
handler.botAdmin = true
export default handler