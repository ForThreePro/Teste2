import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, text, command }) => {

  // 1. paja / pajeame - FIXED
  if (['paja', 'pajeame'].includes(command)) {
    let { key } = await conn.sendMessage(m.chat, { text: "Tas caliente! Ahora te hare una paja..." }, { quoted: m });
    const array = [
      "8==👊==D", "8===👊=D", "8=👊===D", "8=👊===D", "8==👊==D", "8===👊=D", "8====👊D", "8==👊=D", "8==👊==D", "8=👊===D", "8👊====D", "8=👊===D","8==👊==D", "8===👊=D", "8====👊D","8==👊==D", "8===👊=D", "8=👊===D", "8=👊===D", "8==👊==D", "8===👊=D", "8====👊D💦"
    ];
    for (let item of array) {
      await new Promise(resolve => setTimeout(resolve, 80)); // 80ms para que no se bugee
      try {
        await conn.sendMessage(m.chat, { text: `${item}`, edit: key }, { quoted: m });
      } catch {
        // Si el bot no soporta edit, manda mensaje normal
        await conn.sendMessage(m.chat, { text: `${item}` }, { quoted: m });
      }
    }
    try {
      return conn.sendMessage(m.chat, { text: `Oh, se corrió en menos de 1 hora!`, edit: key, mentions: [m.sender] }, { quoted: m });
    } catch {
      return conn.sendMessage(m.chat, { text: `Oh, se corrió en menos de 1 hora!`, mentions: [m.sender] }, { quoted: m });
    }
  }

  // 2. poeta
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

  // 3. formartrio - FIXED MENTIONS
  if (command == 'formartrio') {
    if (m.mentionedJid && m.mentionedJid.length === 2) {
      let person1 = m.mentionedJid[0];
      let person2 = m.mentionedJid[1];
      let name1 = await conn.getName(person1);
      let name2 = await conn.getName(person2);
      let name3 = await conn.getName(m.sender);
      const pp = './src/Imagen.jpg';

      let trio = `\t\t*TRIO VIOLENTOOOOO!*

@${person1.split('@')[0]} y @${person2.split('@')[0]} tienen un *${Math.floor(Math.random() * 100)}%* de compatibilidad como pareja.
Mientras que @${person1.split('@')[0]} y @${m.sender.split('@')[0]} tienen un *${Math.floor(Math.random() * 100)}%* de compatibilidad.
Y @${person2.split('@')[0]} y @${m.sender.split('@')[0]} tienen un *${Math.floor(Math.random() * 100)}%* de compatibilidad.
¿Qué opinas de un trío? 😏`;

      return conn.sendMessage(m.chat, { image: { url: pp }, caption: trio, mentions: [person1, person2, m.sender] }, { quoted: m });
    } else {
      return conn.reply(m.chat, `Menciona a 2 usuarios mas, para calcular la compatibilidad.\n\nEjemplo: ${usedPrefix}formartrio @user1 @user2`, m);
    }
  }

  // 4. embarazar / preg / preñar - FIXED MENTIONS
  if (['preg','embarazar','preñar'].includes(command)) {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    if (!who) return m.reply(`Etiqueta o menciona a alguien.\n\nEjemplo: ${usedPrefix + command} @tag`);

    let name = await conn.getName(who);
    let name2 = await conn.getName(m.sender);
    m.react('😏');
    let str = `@${m.sender.split('@')[0]} embarazo a @${who.split('@')[0]}`.trim();
    if (m.isGroup) {
      let pp = 'https://files.catbox.moe/054z2h.mp4'
      let pp2 = 'https://files.catbox.moe/3ucfc0.mp4'
      let pp3 = 'https://files.catbox.moe/brnwzh.mp4'
      const videos = [pp, pp2, pp3];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }

  // 5. follar / violar - FIXED MENTIONS
  if (/^(follar|violar)$/i.test(command)) {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    let target = who ? `@${who.split('@')[0]}` : text;
    if (!target) return m.reply(`*Ingresa el @ o responde al mensaje de la persona que quieres ${command}*`)

    let nameTarget = who ? await conn.getName(who) : text;
    
    let texto = `🤤👅🥵 *𝐀𝐂𝐀𝐁𝐀𝐒 𝐃𝐄 𝐅𝐎𝐋𝐋𝐀𝐑𝐓𝐄𝐋@!*🥵👅🤤

*𝙏𝙚 𝙖𝙘𝙖𝙗𝙖𝙨 𝙙𝙚 𝙛𝙤𝙡𝙡𝙖𝙧 𝙖 𝙡𝙖 𝙥𝙚𝙧𝙧𝙖 𝙙𝙚* *${target}* *𝙖 𝟰 𝙥𝙖𝙩𝙖𝙨 𝙢𝙞𝙚𝙣𝙩𝙧𝙖𝙨 𝙩𝙚 𝙜𝙚𝙢𝙞𝙖 𝙘𝙤𝙢𝙤 𝙪𝙣𝙖 𝙢𝙖𝙡𝙙𝙞𝙩𝙖 𝙥𝙚𝙧𝙧𝙖 "𝐀𝐚𝐚𝐡.., 𝐀𝐚𝐚𝐡𝐡, 𝐬𝐢𝐠𝐮𝐞, 𝐧𝐨 𝐩𝐚𝐫𝐞𝐬, 𝐧𝐨 𝐩𝐚𝐫𝐞𝐬.." 𝙮 𝙡𝙖 𝙝𝙖𝙨 𝙙𝙚𝙟𝙖𝙙𝙤 𝙩𝙖𝙣 𝙧𝙚𝙫𝙚𝙣𝙩𝙖𝙙𝙖 𝙦𝙪𝙚 𝙣𝙤 𝙥𝙪𝙚𝙙𝙚 𝙨𝙤𝙨𝙩𝙚𝙣𝙚𝙧 𝙣𝙞 𝙨𝙪 𝙥𝙧𝙤𝙥𝙞𝙤 𝙘𝙪𝙚𝙧𝙥𝙤 𝙡𝙖 𝙢𝙖𝙡𝙙𝙞𝙩𝙖 𝙯𝙤𝙧𝙧𝙖!*

*${target}*
🤤🥵 *¡𝐘𝐀 𝐓𝐄 𝐇𝐀𝐍 𝐅𝐎𝐋𝐋𝐀𝐃𝐎!* 🥵🤤`

    return conn.reply(m.chat, texto, m, { mentions: who ? [who, m.sender] : [m.sender] })
  }
};

handler.help = ['pajeame', 'poeta', 'formartrio @usuario1 @usuario2', 'embarazar @tag', 'follar @tag'];
handler.tags = ['fun'];
handler.command = ['paja', 'pajeame', 'poeta', 'formartrio', 'preg', 'embarazar', 'preñar', 'follar', 'violar'];
handler.group = true;
handler.register = false;

export default handler;