import { create } from 'yt-dlp-exec';
import path from 'path';

// Just a test to see if we can get the binary path
const binPath = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp');
console.log('Binary Path:', binPath);
process.exit(0);
