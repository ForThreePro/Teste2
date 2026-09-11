let { downloadContentFromMessage, getContentType } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!m.quoted) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Responde a una imagen o video ViewOnce

━━━━━━━━━━━` }, { quoted: m })
    }

    let q = m.quoted
    let msg = q.msg || q.message || q

    // ARREGLO: sacar el mensaje real del viewonce
    if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message
    else if (msg.viewOnceMessageV2Extension) msg = msg.viewOnceMessageV2Extension.message
    else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message

    if (!msg) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ No se pudo leer el mensaje
❌ ➛ Ya fue visto o expiró

━━━━━━━━━━━` }, { quoted: m })
    }

    let type = getContentType(msg)
    console.log(type) // para debug

    if (!type) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Tipo de archivo no reconocido

━━━━━━━━━━━` }, { quoted: m })
    }

    if (!['imageMessage', 'videoMessage'].includes(type)) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***VER VIEWONCE*** 𐔌 ꒱ ⚠️

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷

── *📝 AVISO* ╏
❌ ➛ Solo soporta imagen y video ViewOnce
❌ ➛ Detectado: ${type}

━━━━━━━━━━━` }, { quoted: m })
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
    } else {
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
handler.command = ['ver', 'readviewonce', 'read']
export default handler