let handler = m => m
handler.all = async function(m) {
    let user = global.db.data.users[m.sender]
    if (!user) return
    user.lastseen = new Date * 1 // Guarda la hora actual
}
export default handler