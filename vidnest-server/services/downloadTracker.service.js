import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

class DownloadTracker {
  detectPlatform(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'YouTube';
    if (urlLower.includes('instagram.com')) return 'Instagram';
    if (urlLower.includes('tiktok.com')) return 'TikTok';
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'Twitter/X';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'Facebook';
    if (urlLower.includes('vimeo.com')) return 'Vimeo';
    if (urlLower.includes('reddit.com')) return 'Reddit';
    if (urlLower.includes('twitch.tv')) return 'Twitch';
    if (urlLower.includes('dailymotion.com')) return 'Dailymotion';
    if (urlLower.includes('soundcloud.com')) return 'SoundCloud';
    if (urlLower.includes('spotify.com')) return 'Spotify';
    if (urlLower.includes('pinterest.com')) return 'Pinterest';
    return 'Other';
  }

  detectFormat(formatStr) {
    if (!formatStr) return 'mp4';
    const lower = formatStr.toLowerCase();
    if (lower.includes('mp3') || lower === 'bestaudio') return 'mp3';
    if (lower.includes('mp4')) return 'mp4';
    if (lower.includes('webm')) return 'webm';
    if (lower.includes('m4a')) return 'm4a';
    if (lower.includes('flac')) return 'flac';
    if (lower.includes('wav')) return 'wav';
    if (lower.includes('avi')) return 'avi';
    if (lower.includes('mkv')) return 'mkv';
    if (lower.includes('mov')) return 'mov';
    return 'mp4';
  }

  async trackStart({ userId, url, format, quality }) {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .insert([{
          user_id: userId,
          original_url: url,
          platform: this.detectPlatform(url),
          format: this.detectFormat(format),
          quality: quality || null,
          status: 'processing',
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      logger.error('Failed to track download start', { error: error.message });
      return null;
    }
  }

  async trackSuccess(downloadId, { fileSize, processingTimeMs }) {
    try {
      if (!downloadId) return;

      const { error } = await supabase
        .from('downloads')
        .update({
          status: 'success',
          file_size: fileSize || null,
          processing_time_ms: processingTimeMs,
        })
        .eq('id', downloadId);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to track download success', { error: error.message });
    }
  }

  async trackFailure(downloadId, { errorMessage, processingTimeMs }) {
    try {
      if (!downloadId) return;

      const { error } = await supabase
        .from('downloads')
        .update({
          status: 'failed',
          error_message: errorMessage || 'Unknown error',
          processing_time_ms: processingTimeMs,
        })
        .eq('id', downloadId);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to track download failure', { error: error.message });
    }
  }
}

export default new DownloadTracker();
