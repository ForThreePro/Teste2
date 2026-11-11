import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
moment.locale('es')

const DB_FOLDER = './src/database/listas'

if (!fs.existsSync(DB_FOLDER)) fs.mkdirSync(DB_FOLDER, { recursive: true })

let handler = async (m, { conn }) => {
    const chatId = m.chat
    const db = path.join(DB_FOLDER, `${chatId}.json`)
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY')
    const hora = moment.tz('America/Lima').format('hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

    let data = JSON.parse(fs.readFileSync(db))
    let total = data.length

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (total === 0) {
        await react('📭')
        let vacia = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐁𝐎𝐑𝐑𝐀𝐑 𝐋𝐈𝐒𝐓𝐀 ﹒ LISTA
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA VACÍA\`\` 🗑️ —˙𖦹.꒷

── *📝 AVISO* ╏ ❄️
📭 ➛ La lista de este grupo ya está vacía
📭 ➛ No hay registros para borrar
❄️ ➛ PHANTOM PLUS: "No hay registros para borrar"

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: vacia }, { quoted: m })
    }

    await react('🗑️')
    fs.writeFileSync(db, JSON.stringify([]))

    let texto = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡

⛓️ ┇ 𝐁𝐎𝐑𝐑𝐀𝐃𝐎 ﹒ LISTA
꒰ ◞⁺⊹ ．${fecha} ${hora}

.⃟𖥔 ݁. 𖦹˙— \`\`BORRADO EXITOSO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ ❄️
🗑️ ➛ Se eliminaron: *${total}* registro${total > 1 ? 's' : ''}
📅 ➛ Rango: *Lunes a Sábado*
⏰ ➛ Hora: *${hora}*
👻 ➛ PHANTOM PLUS eliminó la lista

── *📦 ESTADO* ╏ ⛓️
✅ ➛ Lista de este grupo reiniciada
❄️ ➛ Lista limpia como sistema nuevo

━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━
*Admin*: Comando ejecutado por PHANTOM PLUS
━━━━━━━━━━━`

    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['borrarlista']
handler.tags = ['sorteos']
handler.command = /^(borrarlista)$/i
handler.group = true
handler.admin = true
export default handler