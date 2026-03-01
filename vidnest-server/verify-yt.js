import { spawn } from 'child_process';
import fs from 'fs';

const verify = spawn('python', ['-m', 'yt_dlp', '--version']);
let output = '';

verify.stdout.on('data', (data) => output += data);
verify.on('close', (code) => {
  fs.writeFileSync('yt-verify.txt', `Code: ${code}\nOutput: ${output}`);
  process.exit(0);
});
