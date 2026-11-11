import crypto from "crypto"
import { FormData, Blob } from "formdata-node"
import FormDataNode from "form-data"
import { fileTypeFromBuffer } from "file-type"
import fetch from 'node-fetch'
import axios from 'axios'

const STELLAR_KEY = 'proyectsV2'

async function myCloud(content) {
  const ft = await fileTypeFromBuffer(content)
  const form = new FormData()
  form.append("file", new Blob([content], { type: ft?.mime || 'image/jpeg' }), `${crypto.randomBytes(5).toString("hex")}.${ft?.ext || 'jpg'}`)
  const r = await fetch("https://evogb.win/api/upload", { method: "POST", body: form })
  const j = await r.json()
  return j.url || j.data?.url
}

async function stellarUpscale(buffer, scale) {
  let form = new FormDataNode()
  form.append('file', buffer, { filename: `upscale-${scale}.jpg`, contentType: 'image/jpeg' })
  let url = `https://api.stellarwa.xyz/tools/upscale?method=local&scale=${scale}&key=${STELLAR_KEY}`
  let { data } = await axios.post(url, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 120000
  })
  let str = Buffer.from(data).toString('utf8').slice(0, 500)
  if (str.trim().startsWith('{')) {
    try {
      let json = JSON.parse(Buffer.from(data).toString())
      let resultUrl = json.result || json.data || json.url
      if (resultUrl) {
        let img = await axios.get(resultUrl, { responseType: 'arraybuffer' })
        return Buffer.from(img.data)
      }
    } catch {}
  }
  return Buffer.from(data)
}

async function stellarRemovebg(buffer) {
  try {
    let form = new FormDataNode()
    form.append('file', buffer, { filename: `removebg.jpg`, contentType: 'image/jpeg' })
    let { data, headers } = await axios.post(
      `https://api.stellarwa.xyz/tools/removebg?method=local&key=${STELLAR_KEY}`,
      form,
      { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 120000, maxContentLength: Infinity, maxBodyLength: Infinity }
    )
    return parseStellarResult(data, headers)
  } catch (e1) {
    console.log('Removebg POST falló, intentando GET url:', e1.message)
  }
  let linkTmp = await myCloud(buffer)
  const apiUrl = `https://api.stellarwa.xyz/tools/removebg?method=url&url=${encodeURIComponent(linkTmp)}&key=${STELLAR_KEY}`
  const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 120000, headers: { 'User-Agent': 'Mozilla/5.0' } })
  return parseStellarResult(data, {})
}

async function parseStellarResult(data, headers = {}) {
  const ct = headers['content-type'] || ''
  if (ct.includes('image') || !Buffer.from(data).toString('utf8').slice(0, 200).trim().startsWith('{')) {
    try {
      const txt = Buffer.from(data).toString('utf8')
      if (txt.trim().startsWith('{')) throw new Error('es json')
      return Buffer.from(data)
    } catch {}
  }
  const j = JSON.parse(Buffer.from(data).toString())
  let resultData = j.result?.url || j.result?.image || j.result?.data || j.result || j.url || j.data || j.image
  if (typeof resultData === 'object') resultData = resultData.url || resultData.image || resultData.data
  if (!resultData) throw new Error('API vacía: ' + JSON.stringify(j).slice(0, 200))
  const str = String(resultData).trim()
  if (str.startsWith('http')) {
    const { data: img } = await axios.get(str, { responseType: 'arraybuffer', timeout: 120000 })
    return Buffer.from(img.data)
  } else if (str.startsWith('data:image')) {
    return Buffer.from(str.split(',')[1], 'base64')
  } else {
    return Buffer.from(str, 'base64')
  }
}

let handler = async (m, { conn, text }) => {
  let link = text?.trim()
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  let media = null
  if (link && /^https?:\/\//i.test(link)) {
    try {
      const { data } = await axios.get(link, { responseType: 'arraybuffer' })
      media = Buffer.from(data)
    } catch {}
  } else if (/image/.test(mime)) {
    media = await q.download()
    link = null
  }

  if (!media && !link) {
    await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
    return conn.sendMessage(m.chat, { text: `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰❄️꒱ Responde a una imagen o manda link\n\n❄️ Ejemplo: *.removebg*\n❄️ Ejemplo: *.removebg https://link.jpg*\n\nPasos: 1️⃣ Sube a Evogb → 2️⃣ HD x2 → x4 → 3️⃣ Quita fondo\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━` }, { quoted: m })
  }

  // ===== MEJORA 8 APLICADA: 1 solo mensaje editable, no 4 mensajes =====
  let procMsg = null
  const sendProc = async (pasoTexto) => {
    const txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n${pasoTexto}\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`
    try {
      if (!procMsg) {
        procMsg = await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { text: txt, edit: procMsg.key })
      }
    } catch {}
  }
  const deleteProc = async () => {
    if (!procMsg) return
    try { await conn.sendMessage(m.chat, { delete: procMsg.key }) } catch {}
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    await sendProc(`⏳ *PROCESANDO...*\n\n1️⃣ *PASO 1/3:* Subiendo original a Evogb...`)
    let linkOriginal = link
    if (!linkOriginal) linkOriginal = await myCloud(media)
    if (!linkOriginal) throw new Error('No se pudo subir original a Evogb')

    await sendProc(`⏳ *PROCESANDO...*\n\n2️⃣ *PASO 2/3:* Mejorando HD x2...`)
    let hdX2 = await stellarUpscale(media, 2)
    await sendProc(`⏳ *PROCESANDO...*\n\n2️⃣ *PASO 2/3:* Mejorando HD x4 automático...`)
    let hdX4 = await stellarUpscale(hdX2, 2)
    let linkHD = await myCloud(hdX4)

    await sendProc(`⏳ *PROCESANDO...*\n\n3️⃣ *PASO 3/3:* Quitando fondo (POST archivo)...`)
    let finalBuffer = await stellarRemovebg(hdX4)

    let linkFinal = await myCloud(finalBuffer).catch(() => null)

    const caption = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

╭───INFO ꒰❄️꒱────╮
❄️ Tipo: Removebg + HD x4
❄️ API: Stellar
❄️ Peso final: ${(finalBuffer.length / 1024).toFixed(0)} KB
╰─────── ݁ ˖Ი𐑼⋆────╯

🔗 *Original:* ${linkOriginal}
🔗 *HD x4:* ${linkHD || 'No se pudo subir'}
🔗 *Sin fondo:* ${linkFinal || 'No se pudo subir'}

꒰❄️꒱ Fondo eliminado - listo

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`

    await deleteProc()
    await conn.sendMessage(m.chat, { react: { text: '❄️', key: m.key } })
    await conn.sendMessage(m.chat, { image: finalBuffer, caption }, { quoted: m })
    await conn.sendMessage(m.chat, { document: finalBuffer, mimetype: 'image/png', fileName: `removebg-hd-phantom-plus-frost.png` }, { quoted: m })

  } catch (e) {
    console.error(e)
    await deleteProc()
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰❌꒱ Error: ${e.message}\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━` }, { quoted: m })
  }
}

handler.command = ['removebg', 'nobg', 'quitarfondo']
handler.tags = ['tools']
handler.help = ['removebg']
handler.group = true
export default handler