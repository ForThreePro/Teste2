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
    let result = json.data || json.result || json
    let data = Array.isArray(result)? result : (result.videos || result.pins || result.images || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`Sin resultados para "${text}"`)

    if (type === 'pinterestvideo') {
      // FIX: tu API usa.dl directo
      let vids = data.filter(x => x.dl && x.dl.startsWith('http')).slice(0, 5)
      if (!vids.length) throw new Error('No hay dl en respuesta')

      // Envía 1 random o el primero con más likes
      let v = vids.sort((a,b) => (b.likes||0)-(a.likes||0))[0]

      let caption = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration || ''} | ❤️ ${v.likes || 0}\n꒰ 🔍 ꒱ ${text}\n` + footer

      // v1.pinimg necesita buffer
      let resVid = await fetch(v.dl)
      let buf = await resVid.buffer()
      await conn.sendFile(m.chat, buf, `pinvid.mp4`, caption, m)
      await react('🎃')
      return
    }

    if (type === 'pinterest') {
      // tu API pinterest también tiene dl o image
      let images = data.map(o => o.dl || o.image || o.img || o.url || o.src).filter(u => u && u.startsWith('http') && (u.includes('pinimg') || u.includes('.jpg')))
      images = [...new Set(images)].slice(0, 5)
      if (!images.length) throw new Error(`No hay imágenes para "${text}"`)

      for (let i=0;i<images.length;i++) {
        let cap = i===0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${images.length} fotos\n` + footer : `꒰ 🦇 ꒱ ${text} ${i+1}/${images.length}`
        await conn.sendFile(m.chat, images[i], `pin-${i}.jpg`, cap, m)
        await new Promise(r=>setTimeout(r,600))
      }
      await react('🎃')
      return
    }

    // TTSEARCH y APK
    const getUrl = (obj) => obj.dl || obj.play || obj.hdplay || obj.video || obj.url || obj.download || null
    let v = data[0]
    let mediaUrl = getUrl(v)
    if (!mediaUrl) throw new Error('No se pudo extraer URL: ' + JSON.stringify(v).slice(0,300))

    let cap = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()} - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || v.name || text).slice(0,80)}*\n` + footer

    if (type === 'tiktok') await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, cap, m)
    else if (type === 'apk') {
      if (v.icon) try { await conn.sendFile(m.chat, v.icon, 'icon.jpg', cap, m) } catch {}
      await conn.sendMessage(m.chat, { document: { url: mediaUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${(v.name||text).replace(/[^a-z0-9]/gi,'_')}.apk` }, { quoted: m })
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