import moment from 'moment-timezone'
moment.locale('es')

// ===== 1. Registro por conn, no global =====
const getCatalogImg = (() => {
  // ===== 4. Cache de imagen =====
  let cached = null
  let fetching = null
  return async () => {
    if (cached) return cached
    if (!fetching) {
      fetching = (async () => {
        try {
          const r = await fetch('https://files.evogb.win/XQuHBW.jpg')
          if (!r.ok) throw new Error('img fail')
          cached = Buffer.from(await r.arrayBuffer())
        } catch {
          cached = { url: 'https://files.evogb.win/XQuHBW.jpg' }
        }
        return cached
      })()
    }
    return fetching
  }
})()

const getAuthorInfo = (author) => {
  // ===== 2 y 3. Author real y validado =====
  if (!author || typeof author !== 'string' || !author.includes('@')) {
    return { name: 'Desconocido', tag: 'Desconocido', mention: null }
  }
  return { name: `@${author.split('@')[0]}`, tag: author.split('@')[0], mention: author }
}

const footer = `━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

export async function before(m, { conn }) {
  if (conn._phantomDetectRegistered) return true
  conn._phantomDetectRegistered = true

  conn.ev.on('group-participants.update', async (update) => {
    try {
      // ===== 7. DB segura =====
      let chat = global.db?.data?.chats?.[update.id]
      if (!chat?.detect) return

      const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
      const authorInfo = getAuthorInfo(update.author)
      const catalogoImg = await getCatalogImg()

      for (let user of update.participants) {
        // Si el autor es el mismo afectado y no hay author real, no decir "por él mismo"
        const porLine = authorInfo.mention ? `👑 ➛ Por: @${authorInfo.tag}` : `👑 ➛ Por: Sistema / WhatsApp`
        const mentions = [authorInfo.mention, user].filter(Boolean)

        if (update.action === 'promote') {
          let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ ADMIN
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ASCENDIDO\`\` 👑 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
${porLine}
🎖️ ➛ Nuevo admin: @${user.split('@')[0]}
👻 ➛ PHANTOM PLUS: "Que cuide el sistema"

${footer}`
          await conn.sendMessage(update.id, { image: catalogoImg, caption: txt, mentions })
        }

        if (update.action === 'demote') {
          let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ ADMIN
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DEGRADADO\`\` 💔 —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
${porLine}
💔 ➛ Ex-admin: @${user.split('@')[0]}
❄️ ➛ PHANTOM PLUS: "Se quedó sin acceso"

${footer}`
          await conn.sendMessage(update.id, { image: catalogoImg, caption: txt, mentions })
        }
      }
    } catch (e) {
      console.log('Error detect admin:', e)
    }
  })

  conn.ev.on('groups.update', async (updates) => {
    try {
      for (let update of updates) {
        // ===== 7. DB segura =====
        let chat = global.db?.data?.chats?.[update.id]
        if (!chat?.detect) continue

        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        const authorInfo = getAuthorInfo(update.author)
        const catalogoImg = await getCatalogImg()

        // ===== 5. Juntar todo en 1 mensaje =====
        let cambios = []
        let titulo = 'CAMBIOS'

        if (update.subject) {
          cambios.push(`📝 ➛ Nuevo nombre: *${update.subject}*`)
          titulo = 'NOMBRE'
        }
        if (update.desc) {
          cambios.push(`📄 ➛ Nueva descripción: ${update.desc.slice(0, 300) || 'Vacía'}`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'DESCRIPCION'
        }
        if (update.icon || update.picture) {
          cambios.push(`🖼️ ➛ Foto del grupo cambiada`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'FOTO'
        }
        if (update.inviteCode) {
          // ===== 6. No publicar el link completo =====
          cambios.push(`🔗 ➛ Link del grupo reseteado\n⚠️ ➛ Por seguridad no se muestra el nuevo link aquí`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'LINK'
        }
        // ===== 8. announce / restrict / ephemeral =====
        if (update.announce !== undefined) {
          cambios.push(update.announce ? `🔒 ➛ Grupo en modo SOLO ADMINS pueden escribir` : `💬 ➛ Grupo abierto, todos pueden escribir`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'MODO GRUPO'
        }
        if (update.restrict !== undefined) {
          cambios.push(update.restrict ? `🔒 ➛ Solo admins pueden editar info del grupo` : `✏️ ➛ Todos pueden editar info del grupo`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'PERMISOS'
        }
        if (update.ephemeralDuration !== undefined) {
          const dias = update.ephemeralDuration === 0 ? 'Desactivados' : update.ephemeralDuration === 86400 ? '24 horas' : update.ephemeralDuration === 604800 ? '7 días' : update.ephemeralDuration === 7776000 ? '90 días' : `${update.ephemeralDuration}s`
          cambios.push(`⏳ ➛ Mensajes temporales: ${dias}`)
          titulo = cambios.length > 1 ? 'VARIOS CAMBIOS' : 'TEMPORALES'
        }

        if (!cambios.length) continue

        const porLine = authorInfo.mention ? `👑 ➛ Por: @${authorInfo.tag}` : `👑 ➛ Por: Sistema / WhatsApp`
        const mentions = authorInfo.mention ? [authorInfo.mention] : []

        let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐃𝐄𝐓𝐄𝐂𝐓 ﹒ ${titulo}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`DETECTADO\`\` ❄️ —˙𖦹.꒷

── *👤 ACCION* ╏ ❄️
${porLine}
${cambios.join('\n')}
⚡ ➛ PHANTOM PLUS detectó el cambio

${footer}`
        await conn.sendMessage(update.id, { image: catalogoImg, caption: txt, mentions })
      }
    } catch (e) {
      console.log('Error detect groups:', e)
    }
  })

  return true
}