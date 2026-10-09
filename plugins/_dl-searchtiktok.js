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

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} ${command.includes('tiktok')? 'Bad Bunny' : 'Naruto'}*` + footer, m)

  let type = ''
  if (['ttsearch','tiktoksearch','ttss'].includes(command)) type = 'tiktok'
  if (['pinterest','pin','pinterestsearch'].includes(command)) type = 'pinterest'
  if (['pinterestvideo','pinvid','pinterestvid'].includes(command)) type = 'pinvid'
  if (['ytsearch','yts','ytbuscar'].includes(command)) type = 'yt'
  if (['apksearch','apk'].includes(command)) type = 'apk'
  if (['soundcloud','scsearch'].includes(command)) type = 'soundcloud'
  if (['spotify','spotifysearch'].includes(command)) type = 'spotify'
  if (['deezer'].includes(command)) type = 'deezer'
  if (['igsearch','instagramsearch'].includes(command)) type = 'instagram'
  if (['fbsearch','facebooksearch'].includes(command)) type = 'facebook'

  try {
    await react('⏳')
    let endpoint = type === 'pinvid' ? 'pinterestvideo' : type
    let apiUrl = `${BASE}/${endpoint}?query=${encodeURIComponent(text)}&key=${API_KEY}`
    let res = await fetch(apiUrl)
    let json = await res.json()

    let data = json.result || json.data || json.results || []
    if (!Array.isArray(data)) data = [data]
    data = data.filter(Boolean)
    if (!data.length) throw new Error('API sin resultados')

    let v = data[Math.floor(Math.random() * data.length)]

    let mediaUrl = ''
    let title = v.title || v.name || v.caption || text

    if (type === 'tiktok') {
      mediaUrl = v.dl || v.play || v.video || v.url
      if (typeof mediaUrl === 'object') mediaUrl = mediaUrl.url
    } else if (type === 'pinterest') {
      mediaUrl = v.image || v.images?.[0] || v.url
      if (typeof mediaUrl === 'object') mediaUrl = mediaUrl.url || mediaUrl.src
    } else if (type === 'pinvid') {
      mediaUrl = v.video || v.videoUrl || v.dl || v.url
      if (typeof mediaUrl === 'object') mediaUrl = mediaUrl.url
    } else {
      mediaUrl = v.thumbnail || v.image || v.cover || v.artwork || v.profilePic || v.icon || v.url
    }

    if (!mediaUrl || !mediaUrl.startsWith('http')) throw new Error(`Sin URL válida: ${JSON.stringify(v).slice(0,250)}`)

    let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()} SEARCH* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *Título:* ${String(title).slice(0,90)}\n`
    caption += `꒰ 🔍 ꒱ *Query:* ${text}\n`
    if (v.author || v.username) caption += `꒰ 🦇 ꒱ *Autor:* ${v.author || v.username}\n`
    caption += `꒰ 🎲 ꒱ *Random* ${data.length} encontrados\n`
    caption += footer

    if (type === 'tiktok' || type === 'pinvid') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.mp4`, caption, m)
    } else if (type === 'pinterest' || type === 'instagram' || type === 'facebook') {
      await conn.sendFile(m.chat, mediaUrl, `${type}.jpg`, caption, m)
    } else {
      await conn.sendFile(m.chat, mediaUrl, 'thumb.jpg', caption + `\n\n🔗 ${v.url || v.link || ''}`, m)
    }

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error en *${type}*: ${e.message}` + footer, m)
  }
}

handler.help = ['ttsearch <texto>', 'pinterest <texto>', 'pinvid <texto>', 'ytsearch <texto>', 'apk <texto>', 'soundcloud <texto>', 'spotify <texto>', 'deezer <texto>', 'igsearch <texto>', 'fbsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch','tiktoksearch','ttss','pinterest','pin','pinterestsearch','pinterestvideo','pinvid','pinterestvid','ytsearch','yts','ytbuscar','apksearch','apk','soundcloud','scsearch','spotify','spotifysearch','deezer','igsearch','instagramsearch','fbsearch','facebooksearch']

export default handler