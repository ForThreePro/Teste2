import moment from 'moment-timezone'
import crypto from 'crypto'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    if (['verstickers','versticker','verabrir','vercerrar'].includes(command)) {
        let abrir = chat.stickerAbrir ? '✅ Guardado' : '❌ No guardado'
        let cerrar = chat.stickerCerrar ? '✅ Guardado' : '❌ No guardado'
        await react('❄️')
        return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ STICKERS ：✿ 。\n\n🟢 *ABRIR:* ${abrir}\n🔴 *CERRAR:* ${cerrar}\n\n💡 Para guardar responde a un sticker con *.setabrir* o *.setcerrar*` + foot)
    }

    if (command==='setabrir' || command==='setcerrar') {
        if (!m.quoted) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ USO ：✿ 。\n\n❌ Responde a un sticker con *.${command}*` + foot) }
        try {
            let q = m.quoted
            let fileSha256 = q.msg?.fileSha256 || q.message?.stickerMessage?.fileSha256
            if (!fileSha256) fileSha256 = crypto.createHash('sha256').update(await q.download()).digest()
            let hash = Buffer.from(fileSha256).toString('base64')
            if (command==='setabrir') chat.stickerAbrir = hash; else chat.stickerCerrar = hash
            await react('❄️')
            return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ STICKER ：✿ 。\n\n❄️ Sticker *${command==='setabrir'?'ABRIR 🟢':'CERRAR 🔴'}* guardado en el sistema` + foot)
        } catch { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Error en el sistema` + foot) }
    }

    if (['resetsticker','delsticker','clearsticker','delabrir','delcerrar'].includes(command)) {
        let b=[]
        if (['resetsticker','delsticker','clearsticker','delabrir'].includes(command) && chat.stickerAbrir) { delete chat.stickerAbrir; b.push('ABRIR') }
        if (['resetsticker','delsticker','clearsticker','delcerrar'].includes(command) && chat.stickerCerrar) { delete chat.stickerCerrar; b.push('CERRAR') }
        if (!b.length) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n⚠️ No hay stickers guardados` + foot) }
        await react('🗑️'); return m.reply(head+`\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ STICKER ：✿ 。\n\n🗑️ Eliminado: ${b.join(', ')}` + foot)
    }
}

handler.help = ['setabrir','setcerrar','resetsticker','verstickers']
handler.tags = ['grupo']
handler.command = ['setabrir','setcerrar','resetsticker','delsticker','clearsticker','delabrir','delcerrar','verstickers','versticker','verabrir','vercerrar']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler