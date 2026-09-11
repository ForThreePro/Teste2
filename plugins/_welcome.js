import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

  if (!isAdmin &&!isOwner) {
    let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ﹒ BIENVENIDA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` 🔒 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
🔒 ➛ Solo admins pueden usar este comando

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: error }, { quoted: m })
  }

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  if (/on/i.test(args[0])) {
    await react('🟢')
    chat.bienvenida = true
    let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐀 ﹒ ACTIVA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTIVADA\`\` 🟢 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🟢 ➛ Bienvenida Activada
🖼️ ➛ Con imagen personalizada

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
  } else if (/off/i.test(args[0])) {
    await react('🔴')
    chat.bienvenida = false
    let off = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐀 ﹒ DESACTIVA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DESACTIVADA\`\` 🔴 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔴 ➛ Bienvenida Desactivada

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: off }, { quoted: m })
  } else {
    await react('❌')
    let uso = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈𝐎𝐍 ﹒ BIENVENIDA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` ⚙️ —˙𖦹.꒷

── *📖 ON/OFF* ╏ 🍕
➛.bienvenida on
➛.bienvenida off

── *✏️ EDITAR TEXTO* ╏ 🍕
➛.setwelcome <texto>
➛.setbye <texto>
➛.setkick <texto>

── *🔊 EDITAR AUDIO* ╏ 🍕
➛ Responde audio +.audiowelcome
➛ Responde audio +.audiobye
➛ Responde audio +.audiokick

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
    return conn.sendMessage(m.chat, { text: uso }, { quoted: m })
  }
}

handler.help = ['bienvenida <on/off>']
handler.tags = ['configuración']
handler.command = /^(bienvenida|welcome|bye)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType ||!m.isGroup) return!0
  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat ||!chat.bienvenida) return!0

  const userJid = m.messageStubParameters?.[0] || m.participant
  if (!userJid) return!0

  const DEFAULT_IMG = 'https://files.evogb.win/QFXQtu.jpg'
  let imgBuffer = null

  // PASO 1: Foto del usuario
  try {
    let userPP = await conn.profilePictureUrl(userJid, 'image')
    let res = await fetch(userPP)
    imgBuffer = await res.buffer()
  } catch {
    // PASO 2: Foto por defecto
    try {
      let res = await fetch(DEFAULT_IMG)
      imgBuffer = await res.buffer()
    } catch {
      imgBuffer = null
    }
  }

  const userTag = `@${userJid.split('@')[0]}`
  const groupName = groupMetadata.subject
  const groupDesc = groupMetadata.desc || 'Sin descripción'
  const membersCount = groupMetadata.participants.length

  let txt = '', audio = null

  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_PARTICIPANT_ADD:
      audio = chat.audiowelcome
      txt = chat.customWelcome? chat.customWelcome.replace(/@user/gi, userTag).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) :
`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 ﹒ NUEVO MIEMBRO ：✿ 。
꒰ ◞⁺⊹ ．

.⃟𖥔 ݁. 𖦹˙— \`\`WELCOME\`\` 👋 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
👋 ➛ ${userTag} llegó a *${groupName}*
👥 ➛ Miembro N°: *${membersCount}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      break

    case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
      audio = chat.audiobye
      txt = chat.customBye? chat.customBye.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐒𝐄 𝐅𝐔𝐄 ﹒ ABANDONO ：✿ 。
꒰ ◞⁺⊹ ．

.⃟𖥔 ݁. 𖦹˙— \`\`BYE\`\` 💤 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
💤 ➛ ${userTag} salió de *${groupName}*
📉 ➛ Quedamos: *${membersCount}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      break

    case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
      audio = chat.audiokick
      txt = chat.customKick? chat.customKick.replace(/@user/gi, userTag).replace(/@group/gi, groupName) :
`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎 ﹒ KICK ：✿ 。
꒰ ◞⁺⊹ ．

.⃟𖥔 ݁. 𖦹˙— \`\`KICK\`\` 🥊 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🥊 ➛ ${userTag} fue expulsado de *${groupName}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
      break
  }

  if (txt) {
    if (imgBuffer) {
      await conn.sendMessage(m.chat, { image: imgBuffer, caption: txt, mentions: [userJid] })
    } else {
      await conn.sendMessage(m.chat, { text: txt, mentions: [userJid] })
    }

    // FIX: REPRODUCIR AUDIO GUARDADO EN BASE64
    if (audio) {
      try {
        let audioBuffer
        if (typeof audio === 'string') {
          // Si es base64 lo convertimos
          audioBuffer = Buffer.from(audio, 'base64')
        } else if (Buffer.isBuffer(audio)) {
          audioBuffer = audio
        }

        if (audioBuffer) {
          await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            ptt: true // true = nota de voz
          })
        }
      } catch (e) {
        console.log('Error al enviar audio:', e)
      }
    }
  }
  return!0
}

export default handler