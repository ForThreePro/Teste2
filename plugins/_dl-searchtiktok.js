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

  if (!text) return conn.reply(m.chat, head + `\n💀 Usa: *${usedPrefix + command} Bad Bunny*` + footer, m)

  let type = ''
  if (['ttsearch','tiktoksearch','ttss'].includes(command)) type = 'tiktok'
  if (['pinterest','pin'].includes(command)) type = 'pinterest'
  if (['pinvid','pinterestvideo'].includes(command)) type = 'pinterestvideo'
  if (['ytsearch','yts','ytbuscar'].includes(command)) type = 'yt'
  if (['apk','apksearch','apkdl'].includes(command)) type = 'apk'
  if (['igsearch','instagramsearch'].includes(command)) type = 'instagram'
  if (['fbsearch','facebooksearch'].includes(command)) type = 'facebook'
  if (['spotify','spotifysearch'].includes(command)) type = 'spotify'
  if (['soundcloud','scsearch'].includes(command)) type = 'soundcloud'
  if (['deezer'].includes(command)) type = 'deezer'

  try {
    await react('⏳')

    // ========= FUNCION DESCARGA UNIVERSAL =========
    const tryDownload = async (videoUrl, endpoints) => {
      for (let ep of endpoints) {
        try {
          let r = await fetch(ep)
          let j = await r.json().catch(()=>null)
          if (!j) {
            // si no es json, puede ser redirect directo
            if (r.url && r.url.startsWith('http') && r.url!== ep) return r.url
            continue
          }
          let dl = j.result?.dl || j.result?.url || j.result?.download || j.result || j.dl || j.url || j.link
          if (typeof dl === 'object') dl = dl.url || dl.dl
          if (typeof dl === 'string' && dl.startsWith('http')) return dl
        } catch {}
      }
      return null
    }

    // ========= SEARCH BASE =========
    let sRes = await fetch(`${BASE}/search/${type}?query=${encodeURIComponent(text)}&key=${API_KEY}`)
    let sJson = await sRes.json()
    let sData = sJson.result || sJson.data || sJson.results || sJson
    if (!Array.isArray(sData)) {
      if (sData.videos) sData = sData.videos
      else if (sData.pins) sData = sData.pins
      else if (sData.images) sData = sData.images
      else if (sData.tracks) sData = sData.tracks
      else sData = [sData]
    }
    sData = sData.flat().filter(Boolean)
    if (!sData.length) throw new Error('Sin resultados')
    let v = sData[Math.floor(Math.random() * sData.length)]

    let title = v.title || v.name || v.caption || text
    let thumb = v.thumbnail || v.thumb || v.image || v.cover || v.artwork || v.icon
    let videoUrl = v.url || v.link || v.videoUrl || v.permalink || ''

    // ========= CASOS CON DESCARGA =========
    if (['yt','instagram','facebook','tiktok','spotify','soundcloud','deezer','apk','pinterestvideo'].includes(type)) {
      let dlEndpoints = []

      if (type === 'yt') {
        dlEndpoints = [
          `${BASE}/download/ytmp4?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/yt?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'instagram') {
        dlEndpoints = [
          `${BASE}/download/ig?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/instagram?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'facebook') {
        dlEndpoints = [
          `${BASE}/download/fb?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/facebook?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'tiktok') {
        dlEndpoints = [
          `${BASE}/download/tiktok?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/tt?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'spotify') {
        dlEndpoints = [
          `${BASE}/download/spotify?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/sp?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'soundcloud') {
        dlEndpoints = [
          `${BASE}/download/soundcloud?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
          `${BASE}/download/sc?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'deezer') {
        dlEndpoints = [
          `${BASE}/download/deezer?url=${encodeURIComponent(videoUrl)}&key=${API_KEY}`,
        ]
      } else if (type === 'apk') {
        dlEndpoints = [
          `${BASE}/download/apk?query=${encodeURIComponent(text)}&key=${API_KEY}`,
          `${BASE}/download/apk?package=${encodeURIComponent(v.id||v.package||text)}&key=${API_KEY}`,
        ]
      } else if (type === 'pinterestvideo') {
        // pinvid ya trae dl directo
        let direct = v.dl || v.video || v.videoUrl
        if (direct && direct.startsWith('http')) {
          await conn.sendFile(m.chat, direct, 'pinvid.mp4', head + `\n‧˚꒰🦇୭ *PINTEREST VIDEO* 🎃\n\n꒰ 👻 ꒱ ${title.slice(0,80)}\n` + footer, m)
          await react('🎃')
          return
        }
      }

      let mediaDl = null
      if (type!== 'pinterestvideo') {
        // si el objeto ya trae dl directo
        if (v.dl && typeof v.dl === 'string' && v.dl.startsWith('http')) mediaDl = v.dl
        else mediaDl = await tryDownload(videoUrl, dlEndpoints)
      }

      let caption = head + `\n‧˚꒰🦇୭ *${type.toUpperCase()}* 🎃\n\n`
      caption += `꒰ 👻 ꒱ *${String(title).slice(0,80)}*\n`
      caption += `꒰ 🔍 ꒱ ${text}\n`
      if (v.author || v.artist) caption += `꒰ 🦇 ꒱ ${v.author||v.artist}\n`
      caption += footer

      if (!mediaDl) {
        // fallback: manda thumb + link
        if (thumb) await conn.sendFile(m.chat, thumb, 'thumb.jpg', caption + `\n🔗 ${videoUrl}`, m)
        else await conn.reply(m.chat, caption + `\n🔗 ${videoUrl}\n\n💀 No se pudo descargar directo`, m)
        await react('💀')
        return
      }

      // ENVIAR SEGUN TIPO
      if (['instagram','facebook','yt','tiktok','pinterestvideo'].includes(type)) {
        await conn.sendFile(m.chat, mediaDl, `${type}.mp4`, caption, m)
      } else if (['spotify','soundcloud','deezer'].includes(type)) {
        if (thumb) {
          try { await conn.sendFile(m.chat, thumb, 'thumb.jpg', caption, m) } catch {}
        }
        await conn.sendFile(m.chat, mediaDl, `${title}.mp3`, `🎧 *${title}* - LUX X YALLICO 🎃`, m, false, { mimetype: 'audio/mpeg' })
      } else if (type === 'apk') {
        if (thumb) {
          try { await conn.sendFile(m.chat, thumb, 'icon.jpg', caption, m) } catch {}
        }
        await conn.sendMessage(m.chat, { document: { url: mediaDl }, mimetype: 'application/vnd.android.package-archive', fileName: `${title}.apk` }, { quoted: m })
      }

      await react('🎃')
      return
    }

    // ========= PINTEREST IMAGEN =========
    const extractUrl = (obj) => {
      let d = obj.image || obj.img || obj.src || obj.url || obj.media || obj.dl
      if (typeof d === 'string' && d.startsWith('http')) return d
      for (let k in obj) if (typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k]
      let m2 = JSON.stringify(obj).match(/https?:\/\/[^\s"']+/g)
      return m2? m2[0] : null
    }
    let mediaUrl = extractUrl(v)
    await conn.sendFile(m.chat, mediaUrl, `${type}.jpg`, head + `\n‧˚꒰🦇୭ *${type.toUpperCase()}* 🎃\n\n꒰ 👻 ꒱ ${title.slice(0,80)}\n` + footer, m)
    await react('🎃')

  } catch (e) {
    console.error(e)
    await react('💀')
    return conn.reply(m.chat, head + `\n💀 Error en *${type}*: ${e.message}` + footer, m)
  }
}

handler.help = ['igsearch','fbsearch','spotify','soundcloud','deezer','ytsearch','apk','ttsearch','pinterest','pinvid']
handler.tags = ['search','downloader']
handler.command = ['igsearch','instagramsearch','fbsearch','facebooksearch','spotify','spotifysearch','soundcloud','scsearch','deezer','ytsearch','yts','ytbuscar','apk','apksearch','ttsearch','tiktoksearch','ttss','pinterest','pin','pinvid','pinterestvideo']

export default handler