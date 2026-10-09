import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Bad Bunny*` + footer, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`https://api.stellarwa.xyz/search/tiktok?query=${encodeURIComponent(text)}&key=proyectsV2`)
    let json = await res.json()

    let data = json.result || []
    if (!data.length) throw new Error('Sin resultados')

    // RANDOM - elige uno al azar de los resultados
    let v = data[Math.floor(Math.random() * data.length)]
    let videoUrl = v.dl
    let title = v.title || 'Sin título'

    if (!videoUrl) throw new Error('No se pudo obtener el video')

    let caption = head + `\n‧˚꒰🦇୭ *TT SEARCH - RANDOM* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *Título:* ${title.slice(0, 90)}\n`
    caption += `꒰ 🔍 ꒱ *Query:* ${text}\n`
    caption += `꒰ 🆔 ꒱ *ID:* ${v.id}\n`
    caption += `꒰ 🎲 ꒱ *Random:* ${data.length} videos encontrados\n`
    caption += footer

    await conn.sendFile(m.chat, videoUrl, 'ttsearch.mp4', caption, m)
    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message}` + footer, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler