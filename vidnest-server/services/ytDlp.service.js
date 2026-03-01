import youtubedl from 'youtube-dl-exec';
import logger from '../config/logger.js';

class YtDlpService {
  /**
   * Fetches metadata for a given URL using youtube-dl-exec
   */
  async getMetadata(url) {
    try {
      // Fast-fail for known playlist URLs to prevent NDJSON crash bugs
      if (url.includes('/sets/') && url.includes('soundcloud.com')) {
        const err = new Error("Playlists and entire sets are not supported yet. Please provide a link to a single track/video.");
        err.statusCode = 400;
        throw err;
      }
      if (url.includes('/playlist?') && url.includes('youtube.com')) {
        const err = new Error("YouTube playlists are not supported. Please provide a link to a single track/video.");
        err.statusCode = 400;
        throw err;
      }

      logger.info('Fetching metadata', { url });
      const raw = await youtubedl(url, {
        dumpJson: true,
        noPlaylist: true,
        noWarnings: true
      });
      return this._transformMetadata(raw);
    } catch (err) {
      if (err.statusCode === 400) throw err;
      
      logger.error('Failed to parse yt-dlp output', { error: err.message });
      const customErr = new Error(err.message || 'Failed to fetch metadata');
      customErr.statusCode = 500;
      throw customErr;
    }
  }

  /**
   * Internal helper to clean up raw JSON output
   */
  _transformMetadata(raw) {
    return {
      id: raw.id,
      title: raw.title,
      thumbnail: raw.thumbnail,
      duration: raw.duration,
      viewCount: raw.view_count,
      uploader: raw.uploader,
      formats: raw.formats ? raw.formats
        .filter(f => f.video_ext !== 'none' || f.audio_ext !== 'none')
        .map(f => ({
          formatId: f.format_id,
          ext: f.ext,
          resolution: f.vcodec === 'none' ? 'audio only' : (f.resolution && f.resolution !== 'audio only' ? f.resolution : (f.width ? `${f.width}x${f.height}` : 'audio only')),
          filesize: f.filesize || f.filesize_approx,
          vcodec: f.vcodec,
          acodec: f.acodec
        })) : []
    };
  }
}

export default new YtDlpService();
