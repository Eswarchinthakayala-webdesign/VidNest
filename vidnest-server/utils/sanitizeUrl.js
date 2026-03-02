import { URL } from 'url';

const ALLOWED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'instagram.com',
  'twitter.com',
  'x.com',
  'vimeo.com',
  'tiktok.com',
  'facebook.com',
  'fb.watch',
  'twitch.tv',
  'soundcloud.com'
];

/**
 * Sanitizes and validates a video URL to prevent command injection
 * and local file system access.
 */
export const sanitizeUrl = (inputUrl) => {
  try {
    if (!inputUrl || typeof inputUrl !== 'string') return null;

    const parsedUrl = new URL(inputUrl);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    const host = parsedUrl.hostname.toLowerCase();
    
    // Check if domain is in whitelist
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      host === domain || host.endsWith('.' + domain)
    );

    if (!isAllowed) return null;

    // Strip playlist parameters from YouTube URLs for better reliability
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      parsedUrl.searchParams.delete('list');
      parsedUrl.searchParams.delete('index');
    }

    // Return only the href to strip any local context
    return parsedUrl.href;
  } catch (error) {
    return null;
  }
};
