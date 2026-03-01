import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).send(options.message);
  }
});

// Stricter limit for downloads
export const downloadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 downloads per hour for better testing experience
  message: {
    status: 429,
    error: 'Download limit exceeded. Please try again in an hour.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Download rate limit exceeded', { ip: req.ip });
    res.status(options.statusCode).send(options.message);
  }
});
