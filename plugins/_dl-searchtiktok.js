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
  if (['apk','apksearch'].includes(command)) type = 'apk'

  try {
    await react('🔍')

    // ========= PINTEREST REAL - FIX DEFINITIVO =========
    if (type === 'pinterest') {
      let images = []

      // Intento 1: api siputzx (pinterest real)
      try {
        let r = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`)
        let j = await r.json()
        let d = j.data || j.result || j.images || []
        if (Array.isArray(d)) images = d.map(x => typeof x === 'string'? x : x.url || x.image || x.src).filter(u => u && u.startsWith('http'))
      } catch {}

      // Intento 2: dorratz api
      if (!images.length) {
        try {
          let r = await fetch(`https://api.dorratz.com/api/pinterest?query=${encodeURIComponent(text)}`)
          let j = await r.json()
          let d = j.result || j.data || []
          if (Array.isArray(d)) images = d.map(x => typeof x === 'string'? x : x.image || x.url).filter(u => u && u.startsWith('http'))
        } catch {}
      }

      // Intento 3: Stellar como ultimo recurso
      if (!images.length) {
        try {
          let r = await fetch(`${BASE}/search/pinterest?query=${encodeURIComponent(text)}&key=${API_KEY}`)
          let j = await r.json()
          let d = j.result || j.data || []
          if (Array.isArray(d)) {
            images = d.map(o => o.image || o.img || o.src || o.url).filter(u => typeof u === 'string' && u.startsWith('http'))
          }
        } catch {}
      }

      if (!images.length) throw new Error(`No se encontró nada para "${text}" en Pinterest`)

      // Envía 4 imágenes exactas del query
      let toSend = images.slice(0, 4)
      for (let i = 0; i < toSend.length; i++) {
        let url = toSend[i]
        let caption = head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ *${text}* (${i+1}/${toSend.length})\n` + footer
        await conn.sendFile(m.chat, url, `pin-${i}.jpg`, caption, m)
        await new Promise(r => setTimeout(r, 600))
      }
      await react('🎃')
      return
    }

    // ========= RESTO =========
    let apiUrl = `${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`
    let res = await fetch(apiUrl)
    let json = await res.json()
    let result = json.result || json.data || json
    let data = []
    if (Array.isArray(result)) data = result
    else if (result.videos) data = result.videos
    else if (result.pins) data = result.pins
    else if (result.images) data = result.images
    else data = [result]

    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`No hay resultados para "${text}"`)

    const getUrl = (obj) => {
      let d = obj.dl || obj.video || obj.videoUrl || obj.url || obj.download || obj.image || obj.img
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') {
        let d2 = d.url || d.src
        if (typeof d2 === 'string' && d2.startsWith('http')) return d2
      }
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http') && (obj[k].includes('.mp4') || obj[k].includes('.apk') || obj[k].includes('pinimg'))) return obj[k]
      return null
    }

    if (type === 'pinterestvideo') {
      let v = data[0]
      let mediaUrl = getUrl(v)
      if (!mediaUrl) throw new Error('No video')
      let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(v.title||text).slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, caption, m)
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = data[0]
      let mediaUrl = getUrl(v)
      let caption = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(v.title||text).slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, caption, m)
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = data[0]
      let mediaUrl = getUrl(v)
      let icon = v.icon || v.thumbnail
      let captionApk = head + `\n‧˚꒰🦇୭ *APK - ${text}* 📦🎃\n\n꒰ 👻 ꒱ *${v.name||text}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      if (icon) {
        try { await conn.sendFile(m.chat, icon, 'icon.jpg', captionApk, m) } catch { await conn.reply(m.chat, captionApk, m) }
      } else await conn.reply(m.chat, captionApk, m)
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${v.name||text}.apk` }, { quoted: m })
      await react('🎃')
      return
    }

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message}` + footer, m)
  }
}

handler.help = ['pinterest','pinvid','ttsearch','apk']
handler.tags = ['search']
handler.command = ['pinterest','pin','pinterestsearch','pinvid','pinterestvideo','pinterestvid','ttsearch','tiktoksearch','ttss','apk','apksearch']

export default handler