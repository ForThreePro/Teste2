import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { addExif } from '../lib/sticker.js'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  // Marca de ventas fija
  const PACK = 'PHANTOM PLUS'
  const AUTHOR = '@whois.yallico • +51 927 174 369'

  let q = m.quoted ? m.quoted : m
  let txt = text || q.text || q.caption || ''
  if (!txt) {
    await react('❌')
    return m.reply(head + `\n⤷ ┇ 𝐁𝐑𝐀𝐓 ﹒ USO ：✿ 。\n\n❌ Usa: *${usedPrefix}${command} Tu texto*` + foot, m)
  }

  try {
    await react('⏳')
    let apiUrl = `https://api.stellarwa.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=proyectsV2`
    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`API ${res.status}`)
    let inputBuffer = await res.buffer()

    let tmpInput = path.join(tmpdir(), `brat-${Date.now()}.gif`)
    let tmpOutput = path.join(tmpdir(), `brat-${Date.now()}.webp`)
    fs.writeFileSync(tmpInput, inputBuffer)

    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput).frames(1).size('512x512').aspect('1:1').autopad()
        .outputOptions('-vcodec','libwebp','-lossless','0','-q:v','50','-preset','picture','-an','-vsync','0')
        .toFormat('webp').on('end',resolve).on('error',reject).save(tmpOutput)
    })

    let stickerBuffer = fs.readFileSync(tmpOutput)
    // Marca Phantom Plus
    stickerBuffer = await addExif(stickerBuffer, PACK, AUTHOR)
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    fs.unlinkSync(tmpInput); fs.unlinkSync(tmpOutput)
    await react('❄️')
  } catch (e) {
    await react('❌')
    await m.reply(head + `\n⤷ ┇ 𝐁𝐑𝐀𝐓 ﹒ ERROR ：✿ 。\n\n❌ Error al generar sticker` + foot, m)
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = /^brat$/i
export default handler