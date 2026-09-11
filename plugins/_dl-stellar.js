import ytsearch from "yt-search"
import fetch from "node-fetch"
import moment from 'moment-timezone'
moment.locale('es')

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
    if(!res.ok) throw new Error('No se pudo descargar el buffer')
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    text = text.replace(`.${command}`, '').trim()

    if (!text) {
        return conn.sendMessage(m.chat, { text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ﹒ DESCARGAS ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 ׅ 𝆬 ָ֢ ෆ
📥 ࣪ ꕀ.descargas ˚. ᵎᵎ
> *"Descargando como Garfield come lasaña"*

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` 📥 —˙𖦹.꒷

── *📝 COMANDOS* ╏ 🍕
1️⃣ ➛.*play1* <nombre de canción>
   🎵 ➛ Descarga audio de YouTube MP3

2️⃣ ➛.*ttmp3* <link de tiktok>
   🎵 ➛ Descarga audio de TikTok MP3

3️⃣ ➛.*fb* <link de facebook>
   📹 ➛ Descarga video de Facebook

── *💡 EJEMPLOS* ╏ 🍕
➛.*play1* despacito
➛.*ttmp3* https://tiktok.com/@user/video
➛.*fb* https://facebook.com/watch?v=xxx

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
━━━━━━━━━━━`, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
    }

    await react(conn, m, '⏳')
    try {
        // ===== YOUTUBE MP3 =====
        if (command === 'play1') {
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐍𝐃𝐎 ﹒ PLAY1 ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`YOUTUBE\`\` 🎵 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔍 ➛ Buscando canción...
⬇️ ➛ Descargando audio MP3...
━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
            const searchResult = await ytsearch(text)
            if (!searchResult.videos.length) throw new Error("No se encontró la canción.")
            const video = searchResult.videos[0]

            const apiUrl = `${api.url}/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=${api.key}`
            const resDl = await fetch(apiUrl).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            if (!dl) throw new Error('No se pudo descargar el audio de YT')

            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m })
        }

        // ===== TIKTOK MP3 =====
        if (command === 'ttmp3') {
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐍𝐃𝐎 ﹒ TTMP3 ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`TIKTOK\`\` 🎵 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
⬇️ ➛ Descargando audio de TikTok...
━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result
            let dl = data?.download || data?.dl || data?.music
            const title = data?.title || 'TikTok'
            if (!dl) throw new Error('No se pudo descargar. Link mal o privado')

            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m })
        }

        // ===== FACEBOOK VIDEO =====
        if (command === 'fb' || command === 'facebook') {
            await m.reply(`🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐍𝐃𝐎 ﹒ FACEBOOK ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`FACEBOOK\`\` 📹 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
⬇️ ➛ Descargando video de Facebook...
━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`)
            const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl)

            let videoBuffer
            const ct = res.headers.get('content-type')
            if(ct?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Error API')
                videoBuffer = await getBuffer(data.result.url)
            } else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎 ﹒ FACEBOOK ：✿ 。

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGADO\`\` ✅ —˙𖦹.꒷

── *📊 RESULTADO* ╏ 🍕
✅ ➛ Video descargado correctamente
📥 ➛ Disfrútalo

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            }, { quoted: m })
        }

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        console.log("ERROR:", e)
        return conn.sendMessage(m.chat, { text: `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
❌ ➛ ${e.message}

── *💡 SOLUCIÓN* ╏ 🍕
🔧 ➛ Verifica que el link sea válido
🔧 ➛ Asegúrate que no sea privado

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━` }, { quoted: m })
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>', 'fb <link>']
handler.tags = ['descargas']
handler.command = /^(play1|ttmp3|fb|facebook)$/i
handler.register = false
export default handler