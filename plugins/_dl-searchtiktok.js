import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const api = {
  url: 'https://api.stellarwa.xyz/search/tiktok',
  key: 'proyectsV2'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n\n💀 Usa: *${usedPrefix + command} Bad Bunny*`, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`${api.url}?query=${encodeURIComponent(text)}&key=${api.key}`)
    let json = await res.json()

    let data = json.result || json.data || []
    if (!Array.isArray(data) || !data.length) throw new Error('Sin resultados')

    let list = data.slice(0, 5) // 5 videos en carrusel

    let cards = list.map((v, i) => {
      let title = (v.title || 'Sin título').slice(0, 70)
      let videoUrl = v.dl || v.play

      return {
        body: { text: `🎃 ${title}\n👻 ID: ${v.id}` },
        footer: { text: `LUX X YALLICO - ${fecha}` },
        header: {
          title: `${i+1}. ${title.slice(0,35)}`,
          hasMediaAttachment: true,
          videoMessage: { url: videoUrl }
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🎃 Enviar como Video",
                id: `${usedPrefix}ttdlvid ${videoUrl}`
              })
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🔗 Ver en TikTok",
                url: `https://tiktok.com/@/video/${v.id}`,
                merchant_url: `https://tiktok.com/@/video/${v.id}`
              })
            }
          ]
        }
      }
    })

    await conn.sendMessage(m.chat, {
      text: `🎃 Buscando: ${text}`,
      title: `‧˚꒰🎃୭ LUX X YALLICO 🦇`,
      footer: `Resultados: ${list.length} videos`,
      interactiveMessage: {
        body: { text: `🎃 *TT SEARCH - CARRUSEL* 👻\n🔍 Query: ${text}\n📦 Videos: ${list.length}\n\nDesliza para ver 👻` },
        footer: { text: `LUX X YALLICO • ${fecha}` },
        carouselMessage: { cards }
      }
    }, { quoted: m })

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, `💀 Error: ${e.message || e}`, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler