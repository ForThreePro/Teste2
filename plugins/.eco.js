let MONEDA = 'R-COINS'

// Función para crear usuario y migrar datos viejos
function getUser(id) {
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let user = global.db.data.users[id]
    if (user.lasana!== undefined && user.rcoins === undefined) {
        user.rcoins = user.lasana
        delete user.lasana
    }
    if (user.bank!== undefined && user.rbank === undefined) {
        user.rbank = user.bank
        delete user.bank
    }
    if (user.rcoins === undefined) user.rcoins = 0
    if (user.rbank === undefined) user.rbank = 0
    return user
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let user = getUser(m.sender)

    // 1. SALDO
    if (command === 'saldo' || command === 'balance') {
        let texto = `💰 *TU SALDO*\n\n` +
                    `👛 *BILLETERA*: ${user.rcoins} ${MONEDA}\n` +
                    `🏦 *BANCO*: ${user.rbank} ${MONEDA}\n` +
                    `💵 *TOTAL*: ${user.rcoins + user.rbank} ${MONEDA}`
        return conn.reply(m.chat, texto, m)
    }

    // 2. DEPOSITAR
    if (command === 'd' || command === 'dall') {
        let amount = command === 'dall'? user.rcoins : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}d [monto] | ${usedPrefix}dall`, m)
        if (user.rcoins < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)
        user.rcoins -= amount; user.rbank += amount
        return conn.reply(m.chat, `✅ Depositaste *${amount}* ${MONEDA} al banco\n👛 Billetera: ${user.rcoins}\n🏦 Banco: ${user.rbank}`, m)
    }

    // 3. RETIRAR
    if (command === 'r' || command === 'rall') {
        let amount = command === 'rall'? user.rbank : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}r [monto] | ${usedPrefix}rall`, m)
        if (user.rbank < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA} en el banco`, m)
        user.rbank -= amount; user.rcoins += amount
        return conn.reply(m.chat, `✅ Retiraste *${amount}* ${MONEDA} del banco\n👛 Billetera: ${user.rcoins}\n🏦 Banco: ${user.rbank}`, m)
    }

    // 4. ROBAR - 3 MIN Y AVISO
    if (command === 'robar') {
        let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted?.sender
        if (!who) return conn.reply(m.chat, `*Uso:* ${usedPrefix}robar @usuario`, m)
        if (who === m.sender) return conn.reply(m.chat, `❌ No te puedes robar a ti mismo`, m)

        let target = getUser(who)
        let tiempo = 3 * 60 * 1000 // 3 minutos antes era 60 min
        if (user.lastrob && new Date - user.lastrob < tiempo) {
            let falta = msToTime(user.lastrob + tiempo - new Date())
            return conn.reply(m.chat, `⏰ Espera ${falta} para volver a robar`, m)
        }
        if (target.rcoins < 10) return conn.reply(m.chat, `❌ @${who.split('@')[0]} no tiene ${MONEDA} en la billetera para robar\n*Tiene:* ${target.rcoins} ${MONEDA}`, m, { mentions: [who] })

        let robo = Math.floor(Math.random() * target.rcoins * 0.3) + 10
        if (robo > target.rcoins) robo = target.rcoins

        target.rcoins -= robo
        user.rcoins += robo
        user.lastrob = new Date * 1

        // AVISO A LA VICTIMA POR PRIVADO
        try {
            await conn.sendMessage(who, {
                text: `🚨 *¡TE ESTÁN ROBANDO!* 🚨\n\n@${m.sender.split('@')[0]} te robó *${robo}* ${MONEDA} de tu billetera\n\n👛 Te quedan: ${target.rcoins} ${MONEDA}\n\n💡 Tip: Guarda tus ${MONEDA} en el banco con.dall para que no te roben`
            }, { mentions: [m.sender] })
        } catch(e){} // Si tiene privado cerrado no crashea

        return conn.reply(m.chat, `🕶️ *ROBASTE CON ÉXITO*\n+${robo} ${MONEDA} de @${who.split('@')[0]}\n\n👛 Tu Billetera: ${user.rcoins}\n👛 Billetera de @${who.split('@')[0]}: ${target.rcoins}`, m, { mentions: [who] })
    }

    // 5. PAY
    if (command === 'pay' || command === 'pagar') {
        let who = m.mentionedJid[0]
        let monto = parseInt(args[0])
        if (!who ||!monto) return conn.reply(m.chat, `*Uso:* ${usedPrefix}pay [monto] @usuario`, m)
        if (monto < 1) return conn.reply(m.chat, `❌ Ingresa un monto válido`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        let target = getUser(who)
        user.rcoins -= monto
        target.rcoins += monto
        return conn.reply(m.chat, `💸 *TRANSFERENCIA EXITOSA*\n\nEnviado: *${monto}* ${MONEDA} a @${who.split('@')[0]}\n\n👛 Tu Billetera: ${user.rcoins}`, m, { mentions: [who] })
    }
}

handler.help = [
    'saldo ( Ver Tus R-COINS )',
    'd [monto] ( Depositar Al Banco )',
    'dall ( Depositar Todo Al Banco )',
    'r [monto] ( Retirar Del Banco )',
    'rall ( Retirar Todo Del Banco )',
    'robar @usuario ( Robar De La Billetera Cada 3min )',
    'pay [monto] @usuario ( Transferir R-COINS )'
]
handler.tags = ['economy']
handler.command = ['saldo', 'balance', 'd', 'r', 'dall', 'rall', 'robar', 'pay', 'pagar']
export default handler

function msToTime(d){let m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}