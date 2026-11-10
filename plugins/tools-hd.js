import axios from 'axios'
import FormData from 'form-data'
import moment from 'moment-timezone'
moment.locale('es')

async function stellarUpscale(buffer, scale, key) {
  let form = new FormData()
  form.append('file', buffer, { filename: `upscale-${scale}.jpg`, contentType: 'image/jpeg' })
  let url = `https://api.stellarwa.xyz/tools/upscale?method=local&scale=${scale}&key=${key}`

  let { data, headers } = await axios.post(url, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 90000
  })

  // Si devuelve JSON con URL
  let str = data.toString('utf8').slice(0, 500)
  if (str.trim().startsWith('{')) {
    try {
      let json = JSON.parse(data.toString())
      let resultUrl = json.result || json.data || json.url
      if (resultUrl) {
        let img = await axios.get(resultUrl, { responseType: 'arraybuffer' })
        return Buffer.from(img.data)
      }
    } catch {}
  }
  return Buffer.from(data)
}

let handler = async (m, { conn, usedPrefix }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image/.test(mime)) {
    await react('❌')
    return conn.reply(m.chat, head + `\n⤷ ┇ 𝐇𝐃 ﹒ USO ：✿ 。\n\n❄️ Responde a una imagen con *${usedPrefix}hd*\n\n➛ Hará: x2 y luego automático a x4` + foot, m)
  }

  let key = 'proyectsV2'

  try {
    await react('⏳')
    let media = await q.download()
    if (!media || !media.length) throw new Error('No se pudo descargar la imagen')
    if (media.length > 8 * 1024 * 1024) throw new Error(`Imagen muy pesada (${(media.length / 1024 / 1024).toFixed(2)}MB), usa una foto de menos de 8MB para no dar timeout`)

    // PASO 1: x2 - solo reacciona, sin mensaje
    await react('1️⃣')
    let firstHD = await stellarUpscale(media, 2, key)

    // PASO 2: x2 de nuevo = x4 total - solo reacciona, sin mensaje
    await react('2️⃣')
    let finalHD = await stellarUpscale(firstHD, 2, key)

    await conn.sendFile(m.chat, finalHD, 'hd-x4.jpg',
      head + `\n⤷ ┇ 𝐇𝐃 ﹒ COMPLETADO ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` ❄️ —˙𖦹.꒷\n\n❄️ *HD x4 COMPLETADO*\n\n── *📊 DATOS* ╏ ❄️\n✿ ➛ x2 → x4 automático\n✿ ➛ Stellar API` + foot, m)

    await react('❄️')

  } catch (e) {
    console.error(e)
    await react('❌')
    conn.reply(m.chat, head + `\n❌ Error: ${e.message}` + foot, m)
  }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = ['hd', 'upscale', 'mejorar', 'remini']
export default handler