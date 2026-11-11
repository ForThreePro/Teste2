import fs from 'fs'
import os from 'os'
import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { tmpdir } from 'os'
import moment from 'moment-timezone'
moment.locale('es')

let handler = async (m, { conn, command, text, usedPrefix }) => {
    const fecha = moment.tz('America/Lima').format('DD/MM/YYYY hh:mm:ss a')
    const react = async (t) => { try { await conn.sendMessage(m.chat, { react: { text: t, key: m.key } }) } catch {} }
    const head = `❄️ 𓆩 𝗣𝗛𝗔𝗡𝗧𝗢𝗠 𝗣𝗟𝗨𝗦 𓆪 ⚡\n\n꒰ ◞⁺⊹ ．${fecha}\n`
    const foot = `\n\n━━━━━━━━━━━\n⛓️ *PHANTOM PLUS - VENTAS* ⚡\n🦂 *Contacto:* +51 927 174 369\n📸 *Ig:* @whois.yallico\n━━━━━━━━━━━`
    const clockString = (ms) => {
        let d=Math.floor(ms/86400000), h=Math.floor(ms/3600000)%24, mi=Math.floor(ms/60000)%60, s=Math.floor(ms/1000)%60
        return `${d}d ${h}h ${mi}m ${s}s`
    }

    if (command==='owner'||command==='creator') {
        await react('👑')
        return conn.sendMessage(m.chat, { text: head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ OWNER ：✿ 。\n\n👑 *Dueño del sistema:* +51 927 174 369\nwa.me/51927174369 ❄️` + foot, mentions:['51927174369@s.whatsapp.net'] }, { quoted:m })
    }
    if (command==='ping'||command==='p') {
        let start=Date.now(); await react('⚡')
        let speed=Date.now()-start
        return conn.reply(m.chat, head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ PING ：✿ 。\n\n👻 *Pong:* ${speed}ms ❄️` + foot, m)
    }
    if (command==='cleartmp') {
        const p='./tmp'; if(fs.existsSync(p)) fs.readdirSync(p).forEach(f=>fs.unlinkSync(`${p}/${f}`))
        await react('❄️'); return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ CLEAN ：✿ 。\n\n🗑️ Sistema limpiado` + foot)
    }
    if (command==='cpu') {
        await react('💻'); return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ CPU ：✿ 。\n\n💻 CPU del sistema: ${os.loadavg()[0].toFixed(2)}%` + foot)
    }
    if (command==='ram') {
        let ram=(process.memoryUsage().heapUsed/1024/1024).toFixed(2)
        await react('💾'); return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ RAM ：✿ 。\n\n💾 RAM del sistema: ${ram} MB` + foot)
    }
    if (command==='uptime') {
        await react('⏱️'); return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ UPTIME ：✿ 。\n\n⏱️ Tiempo en línea: ${clockString(process.uptime()*1000)}` + foot)
    }
    if (command==='info') {
        let ram=(process.memoryUsage().heapUsed/1024/1024).toFixed(2)
        await react('❄️')
        return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ INFO ：✿ 。\n\n❄️ *Info del Sistema*\n⏱️ ${clockString(process.uptime()*1000)}\n💾 ${ram} MB\n💻 ${os.loadavg()[0].toFixed(2)}%` + foot, m)
    }
    if (['tts','gtts','ttss'].includes(command)) {
        let txt = text || m.quoted?.text || ''
        if(!txt){ await react('❌'); return m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ TTS ：✿ 。\n\n❌ Usa: *${usedPrefix}tts Hola*` + foot, m) }
        try{
            await react('🎙️')
            let url = googleTTS.getAudioUrl(txt,{lang:'es',slow:false,host:'https://translate.google.com',timeout:10000})
            let tmp = path.join(tmpdir(), `tts-${Date.now()}.opus`)
            await new Promise((res,rej)=>{ ffmpeg(url).audioCodec('libopus').toFormat('opus').outputOptions(['-ac 1','-b:a 64k']).on('end',res).on('error',rej).save(tmp) })
            let buf = fs.readFileSync(tmp)
            await conn.sendMessage(m.chat,{audio:buf,mimetype:'audio/ogg; codecs=opus',ptt:true},{quoted:m})
            fs.unlinkSync(tmp); await react('❄️')
        }catch{ await react('❌'); m.reply(head+`\n⤷ ┇ 𝐒𝐘𝐒𝐓𝐄𝐌 ﹒ ERROR ：✿ 。\n\n❌ Error TTS` + foot, m) }
    }
}

handler.help = ['owner','ping','cleartmp','cpu','ram','uptime','info','tts <texto>']
handler.tags = ['main']
handler.command = /^(owner|creator|ping|p|cleartmp|cpu|ram|uptime|info|g?tts|ttss)$/i
export default handler