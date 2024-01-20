const fs = require('fs');
const path = require('path');

const pathBundle = path.resolve(__dirname, 'project-dist', 'bundle.css');
const pathSourсe = path.resolve(__dirname, 'styles');
const writeStream = fs.createWriteStream(pathBundle);

fs.readdir(pathSourсe, { withFileTypes: true }, function (err, fileNames) {
  if (err) throw err;
  fileNames.forEach((fileName) => {
    const index = fileName.name.indexOf('.');
    const extentionFile = fileName.name.slice(index + 1);
    if (fileName.isFile() && extentionFile === 'css') {
      const readStream = fs.createReadStream(
        path.resolve(pathSourсe, fileName.name),
      );
      readStream.pipe(writeStream);
    }
  });
});
