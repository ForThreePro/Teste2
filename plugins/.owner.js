import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const OWNER_NUMBERS = ['51927174639']
function isOwner(m) {
  let sender = m.sender.replace('@s.whatsapp.net','').replace(/[^0-9]/g,'')
  return OWNER_NUMBERS.includes(sender)
}

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
  const react = async (t) => {
    try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {}
  }

  /* ----------.ver ---------- */
  if (command === 'ver' || command === 'ver1') {
    if (!args[0]) return m.reply(`➛ ${usedPrefix+command} https://files.evogb.win/H63GM4.jpg`)
    let url = args[0].trim()
    try {
      await react('⏳')
      let res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) res = await fetch(url, { headers: { Range: 'bytes=0-0' } })
      if (!res.ok) throw new Error('Link caído 404')
      let type = res.headers.get('content-type') || 'desconocido'
      let size = res.headers.get('content-length')
      let name = decodeURIComponent(url.split('/').pop())
      let sizeTxt = size? `${(size/1024/1024).toFixed(2)} MB` : 'desconocido'
      await react('✅')
      return m.reply(`𐔌 ꒱ ***VERIFICADOR*** 𐔌 ꒱ ✅\n\n── *🔗 LINK* ╏\n➛ ${url}\n── *📊 INFO* ╏\n📄 ➛ Archivo: ${name}\n📁 ➛ Tipo: ${type}\n📦 ➛ Peso: ${sizeTxt}\n✅ ➛ Estado: Activo\n━━━━━━━━━━━`)
    } catch(e) {
      await react('❌')
      return m.reply(`❌ Error: ${e.message}`)
    }
  }

  /* ----------.ver2 ---------- */
  if (command === 'ver2') {
    if (!text) return m.reply(`➛ ${usedPrefix+command} https://files.evogb.win/\n➛ ${usedPrefix+command} H63GM4`)
    let query = text.trim()
    let files = fs.readdirSync('./plugins').filter(f=>f.endsWith('.js'))
    let encontrados = []
    for (let file of files) {
      let c = fs.readFileSync(path.join('./plugins',file),'utf-8')
      if (c.includes(query)) {
        let count = c.split(query).length-1
        encontrados.push(`│ ${encontrados.length+1}. ${file} (${count}x)`)
      }
    }
    if (!encontrados.length) return m.reply(`❌ Ningún plugin usa:\n${query}`)
    return m.reply(`𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ 🔍\n\n── *🔗 BUSQUEDA* ╏\n➛ ${query}\n── *📂 ENCONTRADO EN* ╏\n${encontrados.join('\n')}\n── *📊 TOTAL* ╏\n📦 ➛ ${encontrados.length} archivos\n━━━━━━━━━━━`)
  }

  /* ----------.edit ---------- */
  if (command === 'edit') {
    if (!isOwner(m)) { await react('⛔'); return m.reply('⛔ Solo owner') }
    if (!text.includes('|')) return m.reply(`➛ ${usedPrefix+command} link_viejo | link_nuevo\nEjemplo:\n${usedPrefix+command} https://files.evogb.win/H63GM4.jpg | https://files.catbox.moe/nuevo.jpg`)
    let [viejo,nuevo] = text.split('|').map(s=>s.trim())
    if (!viejo ||!nuevo) return m.reply('❌ Faltan datos')
    await react('⏳')
    let files = fs.readdirSync('./plugins').filter(f=>f.endsWith('.js'))
    let cambiados = []
    let total = 0
    for (let file of files) {
      let fp = path.join('./plugins',file)
      let c = fs.readFileSync(fp,'utf-8')
      if (c.includes(viejo)) {
        let count = c.split(viejo).length-1
        total+=count
        fs.copyFileSync(fp, fp+'.bak')
        fs.writeFileSync(fp, c.split(viejo).join(nuevo))
        cambiados.push(`│ ${cambiados.length+1}. ${file} (${count}x)`)
      }
    }
    if (!cambiados.length) { await react('❌'); return m.reply('❌ No se encontró ese link') }
    await react('✅')
    return m.reply(`𐔌 ꒱ ***EDIT COMPLETO*** 𐔌 ꒱ ✅\n\n── *🔗 CAMBIO* ╏\n❌ ➛ ${viejo}\n✅ ➛ ${nuevo}\n── *📂 MODIFICADOS* ╏\n${cambiados.join('\n')}\n── *📊 RESUMEN* ╏\n🔁 ➛ ${total} reemplazos\n💾 ➛ Backup.bak creado\n🔄 ➛ Reinicia el bot\n━━━━━━━━━━━`)
  }
}

handler.help = ['ver <link>', 'ver2 <link>', 'edit <viejo> | <nuevo>']
handler.tags = ['tools','owner']
handler.command = ['ver','ver1','ver2','edit']

export default handler