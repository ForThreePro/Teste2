import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')

    // TUS LINKS FIJOS
    let defaultImg = 'https://files.evogb.win/ywTVtD.jpg' // DEFAULT
    let defaultBg = 'https://files.evogb.win/iues1p.jpg' // BG
    let key = 'proyectsV2'

    const getAvatar = async (jid) => {
        if (!jid || typeof jid!== 'string') jid = m.sender
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg // <- si no tiene foto usa default
    }

    const getName = async (jid) => {
        if (!jid || typeof jid!== 'string') jid = m.sender
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n && n!== 'undefined') name = n
        } catch {}
        return name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 15)
    }

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== SHIP =====
    if (command == 'ship') {
        if (!m.isGroup) return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ Solo funciona en grupos`)
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
        await m.reply(`Calculando ship entre @${user1.split('@')[0]} + @${user2.split('@')[0]}`, { mentions: [user1, user2] })

        try {
            let avatar1 = await getAvatar(user1)
            let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`

            let res = await fetch(apiUrl, { timeout: 30000 })
            if(!res.ok) throw new Error(`API Error: ${res.status}`)
            let buffer = await res.buffer()

            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : `Compatibilidad altísima 💖`

            await conn.sendMessage(m.chat, { image: buffer, caption: `💘 *${porcentaje}%*\n💌 ${explicacion}`, mentions: [user1, user2] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ===== SECURITY =====
    if (command == 'security') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        await react('🔍')
        await m.reply(`Generando cartel para @${who.split('@')[0]}...`, { mentions: [who] })

        try {
            let pp = await getAvatar(who)
            let createdTimestamp = Math.floor(Date.now() / 1000)
            let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`

            let res = await fetch(apiUrl, { timeout: 30000 })
            if(!res.ok) throw new Error(`API Error: ${res.status}`)
            let buffer = await res.buffer()

            await conn.sendMessage(m.chat, { image: buffer, caption: `🚨 SE BUSCA: @${who.split('@')[0]}\n💰 *Recompensa: 1,000,000$*`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ===== RANK =====
    if (command == 'rank') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        let name = await getName(who)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Leyenda'][Math.floor(Math.random() * 5)]
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000

        await react('📊')
        await m.reply(`Generando tarjeta para @${who.split('@')[0]}...`, { mentions: [who] })

        try {
            let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${encodeURIComponent(rank)}&currxp=${currxp}&needxp=${needxp}&key=${key}`

            let res = await fetch(apiUrl, { timeout: 30000 })
            if(!res.ok) throw new Error(`API Error: ${res.status}`)
            let buffer = await res.buffer()

            await conn.sendMessage(m.chat, { image: buffer, caption: `👤 @${who.split('@')[0]}\n📈 Nivel: *${level}*\n🏆 Rank: *${rank}*\n✨ XP: *${currxp}/${needxp}*`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ===== HORNY ===== AGREGADO
    if (command == 'horny') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        await react('😏')
        await m.reply(`Generando imagen para @${who.split('@')[0]}...`, { mentions: [who] })

        try {
            let pp = await getAvatar(who) // <- si no tiene foto usa defaultImg
            let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}` // <- TU URL

            let res = await fetch(apiUrl, { timeout: 30000 })
            if(!res.ok) throw new Error(`API Error: ${res.status}`)
            let buffer = await res.buffer()

            await conn.sendMessage(m.chat, { image: buffer, caption: `@${who.split('@')[0]} está así ahora mismo 😏🔥`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }
}

handler.help = ['ship @tag1 @tag2', 'security @tag', 'rank @tag', 'horny @tag']
handler.tags = ['diversión']
handler.command = /^(ship|security|rank|horny)$/i
handler.register = false
export default handler