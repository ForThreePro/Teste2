import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const api = {
  search: 'https://api.stellarwa.xyz/search/tiktok',
  dl: 'https://api.stellarwa.xyz/dl/tiktok',
  key: 'proyectsV2'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n꒰ ◞⁺⊹ ．${fecha}\n`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Bad Bunny*`, m)
  }

  try {
    await react('⏳')
    let urlSearch = `${api.search}?query=${encodeURIComponent(text)}&key=${api.key}`
    let res = await fetch(urlSearch)
    let json = await res.json()

    let data = json.result || json.data || json.results || json.videos || []
    if (data.data) data = data.data
    if (data.videos) data = data.videos
    if (!Array.isArray(data)) data = Object.values(data)

    data = data.filter(v => v && (v.url || v.link || v.videoUrl))

    if (!data.length) {
      await react('💀')
      return conn.reply(m.chat, head + `\n💀 Sin resultados para *${text}*\n\n${JSON.stringify(json).slice(0,400)}`, m)
    }

    let list = data.slice(0, 2) // Solo 2 videos
    await conn.reply(m.chat, head + `\n🎃 *TT SEARCH* 👻\n🔍 Query: ${text}\n📦 Enviando ${list.length} videos...`, m)

    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      let title = v.title || v.desc || v.caption || 'Sin título'
      let author = v.author || v.username || v.nickname || 'TikTok'
      let tiktokUrl = v.url || v.link || v.videoUrl || v.play

      try {
        // Intenta descargar con la API dl de StellarWA
        let dlUrl = `${api.dl}?url=${encodeURIComponent(tiktokUrl)}&key=${api.key}`
        let dlRes = await fetch(dlUrl)
        let dlJson = await dlRes.json()

        let videoDl = dlJson.result?.video || dlJson.result?.play || dlJson.result?.url || dlJson.data?.play || dlJson.url || tiktokUrl
        if (typeof videoDl === 'object') videoDl = videoDl.url || videoDl.play

        let caption = `‧˚꒰🎃୭ *TT SEARCH #${i+1}* 🦇\n\n👻 *Título:* ${String(title).slice(0,80)}\n🦇 *Autor:* ${author}\n🔍 *Query:* ${text}\n🔗 *Link:* ${tiktokUrl}\n\n━━━━━━━━━━━\n🎃 *LUX X YALLICO*`

        await conn.sendFile(m.chat, videoDl, `ttsearch_${i+1}.mp4`, caption, m)
        await new Promise(r => setTimeout(r, 1500))
      } catch (e) {
        console.log('Error video', i, e)
        continue
      }
    }

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error: ${e.message || e}`, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler