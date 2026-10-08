
let handler = async (m, { conn }) => {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let botNumber = conn.user.jid

    let candidates = participants.filter(p => !p.admin && p.id !== botNumber)
    if (!candidates.length) return m.reply(`‧˚꒰🎃୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰👻꒱ No hay víctimas, todos son admins... se salvaron del exorcismo 😾`)

    let victim = candidates[Math.floor(Math.random() * candidates.length)]

    await conn.sendMessage(m.chat, { 
        text: 
`‧˚꒰🎃୭ *_𝐑 𝐔 𝐋 𝐄 𝐓 𝐀  𝐁 𝐀 𝐍_*
*𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎 - 𝐇𝐀𝐋𝐋𝐎𝐖𝐄𝐄𝐍*

╭───GIRANDO ꒰🎰꒱────╮
‧˚꒰🕸️୭ Invocando espíritus...
‧˚꒰👻୭ Participantes: ${candidates.length}
╰─────── ݁ ˖Ი𐑼⋆────╯

꒰🦇꒱ La ouija eligió a @${victim.id.split('@')[0]} 💥

*¡EL FANTASMA SE LO LLEVÓ!* 💀🍬`,
        mentions: [victim.id]
    })

    await new Promise(r => setTimeout(r, 1500))

    try {
        await conn.groupParticipantsUpdate(m.chat, [victim.id], 'remove')
        await conn.sendMessage(m.chat, { text: `‧˚꒰🎃୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰💀꒱ @${victim.id.split('@')[0]} fue exorcizado del grupo\n꒰🕯️꒱ Trick or... ¡BAN!`, mentions: [victim.id] })
        await conn.sendMessage(m.chat, { react: { text: '🎃', key: m.key } })
    } catch (e) {
        m.reply(`‧˚꒰🎃୭ *_𝐋𝐔𝐗 𝐗 𝐘𝐀𝐋𝐋𝐈𝐂𝐎_*\n\n꒰😿꒱ No pude exorcizar a @${victim.id.split('@')[0]} - tiene protección fantasmal`, null, { mentions: [victim.id] })
    }
}

handler.help = ['ruletaban']
handler.tags = ['group', 'halloween']
handler.command = /^(ruletaban|ruletab|ruletaban-halloween)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler