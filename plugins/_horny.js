import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let defaultImg = 'https://files.evogb.win/ywTVtD.jpg'
    let defaultBg = 'https://files.evogb.win/iues1p.jpg'
    let key = 'proyectsV2' // <- TODOS USAN ESTA KEY

    const getAvatar = async (jid) => {
        jid = jid || m.sender
        if (typeof jid!== 'string') jid = jid.toString()
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getMention = (jid) => {
        jid = jid || m.sender
        if (typeof jid!== 'string') jid = jid.toString()
        return jid.split('@')[0]
    }

    const fetchImage = async (url) => { // <- NUEVA FUNCION PARA EVITAR 500
        let res = await fetch(url, { timeout: 30000 })
        let contentType = res.headers.get('content-type') || ''

        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        if(!contentType.includes('image')) {
            let txt = await res.text()
            throw new Error(`API: ${txt}`) // <- aqui te muestra si la key esta baneada
        }
        return await res.buffer()
    }

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== SHIP =====
    if (command == 'ship') {
        if (!m.isGroup) return m.reply(`❌ Solo funciona en grupos`)
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply(`❌ Necesitan mínimo 2 personas`)

        let user1, user2
        if (m.mentionedJid.length >= 2) {
            user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1]
        } else {
            user1 = members[Math.floor(Math.random() * members.length)]
            user2 = members[Math.floor(Math.random() * members.length)]
            while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]
        }

        await react('💘')
        await conn.sendMessage(m.chat, { text: `Calculando ship entre @${getMention(user1)} + @${getMention(user2)}`, mentions: [user1, user2] })

        try {
            let avatar1 = await getAvatar(user1)
            let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let buffer = await fetchImage(apiUrl)
            let porcentaje = Math.floor(Math.random() * 101)
            await conn.sendMessage(m.chat, { image: buffer, caption: `💘 *${porcentaje}%*`, mentions: [user1, user2] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ ${e.message}`)
        }
    }

    // ===== SECURITY =====
    if (command == 'security') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        await react('🔍')
        await conn.sendMessage(m.chat, { text: `Generando cartel para @${getMention(who)}...`, mentions: [who] })

        try {
            let pp = await getAvatar(who)
            let createdTimestamp = Math.floor(Date.now() / 1000)
            let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
            let buffer = await fetchImage(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `🚨 SE BUSCA: @${getMention(who)}\n💰 *Recompensa: 1,000,000$*`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ ${e.message}`)
        }
    }

    // ===== RANK =====
    if (command == 'rank') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who, conn)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Leyenda'][Math.floor(Math.random() * 5)]
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000

        await react('📊')
        await conn.sendMessage(m.chat, { text: `Generando tarjeta para @${getMention(who)}...`, mentions: [who] })

        try {
            let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${encodeURIComponent(rank)}&currxp=${currxp}&needxp=${needxp}&key=${key}` // <- CON KEY
            let buffer = await fetchImage(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `👤 @${getMention(who)}\n📈 Nivel: *${level}*\n🏆 Rank: *${rank}*\n✨ XP: *${currxp}/${needxp}*`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ ${e.message}`)
        }
    }

    // ===== HORNY =====
    if (command == 'horny') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        await react('😏')
        await conn.sendMessage(m.chat, { text: `Generando imagen para @${getMention(who)}...`, mentions: [who] })

        try {
            let pp = await getAvatar(who)
            let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}` // <- CON KEY
            let buffer = await fetchImage(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `@${getMention(who)} está así ahora mismo 😏🔥`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ ${e.message}`)
        }
    }
}

const getName = async (jid, conn) => {
    jid = jid || ''
    if (typeof jid!== 'string') jid = jid.toString()
    let name = jid.split('@')[0]
    try { name = await conn.getName(jid) } catch {}
    return name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 15)
}

handler.help = ['ship @tag1 @tag2', 'security @tag', 'rank @tag', 'horny @tag']
handler.tags = ['diversión']
handler.command = /^(ship|security|rank|horny)$/i
handler.register = false
export default handler