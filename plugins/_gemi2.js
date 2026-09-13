import axios from 'axios'

// AQUI METES TUS AUDIOS
let audios = [
    'https://files.evogb.win/UbhAVn.opus' // Audio 1/10
]

let mensajes = [
    '🔥 By : Mía Khalifa'
]

let indice = 0 // Para rotar

let handler = async (m, { conn }) => {

    let url = audios[indice] // Toma el audio actual
    let texto = mensajes[indice] || '✅ Audio enviado' // Toma el mensaje actual
    indice = (indice + 1) % audios.length // Siguiente y rota

    try {
        await m.react('⏳')

        // Descargar el audio
        let res = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 })
        let audioBuffer = Buffer.from(res.data)

        // 1. Enviar AUDIO
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus', // Por tu archivo.opus
            fileName: `audio${indice}.opus`
        }, { quoted: m })

        // 2. Enviar MENSAJE después del audio
        await conn.reply(m.chat, texto, m)

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        await m.reply(`Error: ${err.message || err}`)
    }
}

handler.help = ['audio - Manda audio + mensaje']
handler.tags = ['tools']
handler.command = /^(audio)$/i
export default handler