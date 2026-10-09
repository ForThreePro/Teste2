import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import moment from 'moment-timezone'
moment.locale('es')

const API_KEY = 'api-proyectsV2'
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

  try {
    await react('⏳')
    let apiRes = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let apiTxt = await apiRes.text()
    if (apiTxt.startsWith('<!DOCTYPE')) throw new Error('Stellar caído')
    let json = JSON.parse(apiTxt)
    let list = json.data?.videos || json.result?.videos || json.data?.pins || json.data || json.result || []
    if (!Array.isArray(list)) list = [list]
    list = list.flat().filter(Boolean)
    if (!list.length) throw new Error(`Sin resultados para ${text}`)

    if (type === 'pinterestvideo') {
      let vids = list.filter(x => x.dl && x.dl.includes('.mp4'))
      if (!vids.length) {
        let all = JSON.stringify(list).match(/https:\/\/v1\.pinimg[^\"]+\.mp4/g)
        if (all) vids = all.map(u => ({ dl: u, title: text, duration: '', likes: 0, thumb: '' }))
      }
      if (!vids.length) throw new Error('No hay dl mp4')

      // RANDOM para que no repita
      let v = vids[Math.floor(Math.random() * vids.length)]

      let r = await fetch(v.dl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.pinterest.com/' } })
      if (!r.ok) throw new Error(`Pin bloqueó ${r.status}`)
      let buf = Buffer.from(await r.arrayBuffer())

      // Archivo temporal para evitar "video no disponible"
      let tmp = path.join(tmpdir(), `pinvid-${Date.now()}.mp4`)
      fs.writeFileSync(tmp, buf)

      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration || '0:00'} | ❤️ ${v.likes || 0}\n` + footer

      // VIDEO REAL - NO DOCUMENTO
      await conn.sendFile(m.chat, tmp, 'pinvid.mp4', cap, m, false, { mimetype: 'video/mp4', asVideo: true })

      try { fs.unlinkSync(tmp) } catch {}
      await react('🎃')
      return
    }

    if (type === 'pinterest') {
      let imgs = list.map(o => o.dl || o.image || o.url).filter(u => u && u.startsWith('http'))
      imgs = [...new Set(imgs)].sort(() => 0.5 - Math.random()).slice(0, 5)
      if (!imgs.length) throw new Error('No hay imágenes')

      for (let i = 0; i < imgs.length; i++) {
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n\n꒰ 👻 ꒱ ${imgs.length} fotos\n` + footer : `꒰ 🦇 ꒱ ${i+1}/5`
        await conn.sendFile(m.chat, imgs[i], `pin-${i}.jpg`, cap, m)
        await new Promise(r => setTimeout(r, 400))
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = list[Math.floor(Math.random() * list.length)]
      let url = v.dl || v.play || v.hdplay || v.video || v.url
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n\n꒰ 👻 ꒱ ${String(v.title || text).slice(0,80)}\n` + footer
      await conn.sendFile(m.chat, url, 'tt.mp4', cap, m)
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = list[0]
      let dl = v.dl || v.url || v.download
      let title = v.name || v.title || text
      let cap = head + `\n‧˚꒰🦇୭ *APK - ${title}* 📦🎃\n` + footer
      await conn.reply(m.chat, cap, m)
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