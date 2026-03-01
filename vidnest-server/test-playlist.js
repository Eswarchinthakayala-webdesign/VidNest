import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const raw = await youtubedl('https://soundcloud.com/buzzing-playlists/sets/buzzing-r-b', {
      dumpJson: true,
      flatPlaylist: true,
      noWarnings: true
    });
    console.log(JSON.stringify(raw, null, 2).slice(0, 1000));
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  }
}
test();
