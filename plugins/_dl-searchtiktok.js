import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const api = {
  url: 'https://api.stellarwa.xyz/search/tiktok',
  key: 'api-proyectsV2'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇`
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }

  if (!text) {
    await react('💀')
    return conn.reply(m.chat, `${head}\n\n💀 Ingresa un texto\n\nEj: *${usedPrefix + command} Bad Bunny*`, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`${api.url}?query=${encodeURIComponent(text)}&key=${api.key}`)
    let json = await res.json()
    let data = json.result || json.data || json.results || []
    if (!Array.isArray(data)) data = [data]
    if (!data.length) throw 'Sin resultados'

    let list = data.slice(0, 7)

    // Creamos el carrusel
    let cards = list.map((v, i) => {
      let title = (v.title || v.desc || v.caption || 'Sin título').slice(0, 60)
      let author = v.author || v.username || v.nickname || 'TikTok'
      let videoUrl = v.url || v.link || v.videoUrl || ''
      let cover = v.cover || v.thumbnail || v.image || 'https://telegra.ph/file/320b066dc81928b782c7b.png'
      
      return {
        body: { text: `🎃 *${title}*\n👻 Autor: ${author}` },
        footer: { text: `LUX X YALLICO - ${fecha}` },
        header: {
          title: `${i+1}. ${title}`,
          hasMediaAttachment: true,
          imageMessage: { url: cover }
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🔗 Ver en TikTok",
                url: videoUrl,
                merchant_url: videoUrl
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🎃 Descargar Video",
                id: `${usedPrefix}ttdl ${videoUrl}`
              })
            }
          ]
        }
      }
    })

    await conn.sendMessage(m.chat, {
      text: `${head}\n\n꒰ ◞⁺⊹ ．${fecha}\n\n🎃 *TT SEARCH* 👻\n🔍 Query: ${text}\n📦 Resultados: ${list.length}`,
      title: "🎃 LUX X YALLICO - TT SEARCH 🦇",
      footer: "Desliza para ver más 👻",
      interactiveMessage: {
        body: { text: `🎃 Resultados para: ${text}` },
        footer: { text: "LUX X YALLICO - HALLOWEEN" },
        carouselMessage: { cards }
      }
    }, { quoted: m })

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    await conn.reply(m.chat, `💀 Error: ${e.message || e}`, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['descargas']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']

export default handler