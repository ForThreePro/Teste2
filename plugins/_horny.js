import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, participants }) => {
    let defaultImg = 'https://files.evogb.win/UHUtT3.jpg'
    let defaultBg = 'https://files.evogb.win/7BY3Yv.jpg'
    let key = 'proyectsV2'

    const toJid = (jid) => {
        if (!jid) return m.sender
        if (typeof jid === 'string') return jid
        if (typeof jid === 'object') return jid.sender || jid.id || jid.jid || m.sender
        return m.sender
    }

    const getAvatarBuffer = async (jid) => {
        jid = toJid(jid)
        try {
            let url = await conn.profilePictureUrl(jid, 'image')
            let res = await fetch(url)
            return await res.buffer()
        } catch {}
        let res = await fetch(defaultImg)
        return await res.buffer()
    }

    const getName = async (jid) => {
        jid = toJid(jid)
        let name = jid.split('@')[0]
        try {
            let n = await conn.getName(jid)
            if(n) name = n
        } catch {}
        return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)
    }

    const getMention = (jid) => toJid(jid).split('@')[0]

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const callStellar = async (endpoint, form) => { // <- NUEVA FUNCION POST
        form.append('key', key)
        let res = await fetch(`https://api.stellarwa.xyz/generate/${endpoint}`, {
            method: 'POST',
            body: form,
            timeout: 30000
        })
        let contentType = res.headers.get('content-type')
        if(!contentType ||!contentType.includes('image')){
            let txt = await res.text()
            throw new Error(txt)
        }
        return await res.buffer()
    }

    // ===== HORNY =====
    if (m.message?.extendedTextMessage?.text?.includes('horny') || m.text?.includes('horny')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let pp = await getAvatarBuffer(who)
        try {
            await react('😏')
            await m.reply(`𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 😏\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🔥꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando imagen...\n\n━━━━━━━━━━━`)
            let form = new FormData()
            form.append('avatar', pp, 'avatar.jpg')
            form.append('background', defaultBg)
            let buffer = await callStellar('horny', form)
            await conn.sendMessage(m.chat, { image: buffer, caption: `𐔌 ꒱ ***HORNY*** 𐔌 ꒱ 🔥\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.😏꒷\n\n── *📊 RESULTADO* ╏\n@${getMention(who)} está así ahora mismo 😏🔥\n\n━━━━━━━━━━━`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***HORNY*** 𐔌 ꒱ ⚠️\n\n❌ ${e.message}`)
        }
    }

    // ===== SHIP =====
    if (m.message?.extendedTextMessage?.text?.includes('ship') || m.text?.includes('ship')) {
        if (!m.isGroup) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Solo funciona en grupos`)
        let members = participants.map(u => toJid(u.id))
        if (members.length < 2) return m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ Necesitan mínimo 2 personas`)
        let user1, user2
        if (m.mentionedJid.length >= 2) { user1 = toJid(m.mentionedJid[0]); user2 = toJid(m.mentionedJid[1]) }
        else { user1 = members[Math.floor(Math.random() * members.length)]; user2 = members[Math.floor(Math.random() * members.length)]; while(user1 === user2) user2 = members[Math.floor(Math.random() * members.length)] }

        await react('💘')
        await conn.sendMessage(m.chat, { text: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CALCULANDO\`\` —˙𖦹.💖꒷\n\n── *📊 PAREJA* ╏\n@${getMention(user1)} + @${getMention(user2)}\n\n━━━━━━━━━━━`, mentions: [user1, user2] })
        try {
            let avatar1 = await getAvatarBuffer(user1); let avatar2 = await getAvatarBuffer(user2)
            let form = new FormData()
            form.append('avatar1', avatar1, 'avatar1.jpg')
            form.append('avatar2', avatar2, 'avatar2.jpg')
            form.append('background', defaultBg)
            let buffer = await callStellar('ship', form)
            let porcentaje = Math.floor(Math.random() * 101)
            let explicacion = porcentaje < 20? `Hay 0 química 😅` : porcentaje < 40? `Poca compatibilidad 💛` : porcentaje < 60? `Hay algo ahí ✨` : porcentaje < 80? `Buena conexión ❤️` : `Compatibilidad altísima 💖`
            await conn.sendMessage(m.chat, { image: buffer, caption: `𐔌 ꒱ ***SHIP*** 𐔌 ꒱ 💘\n\n.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADO\`\` —˙𖦹.💖꒷\n\n── *📊 COMPATIBILIDAD* ╏\n@${getMention(user1)} + @${getMention(user2)}\n\n💘 ➛ *${porcentaje}%*\n💌 ➛ ${explicacion}\n\n━━━━━━━━━━━`, mentions: [user1, user2] })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SHIP*** 𐔌 ꒱ ⚠️\n\n❌ ${e.message}`)
        }
    }

    // ===== SECURITY =====
    if (m.message?.extendedTextMessage?.text?.includes('security') || m.text?.includes('security')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let pp = await getAvatarBuffer(who)
        let createdTimestamp = Math.floor(Date.now() / 1000)
        await react('🔍')
        let txt = `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.📢꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando cartel para @${getMention(who)}...\n\n━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: txt, mentions: [who] })
        try {
            let form = new FormData()
            form.append('avatar', pp, 'avatar.jpg')
            form.append('background', defaultBg)
            form.append('createdTimestamp', createdTimestamp)
            let buffer = await callStellar('security', form)
            await conn.sendMessage(m.chat, { image: buffer, caption: `𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ 🚨\n\n.⃟𖥔 ݁. 𖦹˙— \`\`CARTEL\`\` —˙𖦹.💰꒷\n\n── *📊 INFORMACIÓN* ╏\n🚨 ➛ @${getMention(who)}\n💰 ➛ *Recompensa: 1,000,000$*\n\n━━━━━━━━━━━`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***SE BUSCA*** 𐔌 ꒱ ⚠️\n\n❌ ${e.message}`)
        }
    }

    // ===== RANK2 =====
    if (m.message?.extendedTextMessage?.text?.includes('rank') || m.text?.includes('rank')) {
        let who = toJid(m.mentionedJid[0] || m.quoted?.sender || m.sender)
        let name = await getName(who)
        let pp = await getAvatarBuffer(who)
        let level = Math.floor(Math.random() * 100) + 1
        let rankNum = Math.floor(Math.random() * 500) + 1
        let currxp = Math.floor(Math.random() * 5000)
        let needxp = currxp + Math.floor(Math.random() * 2000) + 1000

        await react('📊')
        let txt = `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\n.⃟𖥔 ݁. 𖦹˙— \`\`GENERANDO\`\` —˙𖦹.🎮꒷\n\n── *📊 ESTADO* ╏\n🖼️ ➛ Creando tarjeta para @${getMention(who)}...\n\n━━━━━━━━━━━`
        await conn.sendMessage(m.chat, { text: txt, mentions: [who] })

        try {
            let form = new FormData()
            form.append('username', name)
            form.append('avatar', pp, 'avatar.jpg')
            form.append('background', defaultBg)
            form.append('level', level)
            form.append('rank', rankNum)
            form.append('currxp', currxp)
            form.append('needxp', needxp)
            let buffer = await callStellar('rank2', form)
            await conn.sendMessage(m.chat, { image: buffer, caption: `𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ 📊\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ESTADÍSTICAS\`\` —˙𖦹.🎮꒷\n\n── *📊 DATOS* ╏\n👤 ➛ @${getMention(who)}\n📈 ➛ Nivel: *${level}*\n🏆 ➛ Rank: *#${rankNum}*\n✨ ➛ XP: *${currxp}/${needxp}*\n\n━━━━━━━━━━━`, mentions: [who] })
        } catch (e) {
            await react('❌')
            m.reply(`𐔌 ꒱ ***TARJETA DE NIVEL*** 𐔌 ꒱ ⚠️\n\n❌ ${e.message}`)
        }
    }
}

handler.help = ['horny @tag', 'ship @tag1 @tag2', 'security @tag', 'rank @tag']
handler.tags = ['diversión']
handler.command = ['horny', 'ship', 'security', 'rank']
export default handler