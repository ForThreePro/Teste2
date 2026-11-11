import ytSearch from 'yt-search'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let user = `@${m.sender.split('@')[0]}`
    let groupName = m.isGroup? (await conn.groupMetadata(m.chat)).subject : 'Privado'

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!text) {
        await react('❌')
        let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ BUSCAR
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ ¿Qué quieres buscar?
👻 ➛ PHANTOM PLUS: dime que buscar pe

── *💡 EJEMPLO* ╏ ⛓️
➛.google phantom frost

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    await react('❄️')
    await m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 ﹒ YOUTUBE
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`BUSCANDO\`\` 🔍 —˙𖦹.꒷

── *📊 ESTADO* ╏ ❄️
🔍 ➛ Buscando: *${text}*
⏳ ➛ Conectando al sistema...
👻 ➛ PHANTOM PLUS buscando

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`)

    try {
        let search = await ytSearch(text)
        let results = search.videos.slice(0, 5)

        if (!results.length) {
            await react('❌')
            let vacio = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 ﹒ BUSCAR
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`VACIO\`\` 📭 —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
📭 ➛ No encontré resultados para: *${text}*
❄️ ➛ PHANTOM PLUS: sin resultados

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
        }

        let txt = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 ﹒ YOUTUBE
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`TOP 5\`\` 📺 —˙𖦹.꒷

── *📊 BÚSQUEDA* ╏ ❄️
🔎 ➛ ${text}

${results.map((v, i) => {
            return `── *${i + 1}* ╏ ❄️
📺 ➛ *${v.title}*
⏱️ ➛ Duración: *${v.timestamp}*
👁️ ➛ Vistas: *${v.views.toLocaleString()}*
👤 ➛ Canal: *${v.author.name}*
🔗 ➛ ${v.url}`
        }).join('\n\n')}

━━━━━━━━━━━
── *📋 INFORMACIÓN* ╏ ⛓️
👤 ➛ Solicitado por: ${user}
👥 ➛ Grupo: *${groupName}*
👻 ➛ Buscado por PHANTOM PLUS

── *💡 TIP* ╏ ❄️
➛.ytmp4 + link
➛.ytmp3 + link

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
        await react('❄️')

    } catch (e) {
        console.error(e)
        await react('❌')
        let error = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ BUSCAR
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
❌ ➛ No se pudo realizar la búsqueda
🔧 ➛ Intenta más tarde
❄️ ➛ PHANTOM PLUS falló buscando

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['google <busqueda>']
handler.tags = ['búsqueda']
handler.command = /^google$/i

export default handler