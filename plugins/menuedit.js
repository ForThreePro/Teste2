import fs from 'fs'
import path from 'path'

const MENU_PATH = './plugins/menu.js'
const OWNER_NUM = '51927174369'

function isOwner(m) {
  let sender = (m.sender || '').replace(/[^0-9]/g,'')
  return sender.endsWith(OWNER_NUM) || m.fromMe
}

// Limpia el código y deja solo el diseño con datos de ejemplo
function extraerDiseno() {
  let code = fs.readFileSync(MENU_PATH, 'utf-8')

  // saca todos los bloques `...` asignados a menuTexto
  let bloques = []
  let regex = /menuTexto\s*(\+=|=)\s*`([\s\S]*?)`/g
  let match
  while ((match = regex.exec(code))!== null) {
    bloques.push(match[2])
  }
  if (!bloques.length) return null

  let diseno = bloques.join('\n')

  // reemplaza variables por ejemplos
  const reemplazos = {
    '${estadoBot}': 'Estable • 5h 20m',
    '${ping}': '23',
    '${saludo}': 'Buenas noches',
    '${userName}': 'ForThreePro',
    '${fraseRandom}': 'Dame lasaña o dame sueño',
    '${CANAL_LINK}': 'https://whatsapp.com/channel/0029Vb8emrOJuyACodGSbP0z',
    '${totalUsers}': '1250',
    '${pluginsCount}': '180',
    '${ownerNum}': '51927174369',
    '${ram}': '85.40',
    '${totalram}': '16.00',
    '${fecha}': 'viernes',
    '${fecha2}': '25 de septiembre de 2026',
    '${hora}': '11:45:20 pm',
    '${nombreCat}': 'INFO',
    '${cmds.length}': '5',
    '${icono}': 'ℹ️',
    '${c}': 'owner',
    '${i+1}': '1',
    '${c}': 'menu',
  }
  // reemplazo simple
  for (let k in reemplazos) {
    diseno = diseno.split(k).join(reemplazos[k])
  }
  // limpia cualquier ${...} restante
  diseno = diseno.replace(/\$\{[^}]+\}/g, 'ejemplo')
  // limpia ${TOP_COMANDOS...}
  diseno = diseno.replace(/\$\{TOP_COMANDOS[\s\S]*?\}/g, '1..play | 2..sticker | 3..ia')

  return diseno.trim()
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (command === 'menu1') {
    try {
      let diseno = extraerDiseno()
      if (!diseno) return m.reply('❌ No pude extraer el diseño de menu.js')
      // lo manda como texto para copiar fácil
      await conn.sendMessage(m.chat, { text: `🎨 *DISEÑO ACTUAL DEL MENU*\nUsuario: ForThreePro\nGithub: Teste2\n\n━━━━━━━━━━━\n\n${diseno}\n\n━━━━━━━━━━━\n\n💡 Para cambiarlo usa:\n${usedPrefix}menuedit tu nuevo diseño aquí` }, { quoted: m })
    } catch(e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }

  if (command === 'menuedit') {
    if (!isOwner(m)) return m.reply('⛔ Solo owner')
    if (!text || text.length < 20) return m.reply(`➛ ${usedPrefix}menuedit *pega aquí tu menú completamente nuevo*\n\nPuedes usar:\n{user} = nombre\n{saludo} = saludo\n{fecha} = fecha\n{totalUsers} = usuarios`)

    try {
      let code = fs.readFileSync(MENU_PATH, 'utf-8')
      // hacemos backup
      fs.copyFileSync(MENU_PATH, MENU_PATH + '.bak')

      // Convertimos tus placeholders a variables reales
      let nuevoDiseno = text
       .replace(/{user}/g, '${userName}')
       .replace(/{saludo}/g, '${saludo}')
       .replace(/{fecha}/g, '${fecha2}')
       .replace(/{totalUsers}/g, '${totalUsers}')

      // Reemplazamos SOLO el primer bloque: let menuTexto = `...`
      // Usamos una función para no romper el resto de categorías
      let nuevoCode = code.replace(
        /let menuTexto = `[\s\S]*?`/m,
        `let menuTexto = \`${nuevoDiseno}\``
      )

      if (nuevoCode === code) return m.reply('❌ No encontré el bloque menuTexto en menu.js')

      fs.writeFileSync(MENU_PATH, nuevoCode)
      m.reply(`✅ *MENU CAMBIADO*\n\nUsuario: ForThreePro\n\nTu nuevo diseño ya está guardado pe.\nReinicia el bot y prueba con.menu\n\nSe creó backup en menu.js.bak por si no te gusta.`)
    } catch(e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
}

handler.help = ['menu1', 'menuedit <nuevo menu>']
handler.tags = ['tools', 'owner']
handler.command = ['menu1', 'menuedit']

export default handler