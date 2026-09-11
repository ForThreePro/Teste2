let { downloadContentFromMessage, getContentType } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!m.quoted) {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Responde a una imagen o video ViewOnce

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let quoted = m.quoted
    let msg = quoted.msg || quoted

    // ARREGLO: quitar el viewOnceMessageV2
    if (msg.viewOnceMessageV2) {
        msg = msg.viewOnceMessageV2.message
    } else if (msg.viewOnceMessageV2Extension) {
        msg = msg.viewOnceMessageV2Extension.message
    }

    if (!msg) {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo leer el mensaje
❌ ➛ Tal vez ya fue visto o está corrupto

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    let type = getContentType(msg)
    if (!type ||!['imageMessage', 'videoMessage'].includes(type)) {
        await react('❌')
        let error = `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Solo soporta imagen y video ViewOnce

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    await react('⏳')
    await m.reply(`𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⏳

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` —˙𖦹.⚙️꒷

── *📊 ESTADO* ╏
📥 ➛ Descargando archivo...
🔓 ➛ Quitando ViewOnce...

━━━━━━━━━━━`)

    let buffer = Buffer.from([])
    let stream = await downloadContentFromMessage(msg[type], type.replace('Message', ''))
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    let caption = msg[type].caption || 'Sin descripción'

    if (type === 'videoMessage') {
        await react('🎥')
        await conn.sendFile(m.chat, buffer, 'media.mp4', `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.🎥꒷

── *📊 INFORMACIÓN* ╏
🎥 ➛ Tipo: *Video ViewOnce*
📝 ➛ ${caption}

━━━━━━━━━━━`, m)
    } else if (type === 'imageMessage') {
        await react('🖼️')
        await conn.sendFile(m.chat, buffer, 'media.jpg', `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ✅

.⃟𖥔 ݁. 𖦹˙— \`\`COMPLETADO\`\` —˙𖦹.🖼️꒷

── *📊 INFORMACIÓN* ╏
🖼️ ➛ Tipo: *Imagen ViewOnce*
📝 ➛ ${caption}

━━━━━━━━━━━`, m)
    }
}

handler.help = ['ver']
handler.tags = ['herramientas']
handler.command = ['readviewonce', 'read', 'ver']
export default handler