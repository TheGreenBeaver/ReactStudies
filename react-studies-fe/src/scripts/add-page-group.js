const fs = require('fs');
const path = require('path');
const { insertAtPos, insertAfter } = require('./_utils');


const linksFileContent =
`import { AppLink } from '../config/AppLink';

const links = {
};

export default links;
`;

const indexFileContent =
`import AppRoute from '../config/AppRoute';
import links from './links';

const routes = [
];

export default routes;
`;

async function run() {
  const [,, groupName] = process.argv;
  const dir = path.join('src', 'pages', groupName);
  await fs.promises.mkdir(dir, { recursive: true });

  const configLinks = path.join('src', 'pages', 'config', 'links.js');
  await fs.promises.writeFile(path.join(dir, 'links.js'), linksFileContent);
  await insertAfter(configLinks, 'const links = {\n', `  ${groupName}: ${groupName}Links,\n`);
  await insertAtPos(configLinks, 0, `import ${groupName}Links from '../${groupName}/links';\n`);

  const pagesIndex = path.join('src', 'pages', 'index.js');
  await fs.promises.writeFile(`${dir}/index.js`, indexFileContent);
  await insertAfter(pagesIndex, 'const routes = [\n', `  ...${groupName}Routes,\n`);
  await insertAtPos(pagesIndex, 0, `import ${groupName}Routes from './${groupName}';\n`);
}

run();