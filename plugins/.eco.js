let MONEDA = 'R-COINS'

let trabajos = [
    { name: 'Repartidor', min: 20, max: 50 },
    { name: 'Programador', min: 40, max: 100 },
    { name: 'Chef', min: 30, max: 80 },
    { name: 'Minero', min: 50, max: 120 },
    { name: 'Streamer', min: 60, max: 150 },
    { name: 'Hacker', min: 80, max: 200 },
    { name: 'CEO', min: 100, max: 300 }
]

function getUser(id) {
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let user = global.db.data.users[id]
    if (user.lasana!== undefined && user.rcoins === undefined) { user.rcoins = user.lasana; delete user.lasana }
    if (user.bank!== undefined && user.rbank === undefined) { user.rbank = user.bank; delete user.bank }
    if (user.rcoins === undefined) user.rcoins = 0
    if (user.rbank === undefined) user.rbank = 0
    if (user.level === undefined) user.level = 1
    if (user.exp === undefined) user.exp = 0
    return user
}

function subirNivel(user) {
    let expNecesaria = user.level * 100
    if (user.exp >= expNecesaria) {
        user.level += 1
        user.exp = user.exp - expNecesaria
        return true
    }
    return false
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let user = getUser(m.sender)
    if (subirNivel(user)) conn.reply(m.chat, `🎉 *¡SUBISTE A NIVEL ${user.level}!* 🎉\n+${user.level * 50} ${MONEDA} de bono`, m)

    // 1. SALDO
    if (command === 'saldo' || command === 'balance') {
        let texto = `💰 *TU PERFIL*\n\n` +
                    `📊 *Nivel*: ${user.level}\n` +
                    `✨ *Exp*: ${user.exp}/${user.level * 100}\n\n` +
                    `👛 *BILLETERA*: ${user.rcoins} ${MONEDA}\n` +
                    `🏦 *BANCO*: ${user.rbank} ${MONEDA}\n` +
                    `💵 *TOTAL*: ${user.rcoins + user.rbank} ${MONEDA}`
        return conn.reply(m.chat, texto, m)
    }

    // 2. WORK - TRABAJAR
    if (command === 'work' || command === 'trabajar') {
        let tiempo = 30 * 60 * 1000 // 30 minutos
        if (user.lastwork && new Date - user.lastwork < tiempo) {
            let falta = msToTime(user.lastwork + tiempo - new Date())
            return conn.reply(m.chat, `⏰ Ya trabajaste. Espera ${falta}`, m)
        }

        // Mas nivel = mejores trabajos y mas paga
        let trabajosDisponibles = trabajos.slice(0, user.level + 2)
        if (trabajosDisponibles.length > trabajos.length) trabajosDisponibles = trabajos

        let trabajo = trabajosDisponibles[Math.floor(Math.random() * trabajosDisponibles.length)]
        let bonoNivel = user.level * 5
        let paga = Math.floor(Math.random() * (trabajo.max - trabajo.min)) + trabajo.min + bonoNivel
        let expGanada = 10 + user.level

        user.rcoins += paga
        user.exp += expGanada
        user.lastwork = new Date * 1

        return conn.reply(m.chat, `💼 *FUISTE A TRABAJAR*\n\n*Trabajo:* ${trabajo.name}\n*Ganaste:* ${paga} ${MONEDA}\n*+${expGanada} Exp*\n\n👛 Billetera: ${user.rcoins} ${MONEDA}`, m)
    }

    // 3. DEPOSITAR
    if (command === 'd' || command === 'dall') {
        let amount = command === 'dall'? user.rcoins : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}d [monto] | ${usedPrefix}dall`, m)
        if (user.rcoins < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)
        user.rcoins -= amount; user.rbank += amount
        user.exp += 2
        return conn.reply(m.chat, `✅ Depositaste *${amount}* ${MONEDA}\n+2 Exp`, m)
    }

    // 4. RETIRAR
    if (command === 'r' || command === 'rall') {
        let amount = command === 'rall'? user.rbank : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}r [monto] | ${usedPrefix}rall`, m)
        if (user.rbank < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA} en el banco`, m)
        user.rbank -= amount; user.rcoins += amount
        user.exp += 2
        return conn.reply(m.chat, `✅ Retiraste *${amount}* ${MONEDA}\n+2 Exp`, m)
    }

    // 5. ROBAR
    if (command === 'robar') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted?.sender
        if (!who) return conn.reply(m.chat, `*Uso:* ${usedPrefix}robar @usuario`, m)
        if (who === m.sender) return conn.reply(m.chat, `❌ No te puedes robar a ti mismo`, m)

        let target = getUser(who)
        let tiempo = 3 * 60 * 1000 // 3 min
        if (user.lastrob && new Date - user.lastrob < tiempo) {
            let falta = msToTime(user.lastrob + tiempo - new Date())
            return conn.reply(m.chat, `⏰ Espera ${falta} para volver a robar`, m)
        }
        if (target.rcoins < 10) return conn.reply(m.chat, `❌ @${who.split('@')[0]} no tiene ${MONEDA}\n*Tiene:* ${target.rcoins}`, m, { mentions: [who] })

        let porcentajeRobo = 0.10 + (user.level * 0.01)
        if (porcentajeRobo > 0.30) porcentajeRobo = 0.30

        let robo = Math.floor(target.rcoins * porcentajeRobo) + 10
        if (robo > target.rcoins) robo = target.rcoins

        target.rcoins -= robo
        user.rcoins += robo
        user.lastrob = new Date * 1
        user.exp += 10

        try {
            await conn.sendMessage(who, { text: `🚨 *¡TE ROBARON!* 🚨\n@${m.sender.split('@')[0]} [Nv.${user.level}] te quitó *${robo}* ${MONEDA}` }, { mentions: [m.sender] })
        } catch(e){}

        return conn.reply(m.chat, `🕶️ *ROBASTE*\n+${robo} ${MONEDA} de @${who.split('@')[0]}\n+10 Exp`, m, { mentions: [who] })
    }

    // 6. PAY
    if (command === 'pay' || command === 'pagar') {
        let who = m.mentionedJid[0]
        let monto = parseInt(args[0])
        if (!who ||!monto) return conn.reply(m.chat, `*Uso:* ${usedPrefix}pay [monto] @usuario`, m)
        if (monto < 1) return conn.reply(m.chat, `❌ Ingresa un monto válido`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        let target = getUser(who)
        user.rcoins -= monto
        target.rcoins += monto
        user.exp += 1
        return conn.reply(m.chat, `💸 Enviado: *${monto}* ${MONEDA} a @${who.split('@')[0]}\n+1 Exp`, m, { mentions: [who] })
    }
}

handler.help = [
    'saldo ( Ver Perfil )',
    'work ( Trabajar Cada 30min )',
    'd [monto] ( Depositar )',
    'dall ( Depositar Todo )',
    'r [monto] ( Retirar )',
    'rall ( Retirar Todo )',
    'robar @user ( Robar Cada 3min )',
    'pay [monto] @user ( Transferir )'
]
handler.tags = ['economy']
handler.command = ['saldo', 'balance', 'work', 'trabajar', 'd', 'r', 'dall', 'rall', 'robar', 'pay', 'pagar']
export default handler
function msToTime(d){let m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}