import moment from 'moment-timezone'
import crypto from 'crypto'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    // SETEAR STICKERS
    if (command === 'setabrir' || command === 'setcerrar') {
        if (!m.quoted || m.quoted.mtype!== 'stickerMessage') return m.reply('🍕 Responde a un sticker con.setabrir o.setcerrar')
        let buffer = await conn.downloadMediaMessage(m.quoted)
        let hash = crypto.createHash('sha256').update(buffer).digest('hex')
        if (command === 'setabrir') {
            chat.stickerAbrir = hash
            await react('✅')
            return m.reply(`✅ Sticker para ABRIR guardado 🟢`)
        } else {
            chat.stickerCerrar = hash
            await react('✅')
            return m.reply(`✅ Sticker para CERRAR guardado 🔴`)
        }
    }

    // SI MANDA UN STICKER, VERIFICAR SI ES EL CONFIGURADO (SIN BEFORE)
    if (m.mtype === 'stickerMessage') {
        try {
            let buffer = await conn.downloadMediaMessage(m)
            let hash = crypto.createHash('sha256').update(buffer).digest('hex')
            let groupMetadata = await conn.groupMetadata(m.chat)
            let sender = groupMetadata.participants.find(p => p.id === m.sender)
            if (sender?.admin!== 'admin' && sender?.admin!== 'superadmin') return

            if (chat.stickerAbrir && hash === chat.stickerAbrir) command = 'abrir'
            else if (chat.stickerCerrar && hash === chat.stickerCerrar) command = 'cerrar'
            else return // no es el sticker configurado
        } catch { return }
    }

    // ABRIR / CERRAR
    let isClose, estado, icon, reactEmoji
    if (command === 'abrir') {
        isClose = 'not_announcement'; estado = 'ABIERTO'; icon = '🔓'; reactEmoji = '🔓'
    }
    if (command === 'cerrar') {
        isClose = 'announcement'; estado = 'CERRADO'; icon = '🔒'; reactEmoji = '🔒'
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

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })
    } catch (e) {
        await react('❌')
        m.reply('❌ No soy admin')
    }
}

handler.help = ['abrir', 'cerrar', 'setabrir', 'setcerrar']
handler.tags = ['grupo']
handler.command = ['abrir', 'cerrar', 'setabrir', 'setcerrar']
handler.group = true

export default handler