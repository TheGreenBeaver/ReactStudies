const fs = require('fs');


async function insertAtPos(filePath, pos, text) {
  const currentContent = (await fs.promises.readFile(filePath)).toString();
  const head = currentContent.substring(0, pos);
  const tail = currentContent.substring(pos);
  await fs.promises.writeFile(filePath, `${head}${text}${tail}`);
}

async function insertAfter(filePath, indicator, text) {
  const currentContent = (await fs.promises.readFile(filePath)).toString();
  const pos = currentContent.indexOf(indicator) + indicator.length;
  const head = currentContent.substring(0, pos);
  const tail = currentContent.substring(pos);
  await fs.promises.writeFile(filePath, `${head}${text}${tail}`);
}

module.exports = { insertAtPos, insertAfter };