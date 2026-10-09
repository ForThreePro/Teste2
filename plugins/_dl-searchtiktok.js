import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN EDITION* 🦇\n👻 _Powered by StellarWA_ 🕯️`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Ingresa lo que quieres buscar\n\nEjemplo:\n*${usedPrefix + command} Bad Bunny*` + footer, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`https://api.stellarwa.xyz/search/tiktok?query=${encodeURIComponent(text)}&key=proyectsV2`)
    let json = await res.json()

    let data = json.result
    if (!data || !data.length) throw new Error('Sin resultados')

    let v = data[0] // Solo el primero
    let videoUrl = v.dl
    let title = v.title || 'Sin título'

    if (!videoUrl) throw new Error('No se pudo obtener el video')

    let caption = head + `\n‧˚꒰🦇୭ *TT SEARCH - HALLOWEEN* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *Título:* ${title.slice(0, 90)}\n`
    caption += `꒰ 🔍 ꒱ *Query:* ${text}\n`
    caption += `꒰ 🆔 ꒱ *ID:* ${v.id}\n`
    caption += `꒰ 📦 ꒱ *Resultado:* 1/1\n`
    caption += footer

    await conn.sendFile(m.chat, videoUrl, 'ttsearch.mp4', caption, m)
    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error al buscar *${text}*\n\n> ${e.message}` + footer, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler