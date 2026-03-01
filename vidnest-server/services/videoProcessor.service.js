import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import youtubedl from 'youtube-dl-exec';
import logger from '../config/logger.js';

class VideoProcessorService {
  constructor() {
    this.downloadDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir);
    }
  }

  /**
   * Downloads a video with specified format using youtube-dl-exec
   */
  async downloadVideo(url, formatRequested = 'best') {
    const fileId = uuidv4();
    const outputTemplate = path.join(this.downloadDir, `${fileId}.%(ext)s`);

    logger.info('Starting download', { url, fileId });

    try {
      await youtubedl(url, {
        f: formatRequested,
        o: outputTemplate,
        noPlaylist: true
      });

      // Find the actual file (youtube-dl appends the extension)
      const files = fs.readdirSync(this.downloadDir);
      const downloadedFile = files.find(f => f.startsWith(fileId));

      if (!downloadedFile) {
        throw new Error('Downloaded file not found');
      }

      const fullPath = path.join(this.downloadDir, downloadedFile);
      
      return {
        filePath: fullPath,
        fileName: downloadedFile,
        cleanup: () => this.cleanup(fullPath)
      };
    } catch (error) {
      logger.error('Download failed', { error: error.message });
      throw new Error('Download failed');
    }
  }

  cleanup(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) logger.error('Cleanup failed', { filePath, error: err.message });
        else logger.info('Cleaned up file', { filePath });
      });
    }
  }
}

export default new VideoProcessorService();
