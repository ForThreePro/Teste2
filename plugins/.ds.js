import { existsSync, promises as fs } from 'fs'
import path from 'path'
import moment from 'moment-timezone'
moment.locale('es')

var handler = async (m, { conn }) => {
    if (global.conn.user.jid!== conn.user.jid) {
        return conn.reply(m.chat, '⚠️ *Usa esto en el número principal*', m)
    }

    let rutas = [`./Sesiones/Principal/`, `./sesiones/Principal/`, `./sessions/Principal/`]
    let sessionPath = rutas.find(r => existsSync(r))

    if (!sessionPath) return m.reply('🧐 *No encontré la carpeta de sesión*')

    await conn.sendMessage(m.chat, { react: { text: '🧹', key: m.key } })
    await m.reply(`😴 *Limpiando archivos basura de sesión...*`)

    let files = await fs.readdir(sessionPath)
    let filesDeleted = 0

    for (const file of files) {
        // SOLO BORRAR: pre-keys, sender-key, session
        if (
            file.startsWith('pre-key-') ||
            file.startsWith('sender-key') ||
            file.startsWith('session-')
        ) {
            if (!file.startsWith('creds') &&!file.startsWith('app-state')) {
                await fs.unlink(path.join(sessionPath, file))
                filesDeleted++;
            }
        }
    }

    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const ownerNum = global.owner?.[0]?.[0] || '51927174369'

    let menu = `🍕 𓆩 𝗚𝗔𝗥𝗙𝗜𝗘𝗟𝗗 𝗕𝗢𝗧 𓆪 🍕

⤷ ┇ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ﹒ FIX ：✿ 。
꒰ ◞⁺⊹ ．${fecha}

  ꒱ ׁ. ᘏ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢 ׅ 𝆬 ָ֢ ෆ
🧹 ࣪ ꕀ.dsowner ˚. ᵎᵎ
> *"Limpiando hasta la última miga de lasaña"*

.⃟𖥔 ݁. 𖦹˙— \`\`FIX DE SESIÓN\`\` [${filesDeleted}] 🧹 —˙𖦹.꒷

── *📝 DESCRIPCIÓN* ╏ 🍕
🧹 ➛ Elimina archivos de caché basura de la sesión
🔒 ➛ No borra \`creds\` ni \`app-state\` para que el bot no se desconecte

── *📖 USO* ╏ 🍕
👑 ➛ Usar solo en el número principal del bot
🔌 ➛ El bot sigue conectado, no necesita reinicio

── *📊 RESULTADO* ╏ 🍕
✅ ➛ Archivos eliminados: *${filesDeleted}*
💎 ➛ Estado: *${filesDeleted === 0? 'Todo limpio' : 'Limpieza completada'}*

━━━━━━━━━━━
🍕 *GARFIELD BOT* 🍕
*Owner*: @${ownerNum}
*Version*: 2.6 PRO

> "Si no hay lasaña, limpio todo" 😼
━━━━━━━━━━━`

    await conn.sendMessage(m.chat, {
        text: menu,
        mentions: [m.sender, ownerNum + '@s.whatsapp.net']
    }, { quoted: m })
}
handler.help = ['dsowner']
handler.tags = ['fix', 'owner']
handler.command = ['dsowner','delai','clearcache']
handler.rowner = true
export default handler