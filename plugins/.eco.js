// 🍕 GARFIELD ECONOMY PARTE 1 🍕
let handler = async () => {}

let preguntas = [
    { q: '¿De qué color es Garfield?', a: 'naranja' },
    { q: '¿Qué le gusta comer a Garfield?', a: 'lasana' },
    { q: '¿Qué odia Garfield?', a: 'lunes' },
    { q: '¿Cómo se llama el perro?', a: 'odie' },
    { q: '¿Cuánto es 2+2?', a: '4' }
]

// 1. SALDO
let saldo = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    if (!user.bank) user.bank = 0
    conn.reply(m.chat, `🍕 𓆩 𝐒𝐀𝐋𝐃𝐎 𓆪 🍕\n\n😼 *BILLETERA*: ${user.lasana} 🧀\n🏦 *BANCO*: ${user.bank} 🧀\n💰 *TOTAL*: ${user.lasana + user.bank} 🧀`, m)
}
saldo.help = ['saldo']
saldo.tags = ['economy']
saldo.command = ['saldo', 'balance']

// 2. BANCO DEPOSITAR/RETIRAR
let banco = async (m, { conn, args, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    if (!user.bank) user.bank = 0
    let amount = args[0] === 'all' || args[0] === 'todo'? (command === 'd' || command === 'dall'? user.lasana : user.bank) : parseInt(args[0])
    if (!amount || amount < 1) return conn.reply(m.chat, `🍕 *USO*:.d 100.dall.r 100.rall`, m)
    if (command === 'd' || command === 'dall') {
        if (user.lasana < amount) return conn.reply(m.chat, `🍕 *NO TIENES TANTA LASAÑA*`, m)
        user.lasana -= amount; user.bank += amount
        conn.reply(m.chat, `🏦 *DEPOSITADO* +${amount} lasaña\nBilletera: ${user.lasana} | Banco: ${user.bank}`, m)
    }
    if (command === 'r' || command === 'rall') {
        if (user.bank < amount) return conn.reply(m.chat, `🍕 *NO TIENES TANTO EN EL BANCO*`, m)
        user.bank -= amount; user.lasana += amount
        conn.reply(m.chat, `💰 *RETIRADO* +${amount} lasaña\nBilletera: ${user.lasana} | Banco: ${user.bank}`, m)
    }
}
banco.help = ['d', 'r', 'dall', 'rall']
banco.tags = ['economy']
banco.command = ['d', 'r', 'dall', 'rall', 'depositar', 'retirar']

// 3. TRIVIA
let trivia = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    let tiempo = 10 * 60 * 1000
    if (new Date - user.lasttrivia < tiempo) return conn.reply(m.chat, `😼 *ZZZ* Espera ${msToTime(user.lasttrivia + tiempo - new Date())}`, m)
    let preg = preguntas[Math.floor(Math.random() * preguntas.length)]
    user.trivia = preg.a
    conn.reply(m.chat, `❓ *TRIVIA GARFIELD* ❓\n\n${preg.q}\n\nResponde en 30 seg. Premio: 50 lasaña 🧀`, m)
    setTimeout(() => { delete user.trivia }, 30000)
}
trivia.before = async (m) => {
    let user = global.db.data.users[m.sender]
    if (user.trivia && m.text.toLowerCase() === user.trivia) {
        user.lasana += 50; user.lasttrivia = new Date * 1; delete user.trivia
        m.reply(`🎉 *CORRECTO* +50 lasaña 🧀\nTotal: ${user.lasana}`)
    }
}
trivia.help = ['trivia']
trivia.tags = ['economy']
trivia.command = ['trivia']

// 4. RULETA
let ruleta = async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    let color = args[0]?.toLowerCase()
    let monto = parseInt(args[1])
    if (!['red', 'black', 'rojo', 'negro'].includes(color)) return conn.reply(m.chat, `🍕 *USO*:.ruleta red 100`, m)
    if (!monto || monto < 10) return conn.reply(m.chat, `🍕 *APUESTA MINIMA*: 10 lasaña`, m)
    if (user.lasana < monto) return conn.reply(m.chat, `🍕 *NO TIENES LASAÑA*`, m)
    user.lasana -= monto
    let resultado = Math.random() < 0.5? 'red' : 'black'
    if (((color === 'red' || color === 'rojo') && resultado === 'red') || ((color === 'black' || color === 'negro') && resultado === 'black')) {
        user.lasana += monto * 2
        conn.reply(m.chat, `🎉 *SALIO ${resultado.toUpperCase()}* Ganaste x2: +${monto * 2} lasaña\nTotal: ${user.lasana}`, m)
    } else {
        conn.reply(m.chat, `😿 *SALIO ${resultado.toUpperCase()}* Perdiste ${monto} lasaña\nTotal: ${user.lasana}`, m)
    }
}
ruleta.help = ['ruleta']
ruleta.tags = ['economy']
ruleta.command = ['ruleta', 'rlt']

export default handler
function msToTime(d){var m=Math.floor((d%(1000*60*60))/(1000*60)),s=Math.floor((d%(1000*60))/1000);return m+"m "+s+"s"}