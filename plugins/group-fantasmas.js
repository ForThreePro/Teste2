let handler = async (m, { conn, command, args, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m)

    let tiempo = args[0]? args[0] : '7d' // Ej: 1d, 12h, 2d
    let milisegundos = 0

    if (tiempo.endsWith('d')) milisegundos = parseInt(tiempo) * 24 * 60 * 60 * 1000
    else if (tiempo.endsWith('h')) milisegundos = parseInt(tiempo) * 60 * 60 * 1000
    else milisegundos = 7 * 24 * 60 * 60 * 1000

    let metadata = await conn.groupMetadata(m.chat)
    let participants = metadata.participants
    let now = new Date * 1
    let fantasmas = []

    for (let user of participants) {
        let u = global.db.data.users[user.id]
        if (!u) continue
        let lastseen = u.lastseen || 0
        if (now - lastseen > milisegundos &&!user.admin) {
            fantasmas.push(user.id)
        }
    }

    if (command === 'fantasmas') {
        if (fantasmas.length === 0) return conn.reply(m.chat, `✅ *NO HAY FANTASMAS*\nTodos han estado activos en las últimas ${tiempo}`, m)

        let texto = `👻 *FANTASMAS DETECTADOS* - Inactivos +${tiempo}\n`
        texto += fantasmas.map((v, i) => `${i+1}. @${v.split('@')[0]}`).join('\n')
        texto += `\n\n*Total:* ${fantasmas.length} fantasmas`
        return conn.reply(m.chat, texto, m, { mentions: fantasmas })
    }

    if (command === 'kickfantasmas') {
        if (!isAdmin) return conn.reply(m.chat, '❌ Solo admins pueden usar este comando', m)
        if (!isBotAdmin) return conn.reply(m.chat, '❌ Necesito ser admin para eliminar', m)
        if (fantasmas.length === 0) return conn.reply(m.chat, `✅ *NO HAY FANTASMAS PARA ELIMINAR*`, m)

        await conn.reply(m.chat, `👻 *ELIMINANDO ${fantasmas.length} FANTASMAS* de +${tiempo}...\nEspera un momento`, m)

        let kick = 0
        for (let fantasma of fantasmas) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [fantasma], 'remove')
                kick++
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch {}
        }
        return conn.reply(m.chat, `✅ *LISTO*\nSe eliminaron ${kick} fantasmas del grupo`, m)
    }
}

handler.help = [
    'fantasmas [tiempo] ( Ver Inactivos. Ej: fantasmas 1d / fantasmas 12h )',
    'kickfantasmas [tiempo] ( Eliminar Inactivos. Ej: kickfantasmas 1d )'
]
handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.admin = false
handler.botAdmin = true
export default handler