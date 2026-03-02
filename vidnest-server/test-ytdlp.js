import youtubedl from 'youtube-dl-exec';

const testUrl = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'; // Rick Astley

async function test() {
  try {
    console.log('Fetching metadata for:', testUrl);
    const raw = await youtubedl(testUrl, {
      dumpJson: true,
      noPlaylist: true,
      noWarnings: true
    });
    console.log('SUCCESS! Title:', raw.title);
  } catch (err) {
    console.error('FAILED!');
    console.error('Message:', err.message);
    console.error('Stderr:', err.stderr);
  }
}

test();
