const fs = require('fs');
const path = require('path');


async function run() {
  const [,, name, stylesExt] = process.argv;
  const mainFileName = path.basename(name);

  const srcDir = __dirname.split(path.sep).slice(0, -1).join(path.sep);

  const compDirName = path.join(srcDir, name);
  await fs.promises.mkdir(compDirName, { recursive: true });
  console.log('Directory created...');

  const compIndexFile = path.join(compDirName, 'index.js');
  await fs.promises.writeFile(compIndexFile,
    `export { default } from './${mainFileName}'`);
  console.log('Index file created...');

  const compMainFile = path.join(compDirName, `${mainFileName}.js`);
  await fs.promises.writeFile(compMainFile, 'rsf');
  console.log('Main file created...');

  if (stylesExt) {
    const compStylesFile = path.join(compDirName, `${mainFileName}.styles.${stylesExt}`);
    await fs.promises.writeFile(compStylesFile, '');
    console.log('Styles file created...');
  }

  console.log('Done!');
}

run();