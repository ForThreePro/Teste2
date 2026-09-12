let MONEDA = 'R-COINS'
let iconos = ['🍒', '🍋', '⭐', '💎', '7', '🍀']

let preguntas = [
    { q: '¿Cuánto es 2 + 2?', a: '4' }, { q: '¿De qué color es el cielo?', a: 'azul' }, { q: '¿Cuántos días tiene una semana?', a: '7' }
]

function getUser(id) {
    if (!global.db.data.users[id]) global.db.data.users[id] = {}
    let user = global.db.data.users[id]
    if (user.rcoins === undefined) user.rcoins = 0
    if (user.level === undefined) user.level = 1
    if (user.exp === undefined) user.exp = 0
    return user
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    let user = getUser(m.sender)

    // 1. TRIVIA - PREMIO POR NIVEL
    if (command === 'trivia') {
        let tiempo = 2 * 60 * 1000 // 2 min
        if (user.lasttrivia && new Date - user.lasttrivia < tiempo) {
            let falta = msToTime(user.lasttrivia + tiempo - new Date())
            return conn.reply(m.chat, `⏰ Espera ${falta} para otra trivia`, m)
        }
        let preg = preguntas[Math.floor(Math.random() * preguntas.length)]
        user.trivia = preg.a.toLowerCase()
        user.triviatime = new Date * 1
        let premio = 50 + (user.level * 5) // Nv1=55... Nv10=100
        return conn.reply(m.chat, `❓ *TRIVIA Nv.${user.level}*\n\n${preg.q}\n\n*Premio:* ${premio} ${MONEDA}\nResponde en 30s`, m)
    }

    // 2. RULETA - GANANCIA POR NIVEL
    if (command === 'ruleta' || command === 'rlt') {
        let color = args[0]?.toLowerCase()
        let monto = parseInt(args[1])
        if (!['red', 'black', 'rojo', 'negro'].includes(color)) return conn.reply(m.chat, `*Uso:* ${usedPrefix}ruleta [red/black] [monto]`, m)
        let apuestaMax = 100 + (user.level * 50) // Nv1=150... Nv10=600
        if (!monto || monto < 10) return conn.reply(m.chat, `❌ Apuesta mínima: 10 ${MONEDA}`, m)
        if (monto > apuestaMax) return conn.reply(m.chat, `❌ Con tu Nv.${user.level} max puedes apostar ${apuestaMax} ${MONEDA}`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        user.rcoins -= monto
        let resultado = Math.random() < 0.5? 'red' : 'black'
        let gano = ((color === 'red' || color === 'rojo') && resultado === 'red') || ((color === 'black' || color === 'negro') && resultado === 'black')
        let multi = 2 + (user.level * 0.1) // Nv1=x2.1... Nv10=x3

        if (gano) {
            let gana = Math.floor(monto * multi)
            user.rcoins += gana
            user.exp += 5
            return conn.reply(m.chat, `🎉 Salió ${resultado === 'red'? '🔴' : '⚫'}\n*GANASTE x${multi.toFixed(1)}:* +${gana} ${MONEDA}\n+5 Exp`, m)
        } else {
            user.exp += 1
            return conn.reply(m.chat, `😢 Salió ${resultado === 'red'? '🔴' : '⚫'}\n*PERDISTE:* -${monto} ${MONEDA}\n+1 Exp`, m)
        }
    }

    // 3. SLOTS - MULTIPLICADOR POR NIVEL
    if (command === 'slots' || command === 'slot') {
        let monto = parseInt(args[0])
        let apuestaMax = 200 + (user.level * 100) // Nv1=300... Nv10=1200
        if (!monto || monto < 10) return conn.reply(m.chat, `❌ Apuesta mínima: 10 ${MONEDA}`, m)
        if (monto > apuestaMax) return conn.reply(m.chat, `❌ Con tu Nv.${user.level} max puedes apostar ${apuestaMax} ${MONEDA}`, m)
        if (user.rcoins < monto) return conn.reply(m.chat, `❌ No tienes suficientes ${MONEDA}`, m)

        user.rcoins -= monto
        let s1 = iconos[Math.floor(Math.random() * iconos.length)]
        let s2 = iconos[Math.floor(Math.random() * iconos.length)]
        let s3 = iconos[Math.floor(Math.random() * iconos.length)]

        let iguales = s1 === s2 && s2 === s3? 3 : s1 === s2 || s1 === s3 || s2 === s3? 2 : 1
        let baseMulti = iguales === 3? [10,15,25,50,75,100][Math.floor(Math.random()*6)] : iguales === 2? [2,5][Math.floor(Math.random()*2)] : 0
        let multi = baseMulti + (user.level * 0.5) // Bonus por nivel
        let gana = Math.floor(monto * multi)
        if (gana > 0) user.rcoins += gana
        user.exp += iguales

        let resultado = iguales === 3? `🎉 JACKPOT x${multi.toFixed(1)}!` : iguales === 2? `✨ Ganaste x${multi.toFixed(1)}!` : `😢 Perdiste`
        return conn.reply(m.chat, `🎰 *TRAGAMONEDAS Nv.${user.level}*\n\n[${s1}] [${s2}] [${s3}]\n\n${resultado}\n${gana > 0? `+${gana} ${MONEDA}` : `-${monto} ${MONEDA}`}\n+${iguales} Exp`, m)
    }
}

handler.before = async (m) => {
    let user = getUser(m.sender)
    if (user.trivia && m.text.toLowerCase() === user.trivia) {
        if (new Date - user.triviatime > 30000) return delete user.trivia
        let premio = 50 + (user.level * 5)
        user.rcoins += premio; user.exp += 10; user.lasttrivia = new Date * 1; delete user.trivia; delete user.triviatime
        m.reply(`✅ *CORRECTO!* +${premio} ${MONEDA}\n+10 Exp\n💰 Total: ${user.rcoins}`)
    }
}

handler.help = ['trivia','ruleta [color] [monto]','slots [monto]']
handler.tags = ['games']
handler.command = ['trivia', 'ruleta', 'rlt', 'slots', 'slot']
export default handler
function msToTime(d){let m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}