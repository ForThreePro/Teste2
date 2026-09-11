import ytsearch from "yt-search"
import fetch from "node-fetch"

const api = { url: 'https://api.stellarwa.xyz', key: 'proyectsV2' }

const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

const getBuffer = async (url) => {
    try {
        const res = await fetch(url)
        return Buffer.from(await res.arrayBuffer())
    } catch(e) {
        throw new Error('Error descargando el archivo')
    }
}

let handler = async (m, { conn, text, command }) => {
    if (!text) {
        let menuUso = `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ 🎵

.⃟𖥔 ݁. 𖦹˙— \`\`DESCARGAS\`\` —˙𖦹.📥꒷

── *📖 USO* ╏
1️⃣ ➛.*play1* <nombre>
2️⃣ ➛.*ttmp3* <link tiktok>
3️⃣ ➛.*fb* <link facebook>
4️⃣ ➛.*ig* <link instagram>

━━━━━━━━━━━`
        return conn.sendMessage(m.chat, { text: menuUso }, { quoted: m })
    }

    await react(conn, m, '⏳')
    try {
        // ===== YOUTUBE =====
        if (command === 'play1') {
            const searchResult = await ytsearch(text)
            if (!searchResult.videos.length) throw new Error("No se encontró la canción.")
            const video = searchResult.videos[0]
            const { title, author, timestamp: duration, views, url, image } = video
            const thumbBuffer = await getBuffer(image)

            await conn.sendMessage(m.chat, { image: thumbBuffer, caption: `📌 ${title}\n👤 ${author.name}\n⏱️ ${duration}` }, { quoted: m })

            const dlEndpoint = `${api.url}/dl/ytmp3?url=${encodeURIComponent(url)}&key=${api.key}`
            const resDl = await fetch(dlEndpoint).then(r => r.json())
            const dl = resDl?.data?.dl || resDl?.data?.download
            if (!dl) throw new Error('No se pudo descargar el audio de YT')
            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
        }

        // ===== TIKTOK =====
        if (command === 'ttmp3' || command === 'tt') {
            const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl).then(r => r.json())
            const data = res?.data || res?.result || res
            let dl = data?.download || data?.dl || data?.music
            const title = data?.title || 'tiktok'
            if (!dl) throw new Error('No se pudo descargar. Link mal o privado')
            const audioBuffer = await getBuffer(dl)
            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
        }

        // ===== FACEBOOK ARREGLADO =====
        if (command === 'fb' || command === 'facebook') {
            await m.reply(`𐔌 ꒱ ***.fb*** 𐔌 ꒱ ⏳\nDescargando de Facebook...`)

            const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(text)}&key=${api.key}`
            const res = await fetch(apiUrl)
            const contentType = res.headers.get('content-type')

            let videoBuffer
            let title = "Video de Facebook"

            // Si devuelve JSON
            if(contentType && contentType.includes('application/json')){
                const data = await res.json()
                const result = data?.result || data?.data
                let dl = result?.url
                title = result?.title || title
                if (!dl) throw new Error('No se pudo obtener el link')
                videoBuffer = await getBuffer(dl)
            }
            // Si devuelve directo el video/mp4
            else {
                videoBuffer = Buffer.from(await res.arrayBuffer())
            }

            await react(conn, m, '📥')
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: `𐔌 ꒱ ***.fb*** 𐔌 ꒱ ✅\n📌 ${title}\n⬇️ Enviado por Andreitap Ventas 💗`
            }, { quoted: m })
        }

        // ===== INSTAGRAM ARREGLADO =====
        if (command === 'ig' || command === 'instagram') {
            await m.reply(`𐔌 ꒱ ***.ig*** 𐔌 ꒱ ⏳\nDescargando de Instagram...`)

            // Limpiar el link por si trae?stkn=
            let cleanUrl = text.split('?')[0]

            const apiUrl = `${api.url}/dl/instagram?url=${encodeURIComponent(cleanUrl)}&key=${api.key}`
            const res = await fetch(apiUrl)
            const contentType = res.headers.get('content-type')

            let videoBuffer
            let title = "Reel de Instagram"

            if(contentType && contentType.includes('application/json')){
                const data = await res.json()
                const result = data?.result || data?.data
                let dl = result?.url
                title = result?.title || title
                if (!dl) throw new Error('No se pudo obtener el link. Video privado?')
                videoBuffer = await getBuffer(dl)
            }
            else {
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
        return conn.sendMessage(m.chat, {
            text: `𐔌 ꒱ ***.${command}*** 𐔌 ꒱ ⚠️\n\n.⃟𖥔 ݁. 𖦹˙— \`\`ERROR\`\` —˙𖦹.❌꒷\n\n── *📝 DESCRIPCIÓN* ╏\n❌ ➛ ${e.message}\n\n── *💡 SOLUCIÓN* ╏\n🔧 ➛ Verifica que el link sea público\n🔧 ➛ Prueba quitar?stkn= del link de IG\n\n━━━━━━━━━━━`
        }, { quoted: m })
    }
}

handler.help = ['play1 <nombre>', 'ttmp3 <link>', 'fb <link>', 'ig <link>']
handler.tags = ['descargas']
handler.command = /^(play1|ttmp3|tomp3|tt|fb|facebook|ig|instagram)$/i
handler.register = false
export default handler