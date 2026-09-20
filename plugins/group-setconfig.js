let handler = async (m, { conn, command }) => {
  if (!m.quoted) return m.reply(`🍕 *Responde a un sticker para configurarlo*\n\nEj:\nResponder a un sticker con:\n.setabrir - ese sticker ABRE el grupo\n.setcerrar - ese sticker CIERRA el grupo`)

  let q = m.quoted
  if (q.mtype !== 'stickerMessage') return m.reply('🍕 Eso no es un sticker')

  let hash = q.fileSha256?.toString('base64') || q.msg?.fileSha256?.toString('base64')
  if (!hash) return m.reply('🍕 No pude leer el sticker')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  if (command == 'setabrir' || command == 'setopen') {
    chat.openSticker = hash
    return conn.reply(m.chat, `✅ *STICKER PARA ABRIR GUARDADO* 🟢\n\nYa se guardó en database.json, no se borra aunque reinicies`, m)
  }

  if (command == 'setcerrar' || command == 'setclose') {
    chat.closeSticker = hash
    return conn.reply(m.chat, `✅ *STICKER PARA CERRAR GUARDADO* 🔴\n\nYa se guardó en database.json, no se borra aunque reinicies`, m)
  }
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup) return
  if (m.mtype !== 'stickerMessage') return
  if (!isAdmin) return
  if (!isBotAdmin) return

  let hash = m.fileSha256?.toString('base64') || m.msg?.fileSha256?.toString('base64')
  if (!hash) return

  let chat = global.db.data.chats[m.chat]
  if (!chat) return

  if (chat.openSticker && hash === chat.openSticker) {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    await conn.sendMessage(m.chat, { text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪\n\n🟢 *GRUPO ABIERTO*` }, { quoted: m })
  }

  if (chat.closeSticker && hash === chat.closeSticker) {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    await conn.sendMessage(m.chat, { text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪\n\n🔴 *GRUPO CERRADO*` }, { quoted: m })
  }
}

handler.help = ['setabrir', 'setcerrar']
handler.tags = ['group']
handler.command = ['setabrir', 'setopen', 'setcerrar', 'setclose']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler