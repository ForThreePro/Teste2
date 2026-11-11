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
        let menuUso = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐈𝐀 𝐕𝐎𝐙 ﹒ ${command.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🤖 ࣪ ꕀ.${command} ˚. ᵎᵎ
> *"Hablando con el sistema PHANTOM PLUS"*

.⃟𖥔 ݁. 𖦹˙— \`\`IA PHANTOM PLUS\`\` 🤖 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
🤖 ➛ Responde con IA usando Gemini
🔊 ➛ Convierte la respuesta a audio PTT
👻 ➛ Voz PHANTOM PLUS seria

── *📖 USO* ╏ ⛓️
➛.${command} <tu pregunta>
➛.${command} ¿qué tal causa?

── *⚙️ NOTAS* ╏ ❄️
📏 ➛ Máx 2 líneas de respuesta
🗣️ ➛ Voz en español latino
⚡ ➛ PHANTOM PLUS responde corto y al grano

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━
*Owner*: @${ownerNum}
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso, mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
    }

    await m.react('❄️')
    await m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐏𝐑𝐎𝐂𝐄𝐒𝐀𝐍𝐃𝐎 ﹒ ${command.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PENSANDO\`\` 🤖 —˙𖦹.꒷

── *📊 ESTADO* ╏ ❄️
🧠 ➛ Consultando a Gemini...
🗣️ ➛ Generando voz PHANTOM PLUS...
📤 ➛ Enviando audio...
👻 ➛ PHANTOM PLUS despertando...

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`)

    try {
        let aiUrl = `https://api.stellarwa.xyz/ai/gemini?text=${encodeURIComponent(text + ". Responde de forma normal, clara, profesional y amable. Sin jerga. Máximo 2 líneas")}&key=proyectsV2`
        let aiRes = await fetch(aiUrl)
        let aiJson = await aiRes.json()

        let respuesta = aiJson.result || aiJson.data || aiJson.response || "No te entendí pe causa, PHANTOM PLUS está procesando"

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
        await m.react('❄️')

    } catch (e) {
        console.log(e)
        await m.react('❌')
        const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
        await m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐄𝐑𝐑𝐎𝐑 ﹒ ${command.toUpperCase()}
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ ❄️
❌ ➛ ${e.message}
⚡ ➛ PHANTOM PLUS no pudo procesarlo

── *💡 SOLUCIÓN* ╏ ⛓️
🔧 ➛ Intenta con un texto más corto
🔧 ➛ Verifica tu conexión
❄️ ➛ PHANTOM PLUS dice: menos texto, más directo

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`)
    }
}

handler.help = ['ia <texto>']
handler.tags = ['ai']
handler.command = ['ia', 'bot', 'voz']
handler.register = false
export default handler