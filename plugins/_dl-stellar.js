let handler = async (m, { conn, command }) => {
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    text = text.replace(`.${command}`, '').trim()
    
    if (!text) return conn.sendMessage(m.chat, { text: `Uso: .${command} <link>` }, { quoted: m })

    await react(conn, m, '⏳')
    try {
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            // 1. Encodea el link 1 sola vez
            const igUrl = encodeURIComponent(text)
            
            // 2. Arma bien la URL de la API
            const apiUrl = `${api.url}/dl/instagram?url=${igUrl}&key=${api.key}`

            const res = await fetch(apiUrl)
            const json = await res.json()

            if (!json.status || !json.result) throw new Error(json.message || 'No se pudo descargar')

            let data = json.result
            let buffer = await getBuffer(data.url) // asume que la API devuelve data.url

            await conn.sendFile(m.chat, buffer, 'instagram.mp4', `Listo ✅`, m)
            await react(conn, m, '✅')
        }
    } catch (e) {
        await react(conn, m, '❌')
        await m.reply(`Error: ${e.message}`)
    }
}

handler.command = ['ig', 'instagram']
export default handler