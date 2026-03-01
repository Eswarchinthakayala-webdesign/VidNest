import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/v1/auth/google
 * @desc Authenticate with Google OAuth
 */
router.post('/google', authController.googleLogin);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current authenticated user
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout and clear token
 */
router.post('/logout', authController.logout);

export default router;
