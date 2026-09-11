import os from 'os'

// TU IMAGEN FIJA
const GARFIELD_IMG = 'https://files.evogb.win/QFXQtu.jpg'

let handler = async (m, { conn, usedPrefix }) => {
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  await react('⏳')

  let taguser = m.mentionedJid && m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender
  let img = { url: GARFIELD_IMG }

  let uptime = process.uptime() * 1000
  let _uptime = clockString(uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalcmd = Object.values(global.plugins).filter(p => p.help &&!p.disabled).length

  let owner = global.owner?.[0]?.[0] || '51927174369'
  let ownerTag = `@${owner}`
  let numBot = conn.user.jid.split('@')[0]

  let help = Object.values(global.plugins).filter(p => p.help &&!p.disabled)
  let groups = {}
  for (let plugin of help) {
    let category = plugin.tags? plugin.tags[0] : 'otros'
    if (!groups[category]) groups[category] = []
    if (Array.isArray(plugin.help)) groups[category].push(...plugin.help)
    else groups[category].push(plugin.help)
  }

  // ICONOS POR CATEGORIA
  const icons = {
    search: '🔍', download: '⬇️', game: '🎮', rpg: '⚔️', config: '⚙️',
    group: '👥', owner: '👑', info: 'ℹ️', fun: '😂', anime: '🌸',
    sticker: '🧩', tools: '🛠️', nsfw: '🔞', audio: '🎵', prem: '💎', otros: '📁'
  }

  const categoryNames = {
    search: 'BÚSQUEDA', download: 'DESCARGAS', game: 'JUEGOS', rpg: 'RPG',
    config: 'CONFIGURACIÓN', group: 'GRUPOS', owner: 'OWNER', info: 'INFORMACIÓN',
    fun: 'DIVERSIÓN', anime: 'ANIME', sticker: 'STICKERS', tools: 'HERRAMIENTAS',
    nsfw: 'NSFW', audio: 'AUDIO', prem: 'PREMIUM', otros: 'OTROS'
  }

  let fecha = new Date().toLocaleDateString('es-PE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Lima'})
  let hora = new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima'})

  let menu = `𓂃 𓈒𓏸 𓂃 𓈒𓏸
     *𐔌 ꒱ GARFIELD BOT 𐔌 ꒱* 🍕
     _"Mejorando como lasaña"_ 😼
𓂃 𓈒𓏸 𓂃 𓈒𓏸

𓂃 𓈒𓏸 *PERFIL* 𓂃 𓈒𓏸
🍼 *Usuario:* @${taguser.split('@')[0]}
👑 *Owner:* ${ownerTag}
📱 *Bot:* \`+${numBot}\`

𓂃 𓈒𓏸 *ESTADÍSTICAS* 𓂃 𓈒𓏸
⏱️ *Actividad:* \`${_uptime}\`
👥 *Usuarios:* \`${totalreg}\`
📜 *Comandos:* \`${totalcmd}\`

𓂃 𓈒𓏸 *SISTEMA* 𓂃 𓈒𓏸
💾 *RAM:* \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}gb\`
📅 *Fecha:* ${fecha}
🕐 *Hora:* ${hora}

𓂃 𓈒𓏸 *LISTA DE COMANDOS* 𓂃 𓈒𓏸
`

  for (let category in groups) {
    let icon = icons[category] || '📁'
    let catName = categoryNames[category] || category.toUpperCase()
    menu += `\n*${icon} ${catName}*\n`
    for (let cmd of groups[category]) {
      menu += `> \`\`${usedPrefix}${cmd}\`\n` // Arreglo 1: Solo 1 icono
    }
  }

  menu += `
𓂃 𓈒𓏸 *AYUDA* 𓂃 𓈒𓏸
💡 *Usa:* \`${usedPrefix}\` antes de cada comando
💡 *Ejemplo:* \`\`\`${usedPrefix}sticker\`\`\`

━━━ *Andreitap Ventas* 💗 ━━━`

  await conn.sendMessage(m.chat, {
    image: img,
    caption: menu,
    mentions: [taguser, owner]
  }, { quoted: m })

  await react('✅')
}

handler.help = ['menu', 'help', 'menú']
handler.tags = ['info']
handler.command = /^(menu|help|menú)$/i

export default handler

function clockString(ms) {
  let h = isNaN(ms)? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms)? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms)? '--' : Math.floor(ms / 1000) % 60
  return `${h}h ${m}m ${s}s`
}