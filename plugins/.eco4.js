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

  // .PRESTAMO - PEDIR PRESTADO AL BANCO
  if (command === 'prestamo') {
    if (user.deuda > 0) return m.reply(`🚔 Tienes *deuda con la policía* de ${user.deuda} 🪙\n\nPágala primero con ${usedPrefix}work o ${usedPrefix}pagardeuda`)
    if (user.prestamo > 0) return m.reply(`🏦 Ya tienes un préstamo activo de *${user.prestamo} monedas*\n\nInterés acumulado: ${user.interes} monedas\n\nUsa ${usedPrefix}pagarprestamo <monto> para pagar`)

    let monto = parseInt(text)
    if (isNaN(monto) || monto < 100) return m.reply(`🏦 *PRÉSTAMO BANCARIO* 🏦\n\nMonto mínimo: 100 monedas\nMonto máximo: 10,000 monedas\nInterés: 5% diario\n\nUso: ${usedPrefix}prestamo <monto>`)
    if (monto > 10000) return m.reply('Monto máximo: 10,000 monedas')

    // Calcular capacidad de préstamo según nivel de riqueza
    let totalRiqueza = user.coin + user.bank
    let limitePrestamo = Math.max(100, totalRiqueza * 2)
    if (monto > limitePrestamo) return m.reply(`🏦 El banco solo te presta hasta *${limitePrestamo} monedas* según tu riqueza actual\n\nTotal: ${totalRiqueza} 🪙`)

    user.prestamo = monto
    user.bank += monto
    user.interes = 0

    return m.reply(`🏦 *PRÉSTAMO APROBADO* 🏦\n\nRecibiste: *${monto} monedas* en tu banco\nInterés: 5% diario (${Math.floor(monto * 0.05)} monedas/día)\n\n⚠️ Paga con ${usedPrefix}pagarprestamo <monto>\n\nSaldo banco: ${user.bank} 🪙\nDeuda total: ${user.prestamo} 🪙`)
  }

  // .PAGARPRESTAMO - PAGAR EL PRÉSTAMO
  if (['pagarprestamo', 'pp'].includes(command)) {
    if (user.prestamo === 0) return m.reply('✅ No tienes préstamos pendientes')

    let monto = parseInt(text)
    if (isNaN(monto) || monto < 1) return m.reply(`🏦 *TU PRÉSTAMO* 🏦\n\nDeuda: ${user.prestamo} monedas\nInterés: ${user.interes} monedas\n*Total: ${user.prestamo + user.interes} monedas*\n\nUso: ${usedPrefix}pagarprestamo <monto>`)

    let totalDeuda = user.prestamo + user.interes
    if (user.coin < monto) return m.reply(`No tienes suficiente. Billetera: ${user.coin} 🪙\nDeuda total: ${totalDeuda} 🪙`)

    let aPagar = Math.min(monto, totalDeuda)
    user.coin -= aPagar

    // Primero se paga el interés, luego el capital
    if (aPagar <= user.interes) {
      user.interes -= aPagar
    } else {
      let resto = aPagar - user.interes
      user.interes = 0
      user.prestamo -= resto
    }

    if (user.prestamo === 0 && user.interes === 0) {
      return m.reply(`✅ *PRÉSTAMO PAGADO* ✅\n\nPagaste ${aPagar} monedas\nYa no tienes deudas con el banco\n\nTu saldo: ${user.coin} 🪙`)
    } else {
      return m.reply(`💸 Pagaste ${aPagar} monedas\n\n🏦 *DEUDA RESTANTE* 🏦\nCapital: ${user.prestamo} monedas\nInterés: ${user.interes} monedas\n*Total: ${user.prestamo + user.interes} monedas*\n\nTu saldo: ${user.coin} 🪙`)
    }
  }

  // .VER PRESTAMO - VER INFO DEL PRÉSTAMO
  if (['verprestamo', 'miprestamo'].includes(command)) {
    if (user.prestamo === 0) return m.reply('✅ No tienes préstamos activos\n\nUsa ' + usedPrefix + 'prestamo <monto> para pedir uno')

    return m.reply(`🏦 *TU PRÉSTAMO BANCARIO* 🏦\n\n💰 Capital: ${user.prestamo} monedas\n📈 Interés acumulado: ${user.interes} monedas\n💵 *TOTAL A PAGAR: ${user.prestamo + user.interes} monedas*\n\n⚠️ El interés sube 5% diario\nUsa ${usedPrefix}pagarprestamo <monto> para pagar`)
  }

  // .INTERES - COBRAR INTERÉS DIARIO DEL BANCO
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

  // .CRIMEN - ROBAR AL BANCO CON RIESGO
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

  // .BANCO - VER INFO GENERAL DEL BANCO
  if (command === 'banco') {
    let texto = `🏦 *BANCO CENTRAL* 🏦\n\n`
    texto += `💰 Tu saldo banco: ${user.bank} monedas\n`
    texto += `💵 Tu billetera: ${user.coin} monedas\n`
    texto += `🚔 Deuda policía: ${user.deuda} monedas\n\n`

    if (user.prestamo > 0) {
      texto += `📊 *TU PRÉSTAMO*\nCapital: ${user.prestamo} monedas\nInterés: ${user.interes} monedas\nTotal: ${user.prestamo + user.interes} monedas\n\n`
    } else {
      texto += `✅ Sin préstamos activos\n\n`
    }

    texto += `📈 *SERVICIOS*\n`
    texto += `• ${usedPrefix}interes - Cobra 2% diario de tu banco\n`
    texto += `• ${usedPrefix}prestamo <monto> - Pide prestado (5% interés diario)\n`
    texto += `• ${usedPrefix}pagarprestamo <monto> - Paga tu deuda\n`
    texto += `• ${usedPrefix}crimen - Intenta robar el banco (35% éxito)\n\n`
    texto += `💡 Tip: Deposita con ${usedPrefix}dall para ganar interés`

    return m.reply(texto)
  }
}

// SISTEMA DE INTERÉS AUTOMÁTICO PARA PRÉSTAMOS
// Se ejecuta cada vez que alguien usa un comando
handler.before = async (m, { conn }) => {
  if (!global.db.data.users[m.sender]) return
  let user = global.db.data.users[m.sender]
  user.prestamo = Number(user.prestamo) || 0
  user.interes = Number(user.interes) || 0
  user.ultimoInteresPrestamo = Number(user.ultimoInteresPrestamo) || 0

  // Si tiene préstamo, acumular interés cada 24h
  if (user.prestamo > 0) {
    let ahora = Date.now()
    let tiempoTranscurrido = ahora - user.ultimoInteresPrestamo
    let diasPasados = Math.floor(tiempoTranscurrido / 86400000) // 24h en ms

    if (diasPasados > 0) {
      let interesNuevo = Math.floor(user.prestamo * 0.05 * diasPasados)
      user.interes += interesNuevo
      user.ultimoInteresPrestamo = ahora
    }
  }
}

handler.help = ['prestamo', 'pagarprestamo', 'verprestamo', 'interes', 'crimen', 'banco']
handler.tags = ['economy']
handler.command = ['prestamo', 'pagarprestamo', 'pp', 'verprestamo', 'miprestamo', 'interes', 'crimen', 'banco']
handler.group = true
export default handler