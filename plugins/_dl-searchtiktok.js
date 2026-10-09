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

    if (type === 'pinterest') {
      let images = []
      try {
        let r = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`)
        let j = await r.json()
        let d = j.data || j.result || []
        images = d.map(x => typeof x === 'string'? x : x.url || x.image).filter(u => u && u.startsWith('http'))
      } catch {}

      if (!images.length) {
        try {
          let r = await fetch(`https://api.dorratz.com/api/pinterest?query=${encodeURIComponent(text)}`)
          let j = await r.json()
          let d = j.result || j.data || []
          images = d.map(x => typeof x === 'string'? x : x.image || x.url).filter(u => u && u.startsWith('http'))
        } catch {}
      }

      if (!images.length) throw new Error(`No hay resultados para "${text}"`)

      let toSend = images.slice(0, 5)

      // ===== CARRUSEL REAL DE WHATSAPP =====
      const cards = toSend.map((url, i) => ({
        header: { hasMediaAttachment: true, imageMessage: { url: url } },
        body: { text: `‧˚꒰🦇୭ ${text} - ${i+1}/5 🎃` },
        footer: { text: 'LUX X YALLICO' },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '👻 Ver Imagen HD',
                url: url
              })
            }
          ]
        }
      }))

      await conn.sendMessage(m.chat, {
        text: head + `\n‧˚꒰🦇୭ *PINTEREST CARRUSEL - ${text}* 🎃\n\n꒰ 👻 ꒱ *${toSend.length} resultados exactos*\n꒰ 🔍 ꒱ ${text}\n` + footer,
        footer: '🦇 Desliza para ver más 👉',
        cards: cards,
        header: { hasMediaAttachment: false }
      }, { quoted: m })

      await react('🎃')
      return
    }

    // RESTO IGUAL
    let apiUrl = `${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`
    let res = await fetch(apiUrl)
    let json = await res.json()
    let result = json.result || json.data || json
    let data = []
    if (Array.isArray(result)) data = result
    else if (result.videos) data = result.videos
    else if (result.pins) data = result.pins
    else data = [result]
    data = data.flat().filter(Boolean)

    const getUrl = (obj) => {
      let d = obj.dl || obj.video || obj.videoUrl || obj.url || obj.download
      if (typeof d === 'string' && d.startsWith('http')) return d
      return null
    }

    let v = data[0]
    let mediaUrl = getUrl(v)
    let title = v.title || v.name || text

    if (type === 'pinterestvideo') {
      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ ${title.slice(0,80)}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `pinvid.mp4`, cap, m)
    } else if (type === 'tiktok') {
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ ${title.slice(0,80)}\n` + footer
      await conn.sendFile(m.chat, mediaUrl, `tt.mp4`, cap, m)
    } else if (type === 'apk') {
      let icon = v.icon || v.thumbnail
      let cap = head + `\n‧˚꒰🦇୭ *APK - ${text}* 📦\n\n꒰ 👻 ꒱ ${v.name||text}\n` + footer
      if (icon) try { await conn.sendFile(m.chat, icon, 'icon.jpg', cap, m) } catch { await conn.reply(m.chat, cap, m) }
      else await conn.reply(m.chat, cap, m)
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