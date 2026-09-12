import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, text, command }) => {

  // 1. poeta
  if (command == 'poeta') {
    try {
      const frasesDePoeta = [
        "El amor es la poesía de los sentidos. - Honoré de Balzac",
        "En un beso, sabrás todo lo que he callado. - Pablo Neruda",
        "Ama y haz lo que quieras. Si callas, callarás con amor; si gritas, gritarás con amor. - San Agustín",
        "El amor no tiene cura, pero es la única cura para todos los males. - Leonard Cohen"
      ];
      const fraseAleatoria = frasesDePoeta[Math.floor(Math.random() * frasesDePoeta.length)];
      const apiUrl = `https://nightapi-6hbx.onrender.com/api/mayeditor?url=https://files.catbox.moe/vf6lhl.png&texto=${encodeURIComponent(fraseAleatoria)}&textodireccion=Arriba%20Izquierda&opacity=0.8&fontsize=60`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data.edited_url) {
        await conn.sendFile(m.chat, data.edited_url, 'poeta.jpg', `¡Aquí tienes tu frase de poeta! UwU`, m);
      } else {
        await conn.reply(m.chat, '¡Ups! No pude crear la imagen del poeta (╥﹏╥)', m);
      }
    } catch (error) {
      console.error(error);
      await conn.reply(m.chat, '¡Ay! Algo salió mal, no pude traer la frase del poeta :(', m);
    }
    return
  }

  // 2. embarazar / preg / preñar - FIXED
  if (['preg','embarazar','preñar'].includes(command)) {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    if (!who) return m.reply(`Etiqueta o responde al mensaje de alguien.\n\nEjemplo: ${usedPrefix + command} @tag`);

    let senderName = m.name || await conn.getName(m.sender).catch(_ => 'Usuario');
    let targetName = await conn.getName(who).catch(_ => 'Usuario');
    
    m.react('😏');
    let str = `@${m.sender.split('@')[0]} embarazo a @${who.split('@')[0]}`;
    
    if (m.isGroup) {
      let pp = 'https://files.catbox.moe/054z2h.mp4'
      let pp2 = 'https://files.catbox.moe/3ucfc0.mp4'
      let pp3 = 'https://files.catbox.moe/brnwzh.mp4'
      const videos = [pp, pp2, pp3];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }

  // 3. follar / violar - FIXED
  if (/^(follar|violar)$/i.test(command)) {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    if (!who && !text) return m.reply(`*Etiqueta o responde al mensaje de la persona que quieres ${command}*`)
    
    let targetMention = who ? `@${who.split('@')[0]}` : text;
    let mentionsArray = who ? [who, m.sender] : [m.sender];
    
    let texto = `🤤👅🥵 *𝐀𝐂𝐀𝐁𝐀𝐒 𝐃𝐄 𝐅𝐎𝐋𝐋𝐀𝐑𝐓𝐄𝐋@!*🥵👅🤤

*𝙏𝙚 𝙖𝙘𝙖𝙗𝙖𝙨 𝙙𝙚 𝙛𝙤𝙡𝙡𝙖𝙧 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙧𝙖 𝙙𝙚* ${targetMention} *𝙖 𝟰 𝙥𝙖𝙩𝙖𝙨 𝙢𝙞𝙚𝙣𝙩𝙧𝙖𝙨 𝙩𝙚 𝙜𝙚𝙢𝙞𝙖 𝙘𝙤𝙢𝙤 𝙪𝙣𝙖 𝙢𝙖𝙡𝙙𝙞𝙩𝙖 𝙥𝙚𝙧𝙧𝙖 "𝐀𝐚𝐚𝐡.., 𝐀𝐚𝐚𝐡𝐡, 𝐬𝐢𝐠𝐮𝐞, 𝐧𝐨 𝐩𝐚𝐫𝐞𝐬, 𝐧𝐨 𝐩𝐚𝐫𝐞𝐬.." 𝙮 𝙡𝙖 𝙝𝙖𝙨 𝙙𝙚𝙟𝙖𝙙𝙤 𝙩𝙖𝙣 𝙧𝙚𝙫𝙚𝙣𝙩𝙖𝙙𝙖 𝙦𝙪𝙚 𝙣𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙤𝙨𝙩𝙚𝙣𝙚𝙧 𝙣𝙞 𝙨𝙪 𝙥𝙧𝙤𝙥𝙞𝙤 𝙘𝙪𝙚𝙧𝙥𝙤 𝙡𝙖 𝙢𝙖𝙡𝙙𝙞𝙩𝙖 𝙯𝙤𝙧𝙧𝙖!*

${targetMention}
🤤🥵 *¡𝐘𝐀 𝐓𝐄 𝐇𝐀𝐍 𝐅𝐎𝐋𝐋𝐀𝐃𝐎!* 🥵🤤`

    return conn.reply(m.chat, texto, m, { mentions: mentionsArray })
  }
};

handler.help = ['poeta', 'embarazar @tag', 'follar @tag'];
handler.tags = ['fun'];
handler.command = ['poeta', 'preg', 'embarazar', 'preñar', 'follar', 'violar'];
handler.group = true;
handler.register = false;

export default handler;