const fs = require('fs');
const path = require('path');
const stream = require('stream');

const pathProject = path.join(__dirname, 'project-dist');
const pathAssetsFrom = path.join(__dirname, 'assets');
const pathAssetsTo = path.join(__dirname, 'project-dist', 'assets');
const pathForStyle = path.join(__dirname, 'styles');
const pathStyle = path.join(__dirname, 'project-dist', 'style.css');
const pathHtmlFrom = path.join(__dirname, 'template.html');
const pathHtmlTo = path.join(__dirname, 'project-dist', 'index.html');
const pathComponents = path.join(__dirname, 'components');

function project(
  toProject,
  forStyle,
  toStyle,
  fromAssets,
  toAssets,
  fromHTML,
  toHTML,
  forComponents,
) {
  fs.access(toProject, (err) => {
    if (err) makeDirectory();
    fs.rm(toProject, { recursive: true }, (err) => {
      if (err) throw err;
      makeDirectory();
    });
  });

  function makeDirectory() {
    fs.mkdir(toProject, (err) => {
      if (err) throw err;
      addStyle();
      copyDir(fromAssets, toAssets);
      getComponent();
    });
  }

  function getComponent() {
    fs.readdir(forComponents, (err, fileNames) => {
      if (err) throw err;
      const components = {};
      fileNames.forEach((fileName) => {
        const index = fileName.indexOf('.');
        const nameFile = fileName.slice(0, index);
        fs.readFile(path.join(forComponents, fileName), (err, file) => {
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
    const readStream = fs.createReadStream(fromHTML);
    const writeStream = fs.createWriteStream(toHTML);
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
    fs.readdir(forStyle, { withFileTypes: true }, (err, fileNames) => {
      if (err) throw err;
      const writeStream = fs.createWriteStream(toStyle);
      fileNames.forEach((fileName) => {
        const index = fileName.name.indexOf('.');
        const extentionFile = fileName.name.slice(index + 1);
        if (fileName.isFile() && extentionFile === 'css') {
          const readStream = fs.createReadStream(
            path.join(forStyle, fileName.name),
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
            const pathFromFile = path.join(from, fileName.name);
            const pathToFile = path.join(to, fileName.name);
            const readFileStream = fs.createReadStream(pathFromFile);
            const writeFileStream = fs.createWriteStream(pathToFile);
            readFileStream.pipe(writeFileStream);
          } else if (fileName.isDirectory()) {
            if (err) throw err;
            copyDir(
              path.join(from, fileName.name),
              path.join(to, fileName.name),
            );
          }
        });
      });
    });
  }
}

project(
  pathProject,
  pathForStyle,
  pathStyle,
  pathAssetsFrom,
  pathAssetsTo,
  pathHtmlFrom,
  pathHtmlTo,
  pathComponents,
);
