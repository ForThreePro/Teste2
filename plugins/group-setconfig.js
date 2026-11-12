let handler = async (m, { conn }) => {
    let metadata = await conn.groupMetadata(m.chat).catch(e => null)
    let sender = m.sender
    let senderAlt = m.senderAlt || 'no hay senderAlt'
    let keyParticipant = m.key?.participant || 'no hay'
    let keyRemote = m.key?.remoteJid || 'no hay'

    let list = metadata?.participants?.map(p => {
        return `• id: ${p.id}\n  lid: ${p.lid || 'no lid'}\n  admin: ${p.admin} / isAdmin: ${p.isAdmin}`
    }).join('\n') || 'sin metadata'

    return m.reply(
`❄️ DEBUG ADMIN

Tu sender: ${sender}
Tu senderAlt: ${senderAlt}
key.participant: ${keyParticipant}
m.isAdmin: ${m.isAdmin}
m.isOwner: ${m.isOwner}
m.isGroup: ${m.isGroup}

Participantes:
${list}`
    )
}
handler.help = ['checkadmin']
handler.tags = ['grupo']
handler.command = ['checkadmin','debugadmin']
handler.group = true
export default handler