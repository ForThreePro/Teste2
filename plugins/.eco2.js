let MONEDA = 'R-COINS'
let iconos = ['🍒', '🍋', '⭐', '💎', '7', '🍀']

let preguntas = [
    { q: '¿Cuánto es 2 + 2?', a: '4' }, { q: '¿Cuánto es 5 + 3?', a: '8' }, { q: '¿Cuánto es 10 - 4?', a: '6' },
    { q: '¿De qué color es el cielo?', a: 'azul' }, { q: '¿De qué color es la nieve?', a: 'blanco' },
    { q: '¿Cuántos días tiene una semana?', a: '7' }, { q: '¿Cuántos meses tiene un año?', a: '12' },
    { q: '¿Qué animal dice miau?', a: 'gato' }, { q: '¿Qué animal dice guau?', a: 'perro' },
    { q: '¿Capital de Perú?', a: 'lima' }, { q: '¿Capital de México?', a: 'cdmx' },
    { q: '¿Cuántos ojos tenemos?', a: '2' }, { q: '¿Cuántos dedos tiene una mano?', a: '5' }
]

function getUser(id) {
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let user = global.db.data.users[id]
    if (user.rcoins === undefined) user.rcoins = 0
    return user
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let user = getUser(m.sender)

    // 1. TRIVIA
    if (command === 'trivia') {
        let tiempo = 10 * 60 * 1000
        if (user.lasttrivia && new Date - user.lasttrivia < tiempo) return conn.reply(m.chat, `⏰ Espera ${msToTime(user.lasttrivia + tiempo - new Date())} para otra trivia`, m)
        let preg = preguntas[Math.floor(Math.random() * preguntas.length)]
        user.trivia = preg.a.toLowerCase()
        user.triviatime = new Date * 1
        return conn.reply(m.chat, `❓ *TRIVIA*\n\n${preg.q}\n\n*Premio:* 50 ${MONEDA}\nResponde en 30 segundos`, m)
    }

    // 2. RULETA
    if (command === 'ruleta' || command === 'rlt') {
        let color = args[0]?.toLowerCase()
        let monto = parseInt(args[1])
        if (!['red', 'black', 'rojo', 'negro'].includes(color)) return conn.reply(m.chat, `*Uso:* ${usedPrefix}ruleta [red/black] [monto]\nEjemplo: ${usedPrefix}ruleta red 100`, m)
        if (!monto || monto < 10) return conn.reply(m.chat, `❌ Apuesta mínima: 10 ${MONEDA}`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        user.rcoins -= monto
        let resultado = Math.random() < 0.5? 'red' : 'black'
        let colorTxt = resultado === 'red'? '🔴 ROJO' : '⚫ NEGRO'
        let gano = ((color === 'red' || color === 'rojo') && resultado === 'red') || ((color === 'black' || color === 'negro') && resultado === 'black')

        if (gano) {
            user.rcoins += monto * 2
            return conn.reply(m.chat, `🎉 Salió ${colorTxt}\n*GANASTE x2:* +${monto * 2} ${MONEDA}\n💰 Total: ${user.rcoins} ${MONEDA}`, m)
        } else {
            return conn.reply(m.chat, `😢 Salió ${colorTxt}\n*PERDISTE:* -${monto} ${MONEDA}\n💰 Total: ${user.rcoins} ${MONEDA}`, m)
        }
    }

    // 3. SLOTS - x2 x5 x10 x15 x25 x50 x75 x100
    if (command === 'slots' || command === 'slot') {
        let monto = parseInt(args[0])
        if (!monto || monto < 10) return conn.reply(m.chat, `❌ Apuesta mínima: 10 ${MONEDA}`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        user.rcoins -= monto
        let s1 = iconos[Math.floor(Math.random() * iconos.length)]
        let s2 = iconos[Math.floor(Math.random() * iconos.length)]
        let s3 = iconos[Math.floor(Math.random() * iconos.length)]

        let iguales = s1 === s2 && s2 === s3? 3 : s1 === s2 || s1 === s3 || s2 === s3? 2 : 1
        let multi = iguales === 3? [10,15,25,50,75,100][Math.floor(Math.random()*6)] : iguales === 2? [2,5][Math.floor(Math.random()*2)] : 0
        let gana = monto * multi
        if (gana > 0) user.rcoins += gana

        let resultado = iguales === 3? `🎉 JACKPOT x${multi}!` : iguales === 2? `✨ Ganaste x${multi}!` : `😢 Perdiste`
        return conn.reply(m.chat, `🎰 *TRAGAMONEDAS*\n\n[${s1}] [${s2}] [${s3}]\n\n${resultado}\n${gana > 0? `+${gana} ${MONEDA}` : `-${monto} ${MONEDA}`}\n\n💰 Total: ${user.rcoins} ${MONEDA}`, m)
    }
}

handler.before = async (m) => {
    let user = getUser(m.sender)
    if (user.trivia && m.text.toLowerCase() === user.trivia) {
        if (new Date - user.triviatime > 30000) return delete user.trivia
        user.rcoins += 50; user.lasttrivia = new Date * 1; delete user.trivia; delete user.triviatime
        m.reply(`✅ *CORRECTO!* +50 ${MONEDA}\n💰 Total: ${user.rcoins} ${MONEDA}`)
    }
}

handler.help = [
    'trivia ( Responder Preguntas Y Ganar 50 R-COINS )',
    'ruleta [color] [monto] ( Apostar Rojo o Negro x2 )',
    'slots [monto] ( Tragamonedas x2 hasta x100 )'
]
handler.tags = ['games']
handler.command = ['trivia', 'ruleta', 'rlt', 'slots', 'slot']
export default handler

function msToTime(d){let m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}