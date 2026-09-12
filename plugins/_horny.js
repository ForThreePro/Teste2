import fetch from 'node-fetch'

let handler = async (m, { conn, participants }) => {
    let defaultImg = 'https://files.evogb.win/n4InsB.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let key = 'proyectsV2'

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

    // ===== SECURITY =====
    if (m.text?.includes('security')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        console.log("WHO ES:", who, typeof who) // debe salir string
        let pp = await getAvatar(who)
        let createdTimestamp = Math.floor(Date.now() / 1000)

        let apiUrl = `https://api.stellarwa.xyz/generate/security?avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&createdTimestamp=${createdTimestamp}&key=${key}`

        await react('🔍')
        await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\nGenerando cartel para @${getMention(who)}...`, mentions: [who] })

        try {
            let res = await fetch(apiUrl, { timeout: 30000 });
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\n🚨 ➛ @${getMention(who)}\n💰 ➛ *Recompensa: 1,000,000$*`,
                mentions: [who] // <- AQUÍ ESTABA EL ERROR
            })
        } catch (e) {
            console.log("ERROR:", e)
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }

    // ===== RANK =====
    if (m.text?.includes('rank')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        console.log("WHO ES:", who, typeof who)
        let name = await getName(who)
        let pp = await getAvatar(who)

        let level = Math.floor(Math.random() * 100) + 1
        let rank = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000

        let apiUrl = `https://api.stellarwa.xyz/generate/rank2?username=${encodeURIComponent(name)}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(defaultBg)}&level=${level}&rank=${rank}&currxp=${currxp}&needxp=${needxp}&key=${key}`

        await react('📊')
        await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\nGenerando tarjeta para @${getMention(who)}...`, mentions: [who] })

        try {
            let res = await fetch(apiUrl, { timeout: 30000 });
            if(!res.ok) throw new Error("Status: " + res.status)
            let buffer = await res.buffer()
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\n👤 ➛ @${getMention(who)}\n📈 ➛ Nivel: *${level}*\n🏆 ➛ Rank: *#${rank}*\n✨ ➛ XP: *${currxp}/${needxp}*`,
                mentions: [who] // <- Y AQUÍ TAMBIÉN
            })
        } catch (e) {
            console.log("ERROR:", e)
            await react('❌')
            m.reply(`❌ Error: ${e.message}`)
        }
    }
}

handler.help = ['security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = ['security', 'rank']
export default handler