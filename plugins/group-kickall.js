import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNumber = '51927174369@s.whatsapp.net'
    
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // SOLO TU NUMERO PUEDE USARLO
    if (m.sender !== ownerNumber) {
        await react('❌')
        return conn.sendMessage(m.chat, { 
            text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ﹒ ACCESO DENEGADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DENEGADO\`\` 🔴 —˙𖦹.꒷
😼 Este comando es solo para mi dueño pe

── *📊 INFO* ╏ 🍕
🔒 ➛ Comando: *.kickall*
👑 ➛ Solo: +51 927 174 369
🚫 ➛ Tu: @${m.sender.split('@')[0]}

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`, mentions: [m.sender] }, { quoted: m })
    }

    if (!m.isGroup) return m.reply('😼 Solo en grupos pe')

    try {
        await react('😼')
        let groupMetadata = await conn.groupMetadata(m.chat)
        let botId = conn.user.jid

        let toKick = groupMetadata.participants
            .map(p => p.id)
            .filter(id => id !== botId && id !== ownerNumber)

        if (!toKick.length) {
            await react('😴')
            return m.reply('😼 No hay nadie para sacar pe, solo estás tú y yo 🍕')
        }

        await conn.sendMessage(m.chat, { 
            text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ KICKALL INICIADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PURGA\`\` 🔴 —˙𖦹.꒷
😼 Garfield se enojó, sacando a todos pe 🍕

── *📊 INFO* ╏ 🍕
🔴 ➛ Total: *${toKick.length} miembros*
👑 ➛ Ejecutado por: @${m.sender.split('@')[0]}

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`, mentions: [m.sender] }, { quoted: m })

        for (let id of toKick) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
                await new Promise(r => setTimeout(r, 800))
            } catch {}
        }

        await react('🔥')
        await conn.sendMessage(m.chat, { 
            text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ KICKALL COMPLETADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LIMPIO\`\` 🟢 —˙𖦹.꒷
😼 Grupo limpio pe

── *📊 RESULTADO* ╏ 🍕
🗑️ ➛ Eliminados: *${toKick.length}*
👑 ➛ Quedan: *Tú y el bot*

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` 
        })

    } catch (e) {
        console.log(e)
        return m.reply(`❌ Error: ${e.message}\n😼 El bot tiene que ser admin pe`)
    }
}

handler.help = ['kickall']
handler.tags = ['owner']
handler.command = ['kickall', 'sacartodos', 'kicktodos']
handler.group = true
handler.botAdmin = true

export default handler