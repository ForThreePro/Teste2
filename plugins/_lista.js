import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
moment.locale('es')

const DB_FOLDER = './src/database/listas'

if (!fs.existsSync(DB_FOLDER)) fs.mkdirSync(DB_FOLDER, { recursive: true })

let handler = async (m, { conn, text }) => {
    const chatId = m.chat // ID del grupo para separar listas
    const db = path.join(DB_FOLDER, `${chatId}.json`)
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    // Crear archivo del grupo si no existe
    if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

    let data = JSON.parse(fs.readFileSync(db))

    // Fecha y día de Perú
    let now = moment.tz('America/Lima')
    let fechaFormato = now.format('dddd, DD/MM/YYYY')
    let diaSemana = now.format('dddd').toLowerCase()

    let diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    //.verlista = MOSTRAR TODOS LOS DÍAS LUNES A SÁBADO
    if (m.message?.extendedTextMessage?.text?.includes('verlista') || m.text?.includes('verlista')) {
        await react('📋')
        let tabla = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐋𝐈𝐒𝐓𝐀 𝐒𝐄𝐌𝐀𝐍𝐀𝐋 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`REGISTROS\`\` 📅 —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
📅 ➛ Periodo: *Lunes a Sábado*
🕒 ➛ Actualizado: *${fechaFormato}*

━━━━━━━━━━━
`

        diasSemana.forEach(dia => {
            let anotadosDelDia = data.filter(v => v.dia.toLowerCase().includes(dia))
            tabla += `── *${dia.toUpperCase()}* ╏ 🍕\n`

            if (anotadosDelDia.length === 0) {
                tabla += `📭 ➛ Sin anotados\n\n`
            } else {
                anotadosDelDia.forEach((v, i) => {
                    tabla += `${i+1}️⃣ ➛ *${v.nombre}* [${v.rol}]\n`
                    tabla += `   📱 ➛ ${v.numero}\n`
                    tabla += `   📅 ➛ ${v.dia}\n\n`
                })
            }
        })
        tabla += `━━━━━━━━━━━
📦 ➛ Total: *${data.length}* registro${data.length !== 1 ? 's' : ''}

🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}`
        return conn.sendMessage(m.chat, { text: tabla.trim(), mentions: [ownerNum + '@s.whatsapp.net'] }, { quoted: m })
    }

    //.lista = ANOTAR
    if (m.message?.extendedTextMessage?.text?.includes('lista') || m.text?.includes('lista')) {
        if (!diasSemana.includes(diaSemana)) {
            await react('⛔')
            let fueraHorario = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐅𝐔𝐄𝐑𝐀 𝐃𝐄 𝐇𝐎𝐑𝐀𝐑𝐈𝐎 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` ⛔ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
❌ ➛ Solo se puede anotar de
❌ ➛ *Lunes a Sábado*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: fueraHorario }, { quoted: m })
        }

        if (!text) {
            await react('❌')
            let formato = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐅𝐎𝐑𝐌𝐀𝐓𝐎 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`USO\`\` 📝 —˙𖦹.꒷

── *📖 USO* ╏ 🍕
➛ Envía: .lista Nombre/Numero/Premio

── *💡 EJEMPLO* ╏ 🍕
➛ .lista Garfield/+51 927 174 369/Bot

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: formato }, { quoted: m })
        }

        let [nombre, numero, rol] = text.split('/').map(v => v.trim())
        if (!nombre ||!numero ||!rol) {
            await react('❌')
            let faltan = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐅𝐀𝐋𝐓𝐀𝐍 𝐃𝐀𝐓𝐎𝐒 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` ❌ —˙𖦹.꒷

── *📖 FORMATO* ╏ 🍕
➛ Nombre/Numero/Rol

── *💡 EJEMPLO* ╏ 🍕
➛ fetsy/618282/bot

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: faltan }, { quoted: m })
        }

        let yaAnotado = data.find(v => v.numero === numero && v.dia === fechaFormato)
        if (yaAnotado) {
            await react('⚠️')
            let duplicado = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐘𝐀 𝐀𝐍𝐎𝐓𝐀𝐃𝐎 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`AVISO\`\` ⚠️ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
⚠️ ➛ ${nombre} ya fue anotado hoy
📅 ➛ *${fechaFormato}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
            return conn.sendMessage(m.chat, { text: duplicado }, { quoted: m })
        }

        data.push({ nombre, numero, rol, dia: fechaFormato })
        fs.writeFileSync(db, JSON.stringify(data, null, 2))
        await react('✅')

        let ok = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐀𝐍𝐎𝐓𝐀𝐃𝐎 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fechaFormato}

.⃟𖥔 ݁. 𖦹˙— \`\`REGISTRO\`\` ✅ —˙𖦹.꒷

── *📊 DATOS* ╏ 🍕
👤 ➛ Nombre: *${nombre}*
📱 ➛ Número: *${numero}*
💼 ➛ Rol: *${rol}*
📅 ➛ Día: *${fechaFormato}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: ok }, { quoted: m })
    }
}

handler.help = ['lista nombre/numero/premio', 'verlista']
handler.tags = ['sorteos']
handler.command = /^(lista|verlista)$/i
handler.group = true
export default handler