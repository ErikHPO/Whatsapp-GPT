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

function getMessageFromLog(phoneNumber) {
  const logFilePath = path.join(logsDirPath, `${phoneNumber}.log`);

  if (!fs.existsSync(logFilePath)) {
    console.log('Arquivo de log não encontrado.');
    return [];
  }

  const logContent = fs.readFileSync(logFilePath, 'utf8');
  const lines = logContent.split(/\r?\n/);
  let messageArray = [];
  let currentRole = '';
  let currentMessage = {
    role: '',
    content: '',
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith(`[${phoneNumber}`)) {
      // Nova mensagem do 'user'
      // console.log('trimmedLine User: ', trimmedLine)
      if (currentRole === 'assistant') {
        console.log('Trocou de role')
        messageArray.push(currentMessage)
        currentMessage = {
          role: '',
          content: ''
          
        }
      }

      currentRole = 'user';
      currentMessage = {
        role: currentRole,
        content: `${currentMessage.content}. ${trimmedLine.substring(trimmedLine.indexOf(']') + 1).trim()}`,
      };
    } else if (trimmedLine.startsWith(`[ME@`)) {
      // console.log('trimmedLine ME: ', trimmedLine)
      // Nova mensagem do 'assistant'
      if (currentRole === 'user')  {
        messageArray.push(currentMessage);
        currentMessage = {
          role: '',
          content: '' 
        }
      }
      currentRole = 'assistant';
      currentMessage = {
        role: currentRole,
        content: `${currentMessage.content}. ${trimmedLine.substring(trimmedLine.indexOf(']') + 1).trim()}`,
      };
    } else if (currentMessage && trimmedLine !== '') {
      currentMessage.content += `\n${trimmedLine}`;
    }
  });

  // Adicionar a última mensagem ao array, se existir
  if (currentMessage) {
    messageArray.push(currentMessage);
  }
  console.log('MessageArray ', messageArray)
  return messageArray;
}


  module.exports = {
    logChatMessage,
    saveAudioFile,
    getMessageFromLog
    }