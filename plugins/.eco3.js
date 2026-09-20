let handler = async (m, { conn, usedPrefix, text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = { coin: 0, bank: 0, items: {} }

  const items = {
    'pico': { nombre: 'Pico ⛏️', precio: 500, desc: 'Para minar más monedas como Garfield mina lasaña' },
    'escudo': { nombre: 'Escudo Jon 🛡️', precio: 1000, desc: 'Protege contra robos, ni Odie te roba' },
    'vip': { nombre: 'VIP Garfield 👑', precio: 5000, desc: 'Ganancias x2 - Modo Garfield premium' },
    'cofre': { nombre: 'Cofre de Lasaña 🎁', precio: 300, desc: 'Premio 100-1000 monedas, sorpresa de Garfield' },
    'pocion': { nombre: 'Poción Lunes 🍀', precio: 800, desc: '+20% suerte, anti-lunes de Garfield' }
  }

  if (!text || ['shop', 'tienda'].includes(command)) {
    let texto = `😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕
⤷ ┇ 𝐓𝐈𝐄𝐍𝐃𝐀 ﹒ 𝐆𝐀𝐑𝐅𝐈𝐄𝐋𝐃 ：✿ 。
> *"La tienda de lasaña de Garfield está abierta"*

── *💰 TU SALDO* ╏ 🍕
🪙 ➛ Saldo: *${user.coin} monedas*
😼 ➛ Cliente: Garfield te atiende

── *🛒 PRODUCTOS* ╏ 🍝

`
    for (let [id, item] of Object.entries(items)) {
      texto += `🍕 *${item.nombre}*\n   💵 Precio: ${item.precio} 🪙\n   📝 ${item.desc}\n   🛒 Comprar: ${usedPrefix}buy ${id}\n\n`
    }
    texto += `━━━━━━━━━━━
🍕 *LUX X YALLICO - GARFIELD EDITION* 😼
> "Odio los lunes, pero amo vender" 😼`
    return m.reply(texto)
  }

  if (['buy', 'comprar'].includes(command)) {
    let item = items[text.toLowerCase()]
    if (!item) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n😿 Item no encontrado, ni Garfield lo tiene\n🍕 Usa ${usedPrefix}shop para ver la tienda`)
    if (user.coin < item.precio) return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🍝 No tienes suficiente, te faltan ${item.precio - user.coin} 🪙\n😴 Garfield: "Sin dinero no hay lasaña"`)

    user.coin -= item.precio
    user.items = user.items || {}
    user.items[text.toLowerCase()] = (user.items[text.toLowerCase()] || 0) + 1

    if (text.toLowerCase() === 'cofre') {
      let premio = Math.floor(Math.random() * 901) + 100
      user.coin += premio
      return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n🎁 ¡Abriste un *Cofre de Lasaña*! 🍝\n😸 Garfield te premió con *${premio} monedas* 🪙\n> *"Esta lasaña es especial"* 😼\n\n💰 Saldo: ${user.coin} 🪙`)
    }
    return m.reply(`😼 𓆩 𝗟𝗨𝗫 𝗫 𝗬𝗔𝗟𝗟𝗜𝗖𝗢 𓆪 🍕\n\n✅ ¡Compra purrfecta! 😸\n🍕 Compraste *${item.nombre}* por ${item.precio} 🪙\n😼 Garfield: "Buena elección, humano"\n\n💰 Saldo: ${user.coin} 🪙`)
  }
}

handler.help = ['shop', 'buy']
handler.tags = ['economy']
handler.command = ['shop', 'tienda', 'buy', 'comprar']
handler.group = true
handler.register = false
export default handler