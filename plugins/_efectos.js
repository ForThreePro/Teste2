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

    // EFECTOS
    switch(effect) {
        case 'bass': filter = 'bass=g=20:dynaudnorm=f=200' ; break
        case 'blown': filter = 'acrusher=.1:1:64:0:log' ; break
        case 'deep': filter = 'atempo=4/4,asetrate=44500*2/3' ; break
        case 'earrape': filter = 'acrusher=volume=1:bits=8:mode=log:mix=10' ; break
        case 'fast': filter = 'atempo=1.5' ; break
        case 'fat': filter = 'atempo=1.6,asetrate=22100' ; break
        case 'nightcore': filter = 'atempo=1.06,asetrate=48000*1.25' ; break
        case 'reverse': filter = 'areverse' ; break
        case 'robot': filter = 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75' ; break
        case 'slow': filter = 'atempo=0.7' ; break
        case 'smooth': filter = 'minterpolate=mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120' ; break
        case 'chipmunk':
        case 'agudo': filter = 'atempo=0.5,asetrate=65100' ; break
        case 'grave': filter = 'atempo=0.5,asetrate=48000*0.25' ; break
        case 'vibrato': filter = 'vibrato=f=6.5' ; break
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })
        let audio = await q.download()
        let tmp = tmpdir()
        let input = path.join(tmp, `${Date.now()}_in.mp3`)
        let output = path.join(tmp, `${Date.now()}_out.mp3`)
        fs.writeFileSync(input, audio)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${input}" -af "${filter}" "${output}" -y`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        let out = fs.readFileSync(output)
        await conn.sendMessage(m.chat, { audio: out, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })

        fs.unlinkSync(input)
        fs.unlinkSync(output)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.log(e)
        m.reply(`❌ Error pe, instala ffmpeg\n${e.message}`)
    }
}

handler.help = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'chipmunk', 'grave', 'vibrato']
handler.tags = ['audio']
handler.command = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'chipmunk', 'agudo', 'grave', 'vibrato', 'audioefect']

export default handler