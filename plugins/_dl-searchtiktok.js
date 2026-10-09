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
    let res = await fetch(`${BASE}/search/pinterestvideo?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let txt = await res.text()
    if (txt.trim().startsWith('<!DOCTYPE')) throw new Error('Stellar caída')
    let json = JSON.parse(txt)

    let result = json.result || json.data || json
    let data = Array.isArray(result)? result : (result.videos || [result])
    data = data.flat().filter(Boolean)
    if (!data.length) throw new Error(`No hay videos para "${text}"`)

    let first = data[0]
    let videoUrl = null

    // El search ya devuelve el mp4 directo en v1.pinimg.com
    if (typeof first === 'string' && first.startsWith('http')) videoUrl = first
    else videoUrl = first.video || first.url || first.dl || first.download || first.src || null

    if (!videoUrl ||!videoUrl.startsWith('http')) {
      for (let k in first) {
        if (typeof first[k] === 'string' && first[k].startsWith('http') && first[k].includes('.mp4')) {
          videoUrl = first[k]; break
        }
      }
    }
    if (!videoUrl ||!videoUrl.startsWith('http')) {
      for (let k in first) if (typeof first[k] === 'string' && first[k].startsWith('http')) { videoUrl = first[k]; break }
    }

    if (!videoUrl) throw new Error('No se encontró URL de video')

    // FIX: si ya es mp4 directo de pinimg, enviar directo, no llamar a download
    if (videoUrl.includes('pinimg.com') && videoUrl.includes('.mp4')) {
      let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(first.title||text).toString().slice(0,80)}*\n` + footer
      await conn.sendFile(m.chat, videoUrl, `pinvid.mp4`, cap, m)
      await react('🎃')
      return
    }

    // Si es link de pinterest.com/pin/, ahí sí necesita download
    let dlRes = await fetch(`${BASE}/download/pinterest?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`)
    let dlTxt = await dlRes.text()
    let dlJson = JSON.parse(dlTxt)
    let dlResult = dlJson.result || dlJson.data || dlJson
    let finalUrl = dlResult.url || dlResult.video || dlResult.dl || dlResult.download || videoUrl

    let cap = head + `\n‧˚꒰🦇୭ *PINVID - ${text}* 🎃\n\n꒰ 👻 ꒱ *${(first.title||text).toString().slice(0,80)}*\n` + footer
    await conn.sendFile(m.chat, finalUrl, `pinvid.mp4`, cap, m)
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