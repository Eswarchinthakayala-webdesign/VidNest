import { sanitizeUrl } from './utils/sanitizeUrl.js';
import logger from './config/logger.js';

const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://malicious.com/shell.sh',
  'invalid-url',
  'https://instagram.com/reels/123/'
];

logger.info('Starting internal logic test...');

testUrls.forEach(url => {
  const result = sanitizeUrl(url);
  logger.info(`URL: ${url} -> Sanitized: ${result || 'BLOCKED'}`);
});

logger.info('Internal logic test complete.');
process.exit(0);
