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

let indice = 0

const apiClient = axios.create({
    timeout: 45000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
})

async function searchVideos(query) {
    const res = await apiClient.get(`${API_BASE}/search/xvideos`, {
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
    const res = await apiClient.get(`${API_BASE}/dl/xvideos`, {
        params: {
            url: videoUrl,
            key: API_KEY
        },
        timeout: 60000
    })

    const result = res.data?.resultado?.result
    if (!result?.url) {
        throw new Error('No se pudo obtener el enlace de descarga')
    }

    return {
        url: result.url,
        title: result.title || 'Video XVideos'
    }
}

async function downloadAndSendVideo(conn, m, videoUrl, title) {
    const res = await apiClient.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 180000
    })

    const buffer = Buffer.from(res.data)
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1)

    if (buffer.length > 95 * 1024 * 1024) {
        throw new Error(`El video es demasiado pesado (${sizeMB} MB)`)
    }

    await conn.sendMessage(m.chat, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 *${title}*\n📦 ${sizeMB} MB`
    }, { quoted: m })
}

let handler = async (m, { conn, text }) => {
    const searchQuery = text?.trim() || queries[indice % queries.length]
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

        await m.react('✅')

    } catch (err) {
        console.error(err)
        await m.react('❌')
        await m.reply(`❌ Error: ${err.message || 'No se pudo descargar el video'}`)
    }
}

handler.help = ['xvideos <búsqueda|url>']
handler.tags = ['nsfw']
handler.command = /^(xvideos|xvid|dlvid)$/i
handler.limit = true
handler.nsfw = true

export default handler