import express from 'express';
import linkController from '../controllers/link.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected URL Shortening Routes
router.post('/shorten', authMiddleware, linkController.shortenLink.bind(linkController));
router.get('/', authMiddleware, linkController.getUserLinks.bind(linkController));
router.get('/dashboard', authMiddleware, linkController.getDashboardAnalytics.bind(linkController));
router.get('/:id/analytics', authMiddleware, linkController.getLinkAnalytics.bind(linkController));

export default router;
