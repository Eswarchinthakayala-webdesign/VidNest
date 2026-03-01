import { sanitizeUrl } from './utils/sanitizeUrl.js';
import fs from 'fs';

const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://malicious.com/shell.sh'
];

let output = '';
testUrls.forEach(url => {
  const result = sanitizeUrl(url);
  output += `URL: ${url} -> Sanitized: ${result || 'BLOCKED'}\n`;
});

fs.writeFileSync('test-output.txt', output);
process.exit(0);
