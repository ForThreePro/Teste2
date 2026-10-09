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
    let url = `${api.url}?query=${encodeURIComponent(text)}&key=${api.key}`
    console.log('TTSEARCH URL:', url)
    
    let res = await fetch(url)
    let json = await res.json()
    console.log('TTSEARCH JSON:', JSON.stringify(json).slice(0, 1000))

    // Detecta cualquier formato posible
    let data = json.result || json.data || json.results || json.videos || []
    if (data.data) data = data.data
    if (data.videos) data = data.videos
    if (data.result) data = data.result
    
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) data = Object.values(data)
      else data = [data]
    }

    // Filtra solo objetos válidos
    data = data.filter(v => v && (v.url || v.link || v.videoUrl || v.play || v.title))

    if (!data.length) {
      await react('💀')
      return conn.reply(m.chat, head + `\n💀 No se encontraron resultados para *${text}*\n\nRespuesta API: ${JSON.stringify(json).slice(0,500)}`, m)
    }

    let list = data.slice(0, 10)

    let txt = head + `\n🎃 *TT SEARCH* 👻\n🔍 *Query:* ${text}\n📦 *Resultados:* ${list.length}\n\n`

    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      let title = v.title || v.desc || v.description || v.caption || v.text || 'Sin título'
      let author = v.author || v.username || v.nickname || v.creator || v.author_name || 'TikTok'
      let videoUrl = v.url || v.link || v.videoUrl || v.play || v.video_url || v.downloadUrl || ''

      txt += `*${i+1}. ${String(title).slice(0,70)}*\n`
      txt += `👻 Autor: ${author}\n`
      if (videoUrl) txt += `🔗 ${videoUrl}\n`
      txt += `\n`
    }

    txt += `━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN* 🦇`
    
    await conn.reply(m.chat, txt, m)
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