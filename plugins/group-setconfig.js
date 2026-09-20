let handler = async (m, { conn, command }) => {
  if (!m.quoted) return m.reply(`🍕 Responde a un sticker con:\n.setabrir\n.setcerrar`)
  
  let q = m.quoted
  if (!q || q.mtype !== 'stickerMessage' && q.type !== 'stickerMessage') {
    return m.reply('🍕 Eso no es un sticker')
  }

  // Saca el hash de donde sea que venga
  let hash = q.fileSha256 || q.msg?.fileSha256 || q.message?.stickerMessage?.fileSha256
  if (hash) hash = hash.toString('base64') || Buffer.from(hash).toString('base64')
  
  if (!hash) return m.reply('🍕 No pude leer el hash del sticker, manda el sticker de nuevo')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  if (command == 'setabrir' || command == 'setopen') {
    chat.openSticker = hash
    return conn.reply(m.chat, `✅ *GUARDADO PARA ABRIR* 🟢\nHash: ${hash.slice(0, 20)}...`, m)
  }
  if (command == 'setcerrar' || command == 'setclose') {
    chat.closeSticker = hash
    return conn.reply(m.chat, `✅ *GUARDADO PARA CERRAR* 🔴\nHash: ${hash.slice(0, 20)}...`, m)
  }
}

export async function before(m, { conn, participants, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup) return
    if (m.mtype !== 'stickerMessage') return

    let chat = global.db.data.chats[m.chat]
    if (!chat || (!chat.openSticker && !chat.closeSticker)) return

    // SACAR HASH DEL STICKER ENVIADO - 3 FORMAS
    let hash = m.fileSha256 || m.msg?.fileSha256 || m.message?.stickerMessage?.fileSha256
    if (!hash) return
    
    let hashStr = typeof hash === 'string' ? hash : hash.toString('base64') || Buffer.from(hash).toString('base64')

    // Verificación de admin real (por si isAdmin falla)
    let senderAdmin = isAdmin || participants.find(p => p.id === m.sender)?.admin
    if (!senderAdmin) return

    if (!isBotAdmin) {
      let botId = conn.user.jid
      let botAdmin = participants.find(p => p.id === botId)?.admin
      if (!botAdmin) return
    }

    console.log('[STICKER GROUP] Hash recibido:', hashStr.slice(0, 20))
    console.log('[STICKER GROUP] Hash abrir:', chat.openSticker?.slice(0, 20))
    console.log('[STICKER GROUP] Hash cerrar:', chat.closeSticker?.slice(0, 20))

    if (chat.openSticker && hashStr === chat.openSticker) {
      console.log('ABRIENDO GRUPO')
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      await conn.reply(m.chat, `🟢 *GRUPO ABIERTO* 🍕\nPor sticker de @${m.sender.split('@')[0]}`, m, { mentions: [m.sender] })
    }

    if (chat.closeSticker && hashStr === chat.closeSticker) {
      console.log('CERRANDO GRUPO')
      await conn.groupSettingUpdate(m.chat, 'announcement')
      await conn.reply(m.chat, `🔴 *GRUPO CERRADO* 🍕\nPor sticker de @${m.sender.split('@')[0]}`, m, { mentions: [m.sender] })
    }

  } catch (e) {
    console.log('[STICKER GROUP ERROR]', e)
  }
}

handler.help = ['setabrir', 'setcerrar']
handler.tags = ['group']
handler.command = ['setabrir', 'setopen', 'setcerrar', 'setclose', 'setabrirgrupo', 'setcerrargrupo']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler