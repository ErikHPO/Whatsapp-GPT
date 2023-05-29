require('dotenv').config()
const { getDavinciResponse, getDalleResponse, getWhisperTranscription } = require('./api.js')
const { initializeWhatsapp , sendMedia, sendMessage, } = require('./whatsapp.js')
const { logChatMessage, saveAudioFile } = require('./logs.js')
const logIsActive = Boolean(process.env.LOG_MESSAGES)
const debugIsActive = Boolean(process.env.DEBUG_MODE)


const client = initializeWhatsapp()
client.on('message', async(message) => {
    if(message.type === 'ptt'){
        const filePath = await saveAudioFile(message)
        console.log('filePath: ', filePath)
        const transcription = await getWhisperTranscription(filePath)
        const contact = await message.getContact()
        sendMessage(message.from, transcription, { mentions: [contact] })
        console.log('Transcription: ', transcription)
    }
})
client.on('message_create', async(message) => {
    
    // SE FOR UMA MENSAGEM DE AUDIO
    if(message.type === 'ptt'){
        const {filePath, filename, audioData} = await saveAudioFile(message)
    }

    console.log('Autor:', message._data.notifyName)
    logIsActive && logChatMessage(message)
    commands(message)
})


 const commands = async (message) => {
    const iaCommands = {
        davinci3: "/bot",
        dalle: "/img",
        ping: "/ping",
    }
    let firstWord = message.body.substring(0, message.body.indexOf(" "))
    const sender = message.from.includes(process.env.PHONE_NUMBER) ? message.to : message.from
    switch (firstWord) {
        case iaCommands.davinci3:
            const question = message.body.substring(message.body.indexOf(" "));
            console.log('msg is: ', question);
            getDavinciResponse(question).then(async (response) => {
                const contact = await message.getContact()
                client.sendMessage(sender, `${response}\n`, { mentions: [contact] })
            })
            break

        case iaCommands.dalle:
            const imgDescription = message.body.substring(message.body.indexOf(" "));
            const contact = await message.getContact();
            getDalleResponse(imgDescription, message).then(async (imgUrl)  => {
                   await sendMedia(sender, imgUrl, contact)
            })

        case iaCommands.ping:
            console.log('Pong.')
            client.sendMessage(sender, 'Pong.')
            break

    }
}
