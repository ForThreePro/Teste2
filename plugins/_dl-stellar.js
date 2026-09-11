import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, command }) => {
    // AGARRAR TEXTO CRUDO COMPLETO
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    text = text.replace(`.${command}`, '').trim()
    
    if (!text) return conn.sendMessage(m.chat, { text: `Uso:.${command} <link>` }, { quoted: m })

    await react(conn, m, '⏳')
    try {
        // ===== INSTAGRAM =====
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            // NO USAR URLSearchParams. Mandar el link tal cual encodeado 1 vez
            const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(text)}&key=${api.key}`
            
            console.log("URL ENVIADA:", apiUrl)

            const res = await fetch(apiUrl)
            const ct = res.headers.get('content-type')

            let videoBuffer
            let title = "Reel de Instagram"

            if(ct?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Video privado')
                title = data.result.title || title
                videoBuffer = await getBuffer(data.result.url)
            } else if(ct?.includes('video')){
                videoBuffer = Buffer.from(await res.arrayBuffer())
            } else {
                throw new Error('Respuesta invalida de la API')
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: `𐔌 ꒱ ***.ig*** 𐔌 ꒱ ✅\n📌 ${title}\n⬇️ Andreitap Ventas 💗`
            }, { quoted: m })
        }

        // ===== FACEBOOK =====
        if (command === 'fb' || command === 'facebook') {
            const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl)
            let videoBuffer = Buffer.from(await res.arrayBuffer())
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { video: videoBuffer, caption: `✅ Descargado` }, { quoted: m })
        }

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        console.log("ERROR DETALLADO:", e)
        return conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['fb <link>', 'ig <link>']
handler.tags = ['descargas']
handler.command = /^(fb|facebook|ig|instagram)$/i
handler.register = false
export default handler