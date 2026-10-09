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
      if (t.trim().startsWith('<!DOCTYPE') || t.trim().startsWith('<html')) throw new Error('Stellar devolvió HTML')
      return JSON.parse(t)
    }

    let json = await safeJSON(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let result = json.result || json.data || json
    let data = Array.isArray(result)? result : (result.videos || result.pins || result.images || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error('Sin resultados')

    // Extractor universal mejorado para Stellar
    const extractUrl = (obj) => {
      if (!obj) return null
      if (typeof obj === 'string' && obj.startsWith('http')) return obj
      // Tiktok Stellar usa estos keys
      const keys = ['dl','hdplay','play','video','videoUrl','download','url','media','src','image','img','thumbnail','icon']
      for (let k of keys) {
        if (obj[k] && typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k]
        if (obj[k] && typeof obj[k] === 'object') {
          for (let kk of keys) {
            if (obj[k][kk] && typeof obj[k][kk] === 'string' && obj[k][kk].startsWith('http')) return obj[k][kk]
          }
        }
      }
      // Busca cualquier http en el objeto
      let str = JSON.stringify(obj)
      let m1 = str.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/g)
      if (m1) return m1[0].replace(/\\/g,'')
      let m2 = str.match(/https?:\/\/[^"'\s\\]+pinimg[^"'\s\\]*/g)
      if (m2) return m2[0].replace(/\\/g,'')
      let m3 = str.match(/https?:\/\/[^"'\s\\]+\.jpg[^"'\s\\]*/g)
      if (m3) return m3[0].replace(/\\/g,'')
      let m4 = str.match(/https?:\/\/[^\s"']+/g)
      return m4? m4[0].replace(/\\/g,'') : null
    }

    if (type === 'pinterest') {
      let images = []
      for (let o of data) {
        let u = extractUrl(o)
        // Solo acepta pinimg para que no mande cualquier cosa
        if (u && (u.includes('pinimg') || u.includes('pinterest') || u.includes('.jpg') || u.includes('.png'))) images.push(u)
      }
      images = [...new Set(images)].slice(0, 5)
      if (!images.length) throw new Error(`No hay imágenes para "${text}" - API devolvió otra cosa`)

      for (let i = 0; i < images.length; i++) {
        let caption = i === 0
         ? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} resultados\n꒰ 🔍 ꒱ ${text}\n` + footer
          : `꒰ 🦇 ꒱ ${text} ${i+1}/${images.length}`
        await conn.sendFile(m.chat, images[i], `pin-${i}.jpg`, caption, m)
        await new Promise(r => setTimeout(r, 700))
      }
      await react('🎃')
      return
    }

    if (type === 'pinterestvideo') {
      let v = data[0]
      let mediaUrl = extractUrl(v)
      if (!mediaUrl) throw new Error('No se pudo extraer URL: ' + JSON.stringify(v).slice(0,400))

      // FIX: v1.pinimg.com bloquea sendFile directo, hay que bajar a buffer
      let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n` + footer
      try {
        let vid = await fetch(mediaUrl)
        let buf = await vid.buffer()
        await conn.sendFile(m.chat, buf, `pinvid.mp4`, caption, m)
      } catch {
        // Si falla buffer, intenta directo
        await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, caption, m)
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = data[0]
      let mediaUrl = extractUrl(v)
      if (!mediaUrl) throw new Error('No se pudo extraer URL TT: ' + JSON.stringify(v).slice(0,500))

      let caption = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || v.desc || text).slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `tiktok.mp4`, caption, m)
      await react('🎃')
      return
    }

    // APK
    if (type === 'apk') {
      let v = data[Math.floor(Math.random() * data.length)]
      let mediaUrl = extractUrl(v)
      let title = v.title || v.name || text
      let icon = v.icon || v.thumbnail
      let captionApk = head + `\n‧˚꒰🦇୭ *APK - ${title}* 📦🎃\n\n꒰ 🔍 ꒱ ${text}\n` + footer
      if (icon) try { await conn.sendFile(m.chat, icon, 'icon.jpg', captionApk, m) } catch { await conn.reply(m.chat, captionApk, m) }
      else await conn.reply(m.chat, captionApk, m)
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