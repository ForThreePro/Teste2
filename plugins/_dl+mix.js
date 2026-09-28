import axios from 'axios'
import FormData from 'form-data'
import moment from 'moment-timezone'
moment.locale('es')

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'png'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, generateUniqueFilename(mime))
  const res = await axios.post('https://uguu.se/upload.php', body, { headers: body.getHeaders(), timeout: 30000 })
  const url = res.data?.files?.[0]?.url
  if (!url) throw new Error('No se pudo subir a Uguu')
  return url
}

async function apiWithRetry(url, timeoutMs = 120000) {
  let lastErr
  for (let i=0;i<3;i++) {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: timeoutMs })
      if (!res.data || res.data.length < 5000) throw new Error('Respuesta vacía')
      return Buffer.from(res.data)
    } catch(e) {
      lastErr = e
      console.log(`[RETRY ${i+1}]`, e.message)
      await new Promise(r=>setTimeout(r, 2000*(i+1)))
    }
  }
  throw lastErr
}

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐇𝐄𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀 ﹒ ${command.toUpperCase()} ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n`
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return conn.sendMessage(m.chat, { text: head+`\n❌ Responde a una imagen JPG/PNG con *.${command}*` }, { quoted: m })
    }

    try {
        await m.react('⏳')
        const buffer = await q.download()
        if (buffer.length > 5*1024*1024) {
          await m.react('❌')
          return m.reply(head+`\n❌ Imagen muy pesada, máx 5MB`)
        }

        const uploadedUrl = await uploadToUguu(buffer, mime)

        // 1. Upscale
        const hdBuffer = await apiWithRetry(`${api.url}/tools/upscale?url=${encodeURIComponent(uploadedUrl)}&scale=4&key=${api.key}`, 120000)
        const hdUrl = await uploadToUguu(hdBuffer, 'image/png')

        // 2. RemoveBG
        const finalBuffer = await apiWithRetry(`${api.url}/tools/removebg?url=${encodeURIComponent(hdUrl)}&key=${api.key}`, 90000)

        await m.react('✅')
        await conn.sendMessage(m.chat, { image: finalBuffer, caption: head+`\n✅ HD 4x + Sin fondo listo 😼` }, { quoted: m })
        await conn.sendMessage(m.chat, { document: finalBuffer, fileName: 'image-hdx4-nobg.png', mimetype: 'image/png' }, { quoted: m })

    } catch (err) {
        console.log('[REMOVEBG ERROR]', err.message)
        await m.react('❌')
        let msg = err.message || String(err)
        if (msg.includes('504') || msg.toLowerCase().includes('timeout')) msg = 'La API tardó demasiado (504). Prueba con imagen más pequeña o espera 1 min.'
        return conn.sendMessage(m.chat, { text: head+`\n❌ ${msg}` }, { quoted: m })
    }
}

handler.help = ['removebg']
handler.tags = ['tools']
handler.command = /^(removebg|rbg|nobg)$/i
export default handler