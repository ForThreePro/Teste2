let handler = async (m, { conn, usedPrefix, text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = { coin: 0, bank: 0, items: {}, deuda: 0, prestamo: 0, interes: 0, ultimoCrimen: 0 }

  user.prestamo = Number(user.prestamo) || 0
  user.interes = Number(user.interes) || 0
  user.ultimoCrimen = Number(user.ultimoCrimen) || 0
  user.coin = Number(user.coin) || 0
  user.bank = Number(user.bank) || 0
  user.deuda = Number(user.deuda) || 0

  //.PRESTAMO - INTERÉS FIJO 25% UNA SOLA VEZ
  if (command === 'prestamo') {
    if (user.deuda > 0) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🚔 Deuda policía de ${user.deuda} 🪙\n😴 Paga primero, Garfield no presta con deuda\n\n${usedPrefix}work o ${usedPrefix}pagardeuda`)
    if (user.prestamo > 0) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 Ya tienes préstamo activo\n💰 Capital: ${user.prestamo - user.interes} monedas\n📈 Interés: ${user.interes} monedas\n💵 *Total: ${user.prestamo} monedas*\n\nUsa ${usedPrefix}pagarprestamo <monto>`)

    let monto = parseInt(text)
    if (isNaN(monto) || monto < 100) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n⤷ ┇ 𝐁𝐀𝐍𝐂𝐎 ﹒ 𝐏𝐑𝐄𝐒𝐓𝐀𝐌𝐎 🍝\n\n🏦 *PRÉSTAMO BANCARIO GARFIELD* 🏦\n> *"Te presto pero me debes lasaña"*\n\nMínimo: 100 monedas\nMáximo: 10,000 monedas\nInterés: 25% fijo - Como la flojera de Garfield\n\nEj:\n100 → Pagas 125\n200 → Pagas 250\n500 → Pagas 625\n1000 → Pagas 1250\n\nUso: ${usedPrefix}prestamo <monto>`)
    if (monto > 10000) return m.reply('😼 Máximo 10,000 monedas, ni Garfield presta más 🍕')

    let totalRiqueza = user.coin + user.bank
    let limitePrestamo = Math.max(100, totalRiqueza * 2)
    if (monto > limitePrestamo) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 Solo te presto hasta *${limitePrestamo} monedas* según tu riqueza\n🍝 Total: ${totalRiqueza} 🪙\n😴 Garfield no se fía mucho`)

    let interesFijo = Math.floor(monto * 0.25)
    let totalPagar = monto + interesFijo
    user.prestamo = totalPagar
    user.interes = interesFijo
    user.bank += monto

    return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 *¡PRÉSTAMO APROBADO!* 🏦\n😸 Garfield soltó la lasaña\n\n💰 Recibiste: *${monto} monedas* en tu banco\n📈 Interés: ${interesFijo} monedas (25%)\n💵 *Total a pagar: ${totalPagar} monedas*\n\n⚠️ Paga con ${usedPrefix}pagarprestamo <monto>\n\nBanco: ${user.bank} 🪙`)
  }

  //.PAGARPRESTAMO
  if (['pagarprestamo', 'pp'].includes(command)) {
    if (user.prestamo === 0) return m.reply('😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n✅ Sin préstamos, Garfield orgulloso 😸')
    let monto = parseInt(text)
    if (isNaN(monto) || monto < 1) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 *TU PRÉSTAMO*\n💰 Capital: ${user.prestamo - user.interes}\n📈 Interés: ${user.interes}\n💵 *Total: ${user.prestamo}*\n\nUso: ${usedPrefix}pagarprestamo <monto>`)
    if (user.coin < monto) return m.reply(`😼 Billetera: ${user.coin} 🪙\n💵 Deuda: ${user.prestamo} 🪙\n🍝 No alcanza ni para la propina`)
    let aPagar = Math.min(monto, user.prestamo)
    user.coin -= aPagar
    user.prestamo -= aPagar
    if (user.prestamo === 0) {
      user.interes = 0
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n✅ *¡PRÉSTAMO PAGADO!* ✅\n🍝 Pagaste ${aPagar} monedas\n😸 Garfield: "Por fin, ahora mi siesta"\n\nSaldo: ${user.coin} 🪙`)
    } else {
      let capitalOriginal = user.prestamo + aPagar - user.interes
      let interesOriginal = user.interes
      let porcentajePagado = aPagar / (capitalOriginal + interesOriginal)
      user.interes = Math.max(0, Math.floor(interesOriginal * (1 - porcentajePagado)))
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n💸 Pagaste ${aPagar} monedas\n\n🏦 *RESTANTE*\n💰 Capital: ${user.prestamo - user.interes}\n📈 Interés: ${user.interes}\n💵 *Total: ${user.prestamo}*\n\nSaldo: ${user.coin} 🪙`)
    }
  }

  //.VER PRESTAMO
  if (['verprestamo', 'miprestamo'].includes(command)) {
    if (user.prestamo === 0) return m.reply('😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n✅ Sin préstamos\n🍕 Usa ' + usedPrefix + 'prestamo <monto> para pedir')
    let capital = user.prestamo - user.interes
    return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 *TU PRÉSTAMO GARFIELD* 🏦\n💰 Capital: ${capital} monedas\n📈 Interés: ${user.interes} monedas (25%)\n💵 *TOTAL: ${user.prestamo} monedas*\n\nUsa ${usedPrefix}pagarprestamo <monto> 🍝`)
  }

  //.INTERES
  if (command === 'interes') {
    let ahora = Date.now()
    let ultimoInteres = user.ultimoInteres || 0
    let tiempoEspera = 86400000
    if (ahora - ultimoInteres < tiempoEspera) {
      let falta = tiempoEspera - (ahora - ultimoInteres)
      let horas = Math.floor(falta / 3600000)
      let minutos = Math.floor((falta % 3600000) / 60000)
      return m.reply(`😴 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n⏰ Ya cobraste hoy, Garfield duerme\n⏳ Vuelve en: ${horas}h ${minutos}m 🍕`)
    }
    if (user.bank === 0) return m.reply('😼 Sin monedas en el banco... ¡Garfield se las comió! 🍝\nUsa ' + usedPrefix + 'dall para depositar')
    let interesGanado = Math.floor(user.bank * 0.02)
    if (interesGanado < 1) interesGanado = 1
    user.bank += interesGanado
    user.ultimoInteres = ahora
    return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 *INTERÉS GARFIELD* 🏦\n😸 Ganaste: *${interesGanado} monedas* (2%)\n🍝 Tu banco genera lasaña sola\n\nBanco: ${user.bank} 🪙\n\nVuelve mañana 💰`)
  }

  //.CRIMEN
  if (command === 'crimen') {
    if (user.deuda > 0) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🚔 Deuda de ${user.deuda} 🪙\n😴 Paga primero, no puedes robar con deudas`)
    let ahora = Date.now()
    let tiempoEspera = 600000
    if (ahora - user.ultimoCrimen < tiempoEspera) {
      let falta = tiempoEspera - (ahora - user.ultimoCrimen)
      let minutos = Math.ceil(falta / 60000)
      return m.reply(`🚨 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n👮 La policía y Jon te vigilan\n⏳ Espera ${minutos} min para otro crimen 😼`)
    }
    user.ultimoCrimen = ahora
    let exito = Math.random() < 0.35
    if (exito) {
      let robado = Math.floor(Math.random() * 500) + 100
      user.coin += robado
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🦹 *¡CRIMEN EXITOSO!* 🦹\n🍝 Robaste *${robado} monedas* del banco central\n👀 La policía no vio nada, Garfield te cubrió\n\nSaldo: ${user.coin} 🪙`)
    } else {
      let multa = Math.floor(Math.random() * 200) + 100
      if (user.coin < multa) {
        let deudaNueva = multa - user.coin
        user.deuda += deudaNueva
        user.coin = 0
        return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🚔 *¡TE ATRAPÓ JON!* 🚔\n😿 Intentaste robar el banco pero fallaste\n\n💸 Multa: ${multa} monedas\n💔 *DEUDA*: ${user.deuda} monedas\n\nUsa ${usedPrefix}work para pagar\n\nSaldo: 0 🪙`)
      } else {
        user.coin -= multa
        return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🚔 *¡TE ATRAPARON!* 🚔\n🔔 La alarma sonó, Odie ladró\n\n💸 Multa: *${multa} monedas*\n\nSaldo: ${user.coin} 🪙`)
      }
    }
  }

  //.BANCO
  if (command === 'banco') {
    let texto = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n⤷ ┇ 𝐁𝐀𝐍𝐂𝐎 ﹒ 𝐂𝐄𝐍𝐓𝐑𝐀𝐋 🍝\n> *"El banco de lasaña de Garfield"*\n\n`
    texto += `💰 Banco: ${user.bank} monedas\n`
    texto += `💵 Billetera: ${user.coin} monedas\n`
    texto += `🚔 Deuda policía: ${user.deuda} monedas\n\n`
    if (user.prestamo > 0) {
      let capital = user.prestamo - user.interes
      texto += `📊 *TU PRÉSTAMO* 🍕\n💰 Capital: ${capital}\n📈 Interés: ${user.interes}\n💵 Total: ${user.prestamo}\n\n`
    } else {
      texto += `✅ Sin préstamos - Garfield tranquilo 😸\n\n`
    }
    texto += `📈 *SERVICIOS GARFIELD* ╏ 🍕\n`
    texto += `• ${usedPrefix}interes - Cobra 2% diario 🍝\n`
    texto += `• ${usedPrefix}prestamo <monto> - Préstamo 25% 🍕\n`
    texto += `• ${usedPrefix}pagarprestamo <monto> - Paga deuda 💸\n`
    texto += `• ${usedPrefix}crimen - Roba el banco (35%) 🦹\n\n`
    texto += `💡 Tip: ${usedPrefix}dall para ganar interés como Garfield gana lasaña\n\n`
    texto += `━━━━━━━━━━━\n🍕 *LUX X YALLICO - GARFIELD EDITION* 😼`
    return m.reply(texto)
  }

  //.PERDONARPRESTAMO
  if (command === 'perdonarprestamo') {
    let isOwner = global.owner.map(v => v[0] + '@s.whatsapp.net').includes(m.sender)
    let isAdmin = false
    try {
      let groupMetadata = await conn.groupMetadata(m.chat)
      isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    } catch {}
    if (!isOwner &&!isAdmin) return m.reply('❌ Solo admins, ni Garfield puede perdonar sin permiso 😼')
    let who = m.mentionedJid[0]
    if (!who) return m.reply(`😼 Uso: ${usedPrefix}perdonarprestamo @user 🍕`)
    who = who.replace(/@lid$/, '@s.whatsapp.net')
    if (!global.db.data.users[who]) global.db.data.users[who] = { coin: 0, bank: 0, deuda: 0, prestamo: 0, interes: 0 }
    let userTarget = global.db.data.users[who]
    userTarget.prestamo = Number(userTarget.prestamo) || 0
    if (userTarget.prestamo === 0) return m.reply(`😼 @${who.split('@')[0]} no tiene préstamos 🍝`, null, { mentions: [who] })
    let deudaPerdonada = userTarget.prestamo
    userTarget.prestamo = 0
    userTarget.interes = 0
    try {
      await conn.reply(who, `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🏦 *¡PRÉSTAMO PERDONADO!* 🏦\n😸 Un admin te perdonó *${deudaPerdonada} monedas*\n🍝 Garfield: "Hoy es tu día de suerte"\n\nYa no debes nada ✅`, null, { mentions: [m.sender] })
    } catch {}
    return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n✅ *¡PRÉSTAMO PERDONADO!* ✅\n🍕 Le perdonaste *${deudaPerdonada} monedas* a @${who.split('@')[0]}\n\nYa no tiene deuda 😸`, null, { mentions: [who] })
  }
}

handler.help = ['prestamo', 'pagarprestamo', 'verprestamo', 'interes', 'crimen', 'banco', 'perdonarprestamo']
handler.tags = ['economy']
handler.command = ['prestamo', 'pagarprestamo', 'pp', 'verprestamo', 'miprestamo', 'interes', 'crimen', 'banco', 'perdonarprestamo']
handler.group = true
export default handler