import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    let defaultImg = 'https://files.evogb.win/n4InsB.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let key = 'proyectsV2'

    // ===== FUNCIONES BASE =====
    const toJid = (jid) => {
        if (!jid) return m.sender
        if (typeof jid === 'string') return jid
        if (typeof jid === 'object') return jid.sender || jid.id || jid.jid || m.sender
        return m.sender
    }

    const getAvatar = async (jid) => {
        jid = toJid(jid)
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            if(url && url.startsWith('https')) return url
        } catch {}
        return defaultImg
    }

    const getName = async (jid) => {
        jid = toJid(jid)
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n && n!== 'undefined') name = n
        } catch {}
        return name
    }

    const getMention = (jid) => toJid(jid).split('@')[0]

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    // ===== HORNY =====
    if (m.text?.includes('horny')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let pp = await getAvatar(who)
        let apiUrl = `https://api.stellarwa.xyz/generate/horny?avatar=${encodeURIComponent(pp)}&key=${key}`
        try {
            await react('😏')
            await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 😏\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🔥꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando imagen para @${getMention(who)}...\n\n━━━━━━━━━━━`, mentions: [who] })
            let res = await fetch(apiUrl, { timeout: 20000 })
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 🔥\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.😏꒷\n\n── *📊 RESULTADO* ╏\n@${getMention(who)} está así ahora mismo 😏🔥\n\n━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***HORNY*** 𐔌 ꒱ ⚠️\n\n❌ Error: ${e.message}`)
        }
    }

    // ===== SHIP =====
    if (m.text?.includes('ship')) {
        if (!m.isGroup) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Solo funciona en grupos`)
        let members = participants.map(u => toJid(u.id))
        if (members.length < 2) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Necesitan mínimo 2 personas`)

        let user1, user2
        if (m.mentionedJid.length >= 2) {
            user1 = toJid(m.mentionedJid[0]);
            user2 = toJid(m.mentionedJid[1])
        } else {
            user1 = members[Math.floor(Math.random() * members.length)];
            user2 = members[Math.floor(Math.random() * members.length)];
            while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)]
        }

        await react('💘')
        await conn.sendMessage(m.chat, {
            text: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CALCULANDO\`\` —˙𖦹.💖꒷\n\n── *📊 PAREJA* ╏\n@${getMention(user1)} + @${getMention(user2)}\n\n━━━━━━━━━━━`,
            mentions: [user1, user2]
        })

        try {
            let avatar1 = await getAvatar(user1);
            let avatar2 = await getAvatar(user2)
            let apiUrl = `https://api.stellarwa.xyz/generate/ship?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&background=${encodeURIComponent(defaultBg)}&key=${key}`
            let res = await fetch(apiUrl, { timeout: 20000 });
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : porcentaje < 100? `Compatibilidad altísima 💖` : `100% ALMAS GEMELAS 💍`
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.💖꒷\n\n── *📊 COMPATIBILIDAD* ╏\n@${getMention(user1)} + @${getMention(user2)}\n\n💘 ➛ *${porcentaje}%*\n💌 ➛ ${explicacion}\n\n━━━━━━━━━━━`,
                mentions: [user1, user2]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Error: ${e.message}`)
        }
    }

    // ===== SECURITY =====
    if (m.text?.includes('security')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let pp = await getAvatar(who)
        let createdTimestamp = Math.floor(Date.now() / 1000)
        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`

        await react('🔍')
        await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.📢꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando cartel para @${getMention(who)}...\n\n━━━━━━━━━━━`, mentions: [who] })

        try {
            let res = await fetch(apiUrl, { timeout: 30000 });
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CARTEL\`\` —˙𖦹.💰꒷\n\n── *📊 INFORMACIÓN* ╏\n🚨 ➛ @${getMention(who)}\n💰 ➛ *Recompensa: 1,000,000$*\n\n━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ ⚠️\n\n❌ Error: ${e.message}`)
        }
    }

    // ===== RANK =====
    if (m.text?.includes('rank')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let name = await getName(who)
        let pp = await getAvatar(who)

        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000

        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`

        await react('📊')
        await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🎮꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando tarjeta para @${getMention(who)}...\n\n━━━━━━━━━━━`, mentions: [who] })

        try {
            let res = await fetch(apiUrl, { timeout: 30000 });
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ESTADÍSTICAS\`\` —˙𖦹.🎮꒷\n\n── *📊 DATOS* ╏\n👤 ➛ @${getMention(who)}\n📈 ➛ Nivel: *${level}*\n🏆 ➛ Rank: *#${rank}*\n✨ ➛ XP: *${currxp}/${needxp}*\n\n━━━━━━━━━━━`,
                mentions: [who]
            })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ ⚠️\n\n❌ Error: ${e.message}`)
        }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = ['horny', 'ship', 'security', 'rank']
export default handler