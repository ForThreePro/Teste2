import moment from 'moment-timezone'
import crypto from 'crypto'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // CONFIGURAR STICKERS
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
                await react('🟢')
                return m.reply(`✅ *STICKER ABRIR GUARDADO* 🟢\nAhora manda ese sticker para abrir`)
            } else {
                chat.stickerCerrar = hash
                await react('🔴')
                return m.reply(`✅ *STICKER CERRAR GUARDADO* 🔴\nAhora manda ese sticker para cerrar`)
            }
        } catch (e) {
            return m.reply(`❌ Error: ${e.message}`)
        }
    }

    let isClose, estado, icon, reactEmoji

    if (command === 'abrir') {
        isClose = 'not_announcement'
        estado = 'ABIERTO'
        icon = '🔓'
        reactEmoji = '🔓'
    } 
    if (command === 'cerrar') {
        isClose = 'announcement'
        estado = 'CERRADO'
        icon = '🔒'
        reactEmoji = '🔒'
    }
    if (!isClose) return

    try {
        await conn.groupSettingUpdate(m.chat, isClose)
        await react(reactEmoji)

        let msg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ${estado} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` ${icon} —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
${icon} ➛ Estado: *${estado}*
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏ 🍕
${command === 'cerrar' 
? '🔒 ➛ Solo admins pueden enviar mensajes' 
: '💬 ➛ Todos pueden enviar mensajes'}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
    } catch (e) {
        await react('❌')
        let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ No se pudo cambiar el estado
🔒 ➛ ¿Soy admin del grupo?

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

// DETECTA EL STICKER AUNQUE EL GRUPO ESTE CERRADO
handler.before = async function(m, { conn }) {
    if (m.mtype !== 'stickerMessage') return
    if (!m.isGroup) return
    if (!global.db.data.chats[m.chat]) return
    
    let chat = global.db.data.chats[m.chat]
    if (!chat.stickerAbrir && !chat.stickerCerrar) return

    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    try {
        let fileSha256 = m.msg?.fileSha256 || m.message?.stickerMessage?.fileSha256
        if (!fileSha256) return
        let hash = Buffer.from(fileSha256).toString('base64')

        let isClose, estado, icon, reactEmoji, cmd

        if (chat.stickerAbrir && hash === chat.stickerAbrir) {
            isClose = 'not_announcement'; estado = 'ABIERTO'; icon = '🔓'; reactEmoji = '🔓'; cmd = 'abrir'
        } else if (chat.stickerCerrar && hash === chat.stickerCerrar) {
            isClose = 'announcement'; estado = 'CERRADO'; icon = '🔒'; reactEmoji = '🔒'; cmd = 'cerrar'
        } else return

        await conn.groupSettingUpdate(m.chat, isClose)
        await react(reactEmoji)

        let msg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ${estado} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` ${icon} —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
${icon} ➛ Estado: *${estado}*
👑 ➛ Por: @${m.sender.split('@')[0]}

── *📝 NOTA* ╏ 🍕
${cmd === 'cerrar' 
? '🔒 ➛ Solo admins pueden enviar mensajes' 
: '💬 ➛ Todos pueden enviar mensajes'}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })

    } catch (e) {
        console.log('[ERROR STICKER]:', e)
    }
}

handler.help = ['abrir', 'cerrar', 'setabrir', 'setcerrar']
handler.tags = ['grupo']
handler.command = ['abrir', 'cerrar', 'setabrir', 'setcerrar']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler