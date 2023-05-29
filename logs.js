const fs = require('fs');
const { get } = require('http');
const path = require('path');
const {convertOggToM4a} = require('./audioConverter');


const logsDirPath = path.join(__dirname, 'logs');
// Verifica se a pasta "logs" existe
if (!fs.existsSync(logsDirPath)) {
    // Cria a pasta "logs" se ela não existir
    fs.mkdirSync(logsDirPath);
  }

  function logChatMessage(  message ) {
    const {from, body, timestamp, fromMe, to} = message;
    let author = message.author ?
    message.author +'@' + message._data.notifyName : 
    message.from + '@' + message._data.notifyName;
    if(fromMe) {
      author = 'ME@'+ message._data.notifyName;
    }
    const logFilePath = fromMe ? 
      path.join(logsDirPath, `${to}.log`) : 
      path.join(logsDirPath, `${from}.log`);
    const time = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '');
    }

    const previousContent = fs.readFileSync(logFilePath, 'utf-8').trimEnd();

    if (body !== previousContent) {
      fs.appendFileSync(logFilePath, `[${author} - ${time}] ${body}\n`);
    }
  }

  async function saveAudioFile(audioMessage) {
    const audioDirPath = path.join(__dirname, 'audio');
    if (!fs.existsSync(audioDirPath)) {
        // Cria a pasta "audio" se ela não existir
        fs.mkdirSync(audioDirPath);
      }
    const audioData = await audioMessage.downloadMedia()
    const filename = `${new Date().getTime()}-${ audioData.mimetype.split('/')[0]}.ogg`;
    const filePath = path.join(audioDirPath, filename);
    fs.writeFileSync(filePath, audioData.data, 'base64');
    // converta filePath com as barras invertidas para o formato de URL
    const fileUrl = path.resolve(filePath)
    console.log('fileUrl: ', fileUrl)
    convertOggToM4a(fileUrl, fileUrl.replace('.ogg', '.m4a'));
    return {filePath, filename, audioData};
}



  module.exports = {
    logChatMessage,
    saveAudioFile,
    }