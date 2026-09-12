let handler = async (m, { conn, text, participants, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return conn.reply(m.chat, `*[⚔️] Solo grupos*`, m)

    let member = participants.map(u => u.id)
    let sum = text? parseInt(text) : member.length
    let total = 0
    let sider = []

    for (let i = 0; i < sum; i++) {
        let userId = member[i]
        let userData = global.db.data.users[userId] || {}
        let user = participants.find(u => u.id == userId)

        // Fantasma = menos de 3 mensajes Y no es admin
        if ((userData.chat || 0) < 3 &&!user.admin &&!user.isSuperAdmin) {
            if(userData.whitelist!== true){ // Si no está en whitelist
                total++
                sider.push(userId)
            }
        }
    }

    if (total == 0) return conn.reply(m.chat, `*[⚔️] En Este Grupo No Hay Fantasmas✨🍷*`, m)

    const stickerUrl = 'https://files.catbox.moe/agx2sc.webp';
    m.react('💫')
    await conn.sendFile(m.chat, stickerUrl, 'sticker.webp', '', m, null);

    m.reply(`[⚠ *FANTASMAS - INACTIVOS* ⚠]\n\n𝙶𝚁𝚄𝙿𝙾: ${await conn.getName(m.chat)}\n𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂: ${sum}\n\n[ ⇲ 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 ⇱ ]\n${sider.map(v => ' 👻 @' + v.replace(/@.+/, '')).join('\n')}\n\n*CRITERIO:* <3 mensajes desde que se activó el bot`, null, { mentions: sider })
}
handler.help = ['fantasmas [cantidad]']
handler.tags = ['gc']
handler.command = /^(fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = false
export default handler