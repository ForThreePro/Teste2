import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/audio/.test(mime)) return m.reply(`😼 Responde a un audio/nota de voz pe\n\nEjemplo: *${usedPrefix + command}* (respondiendo a un audio)\n\n🍕 *LU BOT*`)

    let effect = command.toLowerCase()
    let filter = ''

    switch(effect) {
        case 'bass': filter = 'bass=g=20:f=110:w=0.3,dynaudnorm=f=200' ; break
        case 'blown': filter = 'acrusher=level_in=8:level_out=18:bits=8:mode=log:dc=1' ; break
        case 'deep': filter = 'atempo=4/4,asetrate=48000*0.8' ; break
        case 'earrape': filter = 'acrusher=level_in=1:level_out=8:bits=8:mode=log,mixer=10' ; break
        case 'fast': filter = 'atempo=1.5' ; break
        case 'fat': filter = 'atempo=1.6,asetrate=48000*0.8' ; break
        case 'nightcore': filter = 'atempo=1.06,asetrate=48000*1.25' ; break
        case 'reverse': filter = 'areverse' ; break
        case 'robot': filter = 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75' ; break
        case 'slow': filter = 'atempo=0.7' ; break
        case 'smooth': filter = 'aresample=48000' ; break
        case 'chipmunk':
        case 'agudo': filter = 'asetrate=48000*1.5,atempo=1.2' ; break
        case 'grave': filter = 'asetrate=48000*0.7,atempo=0.9' ; break
        case 'vibrato': filter = 'vibrato=f=6.5:d=0.8' ; break
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
        let audio = await q.download()
        let tmp = tmpdir()
        let name = Date.now()
        let input = path.join(tmp, `${name}_in.ogg`)
        let output = path.join(tmp, `${name}_out.mp3`)
        fs.writeFileSync(input, audio)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${input}" -af "${filter}" "${output}" -y`, (err, stdout, stderr) => {
                if (err) reject(new Error(stderr || err.message))
                else resolve()
            })
        })

        let out = fs.readFileSync(output)
        await conn.sendMessage(m.chat, { audio: out, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })

        try { fs.unlinkSync(input) } catch {}
        try { fs.unlinkSync(output) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.log(e)
        m.reply(`❌ Error pe: ${e.message.slice(0,400)}`)
    }
}

handler.help = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'chipmunk', 'grave', 'vibrato']
handler.tags = ['audio']
handler.command = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'chipmunk', 'agudo', 'grave', 'vibrato']

export default handler