import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════
//  USER ANALYTICS (Protected)
// ═══════════════════════════════════════════════

/**
 * @route GET /api/v1/analytics/user-summary
 * @desc Get authenticated user's download summary
 */
router.get('/user-summary', authMiddleware, analyticsController.getUserSummary);

/**
 * @route GET /api/v1/analytics/user-trend
 * @desc Get user's download trend (daily counts)
 */
router.get('/user-trend', authMiddleware, analyticsController.getUserTrend);

/**
 * @route GET /api/v1/analytics/recent-downloads
 * @desc Get user's last 10 downloads
 */
router.get('/recent-downloads', authMiddleware, analyticsController.getRecentDownloads);

// ═══════════════════════════════════════════════
//  GLOBAL ANALYTICS (Protected)
// ═══════════════════════════════════════════════

/**
 * @route GET /api/v1/analytics/platform-distribution
 * @desc Get downloads grouped by platform (pie chart)
 */
router.get('/platform-distribution', authMiddleware, analyticsController.getPlatformDistribution);

/**
 * @route GET /api/v1/analytics/format-distribution
 * @desc Get downloads grouped by format (bar chart)
 */
router.get('/format-distribution', authMiddleware, analyticsController.getFormatDistribution);

/**
 * @route GET /api/v1/analytics/daily-downloads
 * @desc Get daily download counts (line chart)
 */
router.get('/daily-downloads', authMiddleware, analyticsController.getDailyDownloads);

/**
 * @route GET /api/v1/analytics/system-health
 * @desc Get server health and today's stats
 */
router.get('/system-health', authMiddleware, analyticsController.getSystemHealth);

/**
 * @route GET /api/v1/analytics/error-rate
 * @desc Get hourly error rate (last 24h)
 */
router.get('/error-rate', authMiddleware, analyticsController.getErrorRate);

/**
 * @route GET /api/v1/analytics/hourly-usage
 * @desc Get hourly download distribution (peak usage)
 */
router.get('/hourly-usage', authMiddleware, analyticsController.getHourlyUsage);

export default router;
