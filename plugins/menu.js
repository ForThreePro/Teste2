import moment from 'moment-timezone'
import os from 'os'
moment.locale('es')

const CATEGORY_META = {
config: 'CONFIG', main: 'MAIN', tools: 'TOOLS', owner: 'OWNER',
fun: 'FUN', buscadores: 'SEARCH', descargas: 'DOWNLOADER', grupo: 'GRUPOS',
group: 'GRUPO', ia: 'IA', info: 'INFO', sticker: 'STICKER',
}

// ICONOS POR CATEGORIA
const ICONOS_CATEGORIA = {
config: '⚙️', owner: '👑', fun: '😂', buscadores: '🔍',
descargas: '⬇️', grupo: '👥', grupos: '👥', ia: '🤖',
info: 'ℹ️', sticker: '🧩', main: '📁', tools: '🛠️',
}

let handler = async (m, { conn }) => {
try {
await conn.sendMessage(m.chat, { react: { text: '🍕', key: m.key } })

const fecha = moment.tz('America/Lima').format('dddd')
const fecha2 = moment.tz('America/Lima').format('DD [de] MMMM [de] YYYY')
const hora = moment.tz('America/Lima').format('hh:mm:ss a')
const uptime = process.uptime()
const horas = Math.floor(uptime / 3600)
const minutos = Math.floor((uptime % 3600) / 60)
const segundos = Math.floor(uptime % 60)
const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
const totalram = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
const pluginsCount = Object.values(global.plugins || {}).filter(p =>!p?.disabled).length
const totalUsers = Object.keys(global.db.data.users || {}).length

const byTag = {}
for (const plugin of Object.values(global.plugins || {})) {
  if (plugin.disabled) continue
  const tags = Array.isArray(plugin.tags)? plugin.tags : (plugin.tags? [plugin.tags] : [])
  const helps = Array.isArray(plugin.help)? plugin.help : (plugin.help? [plugin.help] : [])
  for (const tag of tags) {
    const t = tag.toLowerCase()
    if (!byTag[t]) byTag[t] = new Set()
    for (const h of helps) if (typeof h === 'string' && h.trim()) byTag[t].add(h.trim())
  }
}

const userName = m.pushName || 'Usuario'
const IMG_MENU = 'https://files.evogb.win/QFXQtu.jpg' // TU IMAGEN DE GARFIELD

let menuTexto = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 ﹒ 2.0 ：✿ 。
꒰ ◞⁺⊹ ．estado: *EN LINEA* • ${horas}h ${minutos}m

  ꒱ ׁ. ᘏ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 ׅ 𝆬 ָ֢ ෆ
😼 ࣪ ꕀ @${userName}. ˚. ᵎᵎ
> *"Odio los lunes... y las dietas"*

──愛 *INFORMACION DEL BOT* ╏ 🍕
*Usuarios*: ${totalUsers} | *Comandos*: ${pluginsCount}
*Owner*: @${global.owner?.[0]?.[0] || '51927174369'}
*Numero*: +${conn.user.jid.split('@')[0]}

 ׅ 埃斯 : 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ﹙ 💻 ﹚
> ﹒ RAM: ${ram}mb / ${totalram}gb
      ᶻz　*${fecha}* ─ ${fecha2} ─ ${hora}　⋌

© ❛ *ping*. ${Math.round(performance.now())}ms
名 ─ *modo:* public﹔

> ❍ 𝖴𝗌𝖺. 𝖺𝗇𝗍𝖾𝗌 𝖽𝖾 𝖼𝖺𝖽𝖺 𝖼𝗈𝗆𝖺𝗇𝖽𝗈

`

const tagsOrdenados = Object.keys(byTag).sort((a, b) => {
  const aIn = CATEGORY_META[a]? 0 : 1
  const bIn = CATEGORY_META[b]? 0 : 1
  return aIn - bIn
})

for (const tag of tagsOrdenados) {
  const set = byTag[tag]
  if (!set || set.size === 0) continue
  const cmds = [...set].sort()

  const icono = ICONOS_CATEGORIA[tag] || '📁'
  const nombreCat = CATEGORY_META[tag] || tag.toUpperCase()

  menuTexto += `.⃟𖥔 ݁. 𖦹˙— \`\`${nombreCat}\`\` —˙𖦹.${icono}꒷\n` // CAMBIO: Ya no dice PREM
  for (const c of cmds) {
    menuTexto += ` ${icono} ➛.${c}\n`
  }
  menuTexto += ` ㅤ└──.✦ ── ⊰ ̟!!.✦. ˙\n\n`
}

menuTexto += `━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${global.owner?.[0]?.[0] || '51927174369'}
*Version*: 2.0
*Frase*: "Mejorando como lasaña"

> "Dame lasaña o dame sueño" 😼
━━━━━━━━━━━`

await conn.sendMessage(m.chat, {
  image: { url: IMG_MENU },
  caption: menuTexto.trim(),
  mentions: [m.sender]
}, { quoted: m })

} catch (e) {
await conn.sendMessage(m.chat, { text: `*❌ ERROR*: ${e.message}` }, { quoted: m })
}
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help', 'menú']

export default handler