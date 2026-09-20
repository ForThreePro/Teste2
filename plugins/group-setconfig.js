import crypto from 'crypto'

let handler = async (m, { conn, command }) => {
  if (!m.quoted) return m.reply(`🍕 *Responde a un sticker*\n\n.setabrir - ese sticker ABRIRÁ\n.setcerrar - ese sticker CERRARÁ`)

  let q = m.quoted
  if (q.mtype !== 'stickerMessage') return m.reply('🍕 Eso no es un sticker')

  try {
    let buffer = await q.download()
    let hash = crypto.createHash('sha256').update(buffer).digest('hex')

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]

    if (command == 'setabrir') {
      chat.stickerAbrir = hash
      return conn.reply(m.chat, `✅ *STICKER PARA ABRIR GUARDADO* 🟢\n${hash.slice(0, 20)}...\n\nAhora ese sticker ABRE el grupo`, m)
    }
    if (command == 'setcerrar') {
      chat.stickerCerrar = hash
      return conn.reply(m.chat, `✅ *STICKER PARA CERRAR GUARDADO* 🔴\n${hash.slice(0, 20)}...\n\nAhora ese sticker CIERRA el grupo`, m)
    }

  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup) return
  if (m.mtype !== 'stickerMessage') return

  let chat = global.db.data.chats[m.chat]
  if (!chat || (!chat.stickerAbrir && !chat.stickerCerrar)) return

  try {
    let groupMetadata = await conn.groupMetadata(m.chat)

    let sender = groupMetadata.participants.find(p => p.id === m.sender)
    let isSenderAdmin = sender?.admin === 'admin' || sender?.admin === 'superadmin'
    if (!isSenderAdmin) return

    let botJid = conn.user.jid
    let bot = groupMetadata.participants.find(p => p.id === botJid || p.id.includes(botJid.split('@')[0]))
    let isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
    if (!isBotAdmin) return

    let buffer = await m.download()
    let hash = crypto.createHash('sha256').update(buffer).digest('hex')

    console.log('[STICKER] Recibido:', hash.slice(0, 10), '| Abrir:', chat.stickerAbrir?.slice(0, 10), '| Cerrar:', chat.stickerCerrar?.slice(0, 10))

    if (chat.stickerAbrir && hash === chat.stickerAbrir) {
      if (groupMetadata.announce === true) {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        await conn.sendMessage(m.chat, { text: `🟢 *GRUPO ABIERTO*\n🍕 Por @${m.sender.split('@')[0]}`, mentions: [m.sender] }, { quoted: m })
      }
      return
    }

    if (chat.stickerCerrar && hash === chat.stickerCerrar) {
      if (groupMetadata.announce === false || !groupMetadata.announce) {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        await conn.sendMessage(m.chat, { text: `🔴 *GRUPO CERRADO*\n🍕 Por @${m.sender.split('@')[0]}`, mentions: [m.sender] }, { quoted: m })
      }
      return
    }

  } catch (e) {
    console.log('Error sticker abrir/cerrar:', e)
  }
}

handler.help = ['setabrir', 'setcerrar']
handler.tags = ['group']
handler.command = ['setabrir', 'setcerrar', 'setopen', 'setclose']
handler.admin = true
handler.group = true

export default handler