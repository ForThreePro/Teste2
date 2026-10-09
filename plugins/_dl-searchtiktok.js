import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
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

  const fetchApi = async (t, q) => {
    let r = await fetch(`${BASE}/search/${t}?query=${encodeURIComponent(q)}&key=${API_KEY}`)
    let txt = await r.text()
    if (txt.startsWith('<!DOCTYPE')) return []
    let j = JSON.parse(txt)
    let li = j.data?.videos || j.result?.videos || j.data?.pins || j.data || j.result || []
    if (!Array.isArray(li)) li = [li]
    return li.flat().filter(Boolean)
  }

  try {
    await react('⏳')
    let list = await fetchApi(type, text)

    // FALLBACK SI PINVID DA 0 RESULTADOS
    if (type === 'pinterestvideo' &&!list.length) {
      console.log('pinvid vacío, intentando pinterest normal')
      let alt = await fetchApi('pinterest', text)
      // saca los mp4 escondidos en pinterest
      let mp4s = []
      let str = JSON.stringify(alt)
      let matches = str.match(/https:\/\/v1\.pinimg[^\"]+\.mp4/g)
      if (matches) mp4s = matches.map(u => ({ dl: u, title: text, duration: '', likes: 0 }))
      // si aún no, prueba pinterest sin el texto completo
      if (!mp4s.length) {
        let alt2 = await fetchApi('pinterest', text.split(' ')[0])
        let str2 = JSON.stringify(alt2)
        let m2 = str2.match(/https:\/\/v1\.pinimg[^\"]+\.mp4/g)
        if (m2) mp4s = m2.map(u => ({ dl: u, title: text, duration: '', likes: 0 }))
      }
      list = mp4s.length? mp4s : alt
    }

    if (!list.length) throw new Error(`Sin resultados para ${text} en ${type}`)

    if (type === 'pinterestvideo') {
      let vids = list.filter(x => x.dl && x.dl.includes('.mp4'))
      if (!vids.length) {
        let all = JSON.stringify(list).match(/https:\/\/v1\.pinimg[^\"]+\.mp4/g)
        if (all) vids = all.map(u => ({ dl: u, title: text, duration: '', likes: 0 }))
      }
      if (!vids.length) throw new Error(`Stellar no devolvió mp4 para "${text}" - prueba con "${text.split(' ')[0]}"`)

      let v = vids[Math.floor(Math.random() * vids.length)]
      let r = await fetch(v.dl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.pinterest.com/' } })
      if (!r.ok) throw new Error(`Pin bloqueó ${r.status}`)
      let buf = Buffer.from(await r.arrayBuffer())
      let tmp = path.join(tmpdir(), `pinvid-${Date.now()}.mp4`)
      fs.writeFileSync(tmp, buf)
      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${String(v.title || text).slice(0,80)}*\n꒰ ⏱️ ꒱ ${v.duration || '0:00'} | ❤️ ${v.likes || 0}\n` + footer
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
        let cap = i === 0? head + `\n‧˚꒰🦇୭ *PINTEREST - ${text}* 🎃\n` + footer : `꒰ 🦇 ꒱ ${i+1}/5`
        await conn.sendFile(m.chat, imgs[i], `pin-${i}.jpg`, cap, m)
        await new Promise(r => setTimeout(r, 400))
      }
      await react('🎃')
      return
    }

    if (type === 'tiktok') {
      let v = list[Math.floor(Math.random() * list.length)]
      let url = v.dl || v.play || v.hdplay || v.video || v.url
      let cap = head + `\n‧˚꒰🦇୭ *TTSEARCH - ${text}* 🎃\n` + footer
      await conn.sendFile(m.chat, url, 'tt.mp4', cap, m)
      await react('🎃')
      return
    }

    if (type === 'apk') {
      let v = list[0]
      let dl = v.dl || v.url
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