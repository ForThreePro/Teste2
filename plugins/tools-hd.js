import fetch from 'node-fetch'
import FormData from 'form-data'
import moment from 'moment-timezone'
moment.locale('es')

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'jpg'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, generateUniqueFilename(mime || 'image/jpeg'))
  const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders(), timeout: 30000 })
  const json = await res.json()
  const url = json.files?.[0]?.url
  if (!url) throw new Error('No se pudo subir a Uguu')
  return url
}

async function getEnhancedBuffer(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  let lastErr
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(apiUrl, { timeout: 120000 })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 5000) throw new Error('Respuesta vacía')
      return buf
    } catch (e) {
      lastErr = e
      console.log(`[HD] Intento ${i+1} fallido:`, e.message)
      await new Promise(r => setTimeout(r, 2000 * (i+1)))
    }
  }
  throw lastErr
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n꒰ ◞⁺⊹ ．${fecha}\n`

    const q = m.quoted? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!/image\/(jpe?g|png)/.test(mime)) {
      await react('❌')
      return m.reply(head + `➛ Responde a una imagen con *${usedPrefix + command}* (jpg/png)`)
    }
    try {
      await react('⏳')
      const buffer = await q.download()
      if (buffer.length > 4 * 1024 * 1024) {
        await react('❌')
        return m.reply(head + `❌ Imagen muy pesada (máx 4MB)`)
      }
      const url1 = await uploadToUguu(buffer, mime)
      const bufHD = await getEnhancedBuffer(url1)

      await react('✅')
      await conn.sendMessage(m.chat, {
        image: bufHD,
        caption: head + `\n✅ *HD Listo*\n😼 Imagen mejorada`
      }, { quoted: m })
    } catch (err) {
      console.log('[HD ERROR]', err)
      await react('❌')
      let msg = err.message || String(err)
      if (msg.includes('504') || msg.includes('timeout')) msg = 'La API tardó demasiado. Intenta con una imagen más pequeña o espera 1 min.'
      await m.reply(head + `❌ Error: ${msg}`)
    }
}
handler.help = ['hd','upscale','4k']
handler.tags = ['tools']
handler.command = ['hd','upscale','remini','4k']
export default handler