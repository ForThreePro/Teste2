import moment from 'moment-timezone'
import os from 'os'
moment.locale('es')

const CATEGORY_META = {
info: 'INFO', descargas: 'DESCARGAS', buscadores: 'BÚSQUEDA',
grupo: 'GRUPOS', fun: 'DIVERSIÓN', ia: 'INTELIGENCIA',
tools: 'HERRAMIENTAS', sticker: 'STICKERS', config: 'CONFIG',
owner: 'OWNER', main: 'GENERAL'
}

const ICONOS_CATEGORIA = {
info: 'ℹ️', descargas: '⬇️', buscadores: '🔍', grupo: '👥',
fun: '😂', ia: '🤖', tools: '🛠️', sticker: '🧩',
config: '⚙️', owner: '👑', main: '📁'
}

let handler = async (m, { conn }) => {
try {
let start = performance.now()
await conn.sendMessage(m.chat, { react: { text: '🍕', key: m.key } })

const fecha = moment.tz('America/Lima').format('dddd')
const fecha2 = moment.tz('America/Lima').format('DD [de] MMMM [de] YYYY')
const hora = moment.tz('America/Lima').format('hh:mm:ss a')
const uptime = process.uptime()
const horas = Math.floor(uptime / 3600)
const minutos = Math.floor((uptime % 3600) / 60)
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
const IMG_MENU = 'https://files.evogb.win/QFXQtu.jpg'
const ping = Math.round(performance.now() - start)
const ownerNum = global.owner?.[0]?.[0] || '51927174369'
const CANAL_LINK = 'https://whatsapp.com/channel/0029Vb8emrOJuyACodGSbP0z'

let menuTexto = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 ﹒ 2.1 PRO ：✿ 。
꒰ ◞⁺⊹ ．estado: *EN LINEA* • ${horas}h ${minutos}m

  ꒱ ׁ. ᘏ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 ׅ 𝆬 ָ֢ ෆ
😼 ࣪ ꕀ @${userName}. ˚. ᵎᵎ
> *"Odio los lunes... y las dietas"*

📢 *CANAL OFICIAL*
${CANAL_LINK}
> _Únete para recibir actualizaciones_

──愛 *INFORMACION* ╏ 🍕
*Usuarios*: ${totalUsers} | *Comandos*: ${pluginsCount}
*Owner*: @${ownerNum}
*Ping*: ${ping}ms | *RAM*: ${ram}mb/${totalram}gb

 ׅ 埃斯 : 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ﹙ 💻 ﹚
*${fecha}* ─ ${fecha2} ─ ${hora}

> ❍ 𝖴𝗌𝖺. 𝖺𝗇𝗍𝖾𝗌 𝖽𝖾 𝖼𝖺𝖽𝖺 𝖼𝗈𝗆𝖺𝗇𝖽𝗈

`

const ordenPrioridad = ['info', 'descargas', 'buscadores', 'grupo', 'fun', 'ia', 'tools', 'sticker', 'config', 'owner', 'main']
const tagsOrdenados = [...new Set([...ordenPrioridad,...Object.keys(byTag)])].filter(t => byTag[t])

for (const tag of tagsOrdenados) {
  const set = byTag[tag]
  if (!set || set.size === 0) continue
  const cmds = [...set].sort()

  const icono = ICONOS_CATEGORIA[tag] || '📁'
  const nombreCat = CATEGORY_META[tag] || tag.toUpperCase()

  menuTexto += `.⃟𖥔 ݁. 𖦹˙— \`\`${nombreCat}\`\` —˙𖦹.${icono}꒷\n`
  for (const c of cmds) {
    menuTexto += ` ${icono} ➛.${c}\n`
  }
  menuTexto += ` ㅤ└──.✦ ── ⊰ ̟!!.✦. ˙\n\n`
}

menuTexto += `━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
*Version*: 2.1 PRO
*${CANAL_LINK}*

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