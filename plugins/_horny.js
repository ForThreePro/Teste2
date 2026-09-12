import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants, usedPrefix, command }) => { // <- agrega command
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
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n && n!== 'undefined') name = n
        } catch {}
        return name
    }

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== HORNY =====
    if (command == 'horny') { // <- usa command en vez de includes
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        if (!who || typeof who!== 'string') return m.reply('Etiqueta a alguien o responde a su mensaje')

        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
        try {
            await react('😏')
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐆𝐄𝐍𝐄𝐑𝐀𝐍𝐃𝐎 ﹒ HORNY ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` 🔥 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🖼️ ➛ Creando imagen para @${who.split('@')[0]}...

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`, { mentions: [who] })
            let res = await fetch(apiUrl, { timeout: 20000 })
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ﹒ HORNY ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` 😏 —˙𖦹.꒷

── *📊 RESULTADO* ╏ 🍕
@${who.split('@')[0]} está así ahora mismo 😏🔥

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`❌ Error al generar la imagen`)
        }
    }

    // ===== SHIP =====
    if (command == 'ship') {
        if (!m.isGroup ||!participants) return m.reply(`❌ Solo funciona en grupos`)
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply(`❌ Necesitan mínimo 2 personas`)
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1] }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }

        await react('💘')
        await conn.sendMessage(m.chat, {
            text: `Calculando ship entre @${user1.split('@')[0]} y @${user2.split('@')[0]}...`,
            mentions: [user1][user2]
        })
        try {
            let avatar1 = await getAvatar(user1); let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let res = await fetch(apiUrl, { timeout: 20000 }); let buffer = await res.buffer()
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : porcentaje < 100? `Compatibilidad altísima 💖` : `100% ALMAS GEMELAS 💍`
            await conn.sendMessage(m.chat, { image: buffer, caption: `💘 ${porcentaje}%\n${explicacion}`, mentions: [user1][user2] })
        } catch (e) { await react('❌'); m.reply(`❌ Error`) }
    }

    // ===== SECURITY =====
    if (command == 'security') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        if (!who || typeof who!== 'string') return m.reply('Etiqueta a alguien o responde a su mensaje')

        let pp = await getAvatar(who)
        let createdTimestamp = Date.now()
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`
        await react('🔍')
        await m.reply(`Generando cartel para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `🚨 SE BUSCA: @${who.split('@')[0]}\n💰 Recompensa: 1,000,000$`, mentions: [who] })
        } catch (e) { await react('❌'); m.reply(`❌ Error`) }
    }

    // ===== RANK2 =====
    if (command == 'rank') {
        let who = m.mentionedJid[0] || m.quoted?.sender || m.sender
        if (!who || typeof who!== 'string') return m.reply('Etiqueta a alguien o responde a su mensaje')

        let name = await getName(who)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`
        await react('📊')
        await m.reply(`Generando tarjeta para @${who.split('@')[0]}...`, null, { mentions: [who] })
        try {
            let res = await fetch(apiUrl, { timeout: 30000 }); let buffer = await res.buffer()
            await conn.sendMessage(m.chat, { image: buffer, caption: `👤 @${who.split('@')[0]}\n📈 Nivel: *${level}*\n🏆 Rank: *#${rank}*\n✨ XP: *${currxp}/${needxp}*`, mentions: [who] })
        } catch (e) { await react('❌'); m.reply(`❌ Error`) }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = /^(horny|ship|security|rank)$/i // <- CAMBIO IMPORTANTE: REGEX
handler.group = false
handler.register = false
export default handler