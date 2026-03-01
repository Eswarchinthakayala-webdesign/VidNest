import { body, validationResult } from 'express-validator';

export const validateMetadata = [
  body('url')
    .isURL()
    .withMessage('Must be a valid URL')
    .notEmpty()
    .withMessage('URL is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateDownload = [
  body('url').isURL().withMessage('Must be a valid URL'),
  body('format').optional().isString().withMessage('Format must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
