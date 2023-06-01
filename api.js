const axios = require('axios')
require('dotenv').config()
const bodyProps ={
    model: process.env.MODEL,
    maxTokens: parseInt(process.env.MAX_TOKENS) || 800,
    temperature: parseFloat(process.env.TEMPERATURE) || 1,
}

const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
    'Content-Type': 'application/json'
}

const API_Openai = axios.create({
    baseURL: 'https://api.openai.com/',
    timeout: 120000,
    headers: headers
});



getDavinciResponse = async (clientText) => {
    const body = {
        "model": "text-davinci-003",
        "prompt": clientText,
        "max_tokens":  bodyProps.maxTokens,
        "temperature": bodyProps.temperature,
    }

    try {
        const { data } = await API_Openai.post('v1/completions', body)
        const botAnswer = data.choices[0].text
        return `${botAnswer}`
    } catch (e) {
        console.error(e.response)
        return `❌ OpenAI Response Error`
    }
}

getChatResponse = async (conversationArray, clientName) => {
    const body = {
        "model": "gpt-3.5-turbo",
        "messages": conversationArray,
        "max_tokens":  bodyProps.maxTokens,
        "temperature": bodyProps.temperature,
    }
}


 getDalleResponse = async (clientText) => {
    const body = {
        prompt: clientText, // Descrição da imagem
        n: 1, // Número de imagens a serem geradas
        size: "256x256", // Tamanho da imagem
    }

    try {
        const { data } = await API_Openai.post('v1/images/generations', body)
        if (!data.data[0].url.includes('https://')) {
            return `❌ OpenAI Denied Your Request`
        }
        return data.data[0].url
    } catch (e) {
        return `❌ OpenAI Response Error`
    }
}

getWhisperTranscription = async (audioUrl) => {
    // console.log('getWhisperTranscription AUDIOURL: ', audioUrl)
    const body = {
        "file": audioUrl,
        "model": "whisper-1",
        "language": "pt",
        "response_format": 'json',
        "temperature": 0.5,
    }

    try{
        const { data } = await API_Openai.post('/v1/audio/transcriptions', body)
        const botAnswer = data.choices[0].text
        return `${botAnswer}`
    }
    catch(e){
        console.error('❌ OpenAI Response Error ', e.response)
        return
    }
}

module.exports = {
    getDavinciResponse,
    getDalleResponse,
    getWhisperTranscription,
}
