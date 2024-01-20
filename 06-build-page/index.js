const fs = require('fs');
const path = require('path');
const stream = require('stream');

const pathProject = path.resolve(__dirname, 'project-dist');
const pathAssetsFrom = path.resolve(__dirname, 'assets');
const pathAssetsTo = path.resolve(__dirname, 'project-dist', 'assets');
const pathForStyle = path.resolve(__dirname, 'styles');
const pathStyle = path.resolve(__dirname, 'project-dist', 'style.css');
const pathHtmlFrom = path.resolve(__dirname, 'template.html');
const pathHtmlTo = path.resolve(__dirname, 'project-dist', 'index.html');
const pathComponents = path.resolve(__dirname, 'components');

function project() {
  fs.access(pathProject, (err) => {
    if (err) makeDirectory();
    else {
      fs.rm(pathProject, { recursive: true }, (err) => {
        if (err) throw err;
        makeDirectory();
      });
    }
  });
}

function makeDirectory() {
  fs.mkdir(pathProject, (err) => {
    if (err) throw err;
    addStyle();
    copyDir(pathAssetsFrom, pathAssetsTo);
    getComponent();
  });
}

function getComponent() {
  fs.readdir(pathComponents, (err, fileNames) => {
    if (err) throw err;
    const components = {};
    fileNames.forEach((fileName) => {
      const index = fileName.indexOf('.');
      const nameFile = fileName.slice(0, index);
      fs.readFile(path.resolve(pathComponents, fileName), (err, file) => {
        if (err) throw err;
        components[nameFile] = file;
        if (Object.keys(components).length === fileNames.length) {
          addHTML(components);
        }
      });
    });
  });
}

function addHTML(components) {
  const readStream = fs.createReadStream(pathHtmlFrom);
  const writeStream = fs.createWriteStream(pathHtmlTo);
  const transformHtml = new stream.Transform({
    transform(chunk, encoding, cb) {
      const transformForHtml = chunk
        .toString()
        .replace(/{{(\w+)}}/g, (_, component) => {
          return components[component];
        });
      cb(null, transformForHtml);
    },
  });
  readStream.pipe(transformHtml).pipe(writeStream);
}

function addStyle() {
  fs.readdir(pathForStyle, { withFileTypes: true }, (err, fileNames) => {
    if (err) throw err;
    const writeStream = fs.createWriteStream(pathStyle);
    fileNames.forEach((fileName) => {
      const index = fileName.name.indexOf('.');
      const extentionFile = fileName.name.slice(index + 1);
      if (fileName.isFile() && extentionFile === 'css') {
        const readStream = fs.createReadStream(
          path.resolve(pathForStyle, fileName.name),
        );
        readStream.pipe(writeStream);
      }
    });
  });
}

function copyDir(from, to) {
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
        } else if (fileName.isDirectory()) {
          if (err) throw err;
          copyDir(
            path.resolve(from, fileName.name),
            path.resolve(to, fileName.name),
          );
        }
      });
    });
  });
}

project();
