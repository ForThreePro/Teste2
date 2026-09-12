import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  let q = m.quoted ? m.quoted : m
  let txt = text || q.text || q.caption || q.body || ''

  if (!txt) {
    await react('❌')
    return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐑𝐀𝐓 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR DE USO\`\` ⚠️ —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛ Escribe el texto para generar el sticker
➛ Ejemplo: ${usedPrefix}${command} whois

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
  }

  await react('🖌️')

  let apiUrl = `https://api.stellarwa.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=proyectsV2`

  try {
    let response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`API ${response.status}`)

    let inputBuffer = await response.buffer()
    
    // La API devuelve GIF, agarramos solo frame 1
    let tmpInput = path.join(tmpdir(), `brat-${Date.now()}.gif`)
    let tmpOutput = path.join(tmpdir(), `brat-${Date.now()}.webp`)

    fs.writeFileSync(tmpInput, inputBuffer)

    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput)
        .frames(1) // SOLO PRIMER FRAME
        .videoFilters('scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x000')
        .toFormat('webp')
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
        .save(tmpOutput)
    })

    let stickerBuffer = fs.readFileSync(tmpOutput)

    await conn.sendMessage(m.chat, {
      sticker: stickerBuffer,
      packname: 'GARFIELD BOT',
      author: 'V2.6'
    }, { quoted: m })

    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput)
    await react('✅')

  } catch (e) {
    console.error("[BRAT ERROR]:", e)
    await react('❌')
    return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐑𝐀𝐓 ﹒ ERROR ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DETALLE* ╏ 🍕
❌ ➛ ${e.message}
💡 ➛ Verifica que ffmpeg esté instalado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = /^brat$/i

export default handler