const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = require('process');

const textPath = path.join(__dirname, 'text.txt');

const writeStream = fs.createWriteStream(textPath);

stdout.write('Hello. Enter the text:\n');
stdin.on('data', (chunk) => {
  if (chunk.toString().trim() !== 'exit') {
    writeStream.write(chunk);
  } else {
    exitProgramm();
  }
});

function exitProgramm() {
  stdout.write('\nGood luck!');
  exit();
}

process.on('SIGINT', exitProgramm);
