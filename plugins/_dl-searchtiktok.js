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
    let r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://www.pinterest.com/' } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.buffer()
  }

  try {
    await react('🔍')
    let res = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let txt = await res.text()
    if (txt.trim().startsWith('<!DOCTYPE')) throw new Error('Stellar HTML')
    let json = JSON.parse(txt)

    // DEBUG: saca todo lo que venga
    let rawVideos = json.data?.videos || json.result?.videos || json.videos || json.data || json.result || []
    if (!Array.isArray(rawVideos)) rawVideos = [rawVideos]
    rawVideos = rawVideos.flat().filter(Boolean)

    console.log('Stellar raw:', JSON.stringify(rawVideos[0]).slice(0,500))

    if (type === 'pinterestvideo') {
      // Extractor a prueba de cambios
      let videos = []
      for (let o of rawVideos) {
        let dl = o.dl || o.url || o.videoUrl || o.video || o.download
        if (!dl) {
          let str = JSON.stringify(o)
          let match = str.match(/https:\/\/v1\.pinimg[^"]+\.mp4[^"]*/g)
          if (match) dl = match[0]
        }
        if (dl && dl.startsWith('http')) videos.push({...o, dl })
      }

      if (!videos.length) throw new Error(`No hay dl. API devolvió: ${JSON.stringify(rawVideos[0]).slice(0,300)}`)

      let v = videos[Math.floor(Math.random() * videos.length)]
      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration || ''} | ❤️ ${v.likes || 0}\n` + footer

      let buffer = await fetchBuffer(v.dl)
      try {
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap, fileName: 'pinvid.mp4' }, { quoted: m })
      } catch {
        await conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `pinvid-${text}.mp4`, caption: cap }, { quoted: m })
      }
      await react('🎃')
      return
    }

    if (type === 'pinterest') {
      let images = rawVideos.map(o => o.dl || o.image || o.url || o.src).filter(u => u && u.startsWith('http'))
      images = [...new Set(images)].sort(() => Math.random() - 0.5).slice(0, 5)
      if (!images.length) throw new Error(`Sin imágenes para "${text}"`)

      for (let i = 0; i < images.length; i++) {
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} fotos\n` + footer : `꒰ 🦇 ꒱ ${i+1}/5`
        let buf = await fetchBuffer(images[i])
        await conn.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: m })
        await new Promise(r => setTimeout(r, 400))
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = rawVideos[Math.floor(Math.random() * rawVideos.length)]
      let mediaUrl = v.dl || v.play || v.hdplay || v.video || v.url
      if (!mediaUrl) throw new Error('Sin URL TT')
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n` + footer
      let buffer = await fetchBuffer(mediaUrl)
      await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: cap }, { quoted: m })
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = rawVideos[0]
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