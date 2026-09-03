import fs from 'fs'
import path from 'path'
import axios from 'axios'

let handler = async (m, { conn, args, command, text }) => {

  // 1..obtener + nombre.js
  if (command === 'obtener') {
    if (!args[0]) return m.reply(`🐱 *𝗖𝗢𝗧𝗜 𝗕𝗢𝗧𝗦 𝗫 𝗠𝗔𝗥𝗜𝗘* 🐱\n\n*Uso:* *.obtener nombre.js*`)

    let fileName = args[0].endsWith('.js')? args[0] : args[0] + '.js'
    let filePath = path.join('./plugins', fileName)

    if (!fs.existsSync(filePath)) return m.reply(`❌ *Marie dice:* No encontré el archivo *${fileName}*`)

    try {
      let fileContent = fs.readFileSync(filePath, 'utf-8')

      if (fileContent.length > 3000) {
        await conn.sendMessage(m.chat, {
          document: Buffer.from(fileContent),
          mimetype: 'text/javascript',
          fileName: fileName,
          caption: `🐱 𓆩 𝗔𝗥𝗖𝗛𝗜𝗩𝗢 𝗘𝗡𝗩𝗜𝗔𝗗𝗢 𓆪 🐱\n\n💖 *Archivo:* ${fileName}`
        }, { quoted: m })
      } else {
        await m.reply(`🐱 𓆩 𝗖𝗢𝗡𝗧𝗘𝗡𝗜𝗗𝗢 𝗗𝗘 ${fileName.toUpperCase()} 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`COTTI BOTS\`\` —˙𖦹.💖꒷

\`\`javascript
${fileContent}
\`\`

━━━━━━━━━━━
*Powered by*: ***COTTI BOTS x Marie*** 🌸`)
      }
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      m.reply(`❌ Error al leer: ${e.message}`)
    }
  }

  // 2..edit + nombre.js / texto nuevo
  if (command === 'edit') {
    if (!args[0] ||!text.includes('/')) return m.reply(`🐱 *𝗖𝗢𝗧𝗜 𝗕𝗢𝗧𝗦 𝗫 𝗠𝗔𝗥𝗜𝗘* 🐱\n\n*Uso:* *.edit nombre.js / texto nuevo*`)

    let [fileName,...newText] = text.split('/')
    fileName = fileName.trim()
    newText = newText.join('/').trim()

    fileName = fileName.endsWith('.js')? fileName : fileName + '.js'
    let filePath = path.join('./plugins', fileName)

    try {
      fs.writeFileSync(filePath, newText, 'utf-8')
      await m.reply(`🐱 𓆩 𝗔𝗥𝗖𝗛𝗜𝗩𝗢 𝗘𝗗𝗜𝗧𝗔𝗗𝗢 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`COTTI BOTS\`\` —˙𖦹.💖꒷

──🌸 *DATOS* ╏ 💚
💚 ➛ *Archivo:* ${fileName}
💚 ➛ *Estado:* Guardado correctamente

━━━━━━━━━━━
*Reinicia el bot para aplicar cambios*`)
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      m.reply(`❌ Error al guardar: ${e.message}`)
    }
  }

  // 3..crear + nombre.js / codigo
  if (command === 'crear') {
    if (!args[0] ||!text.includes('/')) return m.reply(`🐱 *𝗖𝗢𝗧𝗜 𝗕𝗢𝗧𝗦 𝗫 𝗠𝗔𝗥𝗜𝗘* 🐱\n\n*Uso:* *.crear nombre.js / codigo del plugin*`)

    let [fileName,...code] = text.split('/')
    fileName = fileName.trim()
    code = code.join('/').trim()

    fileName = fileName.endsWith('.js')? fileName : fileName + '.js'
    let filePath = path.join('./plugins', fileName)

    if (fs.existsSync(filePath)) return m.reply(`❌ *Marie dice:* El archivo *${fileName}* ya existe. Usa *.edit* para modificarlo.`)

    try {
      fs.writeFileSync(filePath, code, 'utf-8')
      await m.reply(`🐱 𓆩 𝗔𝗥𝗖𝗛𝗜𝗩𝗢 𝗖𝗥𝗘𝗔𝗗𝗢 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`COTTI BOTS\`\` —˙𖦹.💖꒷

──🌸 *DATOS* ╏ 💚
💚 ➛ *Archivo:* ${fileName}
💚 ➛ *Estado:* Creado correctamente

━━━━━━━━━━━
*Reinicia el bot para cargar el plugin*`)
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      m.reply(`❌ Error al crear: ${e.message}`)
    }
  }

  // 4..del + nombre.js
  if (command === 'del') {
    if (!args[0]) return m.reply(`🐱 *𝗖𝗢𝗧𝗜 𝗕𝗢𝗧𝗦 𝗫 𝗠𝗔𝗥𝗜𝗘* 🐱\n\n*Uso:* *.del nombre.js*`)

    let fileName = args[0].endsWith('.js')? args[0] : args[0] + '.js'
    let filePath = path.join('./plugins', fileName)

    if (!fs.existsSync(filePath)) return m.reply(`❌ *Marie dice:* No encontré el archivo *${fileName}*`)

    try {
      fs.unlinkSync(filePath)
      await m.reply(`🐱 𓆩 𝗔𝗥𝗖𝗛𝗜𝗩𝗢 𝗘𝗟𝗜𝗠𝗜𝗡𝗔𝗗𝗢 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`COTTI BOTS\`\` —˙𖦹.💖꒷

──🌸 *DATOS* ╏ 💚
💚 ➛ *Archivo:* ${fileName}
💚 ➛ *Estado:* Eliminado correctamente

━━━━━━━━━━━`)
      await m.react('🗑️')
    } catch (e) {
      await m.react('❌')
      m.reply(`❌ Error al eliminar: ${e.message}`)
    }
  }

  // 5..ver1 = ver lista de archivos del github
  if (command === 'ver1') {
    try {
      await m.react('⏳')
      const repo = 'Teste2'
      const branch = 'main'
      const url = `https://api.github.com/repos/${repo}/contents/plugins?ref=${branch}`

      const { data } = await axios.get(url)
      let jsFiles = data.filter(f => f.name.endsWith('.js')).map((f, i) => `│ ${i+1}. ${f.name}`).join('\n')

      await m.reply(`🐱 𓆩 𝗟𝗜𝗦𝗧𝗔 𝗗𝗘 𝗣𝗟𝗨𝗚𝗜𝗡𝗦 𝗚𝗜𝗧𝗛𝗨𝗕 𓆪 🐱

.⃟𖥔 ݁. 𖦹˙— \`\`COTTI BOTS\`\` —˙𖦹.💖꒷

│
${jsFiles || '│ No hay archivos.js'}
│
━━━━━━━━━━━
*Total:* ${jsFiles.split('\n').length} archivos
*Repo:* ${repo}
*Powered by*: ***COTTI BOTS x Marie*** 🌸`)
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      m.reply(`❌ Error al obtener lista: ${e.message}\n\n*Verifica el nombre del repo en el codigo*`)
    }
  }
}

handler.help = ['obtener <archivo>', 'edit <archivo> / <texto>', 'crear <archivo> / <codigo>', 'del <archivo>', 'ver1']
handler.tags = ['tools']
handler.command = ['obtener', 'edit', 'crear', 'del', 'ver1']
// handler.rowner = true <- QUITADO

export default handler