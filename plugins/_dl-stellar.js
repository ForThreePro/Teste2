import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { 
    await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) 
  } catch {}
}

const getBuffer = async (url) => {
    if (!url) throw new Error('URL vacia')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error al descargar: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, command }) => {
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    text = text.replace(`.${command}`, '').trim()
    
    if (!text) return conn.sendMessage(m.chat, { text: `Uso: .${command} <link>` }, { quoted: m })

    await react(conn, m, '⏳')
    try {
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            const igUrl = encodeURIComponent(text)
            const apiUrl = `${api.url}/dl/instagram?url=${igUrl}&key=${api.key}`

            const res = await fetch(apiUrl)
            const json = await res.json()

            // DEBUG: Para ver en logs qué devuelve la API
            console.log('Resp Stellar:', JSON.stringify(json))

            if (!json.status) throw new Error(json.message || 'La API fallo')
            if (!json.result) throw new Error('No se encontro resultado')

            // Busca el link en varios campos por si la API cambia
            let dlUrl = json.result.url || json.result.data || json.result.media || json.result.video || json.result.download || json.result.dl_link
            
            if (!dlUrl) throw new Error('La API no devolvio link de descarga')

            let buffer = await getBuffer(dlUrl)
            let caption = json.result.title || json.result.caption || 'Descargado de Instagram ✅'

            await conn.sendFile(m.chat, buffer, 'instagram.mp4', caption, m)
            await react(conn, m, '✅')
        }
    } catch (e) {
        console.error(e)
        await react(conn, m, '❌')
        await m.reply(`Error: ${e.message}`)
    }
}

handler.command = ['ig', 'instagram']
handler.help = ['ig <link>']
handler.tags = ['downloader']
export default handler