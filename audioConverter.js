const { promisify } = require('util');
const ffmpeg = require('ffmpeg');

const convertOggToM4a = async (oggFilePath, m4aFilePath) => {
  console.log('Iniciando conversão de arquivo de áudio...');
  try {
    const command = new ffmpeg();
    const commandRun = promisify(command.run).bind(command);

    command.addInput(oggFilePath);
    command.outputOptions('-c:a', 'aac');
    command.output(m4aFilePath);

    await commandRun();

    console.log('Conversão concluída!');
  } catch (error) {
    console.error('Erro durante a conversão:', error);
  }
};

module.exports ={
    convertOggToM4a,
}