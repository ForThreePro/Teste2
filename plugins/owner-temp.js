import fs from 'fs'
import moment from 'moment-timezone'
moment.locale('es')

const filePath = './temp_groups.json'
const OWNER_NUMBERS = ['51927174369']
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]')
global.tempGroups = JSON.parse(fs.readFileSync(filePath))
const save = () => fs.writeFileSync(filePath, JSON.stringify(global.tempGroups, null, 2))
const isOwner = (m) => OWNER_NUMBERS.includes(m.sender.replace('@s.whatsapp.net',''))
const react = async (conn,m,t) => { try{ await conn.sendMessage(m.chat,{react:{text:t,key:m.key}}) }catch{} }
const msToTime = (ms) => {
  let d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000)
  return `${d?d+'d ':''}${h?h+'h ':''}${m?m+'m':''}`.trim()||'0m'
}
const getHeadFoot = () => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`
  return { head, foot }
}

setInterval(async () => {
  if (!global.conn) return
  const now = Date.now()
  let toRemove = []
  for (let i of global.tempGroups) {
    const { head, foot } = getHeadFoot()
    if (i.exitTime - now <= 300000 && i.exitTime - now > 0 && !i.warned) {
      try { await global.conn.sendMessage(i.id, { text: head + `\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ AVISO ：✿ 。\n\n⏰ El bot se irá en 5 minutos 👻` + foot }); i.warned = true; save() } catch {}
    }
    if (now >= i.exitTime) {
      try {
        await global.conn.sendMessage(i.id, { text: head + `\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ SALIDA ：✿ 。\n\n👋 Tiempo terminado, saliendo... ❄️` + foot })
        await new Promise(r=>setTimeout(r,1200))
        await global.conn.groupLeave(i.id)
      } catch {}
      toRemove.push(i.id)
    }
  }
  if (toRemove.length) { global.tempGroups = global.tempGroups.filter(v=>!toRemove.includes(v.id)); save() }
}, 30000)

let handler = async (m, { conn, args, command }) => {
  const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
  const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
  const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

  if (!isOwner(m)) { await react(conn,m,"❌"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ ERROR ：✿ 。\n\n❌ Solo dueño del sistema` + foot) }
  if (command === 'templist') {
    if (!global.tempGroups.length) { await react(conn,m,"⚠️"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ LISTA ：✿ 。\n\n⚠️ Sin grupos temporizados` + foot) }
    let list = global.tempGroups.map((v,i)=>`${i+1}. *${v.name}* - ${msToTime(v.exitTime-Date.now())}`).join('\n')
    await react(conn,m,"📋"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ LISTA ：✿ 。\n\n📋 *Grupos temporizados:*\n${list}` + foot)
  }
  if (command === 'tempcancel') {
    let idx = global.tempGroups.findIndex(v=>v.id===m.chat)
    if (idx===-1) { await react(conn,m,"⚠️"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ ERROR ：✿ 。\n\n⚠️ Sin temporizador activo` + foot) }
    global.tempGroups.splice(idx,1); save()
    await react(conn,m,"❄️"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ CANCELADO ：✿ 。\n\n❄️ Temporizador cancelado` + foot)
  }
  // temporizador / temp
  if (!m.isGroup) { await react(conn,m,"❌"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ ERROR ：✿ 。\n\n❌ Solo en grupos` + foot) }
  if (!args[0]) { await react(conn,m,"❌"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ USO ：✿ 。\n\n⏰ Usa: *.temp 1h* / *.temp 30m* / *.temp 1d*` + foot) }
  let ms=0, rx=/(\d+)([dhm])/g, mt
  while((mt=rx.exec(args[0].toLowerCase()))!==null){ let v=parseInt(mt[1]); if(mt[2]==='d')ms+=v*86400000; if(mt[2]==='h')ms+=v*3600000; if(mt[2]==='m')ms+=v*60000 }
  if (ms<60000) { await react(conn,m,"❌"); return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ ERROR ：✿ 。\n\n❌ Mínimo 1m` + foot) }

  let idx = global.tempGroups.findIndex(v=>v.id===m.chat)
  if(idx!==-1) global.tempGroups.splice(idx,1)
  global.tempGroups.push({ id:m.chat, name: await conn.getName(m.chat), exitTime: Date.now()+ms, warned:false })
  save()
  await react(conn,m,"❄️")
  return m.reply(head+`\n⤷ ┇ 𝐓𝐄𝐌𝐏 ﹒ ACTIVADO ：✿ 。\n\n❄️ Temporizador activado: *${msToTime(ms)}*` + foot)
}

handler.help = ['temporizador 30d','tempcancel','templist']
handler.tags = ['grupos']
handler.command = ['temporizador','temp','tempcancel','templist']
export default handler