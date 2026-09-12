import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    let defaultBg = 'https://files.evogb.win/QFXQtu.jpg'' // fondo garfield
    let defaultImg = 'https://files.evogb.win/n4InsB.jpg'
    let key = 'proyectsV2'
    let botName = 'GARFIELD BOT'
    let emoji = '😼'

    const toJid = (jid) => { if (!jid) return m.sender; if (typeof jid === 'string') return jid; if (typeof jid === 'object') return jid.sender || jid.id || jid.jid || m.sender; return m.sender }
    const getAvatar = async (jid) => { jid = toJid(jid); try { let url = await conn.profilePictureUrl(jid, 'image'); if(url && url.startsWith('https')) return url } catch {}; return defaultImg }
    const getName = async (jid) => { jid = toJid(jid); let name = jid.split('@')[0]; try { let n = await conn.getName(jid); if(n) name = n } catch {}; return name }
    const getMention = (jid) => toJid(jid).split('@')[0]
    const react = async (text) => { try { await conn.sendMessage(m.chat, { react: { text, key: m.key } }) } catch {} }
    const stellarFetch = async (url) => { return await fetch(url, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' } }) }

    //.horny
    if (m.text?.startsWith('.horny')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        await react('😏'); await conn.sendMessage(m.chat, { text: `${emoji} ***${botName}*** ${emoji}\n\n🍕 Generando imagen horny...`, mentions: [who] })
        try { let res = await stellarFetch(apiUrl); let buffer = await res.buffer(); await conn.sendMessage(m.chat, { image: buffer, caption: `${emoji} @${getMention(who)}\n\n"Odio los lunes pero amo esto" 🔥`, mentions: [who] }) } catch { await react('❌'); m.reply(`${emoji} Error al generar`) }
    }

    //.ship
    if (m.text?.startsWith('.ship')) {
        if (!m.isGroup) return m.reply(`${emoji} Solo funciona en grupos`)
        let members = participants.map(u => toJid(u.id)); let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = toJid(m.mentionedJid[0]); user2 = toJid(m.mentionedJid[1]) }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }
        await react('💘'); await conn.sendMessage(m.chat, { text: `${emoji} ***SHIP ${botName}*** ${emoji}\n\n🍕 Calculando compatibilidad...`, mentions: [user1, user2] })
        try { let a1 = await getAvatar(user1); let a2 = await getAvatar(user2); let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(a1)}&avatar2=${encodeURIComponent(a2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`; let res = await stellarFetch(apiUrl); let buffer = await res.buffer(); let p = Math.floor(Math.random() * 101); let txt = p < 30? `Nada que ver 😹` : p < 70? `Ahí la llevan 💛` : `Almas gemelas 💍`; await conn.sendMessage(m.chat, { image: buffer, caption: `${emoji} @${getMention(user1)} + @${getMention(user2)}\n\n💘 Compatibilidad: *${p}%*\n${txt}`, mentions: [user1, user2] }) } catch { await react('❌') }
    }

    //.rank
    if (m.text?.startsWith('.rank')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let name = await getName(who); let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1; let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000); let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`
        await react(emoji); await conn.sendMessage(m.chat, { text: `${emoji} ***${botName}*** ${emoji}\n\n🍕 Generando tarjeta de nivel...`, mentions: [who] })
        try { let res = await stellarFetch(apiUrl); let buffer = await res.buffer(); await conn.sendMessage(m.chat, { image: buffer, caption: `${emoji} @${getMention(who)}\n🍕 Nivel: *${level}*\n🏆 Rank: *#${rank}*\n✨ XP: *${currxp}/${needxp}*`, mentions: [who] }) } catch { await react('❌') }
    }

    //.security
    if (m.text?.startsWith('.security')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender); let pp = await getAvatar(who); let createdTimestamp = Math.floor(Date.now() / 1000)
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
        await react('🔍'); await conn.sendMessage(m.chat, { text: `${emoji} ***SE BUSCA - ${botName}*** ${emoji}\n\n🍕 Generando cartel...`, mentions: [who] })
        try { let res = await stellarFetch(apiUrl); let buffer = await res.buffer(); await conn.sendMessage(m.chat, { image: buffer, caption: `${emoji} @${getMention(who)}\n💰 Recompensa: *1 LASAGNA*`, mentions: [who] }) } catch { await react('❌') }
    }
}
handler.help = ['horny', 'ship', 'rank', 'security']
handler.tags = ['fun']
handler.command = ['horny', 'ship', 'rank', 'security']
export default handler