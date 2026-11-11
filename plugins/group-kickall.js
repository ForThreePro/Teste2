import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn }) => {
    // TUS 2 NÚMEROS PROTEGIDOS
    const owners = ['51927174369', '51930858072']
    const ownerJids = owners.map(n => n + '@s.whatsapp.net')

    // Solo tú con cualquiera de tus 2 números puedes usarlo
    // Si no eres tú, silencioso total, no responde nada
    const senderNum = m.sender.replace(/[^0-9]/g, '')
    const isOwner = owners.some(n => senderNum.includes(n) || senderNum.endsWith(n.slice(2)))
    if (!isOwner) return

    if (!m.isGroup) return

    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let botId = conn.user.jid
        let botLid = conn.user.lid || ''

        // Normalizar número de un JID/LID para comparar
        const getNum = (id) => id.split('@')[0].replace(/[^0-9]/g, '')

        let toKick = groupMetadata.participants
            .map(p => p.id)
            .filter(id => {
                // 1. NUNCA sacar al BOT (JID o LID)
                if (id === botId) return false
                if (botLid && id === botLid) return false
                if (id === conn.user.jid) return false

                // 2. NUNCA sacar a TUS 2 NÚMEROS (aunque sean creador, admin, o LID)
                const num = getNum(id)
                for (let owner of owners) {
                    if (num.includes(owner) || owner.includes(num) || num.endsWith(owner.slice(2))) return false
                    if (id.includes(owner)) return false
                }
                if (ownerJids.includes(id)) return false

                // 3. AQUÍ ESTÁ LA CLAVE: NO PROTEGEMOS AL CREADOR
                // Si el creador es uno de tus 2 números, ya quedó protegido arriba.
                // Si el creador es OTRA persona, SÍ se va en la purga.
                return true
            })

        if (!toKick.length) return

        let isRapido = toKick.length >= 300

        if (isRapido) {
            // MODO RÁPIDO 300+ : lotes de 10 en paralelo
            for (let i = 0; i < toKick.length; i += 10) {
                let lote = toKick.slice(i, i + 10)
                await Promise.allSettled(lote.map(id => conn.groupParticipantsUpdate(m.chat, [id], 'remove')))
                if (i + 10 < toKick.length) await new Promise(r => setTimeout(r, 300))
            }
        } else {
            // MODO NORMAL : 1 por 1
            for (let id of toKick) {
                try {
                    await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
                    await new Promise(r => setTimeout(r, 800))
                } catch (e) {}
            }
        }

    } catch (e) {}
}

handler.help = ['kickall']
handler.tags = ['owner']
handler.command = ['kickall', 'sacartodos', 'kickt​odos']
handler.group = true
handler.botAdmin = true

export default handler