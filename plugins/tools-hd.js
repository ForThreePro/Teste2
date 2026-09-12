import fetch from 'node-fetch'
import FormData from 'form-data'
import moment from 'moment-timezone'
moment.locale('es')

// ===== CONFIG API STELLAR =====
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
  body.append('files[]', buffer, generateUniqueFilename(mime))

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
  const res = await fetch(apiUrl, { timeout: 60000 })
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
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ MEJORADOR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` ⚠️ —˙𖦹.꒷

── *📖 COMO USAR* ╏ 🍕
➛ Responde a una imagen con: *${usedPrefix + command}*
➛ Soporta: jpg, jpeg, png

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      await react('❌')
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO INVALIDO\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ El formato *${mime}* no es compatible
💡 ➛ Solo jpg, jpeg, png

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
    }

    try {
      await react('⏳')
      await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ PROCESANDO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`MEJORANDO\`\` 🖼️ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
⏳ ➛ Subiendo imagen a Uguu...
⚡ ➛ Mejorando calidad 2x con Stellar...

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer, mime)
      const enhancedBuffer = await getEnhancedBuffer(uploadedUrl)

      await conn.sendMessage(m.chat, {
        image: enhancedBuffer,
        caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ RESULTADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LISTO\`\` ✅ —˙𖦹.꒷

── *📊 DETALLES* ╏ 🍕
✨ ➛ Calidad: Mejorada 2x
🔧 ➛ API: Stellar
👤 ➛ Autor: GARFIELD BOT V2.6

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      }, { quoted: m })

      await react('✅')

    } catch (err) {
      await react('❌')
      await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐃 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ ${err.message || err}
💡 ➛ La API puede estar saturada

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
    }
}

handler.help = ['hd', 'upscale']
handler.tags = ['tools']
handler.command = ['hd', 'upscale', 'remini']
export default handler