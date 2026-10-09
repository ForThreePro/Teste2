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
        'Referer': 'https://www.pinterest.com/',
        'Accept': '*/*'
      }
    })
    if (!r.ok) throw new Error(`Error descargando ${r.status}`)
    return await r.buffer()
  }

  try {
    await react('🔍')
    let res = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let txt = await res.text()
    if (txt.trim().startsWith('<!DOCTYPE')) throw new Error('Stellar devolvió HTML')
    let json = JSON.parse(txt)

    let result = json.data || json.result || json
    let data = Array.isArray(result)? result : (result.videos || result.pins || result.images || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`Sin resultados para "${text}"`)

    // ===== PINTEREST 5 FOTOS =====
    if (type === 'pinterest') {
      let images = []
      for (let o of data) {
        let u = o.dl || o.image || o.img || o.url
        if (u && typeof u === 'string' && u.startsWith('http')) images.push(u)
      }
      images = [...new Set(images)].slice(0, 5)
      if (!images.length) throw new Error(`No hay imágenes para "${text}"`)

      for (let i = 0; i < images.length; i++) {
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} resultados\n` + footer : `꒰ 🦇 ꒱ ${text} ${i+1}/${images.length}`
        try {
          let buf = await fetchBuffer(images[i])
          await conn.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: m })
        } catch {
          await conn.sendFile(m.chat, images[i], `pin-${i}.jpg`, cap, m)
        }
        await new Promise(r => setTimeout(r, 500))
      }
      await react('🎃')
      return
    }

    // ===== PINVID FIX BUFFER =====
    if (type === 'pinterestvideo') {
      let videos = data.filter(v => v.dl && v.dl.startsWith('http'))
      if (!videos.length) throw new Error('No hay videos con dl')
      let v = videos.sort((a,b) => (b.likes||0)-(a.likes||0))[0]

      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration || ''} | ❤️ ${v.likes || 0}\n` + footer

      let buffer = await fetchBuffer(v.dl)
      await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap, fileName: 'pinvid.mp4' }, { quoted: m })
      await react('🎃')
      return
    }

    // ===== TTSEARCH FIX BUFFER =====
    if (type === 'tiktok') {
      let v = data[0]
      let mediaUrl = v.dl || v.play || v.hdplay || v.video || v.url
      if (!mediaUrl) throw new Error('No se pudo extraer URL TT: ' + JSON.stringify(v).slice(0,300))

      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || v.desc || text).slice(0,80)}*\n` + footer

      try {
        let buffer = await fetchBuffer(mediaUrl)
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap }, { quoted: m })
      } catch {
        // fallback directo si falla buffer
        await conn.sendMessage(m.chat, { video: { url: mediaUrl }, mimetype: 'video/mp4', caption: cap }, { quoted: m })
      }
      await react('🎃')
      return
    }

    // ===== APK =====
    if (type === 'apk') {
      let v = data[0]
      let mediaUrl = v.dl || v.url || v.download
      let title = v.name || v.title || text
      let icon = v.icon || v.thumbnail
      let cap = head + `\n‧˚꒰🦇୭ *APK - ${title}* 📦🎃\n\n꒰ 🔍 ꒱ ${text}\n` + footer

      if (icon) {
        try {
          let buf = await fetchBuffer(icon)
          await conn.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: m })
        } catch { await conn.reply(m.chat, cap, m) }
      } else await conn.reply(m.chat, cap, m)

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