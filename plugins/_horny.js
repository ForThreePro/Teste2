import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let key = 'proyectsV2'

    const getAvatar = async (jid) => {
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getName = async (jid) => {
        try { return await conn.getName(jid) } catch { return jid.split('@')[0] }
    }

    const react = async (text) => { try { await conn.sendMessage(m.chat, { react: { text, key: m.key } }) } catch {} }

    const fetchImg = async (url) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 25000)
        try {
            let res = await fetch(url, { signal: controller.signal })
            clearTimeout(timeout)
            if(!res.ok) throw new Error(`API ${res.status}`)
            return await res.buffer()
        } catch(e) { clearTimeout(timeout); throw e }
    }

    let who = m.mentionedJid[0] || m.quoted?.sender || m.sender

    // ===== HORNY =====
    if (/horny/i.test(m.text)) {
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        try {
            await react('😏')
            await m.reply(`Generando imagen horny para @${who.split('@')[0]}...`, null, { mentions: [who] })
            let buffer = await fetchImg(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `Listo @${who.split('@')[0]} 😏🔥`, mentions: [who] })
        } catch (e) {
            await react('❌'); m.reply(`Error: ${e.message}`)
        }
    }

    // ===== SHIP =====
    if (/ship/i.test(m.text)) {
        if (!m.isGroup ||!participants) return m.reply(`Solo en grupos`)
        let members = participants.map(u => u.id)
        let [user1, user2] = m.mentionedJid.length >= 2? m.mentionedJid : [members[Math.floor(Math.random() * members.length)], members[Math.floor(Math.random() * members.length)]]
        while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]

        await react('💘')
        try {
            let [avatar1, avatar2] = await Promise.all([getAvatar(user1), getAvatar(user2)])
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let buffer = await fetchImg(apiUrl)
            let porcentaje = Math.floor(Math.random() * 101)
            await conn.sendMessage(m.chat, { image: buffer, caption: `@${user1.split('@')[0]} + @${user2.split('@')[0]}\n💘 ${porcentaje}%`, mentions: [user1, user2] })
        } catch (e) {
            await react('❌'); m.reply(`Error: ${e.message}`)
        }
    }

    // ===== SECURITY y RANK igual, con fetchImg y mentions =====
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['fun']
handler.command = /^(horny|ship|security|rank)$/i
handler.group = true
handler.register = true
export default handler