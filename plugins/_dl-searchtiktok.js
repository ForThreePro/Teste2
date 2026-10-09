import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const API_KEY = 'proyectsV2'
const BASE = 'https://api.stellarwa.xyz'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN* 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Goku*` + footer, m)

  try {
    await react('🔍')
    let res = await fetch(`${BASE}/search/pinterestvideo?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let json = await res.json()
    let videos = json.data?.videos || json.result?.videos || []
    videos = videos.filter(v => v.dl && v.dl.startsWith('http'))
    if (!videos.length) throw new Error('Sin videos')
    
    let v = videos.sort((a,b) => (b.likes||0)-(a.likes||0))[0]
    let dl = v.dl

    let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration} | ❤️ ${v.likes}\n` + footer

    // FIX: Descargar con headers para evitar 403 de pinimg
    let vidRes = await fetch(dl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.pinterest.com/',
        'Accept': 'video/mp4,video/*,*/*'
      }
    })

    if (!vidRes.ok) throw new Error(`Pinterest bloqueó video ${vidRes.status}`)

    let buffer = await vidRes.buffer()

    // Enviar buffer, no URL
    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      caption: caption,
      fileName: `pinvid.mp4`
    }, { quoted: m })

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message}\n\nTip: prueba con otro término, a veces el mp4 de Pinterest expira` + footer, m)
  }
}

handler.help = ['pinvid']
handler.tags = ['search']
handler.command = ['pinvid','pinterestvideo','pinterestvid']

export default handler