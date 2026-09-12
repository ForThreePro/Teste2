// 🍕 GARFIELD ECONOMY PARTE 2 🍕
let handler = async () => {}

let iconos = ['🍕', '🧀', '😼', '💤', '🐶']

// 5. ROBAR
let robar = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted?.sender
    if (!who) return conn.reply(m.chat, `🍕 *MENCIONA A QUIEN ROBAR*`, m)
    let target = global.db.data.users[who]
    if (!target.lasana) target.lasana = 0
    let tiempo = 1 * 60 * 60 * 1000
    if (new Date - user.lastrob < tiempo) return conn.reply(m.chat, `😼 *ESPERA 1 HORA* para volver a robar`, m)
    let robo = Math.floor(Math.random() * target.lasana * 0.3)
    if (robo < 10) return conn.reply(m.chat, `🍕 *NO TIENE NADA QUE ROBAR*`, m)
    target.lasana -= robo; user.lasana += robo; user.lastrob = new Date * 1
    conn.reply(m.chat, `🕶️ *ROBASTE* +${robo} lasaña de @${who.split('@')[0]}\nTu billetera: ${user.lasana}`, m, { mentions: [who] })
}
robar.help = ['robar']
robar.tags = ['economy']
robar.command = ['robar']

// 6. PAY
let pay = async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    let who = m.mentionedJid[0]
    let monto = parseInt(args[0])
    if (!who) return conn.reply(m.chat, `🍕 *USO*:.pay 100 @user`, m)
    if (!monto || monto < 1) return conn.reply(m.chat, `🍕 *PON UN MONTO*`, m)
    if (user.lasana < monto) return conn.reply(m.chat, `🍕 *NO TIENES TANTA LASAÑA*`, m)
    let target = global.db.data.users[who]
    if (!target.lasana) target.lasana = 0
    user.lasana -= monto; target.lasana += monto
    conn.reply(m.chat, `💸 *TRANSFERIDO* ${monto} lasaña a @${who.split('@')[0]}`, m, { mentions: [who] })
}
pay.help = ['pay']
pay.tags = ['economy']
pay.command = ['pay', 'pagar', 'transferir']

// 7. SLOTS
let slots = async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender]
    if (!user.lasana) user.lasana = 0
    let monto = parseInt(args[0])
    if (!monto || monto < 10) return conn.reply(m.chat, `🍕 *APUESTA MINIMA*: 10 lasaña`, m)
    if (user.lasana < monto) return conn.reply(m.chat, `🍕 *NO TIENES LASAÑA*`, m)
    user.lasana -= monto
    let s1 = iconos[Math.floor(Math.random() * iconos.length)]
    let s2 = iconos[Math.floor(Math.random() * iconos.length)]
    let s3 = iconos[Math.floor(Math.random() * iconos.length)]
    let iguales = [s1, s2, s3].filter(v => v === s1).length
    let multi = iguales === 3? 50 : iguales === 2? 5 : 0
    let gana = monto * multi
    if (gana > 0) user.lasana += gana
    conn.reply(m.chat, `🎰 *SLOTS* [${s1}] [${s2}] [${s3}]\n\n${gana > 0? `🎉 *GANASTE x${multi}* +${gana} lasaña` : `😿 *PERDISTE* -${monto} lasaña`}\nTotal: ${user.lasana}`, m)
}
slots.help = ['slots']
slots.tags = ['economy']
slots.command = ['slots', 'slot']

export default handler