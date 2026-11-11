import moment from 'moment-timezone'
moment.locale('es')

let detectEventsRegistered = false

export async function before(m, { conn }) {
  if (!detectEventsRegistered) {
    detectEventsRegistered = true

    conn.ev.on('group-participants.update', async (update) => {
      try {
        let chat = global.db.data.chats[update.id]
        if (!chat?.detect) return

        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        let author = update.author || update.participants[0]
        let catalogoImg = { url: 'https://files.evogb.win/9BFoEi.jpg' }

        for (let user of update.participants) {
          if (update.action === 'promote') {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ ADMIN
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ASCENDIDO\`\` 👑 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
🎖️ ➛ Nuevo admin: @${user.split('@')[0]}
👻 ➛ PHANTOM PLUS: "Que cuide el sistema"

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author, user]
            })
          }

          if (update.action === 'demote') {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ ADMIN
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DEGRADADO\`\` 💔 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
💔 ➛ Ex-admin: @${user.split('@')[0]}
❄️ ➛ PHANTOM PLUS: "Se quedó sin acceso"

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author, user]
            })
          }
        }
      } catch (e) {
        console.log('Error detect admin:', e)
      }
    })

    conn.ev.on('groups.update', async (updates) => {
      try {
        for (let update of updates) {
          let chat = global.db.data.chats[update.id]
          if (!chat?.detect) continue

          const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
          let author = update.author || 'Desconocido'
          let catalogoImg = { url: 'https://files.evogb.win/9BFoEi.jpg' }

          if (update.subject) {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ NOMBRE
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`CAMBIADO\`\` 📝 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
📝 ➛ Nuevo: *${update.subject}*
⚡ ➛ PHANTOM PLUS detectó el cambio

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author].filter(a => a.includes('@'))
            })
          }

          if (update.desc) {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ DESCRIPCION
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`CAMBIADA\`\` 📄 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
📝 ➛ Nueva: ${update.desc.slice(0, 300) || 'Vacía'}
❄️ ➛ Descripción actualizada

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author].filter(a => a.includes('@'))
            })
          }

          if (update.icon || update.picture) {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ FOTO
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`CAMBIADA\`\` 🖼️ —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
🖼️ ➛ Foto cambiada
👻 ➛ PHANTOM PLUS revisando nueva foto

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author].filter(a => a.includes('@'))
            })
          }

          if (update.inviteCode) {
            let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ LINK
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESETEADO\`\` 🔗 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
👑 ➛ Por: @${author.split('@')[0]}
🔗 ➛ Nuevo: https://chat.whatsapp.com/${update.inviteCode}
❄️ ➛ Link nuevo generado

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            await conn.sendMessage(update.id, {
              image: catalogoImg,
              caption: txt,
              mentions: [author].filter(a => a.includes('@'))
            })
          }
        }
      } catch (e) {
        console.log('Error detect groups:', e)
      }
    })
  }
  return true
}