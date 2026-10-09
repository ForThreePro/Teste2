import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const api = {
  url: 'https://api.stellarwa.xyz/search/tiktok',
  key: 'proyectsV2'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Bad Bunny*`, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`${api.url}?query=${encodeURIComponent(text)}&key=${api.key}`)
    let json = await res.json()

    // Formato real: { status:true, result:[ {title, id, dl} ] }
    let data = json.result || json.data || []
    if (!Array.isArray(data) || !data.length) throw new Error('Sin resultados')

    let list = data.slice(0, 2)

    await conn.reply(m.chat, head + `\n🎃 *TT SEARCH* 👻\n🔍 Query: ${text}\n📦 Enviando ${list.length} videos...`, m)

    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      let videoUrl = v.dl || v.play || v.video || v.url
      let title = v.title || 'Sin título'

      if (!videoUrl) continue

      let caption = `‧˚꒰🎃୭ *TT SEARCH #${i+1}* 🦇\n\n👻 *Título:* ${title.slice(0,90)}\n🆔 *ID:* ${v.id || 'N/A'}\n🔍 *Query:* ${text}\n\n━━━━━━━━━━━\n🎃 *LUX X YALLICO*`

      await conn.sendFile(m.chat, videoUrl, `ttsearch_${i+1}.mp4`, caption, m, null, { asDocument: false })
      await new Promise(r => setTimeout(r, 1200))
    }

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message || e}`, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler