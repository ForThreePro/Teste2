let MONEDA = 'R-COINS'

// Función para crear usuario y migrar datos
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

// Subir de nivel: cada 100 exp subes 1 nivel
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
    if (subirNivel(user)) conn.reply(m.chat, `🎉 *¡SUBISTE A NIVEL ${user.level}!* 🎉`, m)

    // 1. SALDO + NIVEL
    if (command === 'saldo' || command === 'balance') {
        let texto = `💰 *TU PERFIL*\n\n` +
                    `📊 *Nivel*: ${user.level}\n` +
                    `✨ *Exp*: ${user.exp}/${user.level * 100}\n\n` +
                    `👛 *BILLETERA*: ${user.rcoins} ${MONEDA}\n` +
                    `🏦 *BANCO*: ${user.rbank} ${MONEDA}\n` +
                    `💵 *TOTAL*: ${user.rcoins + user.rbank} ${MONEDA}`
        return conn.reply(m.chat, texto, m)
    }

    // 2. DEPOSITAR - Ganas exp
    if (command === 'd' || command === 'dall') {
        let amount = command === 'dall'? user.rcoins : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}d [monto] | ${usedPrefix}dall`, m)
        if (user.rcoins < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)
        user.rcoins -= amount; user.rbank += amount
        user.exp += 2
        return conn.reply(m.chat, `✅ Depositaste *${amount}* ${MONEDA}\n+2 Exp\n👛 Billetera: ${user.rcoins}\n🏦 Banco: ${user.rbank}`, m)
    }

    // 3. RETIRAR - Ganas exp
    if (command === 'r' || command === 'rall') {
        let amount = command === 'rall'? user.rbank : parseInt(args[0])
        if (!amount || amount < 1) return conn.reply(m.chat, `*Uso:* ${usedPrefix}r [monto] | ${usedPrefix}rall`, m)
        if (user.rbank < amount) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA} en el banco`, m)
        user.rbank -= amount; user.rcoins += amount
        user.exp += 2
        return conn.reply(m.chat, `✅ Retiraste *${amount}* ${MONEDA}\n+2 Exp\n👛 Billetera: ${user.rcoins}\n🏦 Banco: ${user.rbank}`, m)
    }

    // 4. ROBAR - TODO POR NIVEL
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

        // NIVEL: Mas nivel = robas mas %
        let porcentajeRobo = 0.10 + (user.level * 0.01) // Nv1=11%... Nv20=30%
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

        return conn.reply(m.chat, `🕶️ *ROBASTE*\n+${robo} ${MONEDA} de @${who.split('@')[0]}\n+10 Exp\n👛 Tu Billetera: ${user.rcoins}`, m, { mentions: [who] })
    }

    // 5. PAY - Ganas exp
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

handler.help = ['saldo','d','dall','r','rall','robar @user','pay [monto] @user']
handler.tags = ['economy']
handler.command = ['saldo', 'balance', 'd', 'r', 'dall', 'rall', 'robar', 'pay', 'pagar']
export default handler
function msToTime(d){let m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}