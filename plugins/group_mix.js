let handler = async (m, { conn, usedPrefix, text, command, isAdmin, isOwner, quoted }) => {
  
  // Verificar si es admin o owner
  if (!isAdmin &&!isOwner) return m.reply('😾 ¡Oye! Solo los admins pueden tocar mi lasaña... digo, el grupo')

  // 12. .RESETLINK - REVOCAR LINK DEL GRUPO
  if (['resetlink', 'revokelink'].includes(command)) {
    try {
      await conn.groupRevokeInvite(m.chat)
      let newLink = await conn.groupInviteCode(m.chat)
      return m.reply(`🍝 *¡LINK DE LASAÑA REVOCADO!* 🍝\n\n😼 El link viejo ya se lo comió Garfield\n\n🔗 *Nuevo link fresquito:*\nhttps://chat.whatsapp.com/${newLink}\n\n*Odio los lunes... y los links expirados*`)
    } catch (e) {
      return m.reply('😾 *¡Miau!* Error al revocar el link\n\nNecesito ser admin para devorar... digo, cambiar el link del grupo')
    }
  }

  // 15. .SETNAME - CAMBIAR NOMBRE DEL GRUPO
  if (['setname', 'setgroupname'].includes(command)) {
    if (!text) return m.reply(`🍝 *CAMBIO DE NOMBRE* 🍝\n\nUso: ${usedPrefix}setname <nuevo nombre>\n\nEjemplo: ${usedPrefix}setname Club de Fans de la Lasaña 😼\n\n*No me hagas escribir por gusto...*`)
    if (text.length > 100) return m.reply('😾 ¡Ese nombre es más largo que mi siesta!\n\nMáximo 100 caracteres, humano')
    
    try {
      let oldName = await conn.groupMetadata(m.chat).then(res => res.subject)
      await conn.groupUpdateSubject(m.chat, text)
      return m.reply(`🍝 *¡NOMBRE CAMBIADO!* 🍝\n\nAntes: ${oldName}\nAhora: ${text}\n\n*Espero que haya lasaña en el nuevo nombre...* 😼`)
    } catch (e) {
      return m.reply('😾 *¡Garfield enojado!*\n\nNo pude cambiar el nombre\n\nAsegúrate de que sea admin o me da flojera')
    }
  }

  // 16. .SETDESC - CAMBIAR DESCRIPCIÓN DEL GRUPO
  if (['setdesc', 'setgroupdesc'].includes(command)) {
    if (!text) return m.reply(`🍝 *CAMBIO DE DESCRIPCIÓN* 🍝\n\nUso: ${usedPrefix}setdesc <nueva descripción>\n\nEjemplo: ${usedPrefix}setdesc 🚫 REGLAS 🚫\n1. No molestar a Garfield\n2. Traer lasaña obligatoria\n3. Odiar los lunes\n\n*Escribe algo decente...*`)
    if (text.length > 2048) return m.reply('😾 ¡Eso es más largo que mi lista de excusas para no trabajar!\n\nMáximo 2048 caracteres')
    
    try {
      await conn.groupUpdateDescription(m.chat, text)
      return m.reply(`🍝 *¡DESCRIPCIÓN ACTUALIZADA!* 🍝\n\n*Nueva descripción del grupo:*\n${text}\n\n*¿Mencionaron lasaña?* 😼`)
    } catch (e) {
      return m.reply('😾 *¡Miau!* No pude cambiar la descripción\n\nDame admin o me voy a dormir...')
    }
  }

  // NUEVO: .SETFOTO - CAMBIAR FOTO DEL GRUPO
  if (['setfoto', 'setppgroup', 'setppgc'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // Si es link en el texto
    if (text && /https?:\/\//.test(text)) {
      try {
        await conn.updateProfilePicture(m.chat, { url: text })
        return m.reply(`🍝 *¡FOTO CAMBIADA!* 🍝\n\n😼 Garfield aprobó la nueva foto del grupo\n\n*Espero que sea una foto de lasaña...*\n\n*Odio cuando no hay comida en las fotos*`)
      } catch (e) {
        return m.reply('😾 *¡Miau!* No pude cambiar la foto con ese link\n\nAsegúrate de que sea una imagen válida y que yo sea admin')
      }
    }
    
    // Si es respondiendo a imagen
    if (/image/.test(mime)) {
      try {
        let img = await q.download()
        await conn.updateProfilePicture(m.chat, img)
        return m.reply(`🍝 *¡FOTO CAMBIADA!* 🍝\n\n😼 Nueva foto del grupo instalada\n\n*Si no es lasaña me decepciono...*\n\n*Los lunes y las fotos feas no me gustan*`)
      } catch (e) {
        return m.reply('😾 *¡Garfield frustrado!*\n\nNo pude cambiar la foto\n\nDame admin o me voy a comer lasaña')
      }
    } else {
      return m.reply(`🍝 *CAMBIO DE FOTO* 🍝\n\n😼 *Formas de usar:*\n\n1. Responde a una imagen con ${usedPrefix}setfoto\n2. ${usedPrefix}setfoto <link de imagen>\n\n*No me hagas trabajar por gusto...*`)
    }
  }
}

handler.help = ['resetlink', 'setname', 'setdesc', 'setfoto']
handler.tags = ['group']
handler.command = ['resetlink', 'revokelink', 'setname', 'setgroupname', 'setdesc', 'setgroupdesc', 'setfoto', 'setppgroup', 'setppgc']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler