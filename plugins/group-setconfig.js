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
        if (!m.quoted || m.quoted.mtype !== 'stickerMessage') return m.reply('🍕 Responde a un sticker con .setabrir o .setcerrar')
        try {
            let buffer = await m.quoted.download()
            let hash = crypto.createHash('sha256').update(buffer).digest('hex')
            if (command === 'setabrir') {
                chat.stickerAbrir = hash
                await react('✅')
                return m.reply(`✅ *STICKER PARA ABRIR GUARDADO* 🟢\n${hash.slice(0,15)}...`)
            } else {
                chat.stickerCerrar = hash
                await react('✅')
                return m.reply(`✅ *STICKER PARA CERRAR GUARDADO* 🔴\n${hash.slice(0,15)}...`)
            }
        } catch (e) {
            console.log(e)
            return m.reply(`❌ Error: ${e.message}`)
        }
    }

    // SI MANDA UN STICKER, VERIFICAR SI ES EL CONFIGURADO
    if (m.mtype === 'stickerMessage') {
        try {
            if (!chat.stickerAbrir && !chat.stickerCerrar) return
            let buffer = await m.download()
            let hash = crypto.createHash('sha256').update(buffer).digest('hex')
            
            console.log('STICKER RECIBIDO:', hash.slice(0,10), 'ABRIR:', chat.stickerAbrir?.slice(0,10), 'CERRAR:', chat.stickerCerrar?.slice(0,10))

            if (chat.stickerAbrir && hash === chat.stickerAbrir) command = 'abrir'
            else if (chat.stickerCerrar && hash === chat.stickerCerrar) command = 'cerrar'
            else return
        } catch (e) {
            console.log('Error sticker:', e)
            return
        }
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
handler.all = true
handler.admin = false
handler.botAdmin = false
handler.group = true

export default handler