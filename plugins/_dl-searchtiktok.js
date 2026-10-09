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
    let txt = await res.text()
    if (txt.startsWith('<!DOCTYPE')) throw new Error('Stellar caída')
    let json = JSON.parse(txt)

    let videos = json.data?.videos || json.result?.videos || json.result || []
    videos = videos.filter(v => v.dl && v.dl.includes('pinimg'))
    if (!videos.length) throw new Error('Sin videos')

    let v = videos.sort((a,b) => (b.likes||0)-(a.likes||0))[0]
    let dl = v.dl

    let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration} | ❤️ ${v.likes}\n` + footer

    // FIX quoqued - no uses sendFile, usa sendMessage con url directa
    await conn.sendMessage(m.chat, {
      video: { url: dl },
      mimetype: 'video/mp4',
      caption: caption,
      fileName: `pinvid-${text}.mp4`
    }, { quoted: m })

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    // Si falla por quoted, intenta sin quoted
    try {
      let res = await fetch(`${BASE}/search/pinterestvideo?query=${encodeURIComponent(text)}&key=${API_KEY}`)
      let json = await res.json()
      let dl = json.data.videos[0].dl
      await conn.sendMessage(m.chat, { video: { url: dl }, mimetype: 'video/mp4', caption: `🎃 ${text}` })
      await react('🎃')
    } catch {}
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message}` + footer, m)
  }
}

handler.help = ['pinvid']
handler.tags = ['search']
handler.command = ['pinvid','pinterestvideo','pinterestvid']

export default handler