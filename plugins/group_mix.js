import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, usedPrefix, text, command, isAdmin, isOwner, quoted }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const react = async (text) => {
    try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
  }

  // Verificar si es admin o owner
  if (!isAdmin &&!isOwner) {
    await react('😾')
    return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

── *📝 AVISO* ╏ 😼
😾 ➛ ¡Oye! Solo los admins pueden tocar mi lasaña... digo, el grupo
🍕 ➛ Garfield solo obedece a admins

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
  }

  // 12. .RESETLINK - REVOCAR LINK DEL GRUPO
  if (['resetlink', 'revokelink'].includes(command)) {
    try {
      await react('🔗')
      await conn.groupRevokeInvite(m.chat)
      let newLink = await conn.groupInviteCode(m.chat)
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐑𝐄𝐒𝐄𝐓𝐋𝐈𝐍𝐊 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`REVOCADO\`\` 🍝 —˙𖦹.꒷
😼 El link viejo ya se lo comió Garfield

── *🔗 NUEVO LINK* ╏ 🍕
https://chat.whatsapp.com/${newLink}

── *📝 NOTA* ╏ 😼
🍝 ➛ Link fresquito servido
😴 ➛ Odio los lunes... y los links expirados

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
    } catch (e) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ LINK ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ ¡Miau! Error al revocar el link\n🔒 ➛ Necesito ser admin para devorar... digo, cambiar el link\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
    }
  }

  // 15. .SETNAME - CAMBIAR NOMBRE DEL GRUPO
  if (['setname', 'setgroupname'].includes(command)) {
    if (!text) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐒𝐄𝐓𝐍𝐀𝐌𝐄 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` 🍝 —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛ ${usedPrefix}setname <nuevo nombre>
😼 ➛ Ejemplo: ${usedPrefix}setname Club de Fans de la Lasaña

── *📝 NOTA* ╏ 😼
🍕 ➛ No me hagas escribir por gusto...

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
    }
    if (text.length > 100) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ NOMBRE ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ ¡Ese nombre es más largo que mi siesta!\n📏 ➛ Máximo 100 caracteres\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
    }

    try {
      let oldName = await conn.groupMetadata(m.chat).then(res => res.subject)
      await conn.groupUpdateSubject(m.chat, text)
      await react('✅')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐍𝐎𝐌𝐁𝐑𝐄 ﹒ CAMBIADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` 🍝 —˙𖦹.꒷

── *📊 INFO* ╏ 🍕
📛 ➛ Antes: *${oldName}*
✨ ➛ Ahora: *${text}*

── *📝 NOTA* ╏ 😼
😼 ➛ Espero que haya lasaña en el nuevo nombre...

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
    } catch (e) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ NOMBRE ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ Garfield enojado! No pude cambiar el nombre\n🔒 ➛ Asegúrate de que sea admin\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
    }
  }

  // 16. .SETDESC - CAMBIAR DESCRIPCIÓN DEL GRUPO
  if (['setdesc', 'setgroupdesc'].includes(command)) {
    if (!text) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐒𝐄𝐓𝐃𝐄𝐒𝐂 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` 🍝 —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛ ${usedPrefix}setdesc <nueva descripción>

── *💡 EJEMPLO* ╏ 🍕
🚫 REGLAS 🚫
1. No molestar a Garfield
2. Traer lasaña obligatoria
3. Odiar los lunes

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
    }
    if (text.length > 2048) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ DESC ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ ¡Eso es más largo que mi lista de excusas!\n📏 ➛ Máximo 2048 caracteres\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
    }

    try {
      await conn.groupUpdateDescription(m.chat, text)
      await react('✅')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐂 ﹒ ACTUALIZADA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GUARDADO\`\` 🍝 —˙𖦹.꒷

── *📊 NUEVA DESCRIPCIÓN* ╏ 🍕
${text}

── *📝 NOTA* ╏ 😼
😼 ➛ ¿Mencionaron lasaña?

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
    } catch (e) {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ DESC ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ ¡Miau! No pude cambiar la descripción\n🔒 ➛ Dame admin o me voy a dormir...\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
    }
  }

  // NUEVO: .SETFOTO - CAMBIAR FOTO DEL GRUPO
  if (['setfoto', 'setppgroup', 'setppgc'].includes(command)) {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (text && /https?:\/\//.test(text)) {
      try {
        await react('🖼️')
        await conn.updateProfilePicture(m.chat, { url: text })
        return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐅𝐎𝐓𝐎 ﹒ CAMBIADA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` 🍝 —˙𖦹.꒷
😼 Garfield aprobó la nueva foto

── *📝 NOTA* ╏ 😼
🖼️ ➛ Foto instalada con link
🍕 ➛ Espero que sea una foto de lasaña...

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
      } catch (e) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ FOTO ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ No pude cambiar la foto con ese link\n🔒 ➛ Asegúrate de que sea válida y sea admin\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
      }
    }

    if (/image/.test(mime)) {
      try {
        await react('🖼️')
        let img = await q.download()
        await conn.updateProfilePicture(m.chat, img)
        return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐅𝐎𝐓𝐎 ﹒ CAMBIADA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ACTUALIZADO\`\` 🍝 —˙𖦹.꒷
😼 Nueva foto del grupo instalada

── *📝 NOTA* ╏ 😼
🍕 ➛ Si no es lasaña me decepciono...
😴 ➛ Los lunes y las fotos feas no me gustan

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
      } catch (e) {
        await react('❌')
        return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ FOTO ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n── *📝 AVISO* ╏ 😼\n😾 ➛ Garfield frustrado! No pude cambiar la foto\n🔒 ➛ Dame admin o me voy a comer lasaña\n━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼` }, { quoted: m })
      }
    } else {
      await react('❌')
      return conn.sendMessage(m.chat, { text: `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐒𝐄𝐓𝐅𝐎𝐓𝐎 ﹒ GRUPO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FORMATO\`\` 🖼️ —˙𖦹.꒷

── *📖 USO* ╏ 🍕
1. Responde a una imagen con ${usedPrefix}setfoto
2. ${usedPrefix}setfoto <link de imagen>
😼 ➛ Garfield quiere ver lasaña pe

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━` }, { quoted: m })
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