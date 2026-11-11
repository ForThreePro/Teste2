import moment from 'moment-timezone'
moment.locale('es')

let user = a => '@' + a.split('@')[0]
const pickRandom = (l) => l[Math.floor(Math.random()*l.length)]

let handler = async (m, { groupMetadata, command, conn, text }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`

    if (!groupMetadata) return m.reply(head+`\n⤷ ┇ 𝐓𝐎𝐏 ﹒ ERROR ：✿ 。\n\n❌ Solo en grupos` + foot, m)
    if (!text) { await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐓𝐎𝐏 ﹒ USO ：✿ 。\n\n❄️ Usa: *.top <motivo>*\nEj: *.top Más activos*` + foot, m) }

    let ps = groupMetadata.participants.map(v=>v.id)
    // Quitar al bot para que no salga en el top
    ps = ps.filter(id => id !== conn.user.jid)
    if (ps.length < 10) { await react('⚠️'); return m.reply(head+`\n⤷ ┇ 𝐓𝐎𝐏 ﹒ ERROR ：✿ 。\n\n⚠️ Mínimo 10 usuarios` + foot, m) }

    // Shuffle real - 10 personas diferentes, sin repetir
    let shuffled = [...ps].sort(() => Math.random() - 0.5)
    let picks = shuffled.slice(0, 10)
    let x = pickRandom(['❄️','⛓️','⚡','👻','🦂','🧊','😈','🔮','💎','👑'])

    let top = head + `\n⤷ ┇ 𝐓𝐎𝐏 ﹒ ${text.toUpperCase()} ：✿ 。\n\n🏆 *TOP 10 ${text.toUpperCase()}* ${x}\n\n` +
      picks.map((p,i)=>`${x} *${i+1}.* ${user(p)}`).join('\n') +
      `\n\n🎲 Aleatorio del sistema` + foot

    await react(x)
    return m.reply(top, null, { mentions: picks })
}

handler.help = ['top <texto>']
handler.tags = ['fun']
handler.command = /^(top)$/i
handler.group = true
export default handler