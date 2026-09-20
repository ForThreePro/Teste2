import crypto from 'crypto'

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    if (command === 'setabrir' || command === 'setcerrar') {
        if (!m.quoted) return m.reply(`🍕 Responde a un sticker con .${command}`)
        try {
            let q = m.quoted
            let fileSha256 = q.msg?.fileSha256 || q.message?.stickerMessage?.fileSha256 || q.fileSha256
            if (!fileSha256) {
                let buffer = await q.download()
                fileSha256 = crypto.createHash('sha256').update(buffer).digest()
            }
            let hash = Buffer.from(fileSha256).toString('base64')

            if (command === 'setabrir') {
                chat.stickerAbrir = hash
                console.log('[SETABRIR] Guardado:', hash)
                return m.reply(`✅ *STICKER ABRIR GUARDADO* 🟢\n${hash.slice(0,12)}...`)
            } else {
                chat.stickerCerrar = hash
                console.log('[SETCERRAR] Guardado:', hash)
                return m.reply(`✅ *STICKER CERRAR GUARDADO* 🔴\n${hash.slice(0,12)}...`)
            }
        } catch (e) {
            console.log(e)
            return m.reply(`❌ Error: ${e.message}`)
        }
    }
}

// ESTE ES EL QUE DETECTA SIEMPRE, AUNQUE ESTE CERRADO
handler.before = async function(m, { conn }) {
    if (m.mtype !== 'stickerMessage') return
    if (!m.isGroup) return
    if (!global.db.data.chats[m.chat]) return
    let chat = global.db.data.chats[m.chat]
    if (!chat.stickerAbrir && !chat.stickerCerrar) return

    try {
        let fileSha256 = m.msg?.fileSha256 || m.message?.stickerMessage?.fileSha256
        if (!fileSha256) return
        let hash = Buffer.from(fileSha256).toString('base64')

        if (chat.stickerAbrir && hash === chat.stickerAbrir) {
            console.log('[STICKER] ABRIENDO GRUPO')
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            await conn.sendMessage(m.chat, { 
                text: `🔓 *GRUPO ABIERTO* 🟢\nPor: @${m.sender.split('@')[0]}`, 
                mentions: [m.sender] 
            })
        } else if (chat.stickerCerrar && hash === chat.stickerCerrar) {
            console.log('[STICKER] CERRANDO GRUPO')
            await conn.groupSettingUpdate(m.chat, 'announcement')
            await conn.sendMessage(m.chat, { 
                text: `🔒 *GRUPO CERRADO* 🔴\nPor: @${m.sender.split('@')[0]}`, 
                mentions: [m.sender] 
            })
        }
    } catch (e) {
        console.log('[ERROR STICKER]:', e)
    }
}

handler.help = ['setabrir', 'setcerrar']
handler.tags = ['grupo']
handler.command = ['setabrir', 'setcerrar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler