import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import videoRoutes from './routes/video.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import linkRoutes from './routes/link.routes.js';
import linkController from './controllers/link.controller.js';
import videoController from './controllers/video.controller.js';
import { errorHandler } from './middleware/error.middleware.js';
import { systemLogger } from './middleware/systemLogger.middleware.js';
import logger from './config/logger.js';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length'],
  credentials: true, // Required for cookies
}));

// Cookie Parser (for JWT cookies)
app.use(cookieParser());

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// System Logger Middleware (tracks all requests to DB)
app.use(systemLogger);

// Routes
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/links', linkRoutes);

// Public Short ID Redirect
app.get('/s/:shortCode', linkController.handleRedirect.bind(linkController));

app.get('/health', videoController.getHealth);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
