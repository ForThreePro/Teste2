import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn, text, command }) => {
    if (!text) return conn.sendMessage(m.chat, { text: `Uso:.${command} <link>` }, { quoted: m })

    await react(conn, m, '⏳')
    try {
        // ===== FACEBOOK =====
        if (command === 'fb' || command === 'facebook') {
            await m.reply(`𐔌 ꒱ ***.fb*** 𐔌 ꒱ ⏳\nDescargando de Facebook...`)
            const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl)

            let videoBuffer
            if(res.headers.get('content-type')?.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Error API')
                videoBuffer = await getBuffer(data.result.url)
            } else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { video: videoBuffer, caption: `✅ Descargado\n⬇️ Andreitap Ventas 💗` }, { quoted: m })
        }

        // ===== INSTAGRAM ARREGLADO PARA STKN =====
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            // NO LIMPIAR EL LINK. Mandarlo tal cual porque el stkn es necesario
            const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(text)}&key=${api.key}`
            console.log(apiUrl) // para debug

            const res = await fetch(apiUrl)
            const contentType = res.headers.get('content-type')

            let videoBuffer
            let title = "Reel de Instagram"

            if(contentType && contentType.includes('application/json')){
                const data = await res.json()
                if(!data.status) throw new Error(data.message || 'Video privado o error')
                const result = data.result
                title = result.title || title
                videoBuffer = await getBuffer(result.url)
            } else {
                // Si viene directo el mp4
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: `𐔌 ꒱ ***.ig*** 𐔌 ꒱ ✅\n📌 ${title}\n⬇️ Enviado por Andreitap Ventas 💗`
            }, { quoted: m })
        }

        // ===== YT Y TT IGUAL QUE ANTES =====
        if (command === 'play1') {
            const searchResult = await ytsearch(text)
            const video = searchResult.videos[0]
            const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=${api.key}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            const audioBuffer = await getBuffer(dl)
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
        }

        if (command === 'ttmp3' || command === 'tt') {
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result
            const dl = data?.download || data?.dl
            const audioBuffer = await getBuffer(dl)
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `tiktok.mp3` }, { quoted: m })
        }

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        console.log(e)
        return conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>', 'fb <link>', 'ig <link>']
handler.tags = ['descargas']
handler.command = /^(play1|ttmp3|tomp3|tt|fb|facebook|ig|instagram)$/i
handler.register = false
export default handler