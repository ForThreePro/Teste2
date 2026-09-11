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

let handler = async (m, { conn, args, command }) => {
    // AGARRA TODO EL TEXTO PARA QUE NO SE CORTE EL ?STKN=
    let text = args.join(' ')
    if (!text) {
        let menuUso = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 🎵

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` —˙𖦹.📥꒷

── *📖 USO* ╏
1️⃣ ➛.*play1* <nombre de canción>
2️⃣ ➛.*ttmp3* <link de tiktok>
3️⃣ ➛.*fb* <link de facebook>
4️⃣ ➛.*ig* <link de instagram>

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
    }

    await react(conn, m, '⏳')
    try {
        // ===== YOUTUBE =====
        if (command === 'play1') {
            await m.reply(`𐔌 ꒱ ***.play1*** 𐔌 ꒱ ⏳\nBuscando y descargando...`)
            const searchResult = await ytsearch(text)
            if (!searchResult.videos.length) throw new Error("No se encontró la canción.")
            const video = searchResult.videos[0]
            
            const params = new URLSearchParams({ url: video.url, key: api.key })
            const dlEndpoint = `${api.url}/dl/ytmp3?${params.toString()}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            if (!dl) throw new Error('No se pudo descargar el audio de YT')
            
            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
        }

        // ===== TIKTOK =====
        if (command === 'ttmp3' || command === 'tt') {
            await m.reply(`𐔌 ꒱ ***.ttmp3*** 𐔌 ꒱ ⏳\nDescargando de TikTok...`)
            const params = new URLSearchParams({ url: text, key: api.key })
            const apiUrl = `${api.url}/dl/tiktokmp3?${params.toString()}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result
            let dl = data?.download || data?.dl || data?.music
            const title = data?.title || 'tiktok'
            if (!dl) throw new Error('No se pudo descargar. Link mal o privado')
            
            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
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

        // ===== INSTAGRAM CON STKN =====
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)
            const params = new URLSearchParams({ url: text, key: api.key })
            const apiUrl = `${api.url}/dl/instagram?${params.toString()}`
            
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

        await react(conn, m, '✅')
    } catch (e) {
        await react(conn, m, '❌')
        console.log("ERROR:", e)
        return conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>', 'fb <link>', 'ig <link>']
handler.tags = ['descargas']
handler.command = /^(play1|ttmp3|tomp3|tt|fb|facebook|ig|instagram)$/i
handler.register = false
export default handler