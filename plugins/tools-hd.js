import fetch from 'node-fetch'
import FormData from 'form-data'
import moment from 'moment-timezone'
moment.locale('es')

const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2'
}

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'jpg'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const body = new FormData()
  body.append('files[]', buffer, generateUniqueFilename(mime || 'image/jpeg'))

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
    timeout: 30000
  })

  const json = await res.json()
  const url = json.files?.[0]?.url
  if (!url) throw 'No se pudo subir a Uguu'
  return url
}

async function getEnhancedBuffer(url) {
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await fetch(apiUrl, { timeout: 90000 })
  if (!res.ok) throw `Error ${res.status}: ${await res.text()}`
  return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) {
      await react('❌')
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ MEJORADOR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` ⚠️ —˙𖦹.꒷

── *📖 COMO USAR* ╏ 🍕
➛ Responde a una imagen con: *${usedPrefix + command}*
➛ Soporta: jpg, jpeg, png
😼 ➛ Garfield la pondrá en 4K pe

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      await react('❌')
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO INVALIDO\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 😼
❌ ➛ El formato *${mime}* no es compatible
💡 ➛ Solo jpg, jpeg, png

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)
    }

    try {
      await react('⏳')
      let statusMsg = await conn.sendMessage(m.chat, {
        text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ PROCESANDO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`MEJORANDO\`\` 🖼️ —˙𖦹.꒷

── *📊 ESTADO* ╏ 😼
⏳ ➛ [1/4] Subiendo imagen...
⚡ ➛ Objetivo: 2K → 4K automático

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
      }, { quoted: m })

      const buffer = await q.download()

      // PASO 1: SUBIR ORIGINAL
      const uploadedUrl1 = await uploadToUguu(buffer, mime)

      await conn.sendMessage(m.chat, {
        text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ PROCESANDO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FASE 1/2\`\` 🖼️ —˙𖦹.꒷

── *📊 ESTADO* ╏ 😼
✅ ➛ [1/4] Imagen subida
⏳ ➛ [2/4] Mejorando a 2K...
⚡ ➛ API: Stellar

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`,
        edit: statusMsg.key
      })

      // PASO 2: 2K
      const buffer2K = await getEnhancedBuffer(uploadedUrl1)

      await conn.sendMessage(m.chat, {
        text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ PROCESANDO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FASE 2/2\`\` 🚀 —˙𖦹.꒷

── *📊 ESTADO* ╏ 😼
✅ ➛ [2/4] Mejorada a 2K
⏳ ➛ [3/4] Subiendo 2K...
⏳ ➛ [4/4] Mejorando a 4K...
🍕 ➛ Casi lista la lasaña en HD

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`,
        edit: statusMsg.key
      })

      // PASO 3: SUBIR 2K PARA RE-ESCALAR A 4K
      const uploadedUrl2 = await uploadToUguu(buffer2K, 'image/jpeg')
      const buffer4K = await getEnhancedBuffer(uploadedUrl2)

      await conn.sendMessage(m.chat, {
        image: buffer4K,
        caption: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ RESULTADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LISTO\`\` ✅ —˙𖦹.꒷
😼 Garfield la dejó en 4K sin moverse

── *📊 DETALLES* ╏ 🍕
✨ ➛ Fase 1: Original → 2K
🚀 ➛ Fase 2: 2K → 4K Ultra HD
🔧 ➛ API: Stellar x2
👤 ➛ Autor: LUX X YALLICO 😼

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
      }, { quoted: m })

      await react('✅')

    } catch (err) {
      await react('❌')
      await m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷
😼 Se le quemó la lasaña a la API

── *📝 AVISO* ╏ 🍕
❌ ➛ ${err.message || err}
💡 ➛ La API puede estar saturada, intenta de nuevo

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)
    }
}

handler.help = ['hd', 'upscale', '4k']
handler.tags = ['tools']
handler.command = ['hd', 'upscale', 'remini', '4k']
export default handler