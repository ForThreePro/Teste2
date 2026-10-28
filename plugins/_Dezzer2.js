const handler = async (m, { conn }) => {
    // Audio de prueba real, ya en M4A
    let url = 'https://cdn.jsdelivr.net/gh/dwyl/english-words@master/words.txt' // no, usamos un mp3 real abajo
    let audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

    await conn.sendMessage(m.chat, { text: 'Prueba 1: audio/mp4 ptt false - debería ser BARRA NARANJA' }, { quoted: m })

    await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        ptt: false,
        fileName: 'prueba.m4a'
    }, { quoted: m })

    await conn.sendMessage(m.chat, { text: 'Prueba 2: audio/mpeg ptt false - debería ser BARRA NARANJA también' }, { quoted: m })

    await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'prueba.mp3'
    }, { quoted: m })
}
handler.command = ['testaudio']
export default handler