import axios from 'axios'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    let user = `@${m.sender.split('@')[0]}`
    let groupName = m.isGroup? (await conn.groupMetadata(m.chat)).subject : 'Privado'
    const APIKEY = 'proyectsV2'

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (!text) {
        await react('❌')
        let error = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ YOUTUBE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ ¿Qué deseas buscar en YouTube?
😼 ➛ Garfield dice: escribe algo pe

── *💡 EJEMPLO* ╏ 🍕
➛.ytsearch Bad Bunny

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }

    await react('🔍')
    await m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 ﹒ YOUTUBE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`BUSCANDO\`\` 🔍 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔍 ➛ Buscando: *${text}*
⏳ ➛ Conectando a StellarWA...
😼 ➛ Garfield buscando mientras come

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)

    try {
        let { data } = await axios.get(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=${APIKEY}`)

        if (!data.status ||!data.result || data.result.length === 0) {
            await react('❌')
            let vacio = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 ﹒ YOUTUBE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`VACIO\`\` 📭 —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
📭 ➛ No se encontraron resultados para: *${text}*
😴 ➛ Garfield no encontró ni las migajas

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: vacio }, { quoted: m })
        }

        let res = data.result.slice(0, 5).map((v, i) => 
`── *${i+1}* ╏ 🍕
📺 ➛ *${v.title}*
⏱️ ➛ Duración: *${v.duration}*
👁️ ➛ Vistas: *${v.views}*
👤 ➛ Canal: *${v.author}*
🔗 ➛ ${v.url}`).join('\n\n')

        let caption = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐓𝐎𝐏 𝟓 ﹒ RESULTADOS ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`RESULTADOS\`\` 📺 —˙𖦹.꒷

── *📊 BÚSQUEDA* ╏ 🍕
🔎 ➛ ${text}

${res}

━━━━━━━━━━━
── *📋 INFORMACIÓN* ╏ 🍕
👤 ➛ Solicitado por: ${user}
👥 ➛ Grupo: *${groupName}*
😼 ➛ Buscado por Garfield

── *💡 TIP* ╏ 🍕
➛.ytmp4 + link
➛.ytmp3 + link

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
        await react('✅')
    } catch (e) { 
        console.error(e)
        await react('❌')
        let error = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ YOUTUBE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Error al conectar con StellarWA
🔧 ➛ Intenta más tarde
😼 ➛ Garfield dice: el api se fue a dormir

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`
        conn.sendMessage(m.chat, { text: error }, { quoted: m })
    }
}

handler.help = ['yts <busqueda>']
handler.tags = ['búsqueda']
handler.command = /^(yts|ytsearch)$/i
export default handler