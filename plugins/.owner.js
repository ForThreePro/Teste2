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
  const urlRegex = /https?:\/\/[^\s"'`\)]+/g

  /* ---------- .ver ---------- */
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

  /* ---------- .ver2 ---------- */
  if (command === 'ver2') {
    if (!text) return m.reply(`➛ ${usedPrefix+command} https://files.evogb.win/`)
    let query = text.trim()
    let files = fs.readdirSync('./plugins').filter(f=>f.endsWith('.js'))
    let encontrados = []
    let linksSet = new Set()
    for (let file of files) {
      let c = fs.readFileSync(path.join('./plugins',file),'utf-8')
      if (c.includes(query)) {
        let urls = c.match(urlRegex) || []
        urls.filter(u => u.includes(query)).forEach(u => linksSet.add(u))
        let count = c.split(query).length-1
        encontrados.push(`│ ${encontrados.length+1}. ${file} (${count}x)`)
      }
    }
    if (!encontrados.length) return m.reply(`❌ Ningún plugin usa:\n${query}`)
    let linksList = [...linksSet].slice(0,20).map((u,i)=>`│ ${i+1}. ${u}`).join('\n')
    return m.reply(`𐔌 ꒱ ***BUSCADOR*** 𐔌 ꒱ 🔍\n\n── *🔗 BUSQUEDA* ╏\n➛ ${query}\n── *📂 ARCHIVOS* ╏\n${encontrados.join('\n')}\n── *🔗 LINKS* ╏\n${linksList}\n━━━━━━━━━━━`)
  }

  /* ---------- .obtener ---------- */
  if (command === 'obtener') {
    if (!args[0]) return m.reply(`➛ ${usedPrefix+command} menu.js\n➛ ${usedPrefix+command} menu.js files.evogb.win`)
    let fileName = args[0].trim()
    if (!fileName.endsWith('.js')) fileName += '.js'
    let filtro = args[1] ? args[1].trim() : null
    let fp = path.join('./plugins', fileName)
    if (!fs.existsSync(fp)) return m.reply(`❌ No existe: ${fileName}`)
    let c = fs.readFileSync(fp,'utf-8')
    let urls = c.match(urlRegex) || []
    if (filtro) urls = urls.filter(u => u.includes(filtro))
    urls = [...new Set(urls)]
    if (!urls.length) return m.reply(`❌ No hay links en ${fileName}${filtro?` con filtro ${filtro}`:''}`)
    // manda solo los links, limpio para copiar
    return m.reply(urls.join('\n'))
  }

  /* ---------- .edit ---------- */
  if (command === 'edit') {
    if (!isOwner(m)) { await react('⛔'); return m.reply('⛔ Solo owner') }
    if (!text.includes('|')) return m.reply(`➛ ${usedPrefix+command} link_viejo | link_nuevo`)
    let [viejo,nuevo] = text.split('|').map(s=>s.trim())
    if (!viejo ||!nuevo) return m.reply('❌ Faltan datos')
    await react('⏳')
    let files = fs.readdirSync('./plugins').filter(f=>f.endsWith('.js'))
    let cambiados = []
    let total = 0
    for (let file of files) {
      let fpath = path.join('./plugins',file)
      let c = fs.readFileSync(fpath,'utf-8')
      if (c.includes(viejo)) {
        let count = c.split(viejo).length-1
        total+=count
        fs.copyFileSync(fpath, fpath+'.bak')
        fs.writeFileSync(fpath, c.split(viejo).join(nuevo))
        cambiados.push(`│ ${cambiados.length+1}. ${file} (${count}x)`)
      }
    }
    if (!cambiados.length) { await react('❌'); return m.reply('❌ No se encontró') }
    await react('✅')
    return m.reply(`𐔌 ꒱ ***EDIT*** 𐔌 ꒱ ✅\n\n❌ ➛ ${viejo}\n✅ ➛ ${nuevo}\n\n${cambiados.join('\n')}\n\n🔁 ${total} reemplazos | 🔄 Reinicia el bot`)
  }
}

handler.help = ['ver <link>', 'ver2 <link>', 'obtener <archivo>', 'edit <viejo> | <nuevo>']
handler.tags = ['tools','owner']
handler.command = ['ver','ver1','ver2','obtener','getlink','edit']

export default handler