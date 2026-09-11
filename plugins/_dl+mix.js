import axios from 'axios'
import FormData from 'form-data'
import { downloadContentFromMessage } from "@whiskeysockets/baileys"
import moment from 'moment-timezone'
moment.locale('es')

// ===== CONFIG API STELLAR =====
const api = {
    url: 'https://api.stellarwa.xyz',
    key: 'proyectsV2' // Solo esta key
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
  const res = await axios.post('https://uguu.se/upload.php', body, {
    headers: body.getHeaders(),
    timeout: 30000
  })
  const url = res.data?.files?.[0]?.url
  if (!url) throw new Error('No se pudo subir a Uguu')
  return url
}

async function upscaleImage(url) {
  // CAMBIO: scale=4 para HDx4
  const apiUrl = `${api.url}/tools/upscale?url=${encodeURIComponent(url)}&scale=4&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 90000 }) // +30s por el HDx4
  if (!res.data) throw new Error('Stellar HDx4 no devolvió imagen')
  return Buffer.from(res.data)
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 })
  if (!res.data) throw new Error('Stellar RemoveBG no devolvió imagen')
  return Buffer.from(res.data)
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!mime) {
        let menuUso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐇𝐄𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🖼️ ࣪ ꕀ.${command} ˚. ᵎᵎ
> *"HDx4: Para que se vea pro como Garfield"*

.⃟𖥔 ݁. 𖦹˙— \`\`IA\`\` ✨ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
🖼️ ➛ Mejora la calidad de una imagen a *HD 4x*
🖼️ ➛ Elimina el fondo automáticamente

── *📖 USO* ╏ 🍕
1️⃣ ➛ Responde a una imagen con:.*${command}*
2️⃣ ➛ Envía formatos: JPG o PNG

── *⚙️ PROCESO* ╏ 🍕
⬆️ ➛ Paso 1: Mejora a HD 4x
🗑️ ➛ Paso 2: Quita el fondo
📤 ➛ Paso 3: Envía imagen + documento

── *⚠️ NOTA* ╏ 🍕
⏱️ ➛ HDx4 tarda un poco más pero vale la pena

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
        let menuError = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
❌ ➛ Solo se aceptan imágenes JPG/PNG

── *📖 USO* ╏ 🍕
➛ Responde a una imagen con:.*${command}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
    }

    try {
        await m.react('⏳')
        await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` ⚙️ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
⬆️ ➛ Mejorando calidad a *HD 4x*...
🗑️ ➛ Eliminando fondo...
📤 ➛ Subiendo resultado...
⏱️ ➛ Esto puede tardar 20-40s

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)

        // Proceso completo
        const buffer = await q.download()
        const uploadedUrl = await uploadToUguu(buffer, mime)
        const hdBuffer = await upscaleImage(uploadedUrl) // HDx4
        const hdUrl = await uploadToUguu(hdBuffer, 'image/png')
        const finalBuffer = await removeBgFromUrl(hdUrl)

        // Mensaje 1: Imagen
        await conn.sendMessage(m.chat, {
            image: finalBuffer,
            caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ✨ —˙𖦹.꒷

── *📊 RESULTADO* ╏ 🍕
📌 ➛ Calidad: *HD 4x*
📌 ➛ Fondo: *Eliminado*
📌 ➛ Formato: *PNG Transparente*

── *📥 DESCARGA* ╏ 🍕
⬇️ ➛ También se envió como documento

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        }, { quoted: m })

        // Mensaje 2: Documento
        await conn.sendMessage(m.chat, {
            document: finalBuffer,
            fileName: 'image-hdx4-nobg.png',
            mimetype: 'image/png',
            caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓𝐎 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DOCUMENTO\`\` 📄 —˙𖦹.꒷

── *📊 INFO* ╏ 🍕
📄 ➛ Imagen PNG sin fondo HDx4
✨ ➛ Lista para usar en diseños

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        let menuErr = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
❌ ➛ ${err.message || err}

── *💡 SOLUCIÓN* ╏ 🍕
🔧 ➛ Usa una imagen clara JPG/PNG
🔧 ➛ Máx 5MB recomendado para HDx4

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
    }
}

handler.help = ['removebg', 'rbg', 'nobg']
handler.tags = ['tools']
handler.command = /^(removebg|rbg|nobg)$/i
export default handler