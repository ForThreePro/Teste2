import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `‧˚꒰🎃୭ 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🦇\n\n꒰ ◞⁺⊹ ．${fecha}\n`

  let q = m.quoted ? m.quoted : m
  let txt = text || q.text || q.caption || ''
  if (!txt) {
    await react('💀')
    return m.reply(head + `\n💀 Usa: *${usedPrefix}${command} Tu texto*`, m)
  }

  try {
    await react('⏳')
    // Intenta con params por si Stellar los agrega luego
    let apiUrl = `https://api.stellarwa.xyz/tools/brat?text=${encodeURIComponent(txt)}&bg=%2392D1D6&fg=%23000000&color=92D1D6&background=92D1D6&textcolor=000000&key=proyectsV2`
    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`API ${res.status}`)
    let inputBuffer = await res.buffer()

    let tmpInput = path.join(tmpdir(), `brat-${Date.now()}.gif`)
    let tmpRecolor = path.join(tmpdir(), `brat-c-${Date.now()}.gif`)
    let tmpOutput = path.join(tmpdir(), `brat-${Date.now()}.webp`)
    fs.writeFileSync(tmpInput, inputBuffer)

    // CAMBIA BLANCO (#FFFFFF) POR #92D1D6 (146,209,214) - deja negro intacto
    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput)
        .videoFilters(
          "format=rgba,geq=r='if(gt(r(X,Y),200)*gt(g(X,Y),200)*gt(b(X,Y),200),146,r(X,Y))':g='if(gt(r(X,Y),200)*gt(g(X,Y),200)*gt(b(X,Y),200),209,g(X,Y))':b='if(gt(r(X,Y),200)*gt(g(X,Y),200)*gt(b(X,Y),200),214,b(X,Y))'"
        )
        .on('end', resolve).on('error', reject)
        .save(tmpRecolor)
    })

    await new Promise((resolve, reject) => {
      ffmpeg(tmpRecolor).frames(1).size('512x512').aspect('1:1').autopad()
        .outputOptions('-vcodec','libwebp','-lossless','0','-q:v','80','-preset','picture','-an','-vsync','0')
        .toFormat('webp').on('end',resolve).on('error',reject).save(tmpOutput)
    })

    let stickerBuffer = fs.readFileSync(tmpOutput)
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    try { fs.unlinkSync(tmpInput); fs.unlinkSync(tmpRecolor); fs.unlinkSync(tmpOutput) } catch {}
    await react('🎃')
  } catch (e) {
    console.error(e)
    await react('💀')
    await m.reply(head + `\n💀 Error al generar sticker embrujado: ${e.message}`, m)
  }
}

handler.help = ['brat2 <texto>']
handler.tags = ['sticker']
handler.command = /^brat2$/i
export default handler