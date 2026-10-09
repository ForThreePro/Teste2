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
    return conn.reply(m.chat, `💀 Usa: *${usedPrefix + command} Bad Bunny*`, m)
  }

  try {
    await react('⏳')
    let res = await fetch(`${api.url}?query=${encodeURIComponent(text)}&key=${api.key}`)
    let json = await res.json()
    let data = json.result || []
    if (!data.length) throw new Error('Sin resultados')

    let list = data.slice(0, 5)

    // 1. CARRUSEL CON IMAGEN (este SI aparece)
    let cards = list.map((v, i) => {
      let title = (v.title || 'Sin título').slice(0, 60)
      return {
        body: { text: `🎃 ${title}\n👻 Video ${i+1}` },
        footer: { text: `LUX X YALLICO - ${fecha}` },
        header: {
          title: `${i+1}. ${title.slice(0,35)}`,
          hasMediaAttachment: true,
          imageMessage: { 
            url: v.cover || v.thumbnail || `https://telegra.ph/file/320b066dc81928b782c7b.png` 
          }
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🎃 Descargar este",
                id: `${usedPrefix}ttdl https://www.tiktok.com/@/video/${v.id}`
              })
            }
          ]
        }
      }
    })

    await conn.sendMessage(m.chat, {
      text: " ",
      title: "🎃 LUX X YALLICO",
      footer: "Elige un video 👻",
      interactiveMessage: {
        body: { text: `🎃 *TT SEARCH* 👻\n🔍 ${text}\n📦 5 resultados - Desliza 👻` },
        footer: { text: `LUX X YALLICO • ${fecha}` },
        carouselMessage: { cards }
      }
    }, { quoted: m })

    // 2. MANDA LOS 5 VIDEOS DESPUES DEL CARRUSEL
    await conn.reply(m.chat, `⏳ Enviando 5 videos de *${text}*...`, m)

    for (let v of list) {
      try {
        let cap = `‧˚꒰🎃୭ *${(v.title||'').slice(0,80)}* 🦇\n🆔 ${v.id}`
        await conn.sendFile(m.chat, v.dl, 'tt.mp4', cap, m)
        await new Promise(r => setTimeout(r, 1000))
      } catch {}
    }

    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, `💀 Error: ${e.message}`, m)
  }
}

handler.help = ['ttsearch <texto>']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch', 'ttss']
export default handler