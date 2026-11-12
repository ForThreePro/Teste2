import moment from 'moment-timezone'
moment.locale('es')

async function getMyLid(conn, jid) {
    try {
        if (conn.getLidFromJid) return await conn.getLidFromJid(jid)
        if (conn.signalRepository?.lidMapping?.getLidFromJid) return await conn.signalRepository.lidMapping.getLidFromJid(jid)
        if (conn.signalRepository?.getLidFromJid) return await conn.signalRepository.getLidFromJid(jid)
    } catch {}
    return jid
}

async function isAdminReal(conn, m) {
    if (m.isAdmin) return true
    if (m.isOwner) return true
    let owners = (global.owner || []).map(v => String(v).replace(/[^0-9]/g, ''))
    if (owners.includes(m.sender.split('@')[0].split(':')[0])) return true
    try {
        let metadata = await conn.groupMetadata(m.chat)
        let myLid = await getMyLid(conn, m.sender)
        let myLidNum = String(myLid).split('@')[0].split(':')[0]
        let myNum = m.sender.split('@')[0].split(':')[0]
        let p = metadata.participants.find(x => {
            let id = String(x.id || x.jid || '').split('@')[0].split(':')[0]
            let lid = String(x.lid || '').split('@')[0].split(':')[0]
            return id === myLidNum || lid === myLidNum || id === myNum || lid === myNum
        })
        return p?.admin === 'admin' || p?.admin === 'superadmin' || p?.admin === true || p?.isAdmin === true
    } catch { return false }
}

let handler = async (m, { conn }) => {}

handler.before = async function(m, { conn }) {
    if (m.mtype !== 'stickerMessage' || !m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat) return
    if (!chat.stickerAbrir && !chat.stickerCerrar) return

    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    try {
        // Solo admins pueden abrir/cerrar con sticker
        if (!(await isAdminReal(conn, m))) return

        let fileSha256 = m.msg?.fileSha256
        if (!fileSha256) return
        let hash = Buffer.from(fileSha256).toString('base64')

        let isClose, estado
        if (hash === chat.stickerAbrir) { isClose = 'not_announcement'; estado = 'ABIERTO 🟢❄️' }
        else if (hash === chat.stickerCerrar) { isClose = 'announcement'; estado = 'CERRADO 🔴❄️' }
        else return

        await conn.groupSettingUpdate(m.chat, isClose)
        await conn.sendMessage(m.chat, {
            text: head + `\n⤷ ┇ 𝐆𝐑𝐔𝐏𝐎 ﹒ ${isClose === 'not_announcement' ? 'ABRIR' : 'CERRAR'} ：✿ 。\n\n${estado}\n👑 Por: @${m.sender.split('@')[0]} 👻` + foot,
            mentions: [m.sender]
        }, { quoted: m })
    } catch {}
}

handler.help = ['abrir-cerrar-sticker']
handler.tags = ['grupo']
handler.group = true
handler.admin = false
handler.botAdmin = true
export default handler