import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    let isClose
    let estado
    let icon
    let reactEmoji
    let garfieldMsg

    if (command === 'abrir') {
        isClose = 'not_announcement'
        estado = 'ABIERTO'
        icon = '🔓'
        reactEmoji = '😼'
        garfieldMsg = '😼 Garfield despertó... ¡Hora de chismear y comer lasaña! 🍝'
    } 
    if (command === 'cerrar') {
        isClose = 'announcement'
        estado = 'CERRADO'
        icon = '🔒'
        reactEmoji = '😴'
        garfieldMsg = '😴 Garfield se fue a dormir... ¡Shhh! 🍕'
    }

    try {
        await conn.groupSettingUpdate(m.chat, isClose)
        await react(reactEmoji)

        let msg = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ${estado} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` ${icon} —˙𖦹.꒷
${garfieldMsg}

── *📊 INFO GARFIELD* ╏ 🍕
${icon} ➛ Estado: *${estado}*
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏ 🍕
${command === 'cerrar' 
? '🔒 ➛ Solo admins pueden enviar mensajes\n😴 ➛ Garfield está en siesta' 
: '💬 ➛ Todos pueden enviar mensajes\n🍕 ➛ Incluso Odie puede hablar'}

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
    } catch (e) {
        await react('❌')
        let error = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ No se pudo cambiar el estado
🔒 ➛ ¿Soy admin del grupo?
😼 ➛ Garfield dice: hazme admin pe

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = ['abrir', 'cerrar']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler