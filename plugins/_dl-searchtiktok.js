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

  try {
    await react('🔍')

    const safeJSON = async (url) => {
      let r = await fetch(url)
      let t = await r.text()
      if (t.trim().startsWith('<!DOCTYPE') || t.trim().startsWith('<html')) return { _html: true, text: t.slice(0,200) }
      try { return JSON.parse(t) } catch { return { _parseError: true, text: t.slice(0,500) } }
    }

    // ===== PINVID FIX DEFINITIVO =====
    let type = 'pinterestvideo'
    let jsonSearch = await safeJSON(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)

    if (jsonSearch._html) throw new Error('Stellar search devuelve HTML, está caída')
    if (jsonSearch._parseError) throw new Error('Search no es JSON: ' + jsonSearch.text)

    let result = jsonSearch.result || jsonSearch.data || jsonSearch
    let data = Array.isArray(result)? result : (result.videos || result.pins || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`No hay videos para "${text}"`)

    let first = data[0]
    // Saca el link del pin de donde sea
    let pinUrl = first.url || first.link || first.pin || first.pinterest || first.src || first.video || null
    if (typeof first === 'string') pinUrl = first
    if (!pinUrl ||!pinUrl.startsWith('http')) {
      // busca cualquier http en el objeto
      for (let k in first) if (typeof first[k] === 'string' && first[k].startsWith('http')) { pinUrl = first[k]; break }
    }

    if (!pinUrl) throw new Error('No se encontró link del pin. Data: ' + JSON.stringify(first).slice(0,300))

    // Ahora intenta TODOS los endpoints de descarga de Stellar
    const endpoints = [
      `download/pinterest?url=`,
      `download/pinterestvideo?url=`,
      `download/pinterestdl?url=`,
      `download/pin?url=`,
      `dl/pinterest?url=`,
      `dl/pinterestvideo?url=`,
      `downloader/pinterest?url=`,
      `pinterest/dl?url=`,
      `pinterest/download?url=`
    ]

    let videoUrl = null
    let lastError = ''

    for (let ep of endpoints) {
      try {
        let fullUrl = `${BASE}/${ep}${encodeURIComponent(pinUrl)}&key=${API_KEY}`
        let j = await safeJSON(fullUrl)
        if (j._html) { lastError = ep + ' -> HTML'; continue }
        if (j._parseError) { lastError = ep + ' -> no JSON'; continue }

        let r = j.result || j.data || j
        // Busca mp4 en cualquier nivel
        let candidate = null
        if (typeof r === 'string' && r.startsWith('http')) candidate = r
        else if (r.url && typeof r.url === 'string' && r.url.startsWith('http')) candidate = r.url
        else if (r.video && typeof r.video === 'string' && r.video.startsWith('http')) candidate = r.video
        else if (r.dl && typeof r.dl === 'string' && r.dl.startsWith('http')) candidate = r.dl
        else if (r.download && typeof r.download === 'string' && r.download.startsWith('http')) candidate = r.download
        else if (r.media && typeof r.media === 'string' && r.media.startsWith('http')) candidate = r.media
        else {
          // busca recursivo primer http con mp4 o cualquier http
          for (let k in r) {
            if (typeof r[k] === 'string' && r[k].startsWith('http') && (r[k].includes('.mp4') || r[k].includes('video'))) { candidate = r[k]; break }
          }
          if (!candidate) for (let k in r) if (typeof r[k] === 'string' && r[k].startsWith('http')) { candidate = r[k]; break }
        }

        if (candidate) { videoUrl = candidate; break }
        lastError = ep + ' -> sin url en ' + JSON.stringify(r).slice(0,200)
      } catch (e) { lastError = ep + ' -> ' + e.message }
    }

    if (!videoUrl) throw new Error(`No se pudo descargar el mp4. Pin: ${pinUrl}\nÚltimo error: ${lastError}`)

    let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(first.title||text).toString().slice(0,80)}*\n꒰ 🔗 ꒱ ${pinUrl}\n` + footer
    await conn.sendFile(m.chat, videoUrl, `pinvid.mp4`, cap, m)
    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error PINVID: ${e.message}` + footer, m)
  }
}

handler.help = ['pinvid']
handler.tags = ['search']
handler.command = ['pinvid','pinterestvideo','pinterestvid']

export default handler