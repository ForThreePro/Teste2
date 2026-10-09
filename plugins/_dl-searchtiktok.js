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

    const safeJSON = async (url) => {
      let r = await fetch(url)
      let t = await r.text()
      if (t.trim().startsWith('<!DOCTYPE') || t.trim().startsWith('<html')) throw new Error('API Stellar caída')
      return JSON.parse(t)
    }

    const getUrl = (o) => {
      if (!o) return null
      if (typeof o === 'string' && o.startsWith('http')) return o
      let d = o.dl || o.video || o.videoUrl || o.url || o.download || o.image || o.img
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') return d.url || d.src || null
      for (let k in o) if (typeof o[k] === 'string' && o[k].startsWith('http')) return o[k]
      return null
    }

    if (type === 'pinterest') {
      let json = await safeJSON(`${BASE}/search/pinterest?query=${encodeURIComponent(text)}&key=${API_KEY}`)
      let result = json.result || json.data || []
      let data = Array.isArray(result)? result : [result]
      let images = []
      for (let o of data) {
        let u = getUrl(o)
        if (u) images.push(u)
        if (o.images) images.push(...o.images.filter(x=>typeof x==='string'))
      }
      images = [...new Set(images)].slice(0,5)
      if (!images.length) throw new Error(`No hay imágenes para "${text}"`)
      for (let i=0;i<images.length;i++){
        let cap = i===0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} fotos (${i+1}/${images.length})\n` + footer : `꒰ 🦇 ꒱ ${text} ${i+1}/${images.length}`
        await conn.sendFile(m.chat, images[i], `pin-${i}.jpg`, cap, m)
        await new Promise(r=>setTimeout(r,600))
      }
      await react('🎃')
      return
    }

    if (type === 'pinterestvideo') {
      // 1. Buscar
      let json = await safeJSON(`${BASE}/search/pinterestvideo?query=${encodeURIComponent(text)}&key=${API_KEY}`)
      let result = json.result || json.data || json
      let data = Array.isArray(result)? result : (result.videos || [result])
      data = data.flat().filter(Boolean)
      if (!data.length) throw new Error(`No hay videos para "${text}"`)

      let pinUrl = getUrl(data[0]) // link de pinterest tipo https://www.pinterest.com/pin/...
      if (!pinUrl) throw new Error('No se encontró link del pin')

      // 2. Descargar el mp4 real con el endpoint de download
      // Stellar tiene varios nombres, probamos 3 variantes
      let dlEndpoints = [
        `${BASE}/download/pinterest?url=${encodeURIComponent(pinUrl)}&key=${API_KEY}`,
        `${BASE}/download/pinterestvideo?url=${encodeURIComponent(pinUrl)}&key=${API_KEY}`,
        `${BASE}/download/pinvid?url=${encodeURIComponent(pinUrl)}&key=${API_KEY}`,
        `${BASE}/download/pinterestdl?url=${encodeURIComponent(pinUrl)}&key=${API_KEY}`
      ]

      let videoUrl = null
      let title = data[0].title || text

      for (let ep of dlEndpoints) {
        try {
          let j = await safeJSON(ep)
          let r = j.result || j.data || j
          let v = r.video || r.url || r.dl || r.download || r.media || r.result
          if (typeof v === 'string' && v.startsWith('http')) { videoUrl = v; break }
          if (v && typeof v === 'object' && v.url) { videoUrl = v.url; break }
          // algunos devuelven { result: "https://...mp4" }
          for (let k in r) if (typeof r[k] === 'string' && r[k].startsWith('http') && r[k].includes('.mp4')) { videoUrl = r[k]; break }
          if (videoUrl) break
        } catch {}
      }

      // Si aún no hay mp4, usa el pinUrl directo como último intento (algunos bots lo aceptan)
      if (!videoUrl) videoUrl = pinUrl

      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${title.toString().slice(0,80)}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      await conn.sendFile(m.chat, videoUrl, `pinvid.mp4`, cap, m)
      await react('🎃')
      return
    }

    // TTSEARCH / APK siguen igual solo stellar
    let json = await safeJSON(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let result = json.result || json.data || json
    let data = Array.isArray(result)? result : (result.videos || [result])
    data = data.flat().filter(Boolean)
    let v = data[0]
    let mediaUrl = getUrl(v)
    if (!mediaUrl) throw new Error('No se pudo extraer URL')
    let cap = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()} - ${text}* 🎃\n` + footer
    if (type === 'tiktok') await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, cap, m)
    else if (type === 'apk') {
      let icon = v.icon || v.thumbnail
      if (icon) try { await conn.sendFile(m.chat, icon, 'icon.jpg', cap, m) } catch {}
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${(v.name||text).replace(/[^a-z0-9]/gi,'_')}.apk` }, { quoted: m })
    }
    await react('🎃')

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