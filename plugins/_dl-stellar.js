import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

// ESTA FUNCION FALTABA
const react = async (conn, m, text) => {
  try { 
    await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) 
  } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
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

            if (!json.status || !json.result) throw new Error(json.message || 'No se pudo descargar')

            let data = json.result
            let buffer = await getBuffer(data.url)

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