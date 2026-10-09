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
    let txt = await res.text()

    // FIX del error <!DOCTYPE
    if (txt.trim().startsWith('<!DOCTYPE') || txt.trim().startsWith('<html')) {
      throw new Error('API Stellar devolvió HTML (está caída o key expiró)')
    }

    let json
    try { json = JSON.parse(txt) } catch { throw new Error('API no devolvió JSON válido') }

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
      if (typeof obj === 'string' && obj.startsWith('http')) return obj
      let d = obj.dl || obj.video || obj.videoUrl || obj.url || obj.download || obj.image || obj.img || obj.src || obj.thumbnail
      if (typeof d === 'string' && d.startsWith('http')) return d
      if (d && typeof d === 'object') return d.url || d.src || null
      // busca cualquier http dentro del objeto
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k]
      return null
    }

    const getImages = (obj) => {
      let arr = []
      if (obj.image) arr.push(obj.image)
      if (obj.img) arr.push(obj.img)
      if (obj.src) arr.push(obj.src)
      if (obj.url && obj.url.includes('pinimg')) arr.push(obj.url)
      if (obj.images && Array.isArray(obj.images)) arr.push(...obj.images)
      return arr.filter(u => typeof u === 'string' && u.startsWith('http'))
    }

    if (type === 'pinterest') {
      let images = []
      for (let o of data) images.push(...getImages(o), getUrl(o))
      images = [...new Set(images.filter(Boolean))]

      if (!images.length) throw new Error(`No se encontraron imágenes para "${text}"`)

      let toSend = images.slice(0, 5)

      const cards = toSend.map((url, i) => ({
        header: { hasMediaAttachment: true, imageMessage: { url } },
        body: { text: `‧˚꒰🦇୭ ${text} - ${i+1}/${toSend.length} 🎃` },
        footer: { text: 'LUX X YALLICO' },
        nativeFlowMessage: {
          buttons: [{
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '👻 Ver HD',
              url: url
            })
          }]
        }
      }))

      await conn.sendMessage(m.chat, {
        text: head + `\n‧˚꒰🦇୭ *PINTEREST CARRUSEL - ${text}* 🎃\n\n꒰ 👻 ꒱ *${toSend.length} resultados*\n꒰ 🔍 ꒱ ${text}\n` + footer,
        footer: '🦇 Desliza para ver más 👉',
        cards: cards,
        header: { hasMediaAttachment: false }
      }, { quoted: m })

      await react('🎃')
      return
    }

    // PINVID / TTSEARCH / APK
    let v = data[0]
    let mediaUrl = getUrl(v)
    if (!mediaUrl) throw new Error('No se pudo extraer URL del resultado')

    let cap = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()} - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(v.title||v.name||text).toString().slice(0,80)}*\n` + footer

    if (type === 'pinterestvideo') await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, cap, m)
    else if (type === 'tiktok') await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, cap, m)
    else if (type === 'apk') {
      let icon = v.icon || v.thumbnail || null
      let capApk = head + `\n‧˚꒰🦇୭ *APK - ${text}* 📦🎃\n\n꒰ 👻 ꒱ *${v.name||text}*\n` + footer
      if (icon) {
        try { await conn.sendFile(m.chat, icon, 'icon.jpg', capApk, m) } catch { await conn.reply(m.chat, capApk, m) }
      } else await conn.reply(m.chat, capApk, m)
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