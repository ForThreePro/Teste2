import fs from 'fs'
import moment from 'moment-timezone'
moment.locale('es')

const filePath = './temp_groups.json'

// LISTA DE NUMEROS AUTORIZADOS
// Pon tu numero con codigo de pais sin + ni espacios
const OWNER_NUMBERS = [
  '51927174369' // +51 927 174 369
]

if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]')
global.tempGroups = JSON.parse(fs.readFileSync(filePath))

function saveTempGroups() {
  fs.writeFileSync(filePath, JSON.stringify(global.tempGroups, null, 2))
}

// VERIFICADOR CADA 30 SEGUNDOS
setInterval(async () => {
  if (!global.conn) return
  const now = Date.now()
  let toRemove = []

  for (let i of global.tempGroups) {
    const timeLeft = i.exitTime - now
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

    // AVISO 5 MINUTOS ANTES
    if (timeLeft <= 300000 && timeLeft > 0 &&!i.warned) {
      try {
        await global.conn.sendMessage(i.id, {
          text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐓𝐄𝐌𝐏𝐎𝐑𝐈𝐙𝐀𝐃𝐎𝐑 ﹒ AVISO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`5 MINUTOS\`\` ⏰ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
⏰ ➛ El bot se saldrá de este grupo en 5 minutos
━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        })
        i.warned = true
        saveTempGroups()
      } catch {}
    }

    // HORA DE SALIR
    if (now >= i.exitTime) {
      let attempts = 0
      while (attempts < 3) {
        try {
          await global.conn.sendMessage(i.id, {
            text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐓𝐄𝐌𝐏𝐎𝐑𝐈𝐙𝐀𝐃𝐎𝐑 ﹒ SALIDA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`SALIENDO\`\` 👋 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
⏰ ➛ Temporizador finalizado. Saliendo...
━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
          })
          await new Promise(r => setTimeout(r, 1500))
          await global.conn.groupLeave(i.id)
          console.log(`[TEMP] Sali del grupo: ${i.name}`)
          break
        } catch (e) {
          attempts++
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      toRemove.push(i.id)
    }
  }

  if (toRemove.length > 0) {
    global.tempGroups = global.tempGroups.filter(v =>!toRemove.includes(v.id))
    saveTempGroups()
  }
}, 30000)

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text, key: m.key } }) } catch {}
}

function msToTime(ms) {
  if (ms < 0) ms = 0
  let d = Math.floor(ms / 86400000)
  let h = Math.floor((ms % 86400000) / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  let result = []
  if (d > 0) result.push(`${d}d`)
  if (h > 0) result.push(`${h}h`)
  if (m > 0) result.push(`${m}m`)
  if (s > 0 && d === 0) result.push(`${s}s`)
  return result.join(' ') || '0s'
}

// FUNCION PARA VERIFICAR SI ES OWNER
function isOwner(m) {
  let sender = m.sender.replace('@s.whatsapp.net', '')
  return OWNER_NUMBERS.includes(sender)
}

let handler = async (m, { conn, args, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  // BLOQUEO PARA NO AUTORIZADOS
  if (!isOwner(m)) {
    await react(conn, m, "❌")
    return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n❌ ➛ No tienes permiso para usar este comando\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
  }

  // COMANDO: TEMPLIST
  if (command === 'templist') {
    if (global.tempGroups.length === 0) {
      await react(conn, m, "⚠️")
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐋𝐈𝐒𝐓𝐀 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n⚠️ ➛ No hay grupos con temporizador activo\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
    }

    let list = global.tempGroups.map((v, i) => {
      let timeLeft = v.exitTime - Date.now()
      return `│ ${i+1}. *${v.name}*\n│ ⏰ Falta: ${msToTime(timeLeft)}`
    }).join('\n')

    let texto = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐋𝐈𝐒𝐓𝐀 ﹒ ACTIVA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GRUPOS\`\` 📋 —˙𖦹.꒷

── *📊 GRUPOS* ╏ 🍕
${list}

── *📝 NOTA* ╏ 🍕
💡 ➛ Usa tempcancel para cancelar

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    await react(conn, m, "📋")
    return m.reply(texto)
  }

  // COMANDO: TEMPORIZADOR
  if (!m.isGroup) {
    await react(conn, m, "❌")
    return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n❌ ➛ Solo funciona en grupos\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
  }

  if (!args[0]) {
    await react(conn, m, "❌")
    let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐓𝐄𝐌𝐏𝐎𝐑𝐈𝐙𝐀𝐃𝐎𝐑 ﹒ FORMATO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` ⏰ —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛.temporizador 30d
➛.temporizador 5h
➛.temporizador 1d5h30m

── *💡 EJEMPLOS* ╏ 🍕
➛ 1m = 1 minuto
➛ 2h = 2 horas
➛ 3d = 3 días

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return m.reply(error)
  }

  let time = args[0].toLowerCase()
  let ms = 0
  let regex = /(\d+)([dhm])/g
  let match
  while ((match = regex.exec(time))!== null) {
    let val = parseInt(match[1])
    let type = match[2]
    if (type === 'd') ms += val * 86400000
    if (type === 'h') ms += val * 3600000
    if (type === 'm') ms += val * 60000
  }
  if (ms < 60000) {
    await react(conn, m, "❌")
    return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n❌ ➛ Mínimo 1 minuto\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
  }

  const exitTime = Date.now() + ms
  const groupId = m.chat
  const groupName = await conn.getName(groupId)

  let index = global.tempGroups.findIndex(v => v.id === groupId)
  if (index!== -1) global.tempGroups.splice(index, 1)

  global.tempGroups.push({ id: groupId, name: groupName, exitTime, addedBy: m.sender, warned: false })
  saveTempGroups()

  const fechaSalida = moment.tz(exitTime, 'America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐓𝐄𝐌𝐏𝐎𝐑𝐈𝐙𝐀𝐃𝐎𝐑 ﹒ ACTIVADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PROGRAMADO\`\` ⏰ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🏠 ➛ Grupo: ${groupName}
⏰ ➛ Salida en: ${msToTime(ms)}
📅 ➛ Fecha: ${fechaSalida}

── *📝 NOTA* ╏ 🍕
🗑️ ➛ Usa tempcancel para cancelar

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
  await react(conn, m, "✅")
  return m.reply(ok)
}

// CANCELAR
handler.before = async (m, { conn, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  if (command === 'tempcancel') {

    // BLOQUEO PARA NO AUTORIZADOS
    if (!isOwner(m)) {
      await react(conn, m, "❌")
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n❌ ➛ No tienes permiso para usar este comando\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
    }

    if (!m.isGroup) {
      await react(conn, m, "❌")
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n❌ ➛ Solo funciona en grupos\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
    }

    let index = global.tempGroups.findIndex(v => v.id === m.chat)
    if (index === -1) {
      await react(conn, m, "⚠️")
      return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐀𝐕𝐈𝐒𝐎 ﹒ TEMP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 🍕\n⚠️ ➛ No hay temporizador activo\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕`)
    }

    const groupName = global.tempGroups[index].name
    global.tempGroups.splice(index, 1)
    saveTempGroups()

    let cancel = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐓𝐄𝐌𝐏𝐎𝐑𝐈𝐙𝐀𝐃𝐎𝐑 ﹒ CANCELADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ELIMINADO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🏠 ➛ Grupo: ${groupName}
✅ ➛ Estado: Cancelado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    await react(conn, m, "🗑️")
    return m.reply(cancel)
  }
}

handler.help = ['temporizador 30d', 'tempcancel', 'templist'];
handler.tags = ['grupo'];
handler.command = ['temporizador', 'temp', 'tempcancel', 'templist'];
handler.admin = false

export default handler;