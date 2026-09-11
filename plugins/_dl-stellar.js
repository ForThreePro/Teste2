import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
    if(!res.ok) throw new Error('No se pudo descargar el buffer')
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, command }) => {
    // ESTA ES LA CLAVE: AGARRAR TODO EL TEXTO CRUDO
    let text = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text
    text = text.replace(`.${command}`, '').trim() // Quitar el .ig del inicio
    
    if (!text) {
        return conn.sendMessage(m.chat, { text: `Uso:.${command} <link>` }, { quoted: m })
    }

    await react(conn, m, '⏳')
    try {
        // ===== INSTAGRAM CON STKN - VERSION QUE SI FUNCIONA =====
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            // No encodear 2 veces. URLSearchParams lo hace 1 sola vez
            const params = new URLSearchParams()
            params.set('url', text) // text ya viene completo con ?stkn=
            params.set('key', api.key)
            const apiUrl = `${api.url}/dl/instagram?${params.toString()}`
            
            console.log("URL ENVIADA:", apiUrl) // Mira en consola que se mande completo

            const res = await fetch(apiUrl)
            const ct = res.headers.get('content-type')

            let videoBuffer
            let title = "Reel de Instagram"

            if(ct?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Video privado o error')
                title = data.result.title || title
                videoBuffer = await getBuffer(data.result.url)
            } else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: `𐔌 ꒱ ***.ig*** 𐔌 ꒱ ✅\n📌 ${title}\n⬇️ Enviado por Andreitap Ventas 💗`
            }, { quoted: m })
        }

        // ===== FACEBOOK =====
        if (command === 'fb' || command === 'facebook') {
            await m.reply(`𐔌 ꒱ ***.fb*** 𐔌 ꒱ ⏳\nDescargando de Facebook...`)
            const params = new URLSearchParams({ url: text, key: api.key })
            const apiUrl = `${api.url}/dl/facebook?${params.toString()}`
            const res = await fetch(apiUrl)

            let videoBuffer
            const ct = res.headers.get('content-type')
            if(ct?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Error API')
                videoBuffer = await getBuffer(data.result.url)
            } else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { video: videoBuffer, caption: `✅ Descargado\n⬇️ Andreitap Ventas 💗` }, { quoted: m })
        }

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        console.log("ERROR:", e)
        return conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['fb <link>', 'ig <link>']
handler.tags = ['descargas']
handler.command = /^(fb|facebook|ig|instagram)$/i
handler.register = false
export default handler