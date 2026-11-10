import { sticker } from '../lib/sticker.js'
import axios from 'axios'
import moment from 'moment-timezone'
moment.locale('es')

const fetchStickerVideo = async (text) => {
  const { data } = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { params: { text }, responseType: 'arraybuffer' })
  if (!data) throw new Error('API sin respuesta')
  return data
}

const handler = async (m, { conn, text }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  // Marca de ventas fija
  const PACK = 'PHANTOM PLUS'
  const AUTHOR = '@whois.yallico • +51 927 174 369'

  text = m.quoted?.text || text
  if (!text) {
    await react('❌')
    return conn.reply(m.chat, head + `\n⤷ ┇ 𝐁𝐑𝐀𝐓𝐕 ﹒ USO ：✿ 。\n\n❌ Usa: *.bratv Tu texto*` + foot, m)
  }
  try {
    await react('⏳')
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || PACK
    let texto2 = packstickers.text2 || AUTHOR

    const videoBuffer = await fetchStickerVideo(text)
    const stickerBuffer = await sticker(videoBuffer, null, texto1, texto2)
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    await react('❄️')
  } catch (e) {
    await react('❌')
    await conn.reply(m.chat, head + `\n⤷ ┇ 𝐁𝐑𝐀𝐓𝐕 ﹒ ERROR ：✿ 。\n\n❌ Error al generar sticker` + foot, m)
  }
}

handler.tags = ['sticker']
handler.help = ['bratv <texto>']
handler.command = ['bratv']
export default handler