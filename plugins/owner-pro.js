import { exec } from "child_process"
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    const owner = "@whois.yallico"
    const targetNumber = "51927174369@s.whatsapp.net" // +51 927 174 369

    // 1. RESET
    if (command === 'reset') {
        await react('🔄')
        let msg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐎 ﹒ SISTEMA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`REINICIANDO\`\` 🔄 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🔄 ➛ Reiniciando sistema
⏳ ➛ Por favor espera unos segundos

── *📝 NOTA* ╏ 🍕
⚡ ➛ El bot se reiniciará automáticamente

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
        process.send('reset')
    }

    // 2. AUTOADMIN
    if (command === 'autoadmin') {
        try {
            await react('👑')
            await conn.groupParticipantsUpdate(m.chat, [targetNumber], 'promote')
            let msg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐃𝐌𝐈𝐍 ﹒ ASIGNADO ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`EXITO\`\` 👑 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
👑 ➛ Administrador asignado
📱 ➛ Número: +51 927 174 369
✅ ➛ Ya tiene permisos de admin

── *📝 NOTA* ╏ 🍕
🔒 ➛ Ahora puede gestionar el grupo

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            await conn.sendMessage(m.chat, {
                text: msg,
                mentions: [targetNumber]
            }, { quoted: m })
        } catch (e) {
            await react('❌')
            let error = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ AUTOADMIN ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ No se pudo asignar admin a +51 927 174 369
⚠️ ➛ Revisa que no sea admin o tengas permisos

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            conn.sendMessage(m.chat, { text: error }, { quoted: m })
        }
    }

    // 3. UPDATE / ACTUALIZAR / FIX
    if (command === 'update' || command === 'actualizar' || command === 'fix') {
        await react('🌀')

        let loading = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 ﹒ GIT ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`PROCESO\`\` 🌀 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
🌀 ➛ Obteniendo cambios del repositorio
⏳ ➛ Por favor espera

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`

        await conn.sendMessage(m.chat, { text: loading }, { quoted: m })

        exec('git pull', async (err, stdout, stderr) => {
            if (err) {
                await react('❌')
                let errorMsg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐄𝐑𝐎𝐑 ﹒ UPDATE ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Error en la actualización

── *📊 DETALLE* ╏ 🍕
\`\`${err.message}\`\`

── *👑 OWNER* ╏ 🍕
${owner}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    text: errorMsg,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            if (stdout.includes('Already up to date.')) {
                await react('✅')
                let upToDate = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 ﹒ SISTEMA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`ESTADO\`\` ✅ —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
✅ ➛ Sistema actualizado
💎 ➛ Ya estás en la versión más reciente

── *👑 OWNER* ╏ 🍕
${owner}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
                return conn.sendMessage(m.chat, {
                    text: upToDate,
                    mentions: [owner.split('@')[1] + '@s.whatsapp.net']
                }, { quoted: m })
            }

            await react('✅')
            let updateMsg = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐂𝐈𝐎𝐍 ﹒ COMPLETADA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`GIT PULL\`\` 📥 —˙𖦹.꒷

── *📊 ESTADO* ╏ 🍕
📥 ➛ Actualización aplicada

── *📋 CAMBIOS* ╏ 🍕
\`\`${stdout}\`\`

── *👑 OWNER* ╏ 🍕
${owner}

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, {
                text: updateMsg,
                mentions: [owner.split('@')[1] + '@s.whatsapp.net']
            }, { quoted: m })
        })
    }
}

handler.help = ['reset', 'autoadmin', 'update']
handler.tags = ['owner']
handler.command = ['reset', 'autoadmin', 'update', 'actualizar', 'fix']
handler.rowner = true

export default handler