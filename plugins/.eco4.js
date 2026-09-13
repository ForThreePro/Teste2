let handler = async (m, { conn, usedPrefix, text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = { coin: 0, bank: 0, items: {}, deuda: 0, prestamo: 0, interes: 0, ultimoCrimen: 0 }

  // INICIALIZAR CAMPOS DE BANCO
  user.prestamo = Number(user.prestamo) || 0
  user.interes = Number(user.interes) || 0
  user.ultimoCrimen = Number(user.ultimoCrimen) || 0
  user.coin = Number(user.coin) || 0
  user.bank = Number(user.bank) || 0
  user.deuda = Number(user.deuda) || 0

  //.PRESTAMO - INTERÉS FIJO 25% UNA SOLA VEZ
  if (command === 'prestamo') {
    if (user.deuda > 0) return m.reply(`🚔 Tienes *deuda con la policía* de ${user.deuda} 🪙\n\nPágala primero con ${usedPrefix}work o ${usedPrefix}pagardeuda`)
    if (user.prestamo > 0) return m.reply(`🏦 Ya tienes un préstamo activo\n\nCapital: ${user.prestamo - user.interes} monedas\nInterés: ${user.interes} monedas\n*Total a pagar: ${user.prestamo} monedas*\n\nUsa ${usedPrefix}pagarprestamo <monto> para pagar`)

    let monto = parseInt(text)
    if (isNaN(monto) || monto < 100) return m.reply(`🏦 *PRÉSTAMO BANCARIO* 🏦\n\nMonto mínimo: 100 monedas\nMonto máximo: 10,000 monedas\nInterés: 25% fijo\n\nEjemplos:\n100 → Pagas 125\n200 → Pagas 250\n500 → Pagas 625\n1000 → Pagas 1250\n\nUso: ${usedPrefix}prestamo <monto>`)
    if (monto > 10000) return m.reply('Monto máximo: 10,000 monedas')

    // Calcular capacidad de préstamo según nivel de riqueza
    let totalRiqueza = user.coin + user.bank
    let limitePrestamo = Math.max(100, totalRiqueza * 2)
    if (monto > limitePrestamo) return m.reply(`🏦 El banco solo te presta hasta *${limitePrestamo} monedas* según tu riqueza actual\n\nTotal: ${totalRiqueza} 🪙`)

    let interesFijo = Math.floor(monto * 0.25) // 25% fijo
    let totalPagar = monto + interesFijo

    user.prestamo = totalPagar // Guardamos el total a pagar
    user.interes = interesFijo // Guardamos solo el interés para mostrarlo
    user.bank += monto

    return m.reply(`🏦 *PRÉSTAMO APROBADO* 🏦\n\nRecibiste: *${monto} monedas* en tu banco\nInterés fijo: ${interesFijo} monedas (25%)\n*Total a pagar: ${totalPagar} monedas*\n\n⚠️ Paga con ${usedPrefix}pagarprestamo <monto>\n\nSaldo banco: ${user.bank} 🪙`)
  }

  //.PAGARPRESTAMO - PAGAR EL PRÉSTAMO
  if (['pagarprestamo', 'pp'].includes(command)) {
    if (user.prestamo === 0) return m.reply('✅ No tienes préstamos pendientes')

    let monto = parseInt(text)
    if (isNaN(monto) || monto < 1) return m.reply(`🏦 *TU PRÉSTAMO* 🏦\n\nCapital: ${user.prestamo - user.interes} monedas\nInterés: ${user.interes} monedas\n*Total: ${user.prestamo} monedas*\n\nUso: ${usedPrefix}pagarprestamo <monto>`)

    if (user.coin < monto) return m.reply(`No tienes suficiente. Billetera: ${user.coin} 🪙\nDeuda total: ${user.prestamo} 🪙`)

    let aPagar = Math.min(monto, user.prestamo)
    user.coin -= aPagar
    user.prestamo -= aPagar

    // Recalcular interés proporcional
    if (user.prestamo === 0) {
      user.interes = 0
      return m.reply(`✅ *PRÉSTAMO PAGADO* ✅\n\nPagaste ${aPagar} monedas\nYa no tienes deudas con el banco\n\nTu saldo: ${user.coin} 🪙`)
    } else {
      // Mantener proporción del interés
      let capitalOriginal = user.prestamo + aPagar - user.interes
      let interesOriginal = user.interes
      let porcentajePagado = aPagar / (capitalOriginal + interesOriginal)
      user.interes = Math.max(0, Math.floor(interesOriginal * (1 - porcentajePagado)))

      return m.reply(`💸 Pagaste ${aPagar} monedas\n\n🏦 *DEUDA RESTANTE* 🏦\nCapital: ${user.prestamo - user.interes} monedas\nInterés: ${user.interes} monedas\n*Total: ${user.prestamo} monedas*\n\nTu saldo: ${user.coin} 🪙`)
    }
  }

  //.VER PRESTAMO - VER INFO DEL PRÉSTAMO
  if (['verprestamo', 'miprestamo'].includes(command)) {
    if (user.prestamo === 0) return m.reply('✅ No tienes préstamos activos\n\nUsa ' + usedPrefix + 'prestamo <monto> para pedir uno')

    let capital = user.prestamo - user.interes
    return m.reply(`🏦 *TU PRÉSTAMO BANCARIO* 🏦\n\n💰 Capital prestado: ${capital} monedas\n📈 Interés fijo: ${user.interes} monedas (25%)\n💵 *TOTAL A PAGAR: ${user.prestamo} monedas*\n\nUsa ${usedPrefix}pagarprestamo <monto> para pagar`)
  }

  //.INTERES - COBRAR INTERÉS DIARIO DEL BANCO
  if (command === 'interes') {
    let ahora = Date.now()
    let ultimoInteres = user.ultimoInteres || 0
    let tiempoEspera = 86400000 // 24 horas

    if (ahora - ultimoInteres < tiempoEspera) {
      let falta = tiempoEspera - (ahora - ultimoInteres)
      let horas = Math.floor(falta / 3600000)
      let minutos = Math.floor((falta % 3600000) / 60000)
      return m.reply(`⏰ Ya cobraste tu interés diario\n\nVuelve en: ${horas}h ${minutos}m`)
    }

    if (user.bank === 0) return m.reply('No tienes monedas en el banco para generar interés\n\nUsa ' + usedPrefix + 'dall para depositar')

    let interesGanado = Math.floor(user.bank * 0.02) // 2% del banco
    if (interesGanado < 1) interesGanado = 1

    user.bank += interesGanado
    user.ultimoInteres = ahora

    return m.reply(`🏦 *INTERÉS BANCARIO* 🏦\n\nGanaste: *${interesGanado} monedas* (2% de tu banco)\n\nSaldo banco: ${user.bank} 🪙\n\nVuelve mañana por más 💰`)
  }

  //.CRIMEN - ROBAR AL BANCO CON RIESGO
  if (command === 'crimen') {
    if (user.deuda > 0) return m.reply(`🚔 Tienes *deuda con la policía* de ${user.deuda} 🪙\n\nPágala primero con ${usedPrefix}work o ${usedPrefix}pagardeuda`)

    let ahora = Date.now()
    let tiempoEspera = 600000 // 10 minutos
    if (ahora - user.ultimoCrimen < tiempoEspera) {
      let falta = tiempoEspera - (ahora - user.ultimoCrimen)
      let minutos = Math.ceil(falta / 60000)
      return m.reply(`🚨 La policía te está vigilando\n\nEspera ${minutos} min para intentar otro crimen`)
    }

    user.ultimoCrimen = ahora
    let exito = Math.random() < 0.35 // 35% de éxito

    if (exito) {
      let robado = Math.floor(Math.random() * 500) + 100 // 100-600
      user.coin += robado
      return m.reply(`🦹 *CRIMEN EXITOSO* 🦹\n\nRobaste *${robado} monedas* del banco central\n\nLa policía no te vio 👀\n\nTu saldo: ${user.coin} 🪙`)
    } else {
      let multa = Math.floor(Math.random() * 200) + 100 // 100-300
      if (user.coin < multa) {
        let deudaNueva = multa - user.coin
        user.deuda += deudaNueva
        user.coin = 0
        return m.reply(`🚔 *TE ATRAPARON* 🚔\n\nIntentaste robar el banco pero fallaste\n\nMulta: ${multa} monedas\nPagaste: ${user.coin} monedas\n\n💸 *DEUDA CON LA POLICÍA*: ${user.deuda} monedas\n\nUsa ${usedPrefix}work para pagar trabajando\n\nTu saldo: 0 🪙`)
      } else {
        user.coin -= multa
        return m.reply(`🚔 *TE ATRAPARON* 🚔\n\nIntentaste robar el banco pero la alarma sonó\n\nPagaste *${multa} monedas* de multa\n\nTu saldo: ${user.coin} 🪙`)
      }
    }
  }

  //.BANCO - VER INFO GENERAL DEL BANCO
  if (command === 'banco') {
    let texto = `🏦 *BANCO CENTRAL* 🏦\n\n`
    texto += `💰 Tu saldo banco: ${user.bank} monedas\n`
    texto += `💵 Tu billetera: ${user.coin} monedas\n`
    texto += `🚔 Deuda policía: ${user.deuda} monedas\n\n`

    if (user.prestamo > 0) {
      let capital = user.prestamo - user.interes
      texto += `📊 *TU PRÉSTAMO*\nCapital: ${capital} monedas\nInterés: ${user.interes} monedas\nTotal: ${user.prestamo} monedas\n\n`
    } else {
      texto += `✅ Sin préstamos activos\n\n`
    }

    texto += `📈 *SERVICIOS*\n`
    texto += `• ${usedPrefix}interes - Cobra 2% diario de tu banco\n`
    texto += `• ${usedPrefix}prestamo <monto> - Pide prestado (25% interés fijo)\n`
    texto += `• ${usedPrefix}pagarprestamo <monto> - Paga tu deuda\n`
    texto += `• ${usedPrefix}crimen - Intenta robar el banco (35% éxito)\n\n`
    texto += `💡 Tip: Deposita con ${usedPrefix}dall para ganar interés`

    return m.reply(texto)
  }

  //.PERDONARPRESTAMO - SOLO ADMINS/OWNER
  if (command === 'perdonarprestamo') {
    // Verificar si es owner o admin
    let isOwner = global.owner.map(v => v[0] + '@s.whatsapp.net').includes(m.sender)
    let isAdmin = false
    try {
      let groupMetadata = await conn.groupMetadata(m.chat)
      isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    } catch {}

    if (!isOwner &&!isAdmin) return m.reply('❌ Solo admins pueden usar este comando')

    let who = m.mentionedJid[0]
    if (!who) return m.reply(`Uso: ${usedPrefix}perdonarprestamo @user`)
    who = who.replace(/@lid$/, '@s.whatsapp.net')

    if (!global.db.data.users[who]) global.db.data.users[who] = { coin: 0, bank: 0, deuda: 0, prestamo: 0, interes: 0 }

    let userTarget = global.db.data.users[who]
    userTarget.prestamo = Number(userTarget.prestamo) || 0

    if (userTarget.prestamo === 0) return m.reply(`@${who.split('@')[0]} no tiene préstamos activos`, null, { mentions: [who] })

    let deudaPerdonada = userTarget.prestamo
    userTarget.prestamo = 0
    userTarget.interes = 0

    try {
      await conn.reply(who, `🏦 *PRÉSTAMO PERDONADO* 🏦\n\nUn admin te perdonó tu deuda de *${deudaPerdonada} monedas*\n\nYa no debes nada al banco ✅`, null, { mentions: [m.sender] })
    } catch {}

    return m.reply(`✅ *PRÉSTAMO PERDONADO* ✅\n\nLe perdonaste *${deudaPerdonada} monedas* a @${who.split('@')[0]}\n\nYa no tiene deuda con el banco`, null, { mentions: [who] })
  }
}

handler.help = ['prestamo', 'pagarprestamo', 'verprestamo', 'interes', 'crimen', 'banco', 'perdonarprestamo']
handler.tags = ['economy']
handler.command = ['prestamo', 'pagarprestamo', 'pp', 'verprestamo', 'miprestamo', 'interes', 'crimen', 'banco', 'perdonarprestamo']
handler.group = true
export default handler