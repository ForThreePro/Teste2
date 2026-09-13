import axios from 'axios'

// AQUI METES TUS AUDIOS. YA PUSE EL TUYO
let audios = [
    'https://files.evogb.win/UbhAVn.opus' // Audio 1/10
]

let indice = 0 // Para rotar

let handler = async (m, { conn }) => {

    let url = audios[indice] // Toma el audio actual
    indice = (indice + 1) % audios.length // Siguiente

    try {
        await m.react('⏳')

        // Descargar el audio
        let res = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 })
        let audioBuffer = Buffer.from(res.data)

        // Enviar como audio
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus', // Tu archivo es.opus
            fileName: `audio${indice}.opus`
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        await m.reply(`Error: ${err.message || err}`)
    }
}

handler.help = ['gemidos - Manda audio random']
handler.tags = ['tools']
handler.command = /^(gemidos)$/i
export default handler