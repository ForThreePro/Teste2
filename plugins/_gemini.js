let handler = async (m, { conn, text, participants, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return conn.reply(m.chat, `*[⚔️] Solo grupos*`, m)
    if (!isAdmin) return conn.reply(m.chat, `*[⚔️] Solo Admins*`, m)
    if (!isBotAdmin) return conn.reply(m.chat, `*[⚔️] Necesito ser Admin*`, m)

    let member = participants.map(u => u.id)
    let sum = text? parseInt(text) : member.length
    let sider = []

    for (let i = 0; i < sum; i++) {
        let userId = member[i]
        let userData = global.db.data.users[userId] || {}
        let user = participants.find(u => u.id == userId)

        if ((userData.chat || 0) < 3 &&!user.admin &&!user.isSuperAdmin) {
            if(userData.whitelist!== true){
                sider.push(userId)
            }
        }
    }

    if (sider.length == 0) return conn.reply(m.chat, `*[⚔️] No hay fantasmas para eliminar*`, m)

    await conn.reply(m.chat, `👻 *ELIMINANDO ${sider.length} FANTASMAS*...\nCriterio: <3 mensajes`, m)

    let kick = 0
    for (let fantasma of sider) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [fantasma], 'remove')
            kick++
            await new Promise(resolve => setTimeout(resolve, 3000))
        } catch {}
    }
    conn.reply(m.chat, `✅ *LISTO*\nSe eliminaron ${kick} fantasmas`, m)
}
handler.help = ['kickfantasmas [cantidad]']
handler.tags = ['grupo']
handler.command = /^(kickfantasmas)$/i
handler.admin = true
handler.botAdmin = true
export default handler