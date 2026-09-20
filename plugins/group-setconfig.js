import crypto from 'crypto'

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    if (command === 'setabrir') {
        if (!m.quoted) return m.reply('🍕 Responde a un sticker con .setabrir')
        try {
            let q = m.quoted
            let fileSha256 = q.msg?.fileSha256 || q.message?.stickerMessage?.fileSha256
            if (!fileSha256) {
                let buffer = await q.download()
                fileSha256 = crypto.createHash('sha256').update(buffer).digest()
            }
            let hash = Buffer.from(fileSha256).toString('base64')
            chat.stickerAbrir = hash
            console.log('[SETABRIR] Guardado:', hash)
            return m.reply(`✅ *STICKER DE ABRIR GUARDADO* 🟢\nHash: ${hash.slice(0,10)}...\n\nAhora cierra el grupo y manda ese sticker`)
        } catch (e) {
            console.log(e)
            return m.reply(`❌ Error: ${e.message}`)
        }
    }
}

// ESTA PARTE ES LA QUE ABRE EL GRUPO - SE EJECUTA SIEMPRE
handler.before = async function(m, { conn }) {
    if (m.mtype !== 'stickerMessage') return
    if (!m.isGroup) return
    if (!global.db.data.chats[m.chat]?.stickerAbrir) return

    try {
        let chat = global.db.data.chats[m.chat]
        let fileSha256 = m.msg?.fileSha256 || m.message?.stickerMessage?.fileSha256
        if (!fileSha256) return
        let hash = Buffer.from(fileSha256).toString('base64')

        console.log('[CHECK] Recibido:', hash.slice(0,10), '| Guardado:', chat.stickerAbrir.slice(0,10), '| Igual:', hash === chat.stickerAbrir)

        if (hash === chat.stickerAbrir) {
            console.log('[ABRIENDO GRUPO CON STICKER]')
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            await conn.sendMessage(m.chat, { 
                text: `🔓 *GRUPO ABIERTO CON STICKER* 🟢\nPor: @${m.sender.split('@')[0]}`, 
                mentions: [m.sender] 
            })
        }
    } catch (e) {
        console.log('[ERROR BEFORE]:', e)
    }
}

handler.help = ['setabrir']
handler.tags = ['grupo']
handler.command = ['setabrir']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler