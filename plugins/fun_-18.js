let handler = async (m, { conn, usedPrefix, text, command }) => {

  // 1. matar / kill
  if (['matar', 'kill'].includes(command)) {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    await conn.sendMessage(m.chat, { react: { text: '🗡', key: m.key } })
    let str = `${name2} mató a ${name}`.trim();
    if (m.isGroup) {
      let videos = [
        'https://qu.ax/GQLO.mp4',
        'https://qu.ax/bzFY.mp4',
        'https://qu.ax/OQFE.mp4',
        'https://qu.ax/GQLO.mp4',
        'https://qu.ax/GssX.mp4'
      ];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }

  // 2. nalguear
  if (command == 'nalguear') {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    await conn.sendMessage(m.chat, { react: { text: '😝', key: m.key } })
    let str = `${name2} nalgueó a ${name}`.trim();
    if (m.isGroup) {
      let videos = [
        'https://telegra.ph/file/d4b85856b2685b5013a8a.mp4',
        'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4',
        'https://telegra.ph/file/f830f235f844e30d22e8e.mp4',
        'https://telegra.ph/file/07fe0023525be2b2579f9.mp4',
        'https://telegra.ph/file/99e036ac43a09e044a223.mp4'
      ];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }

  // 3. feliz / happy / alegre
  if (['feliz', 'happy','alegre'].includes(command)) {
    let name2 = conn.getName(m.sender);
    m.react('😁');
    let str = `${name2} se encuentra feliz`.trim();

    if (m.isGroup) {
      let videos = [
        'https://files.catbox.moe/92bs9b.mp4',
        'https://files.catbox.moe/d56pfs.mp4',
        'https://files.catbox.moe/kh6ii0.mp4',
        'https://files.catbox.moe/gmya70.mp4',
        'https://files.catbox.moe/6mjruj.mp4',
        'https://files.catbox.moe/kgggyv.mp4'
      ];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender] }, { quoted: m });
    }
  }

  // 4. huevo
  if (command == 'huevo') {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : text? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    if (!who) return m.reply(`Por favor, menciona a un usuario.`);

    let str = `@${m.sender.split('@')[0]} le está agarrando el huevo a @${who.split('@')[0]}.`;
    let mentionedJid = [who, m.sender];
    const msg = await conn.reply(m.chat, str, m, { mentions: mentionedJid });
    return conn.sendMessage(m.chat, { react: { text: '🍆', key: msg.key } });
  }

  // 5. acariciar / pat
  if (['pat','acariciar'].includes(command)) {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('💐');
    let str = `${name2} acarició a ${name}`.trim();
    if (m.isGroup) {
      let videos = [
        'https://telegra.ph/file/f75aed769492814d68016.mp4',
        'https://telegra.ph/file/4f24bb58fe580a5e97b0a.mp4',
        'https://telegra.ph/file/30206abdcb7b8a4638510.mp4',
        'https://telegra.ph/file/ecd7aeae5b2242c660d41.mp4',
        'https://telegra.ph/file/6d3ba201bcdd1fd2c1408.mp4',
        'https://telegra.ph/file/d5dbdcf845d2739dbe45e.mp4',
        'https://telegra.ph/file/c9a529908d4e0b71d7c5a.mp4',
        'https://telegra.ph/file/b7bc277ddef1af913827c.mp4',
        'https://telegra.ph/file/8b01e180dfb7e98d5a4f8.mp4',
        'https://telegra.ph/file/901f13852aa65f9628d96.mp4'
      ];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }

  // 6. correrse / cum - SIN NSFW CHECK
  if (command == 'cum') {
    let who = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : false;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('🥵');
    let str = `*${name2}* se corrió con *${name}*`.trim(); // texto cambiado
    if (m.isGroup) {
      let videos = [
        'https://files.catbox.moe/ps4qif.mp4',
        'https://files.catbox.moe/1g6hcl.mp4',
        'https://files.catbox.moe/qzsed0.mp4',
        'https://files.catbox.moe/4x2i8x.mp4',
        'https://files.catbox.moe/i02zhp.mp4',
        'https://files.catbox.moe/4ws6bs.mp4'
      ];
      const video = videos[Math.floor(Math.random() * videos.length)];
      return conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: [m.sender, who] }, { quoted: m });
    }
  }
};

handler.help = ['matar @tag', 'nalguear @tag', 'feliz', 'huevo @tag', 'acariciar @tag', 'cum @tag'];
handler.tags = ['fun'];
handler.command = ['matar', 'kill', 'nalguear', 'feliz', 'happy','alegre', 'huevo', 'pat','acariciar', 'cum'];
handler.group = true;
handler.register = false;

export default handler;