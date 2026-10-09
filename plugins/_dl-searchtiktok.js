import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const API_KEY = 'proyectsV2'
const BASE = 'https://api.stellarwa.xyz/search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN* 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Naruto*` + footer, m)

  let type = ''
  if (['ttsearch','tiktoksearch','ttss'].includes(command)) type = 'tiktok'
  if (['pinterest','pin','pinterestsearch'].includes(command)) type = 'pinterest'
  if (['pinterestvideo','pinvid','pinterestvid'].includes(command)) type = 'pinterestvideo'
  if (['ytsearch','yts','ytbuscar'].includes(command)) type = 'yt'
  if (['apksearch','apk'].includes(command)) type = 'apk'
  if (['soundcloud','scsearch'].includes(command)) type = 'soundcloud'
  if (['spotify','spotifysearch'].includes(command)) type = 'spotify'
  if (['deezer'].includes(command)) type = 'deezer'
  if (['igsearch','instagramsearch'].includes(command)) type = 'instagram'
  if (['fbsearch','facebooksearch'].includes(command)) type = 'facebook'

  try {
    await react('⏳')
    let apiUrl = `${BASE}/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`
    let res = await fetch(apiUrl)
    let json = await res.json()

    let result = json.result || json.data || json.results || json
    let data = []

    if (Array.isArray(result)) data = result
    else if (result.videos) data = result.videos
    else if (result.pins) data = result.pins
    else if (result.images) data = result.images
    else if (result.result) data = Array.isArray(result.result)? result.result : [result.result]
    else if (result.data) data = Array.isArray(result.data)? result.data : [result.data]
    else data = [result]

    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error('Sin resultados')

    let v = data[Math.floor(Math.random() * data.length)]

    // EXTRACTOR UNIVERSAL - busca cualquier URL http dentro del objeto
    const extractUrl = (obj) => {
      if (!obj || typeof obj!== 'object') return null
      // prioridades
      let direct = obj.dl || obj.video || obj.videoUrl || obj.image || obj.img || obj.src || obj.media || obj.url || obj.link || obj.download
      if (typeof direct === 'string' && direct.startsWith('http')) return direct
      if (direct && typeof direct === 'object') {
        let d2 = direct.url || direct.src || direct.image || direct.link
        if (typeof d2 === 'string' && d2.startsWith('http')) return d2
      }
      // busca cualquier string http en el objeto
      for (let k in obj) {
        let val = obj[k]
        if (typeof val === 'string' && val.startsWith('http') && (val.includes('.jpg') || val.includes('.png') || val.includes('.mp4') || val.includes('pinimg') || val.includes('pinimg.com') || val.includes('v1.pinimg'))) return val
        if (typeof val === 'string' && val.startsWith('http')) return val
      }
      return null
    }

    let mediaUrl = extractUrl(v)
    if (!mediaUrl) {
      // último intento: primer http del JSON completo
      let allStrings = JSON.stringify(v).match(/https?:\/\/[^\s"']+/g)
      if (allStrings) mediaUrl = allStrings.find(u => u.includes('pinimg') || u.includes('.jpg') || u.includes('.mp4')) || allStrings[0]
    }

    if (!mediaUrl ||!mediaUrl.startsWith('http')) throw new Error(`No se pudo extraer URL`)

    let title = v.title || v.name || v.caption || text
    let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()}* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *${String(title).slice(0,90)}*\n`
    caption += `꒰ 🔍 ꒱ *Query:* ${text}\n`
    if (v.likes) caption += `꒰ ❤️ ꒱ ${v.likes} likes\n`
    if (v.duration) caption += `꒰ ⏱️ ꒱ ${v.duration}\n`
    caption += `꒰ 🎲 ꒱ ${data.length} resultados\n`
    caption += footer

    if (type === 'tiktok' || type === 'pinterestvideo') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.mp4`, caption, m)
    } else if (type === 'pinterest' || type === 'instagram' || type === 'facebook') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.jpg`, caption, m)
    } else {
      await conn.sendFile(m.chat, mediaUrl, 'thumb.jpg', caption, m)
    }

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error en *${type}*: ${e.message}` + footer, m)
  }
}

handler.help = ['ttsearch','pinterest','pinvid','ytsearch','apk','soundcloud','spotify','deezer','igsearch','fbsearch']
handler.tags = ['search']
handler.command = ['ttsearch','tiktoksearch','ttss','pinterest','pin','pinterestsearch','pinterestvideo','pinvid','pinterestvid','ytsearch','yts','ytbuscar','apksearch','apk','soundcloud','scsearch','spotify','spotifysearch','deezer','igsearch','instagramsearch','fbsearch','facebooksearch']

export default handler