const fs = require('fs');
const path = require('path');

const pathFrom = path.resolve(__dirname, 'files');
const pathTo = path.resolve(__dirname, 'files-copy');

function copyDir(from, to) {
  fs.access(to, (err) => {
    if (err) copy();
    else {
      fs.rm(to, { recursive: true }, (err) => {
        if (err) throw err;
        copy();
      });
    }
  });
  function copy() {
    fs.mkdir(to, (err) => {
      if (err) throw err;
      fs.readdir(from, { withFileTypes: true }, (err, fileNames) => {
        if (err) throw err;
        fileNames.forEach((fileName) => {
          if (fileName.isFile()) {
            const pathFromFile = path.resolve(from, fileName.name);
            const pathToFile = path.resolve(to, fileName.name);
            const readFileStream = fs.createReadStream(pathFromFile);
            const writeFileStream = fs.createWriteStream(pathToFile);
            readFileStream.pipe(writeFileStream);
          }
        });
      });
    });
  }
}

copyDir(pathFrom, pathTo);
