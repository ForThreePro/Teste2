import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'
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
        try { return await conn.getName(jid) || jid.split('@')[0] } catch { return jid.split('@')[0] }
    }

    const react = async (text) => { try { await conn.sendMessage(m.chat, { react: { text, key: m.key } }) } catch {} }

    const fetchImg = async (url) => { // Para que no se cuelgue el bot
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000)
        try {
            let res = await fetch(url, { signal: controller.signal })
            clearTimeout(timeout)
            if(!res.ok) throw new Error(`API Error: ${res.status}`)
            let contentType = res.headers.get('content-type')
            if(!contentType ||!contentType.includes('image')) {
                let txt = await res.text()
                throw new Error(`La API devolvió: ${txt}`)
            }
            return await res.buffer()
        } catch(e) { clearTimeout(timeout); throw e }
    }

    // ===== HORNY =====
    if (/horny/i.test(m.text)) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
        try {
            await react('😏')
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\nGenerando imagen para @${who.split('@')[0]}...`, null, { mentions: [who] })
            let buffer = await fetchImg(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `@${who.split('@')[0]} está así ahora mismo 😏🔥`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ===== SHIP =====
    if (/ship/i.test(m.text)) {
        if (!m.isGroup ||!participants) return m.reply(`❌ Solo funciona en grupos`)
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply(`❌ Necesitan mínimo 2 personas`)
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1] }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }

        await react('💘')
        await conn.sendMessage(m.chat, { text: `Calculando ship entre @${user1.split('@')[0]} y @${user2.split('@')[0]}...`, mentions: [user1][user2] })
        try {
            let [avatar1, avatar2] = await Promise.all([getAvatar(user1), getAvatar(user2)])
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let buffer = await fetchImg(apiUrl)
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : porcentaje < 100? `Compatibilidad altísima 💖` : `100% ALMAS GEMELAS 💍`
            await conn.sendMessage(m.chat, { image: buffer, caption: `💘 ${porcentaje}%\n${explicacion}`, mentions: [user1][user2] })
        } catch (e) { await react('❌'); m.reply(`Error: ${e.message}`) }
    }

    // ===== SECURITY ===== ARREGLADO
    if (/security/i.test(m.text)) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        if(!who) return m.reply('Etiqueta a alguien')
        let pp = await getAvatar(who)
        let createdTimestamp = Math.floor(Date.now() / 1000) // <- la api pide en segundos
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
        await react('🔍')
        await m.reply(`Generando cartel para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let buffer = await fetchImg(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `🚨 SE BUSCA: @${who.split('@')[0]}\n💰 Recompensa: 1,000,000$`, mentions: [who] })
        } catch (e) { await react('❌'); m.reply(`❌ Error: ${e.message}`) }
    }

    // ===== RANK ===== ARREGLADO
    if (/rank/i.test(m.text)) {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        if(!who) return m.reply('Etiqueta a alguien')
        let name = await getName(who)
        name = name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 15) // <- quitar emojis y limitar
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currentXP=${currxp}&requiredXP=${needxp}&key=${key}` // <- currentXP y requiredXP
        await react('📊')
        await m.reply(`Generando tarjeta para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let buffer = await fetchImg(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `👤 @${who.split('@')[0]}\n📈 Nivel: *${level}*\n🏆 Rank: *#${rank}*\n✨ XP: *${currxp}/${needxp}*`, mentions: [who] })
        } catch (e) { await react('❌'); m.reply(`❌ Error: ${e.message}`) }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = /^(horny|ship|security|rank)$/i
handler.group = false
handler.register = false
export default handler