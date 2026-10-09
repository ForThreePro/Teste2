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

  try {
    await react('⏳')

    const safeJSON = async (url) => {
      let r = await fetch(url)
      let t = await r.text()
      if (t.trim().startsWith('<!DOCTYPE') || t.trim().startsWith('<html')) throw new Error('API Stellar devolvió HTML')
      return JSON.parse(t)
    }

    let json = await safeJSON(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let result = json.result || json.data || json
    let data = []
    if (Array.isArray(result)) data = result
    else if (result.videos) data = result.videos
    else if (result.pins) data = result.pins
    else if (result.images) data = result.images
    else data = [result]
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error('Sin resultados')

    const getUrl = (obj) => {
      if (typeof obj === 'string' && obj.startsWith('http')) return obj
      let d = obj.dl || obj.video || obj.videoUrl || obj.url || obj.download || obj.image || obj.img || obj.src
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') {
        let d2 = d.url || d.src || d.image
        if (typeof d2 === 'string' && d2.startsWith('http')) return d2
      }
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http') && obj[k].includes('.mp4')) return obj[k]
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http') && obj[k].includes('pinimg')) return obj[k]
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k]
      return null
    }

    // ===== PINTEREST 5 FOTOS EN CARRUSEL =====
    if (type === 'pinterest') {
      let images = []
      for (let o of data) {
        let u = getUrl(o)
        if (u) images.push(u)
      }
      images = [...new Set(images)].filter(u => u.startsWith('http')).slice(0, 5)
      if (!images.length) throw new Error(`No hay imágenes para "${text}"`)

      for (let i = 0; i < images.length; i++) {
        let caption = i === 0
         ? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ *${text}* (${i+1}/${images.length})\n꒰ 🎲 ꒱ ${data.length} encontrados\n` + footer
          : `꒰ 🦇 ꒱ ${text} ${i+1}/${images.length}`
        await conn.sendFile(m.chat, images[i], `pinterest-${i}.jpg`, caption, m)
        await new Promise(r => setTimeout(r, 600))
      }
      await react('🎃')
      return
    }

    // ===== PINVID FIX - YA VIENE MP4 DIRECTO =====
    if (type === 'pinterestvideo') {
      let v = data[0]
      let mediaUrl = getUrl(v)
      if (!mediaUrl) throw new Error('No se pudo extraer URL de video')

      // Ya es mp4 directo de v1.pinimg.com, no necesita download
      let caption = head + `\n‧˚꒰🦇୭ *PINVID* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, caption, m)
      await react('🎃')
      return
    }

    // TTSEARCH y APK normal
    let v = data[Math.floor(Math.random() * data.length)]
    let title = v.title || v.name || text
    let mediaUrl = getUrl(v)
    if (!mediaUrl) throw new Error('No se pudo extraer URL')

    let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()}* 🎃\n\n꒰ 👻 ꒱ *${String(title).slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n꒰ 🎲 ꒱ ${data.length} encontrados\n` + footer

    if (type === 'tiktok') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.mp4`, caption, m)
    } else if (type === 'apk') {
      let icon = v.icon || v.thumbnail || v.image
      let size = v.size || ''
      let version = v.version || v.versionName || ''
      let captionApk = head + `\n‧˚꒰🦇୭ *APK DOWNLOAD* 📦🎃\n\n꒰ 👻 ꒱ *App:* ${title}\n`
      if (version) captionApk += `꒰ 🧟 ꒱ *Versión:* ${version}\n`
      if (size) captionApk += `꒰ 💀 ꒱ *Tamaño:* ${size}\n`
      captionApk += `꒰ 🔍 ꒱ ${text}\n` + footer
      if (icon) { try { await conn.sendFile(m.chat, icon, 'icon.jpg', captionApk, m) } catch { await conn.reply(m.chat, captionApk, m) } }
      else await conn.reply(m.chat, captionApk, m)
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${title.replace(/[^a-z0-9]/gi,'_')}.apk` }, { quoted: m })
    }

    await react('🎃')

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