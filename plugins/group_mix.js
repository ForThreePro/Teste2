import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, usedPrefix, text, command, isAdmin, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const reply = (txt) => conn.sendMessage(m.chat, { text: head + `\n${txt}` + footer }, { quoted: m })

  if (!isAdmin && !isOwner) { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Solo admins del sistema`) }

  if (['resetlink','revokelink'].includes(command)) {
    try {
      await react('🔗')
      await conn.groupRevokeInvite(m.chat)
      let code = await conn.groupInviteCode(m.chat)
      await react('❄️')
      return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ LINK ：✿ 。\n\n🔗 Nuevo link del grupo:\nhttps://chat.whatsapp.com/${code}`)
    } catch { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Necesito ser admin`) }
  }

  if (['setname','setgroupname'].includes(command)) {
    if (!text) { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ USO ：✿ 。\n\n❌ Usa: *${usedPrefix}setname Nuevo nombre*`) }
    try { await react('⏳'); await conn.groupUpdateSubject(m.chat, text); await react('❄️'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ NOMBRE ：✿ 。\n\n❄️ Nombre cambiado a: *${text}*`) }
    catch { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Error al cambiar nombre`) }
  }

  if (['setdesc','setgroupdesc'].includes(command)) {
    if (!text) { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ USO ：✿ 。\n\n❌ Usa: *${usedPrefix}setdesc Nueva descripción*`) }
    try { await react('⏳'); await conn.groupUpdateDescription(m.chat, text); await react('❄️'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ DESCRIPCIÓN ：✿ 。\n\n❄️ Descripción actualizada`) }
    catch { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Error al cambiar descripción`) }
  }

  if (['setfoto','setppgroup','setppgc'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    try {
      await react('⏳')
      if (text && /https?:\/\//.test(text)) {
        await conn.updateProfilePicture(m.chat, { url: text })
      } else if (/image/.test(mime)) {
        let img = await q.download()
        await conn.updateProfilePicture(m.chat, img)
      } else { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ USO ：✿ 。\n\n❌ Responde a una imagen o pasa un link`) }
      await react('❄️')
      return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ FOTO ：✿ 。\n\n❄️ Foto del grupo actualizada`)
    } catch { await react('❌'); return reply(`⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ERROR ：✿ 。\n\n❌ Error al actualizar foto`) }
  }
}

handler.help = ['resetlink','setname','setdesc','setfoto']
handler.tags = ['grupos']
handler.command = ['resetlink','revokelink','setname','setgroupname','setdesc','setgroupdesc','setfoto','setppgroup','setppgc']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler