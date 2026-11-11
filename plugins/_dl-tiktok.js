import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

var handler = async (m, { conn, args }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const ownerNum = global.owner?.[0]?.[0] || '51927174369'

  if (!args[0]) {
    let menuUso = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ﹒ TIKTOK
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
📱 ࣪ ꕀ.tiktok ˚. ᵎᵎ
> *"Bajando videos con el sistema PHANTOM PLUS"*

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` 📥 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
📱 ➛ Descarga videos de TikTok sin marca de agua
📱 ➛ Con botones interactivos
👻 ➛ PHANTOM PLUS procesando TikTok

── *📖 USO* ╏ ⛓️
➛.*tiktok* <link de tiktok>
➛.*tt* <link de tiktok>

── *💡 EJEMPLO* ╏ ❄️
➛ https://vm.tiktok.com/ZMkcmTCa6/

── *🔗 SOPORTE* ╏ ❄️
📱 ➛ vm.tiktok.com
📱 ➛ vt.tiktok.com
📱 ➛ www.tiktok.com

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━
*Owner*: @${ownerNum}
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuUso, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
  }

  const url = args[0]
  if (!url.match(/(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\//)) {
    await react(conn, m, '❌')
    let menuError = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TIKTOK
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
❌ ➛ El enlace no es válido
👻 ➛ PHANTOM PLUS: "Eso no es TikTok"

── *📖 USO* ╏ ⛓️
➛ Solo links de: *tiktok.com*

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuError }, { quoted: m })
  }

  try {
    await react(conn, m, "❄️")
    await m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 ﹒ TIKTOK
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESANDO\`\` ⚙️ —˙𖦹.꒷

── *📊 ESTADO* ╏ ❄️
🔍 ➛ Analizando link...
📥 ➛ Obteniendo video HD...
⬇️ ➛ Preparando descarga sin marca...
👻 ➛ PHANTOM PLUS buscando el video...

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`)

    const tiktokData = await tiktokdl(url)
    if (!tiktokData?.data) throw new Error('No se pudo obtener el video.')

    const videoURL = tiktokData.data.play
    const title = tiktokData.data.title || 'Sin título'
    const author = tiktokData.data.author?.nickname || 'Desconocido'
    const likes = formatNum(tiktokData.data.digg_count)
    const comments = formatNum(tiktokData.data.comment_count)

    // FIX: video normal, sin viewOnce ni interactive, así WhatsApp sí lo muestra
    let caption = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎 ﹒ TIKTOK
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` 📥 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
📌 ➛ Título: *${title}*
👤 ➛ Autor: *@${author}*
❤️ ➛ Likes: *${likes}*
💬 ➛ Comentarios: *${comments}*
👻 ➛ PHANTOM PLUS le dio like

── *📥 DESCARGA* ╏ ⛓️
⬇️ ➛ Video sin marca de agua
❄️ ➛ Listo para ver

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━
🔗 ${url}`

    await conn.sendMessage(m.chat, {
      video: { url: videoURL },
      caption: caption,
      mimetype: 'video/mp4',
      fileName: 'PHANTOM_PLUS_TIKTOK.mp4'
    }, { quoted: m })

    await react(conn, m, "❄️")

  } catch (error) {
    await react(conn, m, "❌")
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let menuErr = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TIKTOK
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
❌ ➛ ${error.message}
⚡ ➛ PHANTOM PLUS no pudo procesarlo

── *💡 SOLUCIÓN* ╏ ⛓️
🔧 ➛ Verifica que el video sea público
🔧 ➛ Intenta con otro link
❄️ ➛ PHANTOM PLUS dice: prueba otra vez

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: menuErr }, { quoted: m })
  }
}

async function tiktokdl(url) {
  const tikwm = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  return await (await fetch(tikwm, { signal: AbortSignal.timeout(20000) })).json()
}

const formatNum = (n) => {
  n = Number(n)
  if (!n) return "0"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

handler.help = ['tiktok <link>']
handler.tags = ['descargas']
handler.command = ['tt', 'tiktok']
handler.limit = true
export default handler