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

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Goku*` + footer, m)

  let type = ''
  if (['ttsearch','tiktoksearch','ttss'].includes(command)) type = 'tiktok'
  if (['pinterest','pin','pinterestsearch'].includes(command)) type = 'pinterest'
  if (['pinvid','pinterestvideo','pinterestvid'].includes(command)) type = 'pinterestvideo'
  if (['apk','apksearch','apkdl'].includes(command)) type = 'apk'

  const getBuf = async (url, isVideo = false) => {
    let r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': isVideo ? 'https://www.pinterest.com/' : 'https://www.google.com/',
        'Accept': '*/*'
      }
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return Buffer.from(await r.arrayBuffer())
  }

  try {
    await react('⏳')
    let res = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let json = await res.json()
    let list = json.data?.videos || json.result?.videos || json.data || json.result || []
    if (!Array.isArray(list)) list = [list]
    list = list.flat().filter(Boolean)
    if (!list.length) throw new Error('Sin resultados')

    if (type === 'pinterestvideo') {
      let vids = list.filter(x => x.dl && x.dl.includes('.mp4'))
      if (!vids.length) {
        let m = JSON.stringify(list).match(/https:\/\/v1\.pinimg[^\"]+\.mp4/g)
        if (m) vids = m.map(u => ({ dl: u, title: text, thumb: '', likes: 0 }))
      }
      if (!vids.length) throw new Error('No hay videos')

      let v = vids[Math.floor(Math.random() * vids.length)]
      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n` + footer

      let videoBuf = await getBuf(v.dl, true)
      let thumbBuf = null
      try { if (v.thumb) thumbBuf = await getBuf(v.thumb) } catch {}

      // VIDEO REAL, NO DOCUMENTO
      await conn.sendMessage(m.chat, {
        video: videoBuf,
        mimetype: 'video/mp4',
        caption: cap,
        fileName: 'pinvid.mp4',
        jpegThumbnail: thumbBuf,
        gifPlayback: false
      }, { quoted: m })

      await react('🎃')
      return
    }

    if (type === 'pinterest') {
      let imgs = list.map(o => o.dl || o.image || o.url).filter(u => u && u.startsWith('http'))
      imgs = [...new Set(imgs)].sort(() => 0.5 - Math.random()).slice(0, 5)
      for (let i = 0; i < imgs.length; i++) {
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n` + footer : `꒰ 🦇 ꒱ ${i+1}/5`
        let buf = await getBuf(imgs[i])
        await conn.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: m })
        await new Promise(r => setTimeout(r, 300))
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = list[Math.floor(Math.random() * list.length)]
      let url = v.dl || v.play || v.hdplay || v.video || v.url
      let buf = await getBuf(url, true)
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ ${String(v.title || text).slice(0,80)}\n` + footer
      await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: cap }, { quoted: m })
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = list[0]
      let dl = v.dl || v.url || v.download
      let title = v.name || v.title || text
      await conn.reply(m.chat, head + `\n‧˚꒰🦇୭ *APK - ${title}* 📦🎃\n` + footer, m)
      await conn.sendMessage(m.chat, { document: { url: dl }, mimetype: 'application/vnd.android.package-archive', fileName: `${title.replace(/[^a-z0-9]/gi,'_')}.apk` }, { quoted: m })
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