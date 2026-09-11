import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
moment.locale('es')

const DB_FOLDER = './src/database/listas'

if (!fs.existsSync(DB_FOLDER)) fs.mkdirSync(DB_FOLDER, { recursive: true })

let handler = async (m, { conn }) => {
    const chatId = m.chat // ID del grupo
    const db = path.join(DB_FOLDER, `${chatId}.json`)
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY')
    const hora = moment.tz('America/Lima').format('hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    // Si el archivo no existe, crearlo vacío
    if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify([]))

    let data = JSON.parse(fs.readFileSync(db))
    let total = data.length

    const react = async (text) => {
        try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
    }

    if (total === 0) {
        await react('📭')
        let vacia = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐎𝐑𝐑𝐀𝐑 𝐋𝐈𝐒𝐓𝐀 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

.⃟𖥔 ݁. 𖦹˙— \`\`LISTA VACÍA\`\` 🗑️ —˙𖦹.꒷

── *📝 AVISO* ╏ 🍕
📭 ➛ La lista de este grupo ya está vacía
📭 ➛ No hay registros para borrar

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: vacia }, { quoted: m })
    }

    await react('🗑️')
    fs.writeFileSync(db, JSON.stringify([]))

    let texto = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐁𝐎𝐑𝐑𝐀𝐃𝐎 ﹒ LISTA ：✿ 。
꒰ ◞⁺⊹ ．${fecha} ${hora}

.⃟𖥔 ݁. 𖦹˙— \`\`BORRADO EXITOSO\`\` 🗑️ —˙𖦹.꒷

── *📊 INFORMACIÓN* ╏ 🍕
🗑️ ➛ Se eliminaron: *${total}* registro${total > 1 ? 's' : ''}
📅 ➛ Rango: *Lunes a Sábado*
⏰ ➛ Hora: *${hora}*

── *📦 ESTADO* ╏ 🍕
✅ ➛ Lista de este grupo reiniciada

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Admin*: Comando ejecutado
━━━━━━━━━━━`

    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['borrarlista']
handler.tags = ['sorteos']
handler.command = /^(borrarlista)$/i
handler.group = true
handler.admin = true
export default handler