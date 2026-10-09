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
      let d = obj.dl || obj.image || obj.img || obj.src || obj.url || obj.video || obj.videoUrl
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') {
        let d2 = d.url || d.src || d.image
        if (typeof d2 === 'string' && d2.startsWith('http')) return d2
      }
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http') && (obj[k].includes('pinimg') || obj[k].includes('.jpg') || obj[k].includes('.mp4') || obj[k].includes('tik'))) return obj[k]
      let mm = JSON.stringify(obj).match(/https?:\/\/[^\s"']+\.(?:jpg|png|mp4)/g)
      return mm? mm[0] : null
    }

    if (type === 'pinterest') {
      // Manda 3 imágenes exactas del query (no random)
      let toSend = data.slice(0, 3)
      for (let i = 0; i < toSend.length; i++) {
        let v = toSend[i]
        let mediaUrl = getUrl(v)
        if (!mediaUrl) continue
        let caption = head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n`
        caption += `꒰ 👻 ꒱ *${(v.title||text).slice(0,80)}*\n`
        caption += `꒰ 🔍 ꒱ *${text}* (${i+1}/3)\n`
        caption += footer
        await conn.sendFile(m.chat, mediaUrl, `pinterest-${i}.jpg`, caption, m)
        await new Promise(r => setTimeout(r, 700))
      }
      await react('🎃')
      return
    }

    if (type === 'pinterestvideo') {
      // Video más relevante, no random
      let v = data[0]
      let mediaUrl = getUrl(v)
      if (!mediaUrl) throw new Error('No se extrajo video')
      let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n`
      caption += `꒰ 👻 ꒱ *${(v.title||text).slice(0,80)}*\n`
      caption += `꒰ 🔍 ꒱ *Query:* ${text}\n`
      caption += footer
      await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, caption, m)
      await react('🎃')
      return
    }

    // TTSEARCH y APK con random si quieres
    let v = data[0] // también el más relevante para ttsearch
    let mediaUrl = getUrl(v)
    if (!mediaUrl) throw new Error('No URL')

    let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()} - ${text}* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *${(v.title||v.name||text).slice(0,80)}*\n`
    caption += `꒰ 🔍 ꒱ ${text}\n`
    caption += footer

    if (type === 'tiktok') {
      await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, caption, m)
    } else if (type === 'apk') {
      let icon = v.icon || v.thumbnail
      let captionApk = head + `\n‧˚꒰🦇୭ *APK - ${text}* 📦🎃\n\n꒰ 👻 ꒱ *${v.name||title}*\n꒰ 🔍 ꒱ ${text}\n` + footer
      if (icon) {
        try { await conn.sendFile(m.chat, icon, 'icon.jpg', captionApk, m) } catch { await conn.reply(m.chat, captionApk, m) }
      } else {
        await conn.reply(m.chat, captionApk, m)
      }
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${v.name||text}.apk` }, { quoted: m })
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