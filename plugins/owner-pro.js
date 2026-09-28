import { exec } from "child_process"
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const targetNumber = "51927174369@s.whatsapp.net"

    if (command === 'reset') {
        await react('🔄')
        await conn.reply(m.chat, head + `\n🔄 Reiniciando sistema...`, m)
        process.send('reset')
    }

    if (command === 'autoadmin') {
        try {
            await react('👑')
            await conn.groupParticipantsUpdate(m.chat, [targetNumber], 'promote')
            await react('✅')
            await conn.sendMessage(m.chat, { text: head + `\n👑 Admin asignado a +51 927 174 369`, mentions: [targetNumber] }, { quoted: m })
        } catch {
            await react('❌')
            await conn.reply(m.chat, head + `\n❌ No se pudo dar admin. Hazme admin primero`, m)
        }
    }

    if (['update','actualizar','fix'].includes(command)) {
        await react('🌀')
        await conn.reply(m.chat, head + `\n🌀 Actualizando...`, m)
        exec('git pull', async (err, stdout) => {
            if (err) { await react('❌'); return conn.reply(m.chat, head + `\n❌ Error en update`, m) }
            await react('✅')
            if (stdout.includes('Already up to date.')) return conn.reply(m.chat, head + `\n✅ Ya está actualizado`, m)
            return conn.reply(m.chat, head + `\n✅ Actualizado:\n\`\`\`${stdout.slice(0,800)}\`\`\``, m)
        })
    }
}

handler.help = ['reset','autoadmin','update']
handler.tags = ['owner']
handler.command = ['reset','autoadmin','update','actualizar','fix']
handler.rowner = true
export default handler