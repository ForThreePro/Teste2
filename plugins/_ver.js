let { downloadContentFromMessage, getContentType } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
    if (!m.quoted) return conn.reply(m.chat, `《✧》 Responde a una imagen o video ViewOnce.`, m)

    let q = m.quoted
    let msg = q.msg || q.message || q

    // Desenvolver el viewOnce
    if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message
    else if (msg.viewOnceMessageV2Extension) msg = msg.viewOnceMessageV2Extension.message
    else if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message
    else if (!q.viewOnce) return conn.reply(m.chat, `《✧》 El mensaje no es ViewOnce.`, m)

    let type = getContentType(msg)
    if (!type) return conn.reply(m.chat, `《✧》 No se pudo identificar el archivo.`, m)
    if (!['imageMessage', 'videoMessage'].includes(type)) return conn.reply(m.chat, `《✧》 Solo soporta imagen y video ViewOnce.`, m)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        let buffer = Buffer.from([])
        let stream = await downloadContentFromMessage(msg[type], type.replace('Message', ''))
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

        let caption = msg[type].caption || ''

        if (type === 'videoMessage') {
            await conn.sendFile(m.chat, buffer, 'media.mp4', `《✧》 Video ViewOnce\n${caption}`, m)
        } else {
            await conn.sendFile(m.chat, buffer, 'media.jpg', `《✧》 Imagen ViewOnce\n${caption}`, m)
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, `《✧》 Error al descargar. Tal vez ya fue visto o expiró.`, m)
    }
}

handler.help = ['ver']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'ver']
handler.register = false

export default handler