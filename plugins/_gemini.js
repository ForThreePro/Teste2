import fs from 'fs'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    if (!text) {
        let menuUso = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐈𝐀 𝐕𝐎𝐙 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🤖 ࣪ ꕀ.${command} ˚. ᵎᵎ
> *"Hablando como Garfield después de 3 lasañas"*

.⃟𖥔 ݁. 𖦹˙— \`\`IA\`\` 🤖 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
🤖 ➛ Responde con IA usando Gemini
🔊 ➛ Convierte la respuesta a audio PTT
😼 ➛ Voz de Garfield serio

── *📖 USO* ╏ 🍕
➛.${command} <tu pregunta>
➛.${command} ¿qué tal causa?

── *⚙️ NOTAS* ╏ 🍕
📏 ➛ Máx 2 líneas de respuesta
🗣️ ➛ Voz en español latino
🍝 ➛ Garfield opina corto y al grano

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
*Owner*: @${ownerNum}
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
    }

    await m.react('⏳')
    await m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PENSANDO\`\` 🤖 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🧠 ➛ Consultando a Gemini...
🗣️ ➛ Generando voz...
📤 ➛ Enviando audio...
😼 ➛ Garfield despertando de siesta...

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)

    try {
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara, profesional y amable. Sin jerga. Máximo 2 líneas")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()

        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No te entendí pe causa, Garfield tiene hambre"

        if(respuesta.length > 200) respuesta = respuesta.substring(0, 200) + "..."

        let url = googleTTS.getAudioUrl(respuesta, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        })

        let tmpFilePath = path.join(tmpdir(), `ia-pe-${Date.now()}.opus`)

        await new Promise((resolve, reject) => {
            ffmpeg(url)
        .audioCodec('libopus')
        .toFormat('opus')
        .outputOptions([
                    '-avoid_negative_ts make_zero',
                    '-ac 1',
                    '-b:a 64k'
                ])
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err))
        .save(tmpFilePath)
        })

        let audioBuffer = fs.readFileSync(tmpFilePath)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m })

        if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)
        await m.react('✅')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        await m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ ${command.toUpperCase()} ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
❌ ➛ ${e.message}
😴 ➛ Garfield se durmió con el error

── *💡 SOLUCIÓN* ╏ 🍕
🔧 ➛ Intenta con un texto más corto
🔧 ➛ Verifica tu conexión
🍕 ➛ Garfield dice: menos texto, más lasaña

━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
━━━━━━━━━━━`)
    }
}

handler.help = ['ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false
export default handler