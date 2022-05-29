const fs = require('fs');
const path = require('path');
const { insertAtPos, insertAfter } = require('./_utils');


const getPageFileContent = pageName =>
`function ${pageName}() {
  return <div />;
}

export default ${pageName};
`;

const getIndexFileContent = pageName =>
`import ${pageName} from './${pageName}';
import { memo } from 'react';

export default memo(${pageName});
`;

async function run() {
  const [,, groupName, pageName, appLinkPath] = process.argv;
  const groupDir = path.join('src', 'pages', groupName);
  const dir = path.join(groupDir, pageName);
  await fs.promises.mkdir(dir, { recursive: true });

  await fs.promises.writeFile(path.join(dir, `${pageName}.js`), getPageFileContent(pageName));
  await fs.promises.writeFile(path.join(dir, 'index.js'), getIndexFileContent(pageName));

  const camelCase = `${pageName[0].toLowerCase()}${pageName.substring(1)}`;
  await insertAfter(
    path.join(groupDir, 'links.js'),
    'const links = {\n',
    `  ${camelCase}: new AppLink('${appLinkPath}'),\n`
  );
  await insertAtPos(
    path.join(groupDir, 'index.js'),
    0,
    `import ${pageName} from './${pageName}';\n`
  );
  await insertAfter(
    path.join(groupDir, 'index.js'),
    'const routes = [\n',
    `  new AppRoute(links.${camelCase}, ${pageName}),\n`
  );
}

run()