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
  if (!url) throw 'No se pudo subir a Uguu'
  return url
}
async function getEnhancedBuffer(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await fetch(apiUrl, { timeout: 90000 })
  if (!res.ok) throw `Error ${res.status}`
  return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n꒰ ◞⁺⊹ ．${fecha}\n`

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!/image\/(jpe?g|png)/.test(mime)) {
      await react('❌')
      return m.reply(head + `➛ Responde a una imagen con *${usedPrefix + command}* (jpg/png)`, m)
    }
    try {
      await react('⏳')
      const buffer = await q.download()
      const url1 = await uploadToUguu(buffer, mime)
      const buf2k = await getEnhancedBuffer(url1)
      const url2 = await uploadToUguu(buf2k, 'image/jpeg')
      const buf4k = await getEnhancedBuffer(url2)

      await react('✅')
      await conn.sendMessage(m.chat, {
        image: buf4k,
        caption: head + `\n✅ *HD 4K Listo*\n😼 Imagen mejorada a 4K`
      }, { quoted: m })
    } catch (err) {
      await react('❌')
      await m.reply(head + `❌ Error: ${err.message || err}`, m)
    }
}
handler.help = ['hd','upscale','4k']
handler.tags = ['tools']
handler.command = ['hd','upscale','remini','4k']
export default handler