import axios from 'axios'

const API_BASE = 'https://api.stellarwa.xyz/nsfw'
const API_KEY = 'garfield-vip'

// Queries que rota automáticamente
const queries = [
    'MIA KHALIFA',
    'Lana Rhoades',
    'Riley Reid',
    'Abella Danger',
    'Brandi Love',
    'Angela White',
    'Emily Willis',
    'Gia Derza'
]

// Audios opcionales
const audios = [
    'https://files.evogb.win/UbhAVn.opus'
]

// Mensajes finales
const mensajes = [
    '🔥 Aquí tienes tu video bro',
    '😎 Disfruta crack',
    '✅ Listo, descargado de xnxx',
    '🎬 A disfrutar',
    '💥 Video listo'
]

let indice = 0

const apiClient = axios.create({
    timeout: 45000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
})

async function searchVideos(query) {
    const res = await apiClient.get(`${API_BASE}/search/xnxx`, {
        params: { query, key: API_KEY }
    })

    if (!res.data?.resultados?.length) {
        throw new Error('No se encontraron resultados')
    }

    // Elige aleatoriamente entre los primeros 5 resultados
    const results = res.data.resultados.slice(0, 5)
    return results[Math.floor(Math.random() * results.length)]
}

async function getDownloadUrl(videoUrl) {
    const res = await apiClient.get(`${API_BASE}/dl/xnxx`, {
        params: {
            url: videoUrl,
            key: API_KEY
        },
        timeout: 60000
    })

    // La API de xnxx devuelve: resultado.videos.high / .low / .HLS
    const videos = res.data?.resultado?.videos
    if (!videos) {
        throw new Error('No se pudo obtener el enlace de descarga')
    }

    // Preferimos high, si no existe usamos low
    const downloadUrl = videos.high || videos.low
    if (!downloadUrl) {
        throw new Error('No hay enlace MP4 disponible')
    }

    return {
        url: downloadUrl,
        title: 'Video XNXX' // La API de xnxx no devuelve título en el dl
    }
}

async function downloadAndSendVideo(conn, m, videoUrl, title) {
    const res = await apiClient.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 180000
    })

    const buffer = Buffer.from(res.data)
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1)

    // WhatsApp tiene límite aproximado de \~100MB
    if (buffer.length > 95 * 1024 * 1024) {
        throw new Error(`El video es demasiado pesado (${sizeMB} MB)`)
    }

    await conn.sendMessage(m.chat, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 *${title}*\n📦 ${sizeMB} MB`
    }, { quoted: m })
}

async function sendAudio(conn, m, audioUrl) {
    try {
        const res = await apiClient.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        })

        await conn.sendMessage(m.chat, {
            audio: Buffer.from(res.data),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false
        }, { quoted: m })
    } catch (e) {
        console.log('Error al enviar audio:', e.message)
    }
}

let handler = async (m, { conn, text }) => {
    const searchQuery = text?.trim() || queries[indice % queries.length]
    const audioUrl = audios.length ? audios[indice % audios.length] : null
    const finalMsg = mensajes[indice % mensajes.length]

    indice++

    try {
        await m.react('⏳')

        let videoUrl, videoTitle

        if (searchQuery.startsWith('http')) {
            // URL directa
            videoUrl = searchQuery
            videoTitle = 'Video'
            await m.reply('⬇️ Descargando video...')
        } else {
            // Búsqueda
            await m.reply(`🔍 Buscando *${searchQuery}*...`)
            const result = await searchVideos(searchQuery)
            videoUrl = result.url
            videoTitle = result.title || 'Video'
        }

        // Obtener link de descarga
        const { url: directUrl, title } = await getDownloadUrl(videoUrl)

        // Descargar y enviar video
        await downloadAndSendVideo(conn, m, directUrl, title || videoTitle)

        // Enviar audio (si hay)
        if (audioUrl) {
            await new Promise(r => setTimeout(r, 800))
            await sendAudio(conn, m, audioUrl)
        }

        // Mensaje final
        await new Promise(r => setTimeout(r, 400))
        await conn.reply(m.chat, finalMsg, m)

        await m.react('✅')

    } catch (err) {
        console.error(err)
        await m.react('❌')
        await m.reply(`❌ Error: ${err.message || 'No se pudo descargar el video'}`)
    }
}

handler.help = ['xnxx <búsqueda|url>']
handler.tags = ['nsfw', 'downloader']
handler.command = /^(xnxx|xnx|dlxnxx)$/i
handler.limit = true
handler.nsfw = true

export default handler