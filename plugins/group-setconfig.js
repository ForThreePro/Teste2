import crypto from 'crypto'

async function getBuffer(conn, m) {
    try { if (m.download) { let b = await m.download(); if (b) return b } } catch {}
    try { if (m.quoted?.download) { let b = await m.quoted.download(); if (b) return b } } catch {}
    try { if (conn.downloadMediaMessage) { let b = await conn.downloadMediaMessage(m); if (b) return b } } catch {}
    return null
}

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    // CONFIGURAR
    if (command === 'setabrir') {
        if (!m.quoted) return m.reply('🍕 Responde a un sticker con .setabrir')
        let buffer = await getBuffer(conn, m.quoted)
        if (!buffer) return m.reply('❌ No pude descargar el sticker')
        let hash = crypto.createHash('sha256').update(buffer).digest('hex')
        chat.stickerAbrir = hash
        return m.reply(`✅ *STICKER DE ABRIR GUARDADO* 🟢\n\nAhora manda ese sticker y se abrirá el grupo`)
    }

    // SI ES STICKER, ABRIR
    if (m.mtype === 'stickerMessage') {
        if (!chat.stickerAbrir) return
        let buffer = await getBuffer(conn, m)
        if (!buffer) return
        let hash = crypto.createHash('sha256').update(buffer).digest('hex')
        
        if (hash === chat.stickerAbrir) {
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            await conn.sendMessage(m.chat, { text: `🔓 *GRUPO ABIERTO* 🟢\nPor: @${m.sender.split('@')[0]}`, mentions: [m.sender] })
        }
    }
}

handler.help = ['setabrir']
handler.tags = ['grupo']
handler.command = ['setabrir']
handler.all = true
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler