import { webp2mp4 } from '../lib/webp2mp4.js'
import { toAudio } from '../lib/converter.js'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  if (['tovid', 'tovideo'].includes(command)) {
    if (!m.quoted || !/webp/.test(m.quoted.mimetype || '')) {
      await react('❌')
      return conn.reply(m.chat, head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ USO ：✿ 。\n\n❌ Responde a un *sticker*` + foot, m)
    }
    try {
      await react('⏳')
      let media = await m.quoted.download()
      let out = await webp2mp4(media)
      await react('❄️')
      await conn.sendFile(m.chat, out, 'video.mp4', head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ COMPLETADO ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ❄️ —˙𖦹.꒷\n\n❄️ *Tovideo completado*` + foot, m)
    } catch { await react('❌'); await conn.reply(m.chat, head + `\n❌ No se pudo convertir` + foot, m) }
  }

  if (['tomp3', 'toaudio'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) { await react('❌'); return conn.reply(m.chat, head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ USO ：✿ 。\n\n❌ Responde a un *video o audio*` + foot, m) }
    try {
      await react('⏳')
      let media = await q.download?.()
      let audio = await toAudio(media, 'mp4')
      await react('❄️')
      await conn.sendFile(m.chat, audio.data, 'audio.mp3', head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ COMPLETADO ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ❄️ —˙𖦹.꒷\n\n❄️ *Audio extraído*` + foot, m, null, { mimetype: 'audio/mp4' })
    } catch { await react('❌'); await conn.reply(m.chat, head + `\n❌ No se pudo convertir a audio` + foot, m) }
  }

  if (['toimg', 'simg'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    if (!((q.mimetype || '').includes('webp'))) { await react('❌'); return conn.reply(m.chat, head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ USO ：✿ 。\n\n❌ Responde a un *sticker*` + foot, m) }
    try {
      await react('⏳')
      let media = await q.download()
      await react('❄️')
      await conn.sendMessage(m.chat, { image: media, caption: head + `\n⤷ ┇ 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐑 ﹒ COMPLETADO ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ❄️ —˙𖦹.꒷\n\n❄️ *Sticker a imagen*` + foot }, { quoted: m })
    } catch { await react('❌'); await conn.reply(m.chat, head + `\n❌ No se pudo convertir` + foot, m) }
  }
}

handler.help = ['tovid', 'tomp3', 'toimg']
handler.tags = ['tools']
handler.command = ['tovid', 'tovideo', 'tomp3', 'toaudio', 'toimg', 'stickerimg', 'simg']
export default handler