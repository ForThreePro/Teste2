let handler = async (m, { conn }) => {
    if (m.mtype !== 'stickerMessage') return
    console.log('>>> STICKER DETECTADO <<<')
    try {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        await conn.sendMessage(m.chat, { text: `🔓 ABIERTO CON CUALQUIER STICKER - PRUEBA OK` })
        console.log('>>> GRUPO ABIERTO <<<')
    } catch (e) {
        console.log('ERROR:', e)
    }
}
handler.all = true
handler.group = true
export default handler