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
    if (!data.length) throw new Error('Sin resultados')

    let v = data[Math.floor(Math.random() * data.length)]
    let title = v.title || v.name || text

    // Extractor universal
    const getUrl = (obj) => {
      let d = obj.dl || obj.image || obj.img || obj.src || obj.url || obj.video || obj.videoUrl || obj.download
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') {
        let d2 = d.url || d.src || d.image
        if (typeof d2 === 'string' && d2.startsWith('http')) return d2
      }
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k]
      let mm = JSON.stringify(obj).match(/https?:\/\/[^\s"']+/g)
      return mm? mm[0] : null
    }

    let mediaUrl = getUrl(v)

    if (!mediaUrl) throw new Error('No se pudo extraer URL')

    let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()}* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *${String(title).slice(0,80)}*\n`
    caption += `꒰ 🔍 ꒱ ${text}\n`
    if (v.likes) caption += `꒰ ❤️ ꒱ ${v.likes} likes\n`
    caption += `꒰ 🎲 ꒱ ${data.length} encontrados\n`
    caption += footer

    if (type === 'tiktok' || type === 'pinterestvideo') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.mp4`, caption, m)
    } else if (type === 'pinterest') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.jpg`, caption, m)
    } else if (type === 'apk') {
      let icon = v.icon || v.thumbnail || v.image
      let size = v.size || ''
      let version = v.version || v.versionName || ''

      let captionApk = head + `\n‧˚꒰🦇୭ *APK DOWNLOAD* 📦🎃\n\n`
      captionApk += `꒰ 👻 ꒱ *App:* ${title}\n`
      if (version) captionApk += `꒰ 🧟 ꒱ *Versión:* ${version}\n`
      if (size) captionApk += `꒰ 💀 ꒱ *Tamaño:* ${size}\n`
      captionApk += `꒰ 🔍 ꒱ ${text}\n` + footer

      if (icon) {
        try { await conn.sendFile(m.chat, icon, 'icon.jpg', captionApk, m) } catch { await conn.reply(m.chat, captionApk, m) }
      } else {
        await conn.reply(m.chat, captionApk, m)
      }

      // Enviar APK como documento
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${title}.apk` }, { quoted: m })
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