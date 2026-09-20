import crypto from 'crypto'

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    // 1. CONFIGURAR - Responde a un sticker con .setabrir
    if (command === 'setabrir') {
        if (!m.quoted) return m.reply('🍕 Responde a un sticker con .setabrir')
        try {
            let q = m.quoted
            // Usar el sha256 original de WhatsApp, no el buffer
            let fileSha256 = q.msg?.fileSha256 || q.message?.stickerMessage?.fileSha256 || q.fileSha256
            if (!fileSha256) {
                // Fallback si no tiene sha
                let buffer = await q.download()
                fileSha256 = crypto.createHash('sha256').update(buffer).digest()
            }
            let hash = Buffer.from(fileSha256).toString('base64')

            chat.stickerAbrir = hash
            console.log('STICKER ABRIR GUARDADO:', hash)
            return m.reply(`✅ *STICKER DE ABRIR GUARDADO* 🟢\n\nManda ese sticker y se abrirá`)
        } catch (e) {
            console.log(e)
            return m.reply(`❌ Error: ${e.message}`)
        }
    }

    // 2. DETECTAR CUANDO MANDAN EL STICKER
    if (m.mtype === 'stickerMessage') {
        if (!chat.stickerAbrir) return
        try {
            let fileSha256 = m.msg?.fileSha256 || m.message?.stickerMessage?.fileSha256
            if (!fileSha256) {
                let buffer = await m.download()
                fileSha256 = crypto.createHash('sha256').update(buffer).digest()
            }
            let hash = Buffer.from(fileSha256).toString('base64')

            console.log('RECIBIDO:', hash)
            console.log('GUARDADO:', chat.stickerAbrir)
            console.log('IGUAL?:', hash === chat.stickerAbrir)

            if (hash === chat.stickerAbrir) {
                console.log('ABRIENDO GRUPO...')
                await conn.groupSettingUpdate(m.chat, 'not_announcement')
                await conn.sendMessage(m.chat, { 
                    text: `🔓 *GRUPO ABIERTO* 🟢\nPor: @${m.sender.split('@')[0]}`, 
                    mentions: [m.sender] 
                })
            }
        } catch (e) {
            console.log('ERROR ABRIENDO:', e)
        }
    }
}

handler.help = ['setabrir']
handler.tags = ['grupo']
handler.command = ['setabrir']
handler.all = true
handler.group = true
handler.admin = false
handler.botAdmin = true

export default handler