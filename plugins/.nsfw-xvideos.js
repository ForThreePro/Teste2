import axios from 'axios'

// CONFIGURACIÓN API
const API_BASE = 'https://api.stellarwa.xyz/nsfw'
const API_KEY = 'garfield-vip'

// QUERIES PARA BÚSQUEDA (rota automáticamente)
const queries = [
    'MIA KHALIFA',
    'Lana Rhoades', 
    'Riley Reid',
    'Abella Danger',
    'Brandi Love'
]

// AUDIOS - Opcional, se envía después del video
const audios = [
    'https://files.evogb.win/UbhAVn.opus'
]

// MENSAJES - Van al final
const mensajes = [
    '🔥 Aquí tienes tu video bro',
    '😎 Disfruta crack',
    '✅ Listo, descargado de xvideos'
]

// Variables globales
let indice = 0 // Para rotar queries

// Configuración de axios con timeout por defecto
const apiClient = axios.create({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
})

// Función para buscar videos
async function searchVideos(query) {
    try {
        console.log(`Buscando videos para: ${query}`)
        
        const searchRes = await apiClient.get(`${API_BASE}/search/xvideos`, {
            params: {
                query,
                key: API_KEY
            }
        })

        console.log('Respuesta de búsqueda:', searchRes.status, searchRes.data)

        if (!searchRes.data?.results?.length) {
            console.log('No se encontraron resultados en la respuesta')
            throw new Error('No se encontraron resultados')
        }

        return searchRes.data.results[0]
    } catch (error) {
        console.error('Error en búsqueda:', error.message)
        console.error('Detalles del error:', error.response?.data || 'Sin detalles adicionales')
        
        // Mensaje de error más específico
        if (error.response?.status === 401) {
            throw new Error('Error de autenticación con la API')
        } else if (error.response?.status === 404) {
            throw new Error('Endpoint no encontrado')
        } else if (error.response?.status >= 500) {
            throw new Error('Error del servidor de la API')
        } else {
            throw new Error(`Error al buscar videos: ${error.message}`)
        }
    }
}

// Función para obtener URL de descarga
async function getDownloadUrl(videoUrl) {
    try {
        console.log(`Obteniendo URL de descarga para: ${videoUrl}`)
        
        const downloadRes = await apiClient.get(`${API_BASE}/dl/xvideos`, {
            params: {
                url: encodeURIComponent(videoUrl),
                key: API_KEY
            },
            timeout: 60000
        })

        console.log('Respuesta de descarga:', downloadRes.status, downloadRes.data)

        if (!downloadRes.data?.download_url) {
            throw new Error('No se pudo obtener el link de descarga')
        }

        return {
            url: downloadRes.data.download_url,
            title: downloadRes.data.title || 'Video'
        }
    } catch (error) {
        console.error('Error al obtener URL de descarga:', error.message)
        console.error('Detalles del error:', error.response?.data || 'Sin detalles adicionales')
        
        if (error.response?.status === 401) {
            throw new Error('Error de autenticación con la API')
        } else if (error.response?.status === 404) {
            throw new Error('Endpoint de descarga no encontrado')
        } else if (error.response?.status >= 500) {
            throw new Error('Error del servidor de la API al descargar')
        } else {
            throw new Error(`Error al obtener el enlace de descarga: ${error.message}`)
        }
    }
}

// Función para descargar y enviar video
async function downloadAndSendVideo(conn, m, videoUrl, title) {
    try {
        await m.reply('📥 Descargando archivo...')
        
        const resVideo = await apiClient.get(videoUrl, { 
            responseType: 'arraybuffer', 
            timeout: 120000
        })
        
        const videoBuffer = Buffer.from(resVideo.data)
        
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `🎬 *${title}*\n\n😼`
        }, { quoted: m })
        
        return true
    } catch (error) {
        console.error('Error al descargar y enviar video:', error.message)
        throw new Error(`Error al descargar el video: ${error.message}`)
    }
}

// Función para enviar audio
async function sendAudio(conn, m, audioUrl) {
    try {
        const resAudio = await apiClient.get(audioUrl, { 
            responseType: 'arraybuffer', 
            timeout: 120000 
        })
        
        const audioBuffer = Buffer.from(resAudio.data)
        
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false
        }, { quoted: m })
        
        return true
    } catch (error) {
        console.error('Error al enviar audio:', error.message)
        // No lanzamos error aquí para que el proceso continúe
        return false
    }
}

// Handler principal
let handler = async (m, { conn, text }) => {
    // Si el usuario pasa una URL directa, la usa. Si no, busca con el query rotativo
    const searchQuery = text || queries[indice % queries.length]
    const audioUrl = audios[indice % audios.length]
    const texto = mensajes[indice % mensajes.length] || '✅ Listo bro'
    
    // Incrementar índice para la siguiente llamada
    indice = (indice + 1)
    
    try {
        await m.react('⏳')
        
        let videoUrl, videoTitle
        
        // Si el texto empieza con http, es URL directa. Si no, busca
        if (searchQuery.startsWith('http')) {
            videoUrl = searchQuery
            videoTitle = 'Video'
            await m.reply('⬇️ Descargando video por URL...')
        } else {
            await m.reply(`🔍 Buscando: *${searchQuery}*...`)
            
            // BUSCAR EN LA API
            const searchResult = await searchVideos(searchQuery)
            videoUrl = searchResult.url || searchResult.video_url
            videoTitle = searchResult.title || 'Video'
            
            await m.reply(`📹 Encontrado: *${videoTitle}*\n⬇️ Descargando...`)
        }
        
        // DESCARGAR VIDEO DESDE LA API DE DESCARGA
        const { url: directVideoUrl, title: downloadTitle } = await getDownloadUrl(videoUrl)
        
        // 1. DESCARGAR Y ENVIAR VIDEO
        await downloadAndSendVideo(conn, m, directVideoUrl, downloadTitle)
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Pausa 1s
        
        // 2. ENVIAR AUDIO (si existe)
        if (audioUrl) {
            await sendAudio(conn, m, audioUrl)
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // 3. ENVIAR MENSAJE FINAL
        await conn.reply(m.chat, texto, m)
        
        await m.react('✅')
        
    } catch (err) {
        console.error('Error general en el handler:', err)
        await m.react('❌')
        await m.reply(`Error: ${err.message || 'Falló la descarga'}`)
    }
}

handler.help = ['xvideos <query|url> - Busca y descarga videos']
handler.tags = ['nsfw', 'downloader']
handler.command = /^(xvideos|xvid|dlvid)$/i
handler.limit = true
handler.nsfw = true

export default handler