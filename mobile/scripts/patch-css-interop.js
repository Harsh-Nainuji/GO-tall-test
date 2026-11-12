const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'native',
  'render-component.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('newValue[entry[0]] = replace')) {
    const buggyStringify = /function stringify\(object\) \{[\s\S]*?seen\.delete\(value\);[\s\S]*?return newValue;[\s\S]*?\}, 2\);[\s\S]*?\}/;
    const safeStringify = `function stringify(object) {
    const seen = new WeakSet();
    try {
        return JSON.stringify(object, function (key, value) {
            if (key === 'children' || key === '_owner') return '[ReactElement]';
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[Circular]';
                seen.add(value);
            }
            return value;
        }, 2);
    } catch (e) {
        return String(object);
    }
}`;
    content = content.replace(buggyStringify, safeStringify);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-css-interop] Patched react-native-css-interop stringify recursion bug.');
  }
}

