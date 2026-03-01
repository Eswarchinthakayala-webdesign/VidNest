import express from 'express';
import videoController from '../controllers/video.controller.js';
import { validateMetadata, validateDownload } from '../middleware/validate.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/v1/video/metadata
 * @desc Get video details and available formats
 */
router.post(
  '/metadata', 
  optionalAuth,
  validateMetadata, 
  videoController.getMetadata
);

/**
 * @route POST /api/v1/video/download
 * @desc Download video file (tracks if user is authenticated)
 */
router.post(
  '/download', 
  optionalAuth,
  validateDownload, 
  videoController.downloadVideo
);

export default router;
