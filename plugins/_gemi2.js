import axios from 'axios'

// VIDEOS - Se mandan primero
let videos = [
    'https://telegra.ph/file/d4b85856b2685b5013a8a.mp4', // Video 1
    'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4', // Video 2
    'https://telegra.ph/file/f830f235f844e30d22e8e.mp4', // Video 3
    'https://telegra.ph/file/07fe0023525be2b2579f9.mp4', // Video 4
    'https://telegra.ph/file/99e036ac43a09e044a223.mp4'  // Video 5
]

// AUDIOS - Van después del video
let audios = [
    'https://files.evogb.win/UbhAVn.opus' // Audio 1 // Audio 2
]

// MENSAJES - Van al final
let mensajes = [
    '🔥 Aquí tienes tu audio bro',
    // '😎 Segundo audio pa ti',
]

let indice = 0 // Para rotar

let handler = async (m, { conn }) => {

    let videoUrl = videos[indice % videos.length] // Toma el video actual
    let audioUrl = audios[indice % audios.length] // Toma el audio actual
    let texto = mensajes[indice % mensajes.length] || '✅ Listo bro' // Toma el mensaje
    
    indice = (indice + 1) // Siguiente

    try {
        await m.react('⏳')

        // 1. DESCARGAR Y ENVIAR VIDEO PRIMERO
        let resVideo = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 120000 })
        let videoBuffer = Buffer.from(resVideo.data)
        
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: '😼' // Caption opcional
        }, { quoted: m })

        await new Promise(resolve => setTimeout(resolve, 800)) // Pausa de 0.8s

        // 2. DESCARGAR Y ENVIAR AUDIO
        let resAudio = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 120000 })
        let audioBuffer = Buffer.from(resAudio.data)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus', // Por tu archivo.opus
            ptt: false // pon true si quieres que salga como nota de voz
        }, { quoted: m })

        await new Promise(resolve => setTimeout(resolve, 500)) // Pausa de 0.5s

        // 3. ENVIAR MENSAJE AL FINAL
        await conn.reply(m.chat, texto, m)

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        await m.reply(`Error: ${err.message || err}`)
    }
}

handler.help = ['gemidos - Manda video + audio + mensaje']
handler.tags = ['tools']
handler.command = /^(gemidos)$/i
export default handler