let handler = async (m, { conn, usedPrefix, text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = { coin: 0, bank: 0, items: {} }

  // SALDO - FIXED NaN Y UNDEFINED
  if (['saldo', 'bal', 'balance'].includes(command)) {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : m.sender

    // Si el usuario no existe en la DB, crearlo
    if (!global.db.data.users[who]) {
      global.db.data.users[who] = { coin: 0, bank: 0, items: {} }
    }

    let userTarget = global.db.data.users[who]

    // Asegurar que coin y bank sean números
    userTarget.coin = userTarget.coin || 0
    userTarget.bank = userTarget.bank || 0

    let name = 'Usuario'
    try {
      name = await conn.getName(who)
      if (!name || name === 'undefined') name = 'Usuario'
    } catch {
      name = 'Usuario'
    }

    let texto = `💰 *SALDO DE ${name}* 💰\n\n🪙 Billetera: ${userTarget.coin} monedas\n🏦 Banco: ${userTarget.bank} monedas\n💵 Total: ${userTarget.coin + userTarget.bank} monedas`

    // Si menciona a otro, manda al privado y no muestra en el grupo
    if (who!== m.sender) {
      try {
        await conn.reply(m.sender, texto, null)
        return m.reply('📩 Te envié el saldo al privado')
      } catch {
        return m.reply('No pude enviarte DM. Abre tu privado con el bot')
      }
    } else {
      return m.reply(texto)
    }
  }

  // DEPOSITAR TODO
  if (command === 'dall') {
    user.coin = user.coin || 0
    if (user.coin === 0) return m.reply('No tienes monedas en la billetera')
    let cantidad = user.coin
    user.coin = 0
    user.bank = (user.bank || 0) + cantidad
    return m.reply(`🏦 Depositaste *${cantidad} monedas* al banco\n\nBilletera: ${user.coin} 🪙\nBanco: ${user.bank} 🏦`)
  }

  // RETIRAR TODO
  if (command === 'rall') {
    user.bank = user.bank || 0
    if (user.bank === 0) return m.reply('No tienes monedas en el banco')
    let cantidad = user.bank
    user.bank = 0
    user.coin = (user.coin || 0) + cantidad
    return m.reply(`🏦 Retiraste *${cantidad} monedas* del banco\n\nBilletera: ${user.coin} 🪙\nBanco: ${user.bank} 🏦`)
  }

  // DEPOSITAR MONTO
  if (command === 'd') {
    let monto = parseInt(text)
    user.coin = user.coin || 0
    if (isNaN(monto) || monto < 1) return m.reply(`Uso: ${usedPrefix}d <monto>`)
    if (user.coin < monto) return m.reply(`No tienes suficiente. Billetera: ${user.coin} 🪙`)
    user.coin -= monto
    user.bank = (user.bank || 0) + monto
    return m.reply(`🏦 Depositaste *${monto} monedas*\n\nBilletera: ${user.coin} 🪙\nBanco: ${user.bank} 🏦`)
  }

  // RETIRAR MONTO
  if (command === 'r') {
    let monto = parseInt(text)
    user.bank = user.bank || 0
    if (isNaN(monto) || monto < 1) return m.reply(`Uso: ${usedPrefix}r <monto>`)
    if (user.bank < monto) return m.reply(`No tienes suficiente. Banco: ${user.bank} 🏦`)
    user.bank -= monto
    user.coin = (user.coin || 0) + monto
    return m.reply(`🏦 Retiraste *${monto} monedas*\n\nBilletera: ${user.coin} 🪙\nBanco: ${user.bank} 🏦`)
  }

  // PAY
  if (['pay', 'pagar'].includes(command)) {
    let args = text.split(' ')
    if (args.length < 2) return m.reply(`Uso: ${usedPrefix + command} <monto> @user`)
    let monto = parseInt(args[0])
    user.coin = user.coin || 0
    if (isNaN(monto) || monto < 1) return m.reply('Monto inválido')
    if (user.coin < monto) return m.reply(`No tienes suficiente. Saldo: ${user.coin} 🪙`)
    let who = m.mentionedJid[0]
    if (!who) return m.reply('Menciona a quien le quieres pagar')
    if (who === m.sender) return m.reply('No te puedes pagar a ti mismo')
    if (!global.db.data.users[who]) global.db.data.users[who] = { coin: 0, bank: 0 }
    global.db.data.users[who].coin = (global.db.data.users[who].coin || 0)
    user.coin -= monto
    global.db.data.users[who].coin += monto
    return m.reply(`💸 *TRANSFERENCIA* 💸\n\nLe pagaste *${monto} monedas* a @${who.split('@')[0]}\n\nTu saldo: ${user.coin} 🪙`, null, { mentions: [who, m.sender] })
  }

  // LEADERBOARD
  if (['leaderboard', 'lb', 'top'].includes(command)) {
    let users = Object.entries(global.db.data.users).map(([key, value]) => ({
      jid: key,
      coin: value.coin || 0,
      bank: value.bank || 0
    })).filter(v => v.coin || v.bank)

    if (users.length === 0) return m.reply('No hay usuarios con monedas aún')
    users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))
    let texto = `🏆 *TOP 10 MILLONARIOS* 🏆\n\n`
    let len = Math.min(10, users.length)
    for (let i = 0; i < len; i++) {
      let user = users[i]
      let total = user.coin + user.bank
      let medalla = i === 0? '🥇' : i === 1? '🥈' : i === 2? '🥉' : `${i + 1}.`
      texto += `${medalla} @${user.jid.split('@')[0]}\n💰 Total: ${total}\n\n`
    }
    let posicion = users.findIndex(v => v.jid === m.sender) + 1
    if (posicion > 0) texto += `\n📍 Tu posición: #${posicion}`
    return conn.reply(m.chat, texto, m, { mentions: users.slice(0, len).map(v => v.jid) })
  }
}

handler.help = ['saldo', 'dall', 'rall', 'd', 'r', 'pay', 'lb']
handler.tags = ['economy']
handler.command = ['saldo', 'bal', 'balance', 'dall', 'rall', 'd', 'r', 'pay', 'pagar', 'leaderboard', 'lb', 'top']
handler.group = true
export default handler