import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const API_KEY = 'proyectsV2'
const BASE = 'https://api.stellarwa.xyz/search'

const endpoints = {
  pinterest: `${BASE}/pinterest?query={q}&key=${API_KEY}`,
  pinvid: `${BASE}/pinterestvideo?query={q}&key=${API_KEY}`,
  yt: `${BASE}/yt?query={q}&key=${API_KEY}`,
  apk: `${BASE}/apk?query={q}&key=${API_KEY}`,
  soundcloud: `${BASE}/soundcloud?query={q}&key=${API_KEY}`,
  spotify: `${BASE}/spotify?query={q}&key=${API_KEY}`,
  deezer: `${BASE}/deezer?query={q}&key=${API_KEY}`,
  instagram: `${BASE}/instagram?query={q}&key=${API_KEY}`,
  facebook: `${BASE}/facebook?query={q}&key=${API_KEY}`,
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const footer = `\n━━━━━━━━━━━━━━━\n🎃 *LUX X YALLICO - HALLOWEEN* 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  let [type,...queryArr] = (text || '').split(' ')
  let query = queryArr.join(' ')

  if (!type ||!query) {
    return conn.reply(m.chat, head + `\n💀 Usa:\n\n*${usedPrefix}${command} pinterest Naruto*\n*${usedPrefix}${command} pinvid anime edit*\n*${usedPrefix}${command} yt Bad Bunny*\n*${usedPrefix}${command} apk whatsapp*\n*${usedPrefix}${command} soundcloud phonk*\n*${usedPrefix}${command} spotify blinding lights*\n*${usedPrefix}${command} deezer duki*\n*${usedPrefix}${command} instagram cristiano*\n*${usedPrefix}${command} facebook meme*\n\nTipos: pinterest, pinvid, yt, apk, soundcloud, spotify, deezer, instagram, facebook` + footer, m)
  }

  type = type.toLowerCase()
  if (type === 'pinterestvideo') type = 'pinvid'

  if (!endpoints[type]) {
    return conn.reply(m.chat, head + `\n💀 Tipo *${type}* no existe` + footer, m)
  }

  try {
    await react('⏳')
    let url = endpoints[type].replace('{q}', encodeURIComponent(query))
    let res = await fetch(url)
    let json = await res.json()
    console.log(type, JSON.stringify(json).slice(0,800))

    let data = json.result || json.data || json.results || []
    if (!Array.isArray(data)) data = [data]
    if (!data.length) throw new Error('Sin resultados')

    let v = data[Math.floor(Math.random() * data.length)]

    // Detecta imagen / video / audio / link
    let mediaUrl = v.dl || v.url || v.link || v.image || v.thumbnail || v.cover || v.download || ''
    let title = v.title || v.name || v.caption || v.username || query

    let caption = head + `\n‧˚꒰🦇୭ *SEARCH ${type.toUpperCase()}* 🎃\n\n`
    caption += `꒰ 👻 ꒱ *Título:* ${String(title).slice(0,90)}\n`
    caption += `꒰ 🔍 ꒱ *Query:* ${query}\n`
    if (v.author) caption += `꒰ 🦇 ꒱ *Autor:* ${v.author}\n`
    if (v.id) caption += `꒰ 🆔 ꒱ *ID:* ${v.id}\n`
    caption += footer

    // Envia segun tipo
    if (type === 'pinterest' || type === 'instagram' || type === 'facebook') {
      await conn.sendFile(m.chat, mediaUrl, 'search.jpg', caption, m)
    } else if (type === 'pinvid' || type === 'yt') {
      await conn.sendFile(m.chat, mediaUrl, 'search.mp4', caption, m)
    } else if (['soundcloud','spotify','deezer'].includes(type)) {
      // Audio
      await conn.sendFile(m.chat, mediaUrl, 'search.mp3', caption, m)
    } else if (type === 'apk') {
      caption += `\n\n🔗 ${mediaUrl}`
      await conn.reply(m.chat, caption, m)
    } else {
      await conn.sendFile(m.chat, mediaUrl, 'search.jpg', caption, m)
    }

    await react('🎃')
  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error en ${type}: ${e.message}` + footer, m)
  }
}

handler.help = ['searchall <tipo> <texto>']
handler.tags = ['search']
handler.command = ['searchall', 'sall', 'stellarsearch']
export default handler