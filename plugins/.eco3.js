let handler = async (m, { conn, usedPrefix, text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = { coin: 0, bank: 0, items: {} }

  const items = {
    'pico': { nombre: 'Pico Frost ⛏️', precio: 500, desc: 'Para minar más monedas en la cadena PHANTOM PLUS' },
    'escudo': { nombre: 'Escudo PHANTOM PLUS 🛡️', precio: 1000, desc: 'Protege contra robos, sistema blindado' },
    'vip': { nombre: 'VIP PHANTOM PLUS 👑', precio: 5000, desc: 'Ganancias x2 - Modo PHANTOM PLUS premium' },
    'cofre': { nombre: 'Cofre PHANTOM PLUS 🎁', precio: 300, desc: 'Premio 100-1000 monedas, sorpresa del sistema' },
    'pocion': { nombre: 'Poción Frost 🍀', precio: 800, desc: '+20% suerte, hielo eléctrico activado' }
  }

  if (!text || ['shop', 'tienda'].includes(command)) {
    let texto = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡
⤷ ┇ 𝐓𝐈𝐄𝐍𝐃𝐀 ﹒ 𝐏𝐇𝐀𝐍𝐓𝐎𝐌 𝐏𝐋𝐔𝐒
꒰ ◞⁺⊹ ．FROST MODE
> *"La bóveda PHANTOM PLUS está abierta"*

── *💰 TU SALDO* ╏ ❄️
🪙 ➛ Saldo: *${user.coin} monedas*
👻 ➛ Cliente: PHANTOM PLUS te atiende

── *🛒 PRODUCTOS* ╏ ⛓️

`
    for (let [id, item] of Object.entries(items)) {
      texto += `💎 *${item.nombre}*\n   💵 Precio: ${item.precio} 🪙\n   📝 ${item.desc}\n   🛒 Comprar: ${usedPrefix}buy ${id}\n\n`
    }
    texto += `━━━━━━━━━━━
⛓️ *PHANTOM PLUS - VENTAS* ⚡
🦂 *Contacto:* +51 927 174 369
📸 *Ig:* @whois.yallico
━━━━━━━━━━━`
    return m.reply(texto)
  }

  if (['buy', 'comprar'].includes(command)) {
    let item = items[text.toLowerCase()]
    if (!item) return m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n💀 Item no encontrado, ni PHANTOM PLUS lo tiene\n⚡ Usa ${usedPrefix}shop para ver la tienda\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`)
    if (user.coin < item.precio) return m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n⛓️ No tienes suficiente, te faltan ${item.precio - user.coin} 🪙\n👻 PHANTOM PLUS: "Sin dinero no hay sistema"\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`)

    user.coin -= item.precio
    user.items = user.items || {}
    user.items[text.toLowerCase()] = (user.items[text.toLowerCase()] || 0) + 1

    if (text.toLowerCase() === 'cofre') {
      let premio = Math.floor(Math.random() * 901) + 100
      user.coin += premio
      return m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n🎁 ¡Abriste un *Cofre PHANTOM PLUS*! 💎\n👻 PHANTOM PLUS te premió con *${premio} monedas* 🪙\n> *"Este cofre es especial"* ⚡\n\n💰 Saldo: ${user.coin} 🪙\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`)
    }
    return m.reply(`❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n✅ ¡Compra perfecta! 👻\n💎 Compraste *${item.nombre}* por ${item.precio} 🪙\n⚡ PHANTOM PLUS: "Buena elección"\n\n💰 Saldo: ${user.coin} 🪙\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`)
  }
}

handler.help = ['shop', 'buy']
handler.tags = ['economy']
handler.command = ['shop', 'tienda', 'buy', 'comprar']
handler.group = true
handler.register = false
export default handler