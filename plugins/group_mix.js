import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, usedPrefix, text, command, isAdmin, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n꒰ ◞⁺⊹ ．${fecha}\n`

  if (!isAdmin && !isOwner) { await react('❌'); return m.reply(head+`\n❌ Solo admins`, m) }

  if (['resetlink','revokelink'].includes(command)) {
    try {
      await react('🔗')
      await conn.groupRevokeInvite(m.chat)
      let code = await conn.groupInviteCode(m.chat)
      await react('✅')
      return m.reply(head+`\n🔗 Nuevo link:\nhttps://chat.whatsapp.com/${code}`, m)
    } catch { await react('❌'); return m.reply(head+`\n❌ Necesito ser admin`, m) }
  }

  if (['setname','setgroupname'].includes(command)) {
    if (!text) { await react('❌'); return m.reply(head+`\n❌ Usa: *${usedPrefix}setname Nuevo nombre*`, m) }
    try { await react('⏳'); await conn.groupUpdateSubject(m.chat, text); await react('✅'); return m.reply(head+`\n✅ Nombre cambiado a: *${text}*`, m) }
    catch { await react('❌'); return m.reply(head+`\n❌ Error`, m) }
  }

  if (['setdesc','setgroupdesc'].includes(command)) {
    if (!text) { await react('❌'); return m.reply(head+`\n❌ Usa: *${usedPrefix}setdesc Nueva descripción*`, m) }
    try { await react('⏳'); await conn.groupUpdateDescription(m.chat, text); await react('✅'); return m.reply(head+`\n✅ Descripción actualizada`, m) }
    catch { await react('❌'); return m.reply(head+`\n❌ Error`, m) }
  }

  if (['setfoto','setppgroup','setppgc'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg||q).mimetype || ''
    try {
      await react('⏳')
      if (text && /https?:\/\//.test(text)) await conn.updateProfilePicture(m.chat, { url: text })
      else if (/image/.test(mime)) await conn.updateProfilePicture(m.chat, await q.download())
      else { await react('❌'); return m.reply(head+`\n❌ Responde a una imagen o pasa un link`, m) }
      await react('✅'); return m.reply(head+`\n✅ Foto actualizada`, m)
    } catch { await react('❌'); return m.reply(head+`\n❌ Error`, m) }
  }
}

handler.help = ['resetlink','setname','setdesc','setfoto']
handler.tags = ['group']
handler.command = ['resetlink','revokelink','setname','setgroupname','setdesc','setgroupdesc','setfoto','setppgroup','setppgc']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler