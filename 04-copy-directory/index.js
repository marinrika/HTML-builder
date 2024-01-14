const fs = require('fs');
const path = require('path');

const pathFrom = path.join(__dirname, 'files');
const pathTo = path.join(__dirname, 'files-copy');

function copyDir(from, to) {
  fs.access(to, (err) => {
    if (err) copy();
    fs.rm(to, { recursive: true }, (err) => {
      if (err) throw err;
      copy();
    });
  });
  function copy() {
    fs.mkdir(to, (err) => {
      if (err) throw err;
    });
    fs.readdir(from, { withFileTypes: true }, (err, fileNames) => {
      if (err) throw err;
      fileNames.forEach((fileName) => {
        if (fileName.isFile()) {
          const pathFromFile = path.join(from, fileName.name);
          const pathToFile = path.join(to, fileName.name);
          const readFileStream = fs.createReadStream(pathFromFile);
          const writeFileStream = fs.createWriteStream(pathToFile);
          readFileStream.pipe(writeFileStream);
        }
      });
    });
  }
}

copyDir(pathFrom, pathTo);
