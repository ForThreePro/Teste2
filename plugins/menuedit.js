import fs from 'fs'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const menuPath = './plugins/menu.js'
  const ownerJid = '51927174369@s.whatsapp.net'

  if (command === 'menu1') {
    if (!fs.existsSync(menuPath)) return m.reply('❌ No encontré plugins/menu.js')
    
    try {
      // Importamos tu menu.js real
      const menuPlugin = (await import('./menu.js?update=' + Date.now())).default
      // Lo ejecutamos para que genere el menú completo como lo haría .menu
      // Pero lo capturamos como texto para que lo puedas copiar
      await menuPlugin(m, { conn, text: '', command: 'menu', usedPrefix: '.' })
      
      await m.reply(`✅ Ese de arriba es tu menú completo detectado de *menu.js*\n\nUsuario: ForThreePro\nGithub: Teste2\n\nSi no te gusta, usa:\n${usedPrefix}menuedit + tu nuevo diseño`)
    } catch(e) {
      m.reply(`❌ Error al leer menu.js: ${e.message}`)
    }
  }

  if (command === 'menuedit') {
    if (m.sender !== ownerJid && !m.fromMe) return m.reply('⛔ Solo owner')
    if (!text || text.length < 30) return m.reply(`Pega tu menú nuevo así:\n${usedPrefix}menuedit Hola soy ForThreePro...\n\nPuedes usar {user}, {fecha}, {hora}`)

    try {
      let code = fs.readFileSync(menuPath, 'utf-8')
      fs.copyFileSync(menuPath, './plugins/menu.js.bak')

      // Convertimos tus variables fáciles a las del bot
      let nuevoTexto = text
        .replace(/{user}/g, '${userName}')
        .replace(/{fecha}/g, '${fecha2}')
        .replace(/{hora}/g, '${hora}')
        .replace(/`/g, "'") // evitamos que rompa el código

      // Reemplaza el primer bloque del menú
      let newCode = code.replace(/let menuTexto = `[\s\S]*?`/, `let menuTexto = \`${nuevoTexto}\``)

      if (newCode === code) return m.reply('❌ No pude encontrar el diseño en menu.js')
      
      fs.writeFileSync(menuPath, newCode)
      await m.reply(`✅ *MENU CAMBIADO*\n\nListo pe, ya se guardó tu nuevo diseño.\nHaz .menu1 de nuevo para verlo.`)
    } catch(e) {
      m.reply(`❌ ${e.message}`)
    }
  }
}

handler.help = ['menu1', 'menuedit']
handler.tags = ['owner']
handler.command = ['menu1', 'menuedit']
export default handler