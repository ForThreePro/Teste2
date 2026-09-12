import fetch from 'node-fetch'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, participants }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'
    let defaultImg = 'https://files.evogb.win/E2yVdA.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let keyNormal = 'proyectsV2'
    let keyHorny = 'gafield-vip' // <- KEY NUEVA SOLO PARA HORNY

    const getAvatar = async (jid) => {
        jid = jid || m.sender
        jid = jid.toString() // <- FORZAR A STRING SIEMPRE
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getName = async (jid) => {
        jid = jid || m.sender
        jid = jid.toString() // <- FORZAR A STRING
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n) name = n
        } catch {}
        return name.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 15)
    }

    const getMention = (jid) => {
        jid = jid || m.sender
        jid = jid.toString() // <- FORZAR A STRING
        return jid.split('@')[0]
    }

    const getJid = (m) => { // <- NUEVA FUNCION PARA EVITAR EL ERROR
        let jid = m.mentionedJid[0] || m.quoted?.sender || m.sender
        return jid.toString()
    }

    const fetchImage = async (url) => {
        let res = await fetch(url, { timeout: 30000 })
        let contentType = res.headers.get('content-type') || ''
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        if(!contentType.includes('image')) throw new Error(await res.text())
        return await res.buffer()
    }

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== HORNY ===== CON KEY NUEVA
    if (m.message?.extendedTextMessage?.text?.includes('horny') || m.text?.includes('horny')) {
        let who = getJid(m) // <- USAR LA NUEVA FUNCION
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${keyHorny}`

        try {
            await react('😏')
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐆𝐄𝐍𝐄𝐑𝐀𝐍𝐃𝐎 ﹒ HORNY ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` 🔥 —˙𖦹.꒷\n\n── *📊 ESTADO* ╏ 🍕\n🖼️ ➛ Creando imagen...\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`)

            let buffer = await fetchImage(apiUrl)

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ﹒ HORNY ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` 😏 —˙𖦹.꒷\n\n── *📊 RESULTADO* ╏ 🍕\n@${getMention(who)} está así ahora mismo 😏🔥\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ HORNY ：✿ 。\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷\n❌ ➛ ${e.message}\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`)
        }
    }

    // ===== SHIP =====
    if (m.message?.extendedTextMessage?.text?.includes('ship') || m.text?.includes('ship')) {
        if (!m.isGroup) return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ Solo funciona en grupos`)
        let members = participants.map(u => u.id)
        if (members.length < 2) return m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ Necesitan mínimo 2 personas`)
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = m.mentionedJid[0]; user2 = m.mentionedJid[1] }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }

        await react('💘')
        await conn.sendMessage(m.chat, { text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐂𝐀𝐋𝐂𝐔𝐋𝐀𝐍𝐃𝐎 ﹒ SHIP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CALCULANDO\`\` 💖 —˙𖦹.꒷\n\n── *📊 PAREJA* ╏ 🍕\n@${getMention(user1)} + @${getMention(user2)}\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, mentions: [user1, user2] })
        try {
            let avatar1 = await getAvatar(user1); let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${keyNormal}`
            let buffer = await fetchImage(apiUrl)
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : `Compatibilidad altísima 💖`
            await conn.sendMessage(m.chat, { image: buffer, caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ﹒ SHIP ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` 💖 —˙𖦹.꒷\n\n── *📊 COMPATIBILIDAD* ╏ 🍕\n@${getMention(user1)} + @${getMention(user2)}\n\n💘 ➛ *${porcentaje}%*\n💌 ➛ ${explicacion}\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, mentions: [user1, user2] })
        } catch (e) {
            await react('❌')
            m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ ${e.message}`)
        }
    }

    // ===== SECURITY ===== CON KEY NORMAL
    if (m.message?.extendedTextMessage?.text?.includes('security') || m.text?.includes('security')) {
        let who = getJid(m) // <- USAR LA NUEVA FUNCION
        let pp = await getAvatar(who)
        let createdTimestamp = Math.floor(Date.now() / 1000)
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${keyNormal}`
        await react('🔍')
        await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐆𝐄𝐍𝐄𝐑𝐀𝐍𝐃𝐎 ﹒ SECURITY ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CARTEL\`\` 🚨 —˙𖦹.꒷\n\n── *📊 ESTADO* ╏ 🍕\n🖼️ ➛ Creando cartel para @${getMention(who)}...\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, { mentions: [who] })
        try {
            let buffer = await fetchImage(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ﹒ SECURITY ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`SE BUSCA\`\` 💰 —˙𖦹.꒷\n\n── *📊 INFORMACIÓN* ╏ 🍕\n🚨 ➛ @${getMention(who)}\n💰 ➛ *Recompensa: 1,000,000$*\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ ${e.message}`)
        }
    }

    // ===== RANK ===== CON KEY NORMAL
    if (m.message?.extendedTextMessage?.text?.includes('rank') || m.text?.includes('rank')) {
        let who = getJid(m) // <- USAR LA NUEVA FUNCION
        let name = await getName(who)
        let pp = await getAvatar(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000
        let apiUrl = `https://api.stellarwa.xyz/generate/rank?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${keyNormal}`
        await react('📊')
        await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐆𝐄𝐍𝐄𝐑𝐀𝐍𝐃𝐎 ﹒ RANK ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`TARJETA\`\` 🎮 —˙𖦹.꒷\n\n── *📊 ESTADO* ╏ 🍕\n🖼️ ➛ Creando tarjeta para @${getMention(who)}...\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, { mentions: [who] })
        try {
            let buffer = await fetchImage(apiUrl)
            await conn.sendMessage(m.chat, { image: buffer, caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n⤷ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ﹒ RANK ：✿ 。\n꒰ ◞⁺⊹ ．${fecha}\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ESTADÍSTICAS\`\` 📊 —˙𖦹.꒷\n\n── *📊 DATOS* ╏ 🍕\n👤 ➛ @${getMention(who)}\n📈 ➛ Nivel: *${level}*\n🏆 ➛ Rank: *#${rank}*\n✨ ➛ XP: *${currxp}/${needxp}*\n\n━━━━━━━━━━━\n🍕 *GARFIELD BOT* 🍕\n━━━━━━━━━━━`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕\n\n❌ ${e.message}`)
        }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = ['horny', 'ship', 'security', 'rank']
export default handler