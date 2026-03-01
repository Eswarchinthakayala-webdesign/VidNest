import fs from 'fs';
import ytDlpService from '../services/ytDlp.service.js';
import videoProcessorService from '../services/videoProcessor.service.js';
import downloadTracker from '../services/downloadTracker.service.js';
import { sanitizeUrl } from '../utils/sanitizeUrl.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
import { nanoid } from 'nanoid';

class VideoController {
  async getMetadata(req, res, next) {
    try {
      const { url } = req.body;
      const sanitizedUrl = sanitizeUrl(url);

      if (!sanitizedUrl) {
        return res.status(400).json({ error: 'Unsupported or invalid URL' });
      }

      const metadata = await ytDlpService.getMetadata(sanitizedUrl);

      // Automatic Short Link Integration
      if (req.user) {
        try {
          // Check if user already has a short link for this URL
          const { data: existingLink } = await supabase
            .from('links')
            .select('short_code')
            .eq('user_id', req.user.id)
            .eq('original_url', sanitizedUrl)
            .single();

          let shortCode;
          if (existingLink) {
            shortCode = existingLink.short_code;
          } else {
            // Create a new one
            shortCode = nanoid(7);
            await supabase.from('links').insert([{
              user_id: req.user.id,
              original_url: sanitizedUrl,
              short_code: shortCode,
              total_clicks: 0
            }]);
          }
          
          metadata.shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;
        } catch (linkError) {
          logger.error('Failed to auto-shorten link', { error: linkError.message });
        }
      }

      res.json(metadata);
    } catch (error) {
      next(error);
    }
  }

  async downloadVideo(req, res, next) {
    const startTime = Date.now();
    let downloadId = null;

    try {
      const { url, format } = req.body;
      const sanitizedUrl = sanitizeUrl(url);

      if (!sanitizedUrl) {
        return res.status(400).json({ error: 'Unsupported or invalid URL' });
      }

      logger.info('Download requested', { url: sanitizedUrl, format });

      // Track download start (if user is authenticated)
      if (req.user) {
        downloadId = await downloadTracker.trackStart({
          userId: req.user.id,
          url: sanitizedUrl,
          format,
        });
      }

      const { filePath, fileName, cleanup } = await videoProcessorService.downloadVideo(
        sanitizedUrl, 
        format
      );

      // Get file size
      let fileSize = null;
      try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
      } catch (_) {}

      // Track success
      if (downloadId) {
        await downloadTracker.trackSuccess(downloadId, {
          fileSize,
          processingTimeMs: Date.now() - startTime,
        });
      }

      res.download(filePath, fileName, (err) => {
        if (err) {
          logger.error('Error during file transfer', { error: err.message });
        }
        cleanup(); // Cleanup file after streaming
      });
    } catch (error) {
      // Track failure
      if (downloadId) {
        await downloadTracker.trackFailure(downloadId, {
          errorMessage: error.message,
          processingTimeMs: Date.now() - startTime,
        });
      }
      next(error);
    }
  }

  getHealth(req, res) {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  }
}

export default new VideoController();
