import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import { fileTypeFromBuffer } from "file-type"
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/video/.test(mime)) {
    await react('❌')
    return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ USO ：✿ 。\n\n➛ Responde a un video con *${usedPrefix + command}* ❄️` + foot, m)
  }

  try {
    await react('⏳')
    // 1. Subir tu video a Evogb
    let media = await q.download()
    let link = await myCloud(media)
    // 2. Pedir el HD a la API
    let res = await fetch(`https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(link.url)}`)
    let json = await res.json()
    let resultUrl = json.result
    // 3. Esperar a que termine (max 90s) y mandarte el link
    let videoBuffer = null
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000))
      let check = await fetch(resultUrl)
      if ((check.headers.get('content-type') || '').includes('video')) {
        videoBuffer = Buffer.from(await check.arrayBuffer())
        break
      }
      let t = await check.text()
      try {
        let j = JSON.parse(t)
        let finalUrl = j.url || j.result_url || j.download || j.data?.url
        if (finalUrl && finalUrl.includes('http') && finalUrl !== resultUrl) {
          let v = await fetch(finalUrl)
          videoBuffer = Buffer.from(await v.arrayBuffer())
          break
        }
      } catch {}
    }
    if (!videoBuffer) throw new Error('La API demoró mucho, intenta con un video más corto')
    // 4. Subir el HD a Evogb y darte el link
    let hd = await myCloud(videoBuffer)
    await react('❄️')
    return await conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 𝐕𝐈𝐃𝐄𝐎 ﹒ LISTO ：✿ 。\n\n🔗 ➛ ${hd.url}` + foot, m)
  } catch (e) {
    await react('❌')
    await conn.reply(m.chat, head + `\n❌ ${e.message || e}` + foot, m)
  }
}

async function myCloud(content) {
  const fileType = await fileTypeFromBuffer(content)
  const ext = fileType ? fileType.ext : 'mp4'
  const mime = fileType ? fileType.mime : 'video/mp4'
  const formData = new FormData()
  formData.append("file", new Blob([content], { type: mime }), `${crypto.randomBytes(5).toString("hex")}.${ext}`)
  const response = await fetch("https://evogb.win/api/upload", { method: "POST", body: formData })
  return await response.json()
}

handler.help = ['hdvid']
handler.tags = ['tools']
handler.command = ['hdvid']
export default handler