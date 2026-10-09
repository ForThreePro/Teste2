import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const API_KEY = 'api-proyectsV2'
const BASE = 'https://api.stellarwa.xyz'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN* 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Naruto*` + footer, m)

  let type = ''
  if (['ttsearch','tiktoksearch','ttss'].includes(command)) type = 'tiktok'
  if (['pinterest','pin','pinterestsearch'].includes(command)) type = 'pinterest'
  if (['pinvid','pinterestvideo','pinterestvid'].includes(command)) type = 'pinterestvideo'
  if (['apk','apksearch','apkdl'].includes(command)) type = 'apk'

  const fetchBuffer = async (url) => {
    let r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.pinterest.com/'
      }
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.buffer()
  }

  try {
    await react('🔍')
    let res = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let txt = await res.text()
    if (txt.trim().startsWith('<!DOCTYPE')) throw new Error('Stellar HTML')
    let json = JSON.parse(txt)
    let result = json.data || json.result || json
    let data = Array.isArray(result)? result : (result.videos || result.pins || result.images || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`Sin resultados`)

    if (type === 'pinterest') {
      let images = data.map(o => o.dl || o.image || o.url).filter(u => u && u.startsWith('http'))
      images = [...new Set(images)].sort(() => Math.random() - 0.5).slice(0, 5)
      if (!images.length) throw new Error('No hay imágenes')

      for (let i = 0; i < images.length; i++) {
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} resultados\n` + footer : `꒰ 🦇 ꒱ ${i+1}/${images.length}`
        try {
          let buf = await fetchBuffer(images[i])
          await conn.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: m })
        } catch {
          await conn.sendFile(m.chat, images[i], `pin-${i}.jpg`, cap, m)
        }
        await new Promise(r => setTimeout(r, 400))
      }
      await react('🎃')
      return
    }

    if (type === 'pinterestvideo') {
      let videos = data.filter(v => v.dl && v.dl.startsWith('http'))
      if (!videos.length) throw new Error('No hay dl')

      // RANDOM para que no repita el mismo
      let v = videos[Math.floor(Math.random() * videos.length)]

      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration} | ❤️ ${v.likes}\n` + footer

      let buffer = await fetchBuffer(v.dl)

      // Intenta como video, si falla envía como documento (así nunca dice no disponible)
      try {
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap, fileName: 'pinvid.mp4' }, { quoted: m })
      } catch {
        await conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `pinvid-${text}.mp4`, caption: cap }, { quoted: m })
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = data[Math.floor(Math.random() * data.length)]
      let mediaUrl = v.dl || v.play || v.hdplay || v.video || v.url
      if (!mediaUrl) throw new Error('Sin URL TT')
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || v.desc || text).slice(0,80)}*\n` + footer
      let buffer = await fetchBuffer(mediaUrl)
      await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap }, { quoted: m })
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = data[0]
      let mediaUrl = v.dl || v.url || v.download
      let title = v.name || v.title || text
      let cap = head + `\n‧˚꒰🦇୭ *APK - ${title}* 📦🎃\n` + footer
      await conn.reply(m.chat, cap, m)
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${title.replace(/[^a-z0-9]/gi,'_')}.apk` }, { quoted: m })
      await react('🎃')
      return
    }

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error en *${type}*: ${e.message}` + footer, m)
  }
}

handler.help = ['pinterest','pinvid','ttsearch','apk']
handler.tags = ['search']
handler.command = ['pinterest','pin','pinterestsearch','pinvid','pinterestvideo','pinterestvid','ttsearch','tiktoksearch','ttss','apk','apksearch','apkdl']

export default handler