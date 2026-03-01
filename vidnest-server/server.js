import 'dotenv/config';
import app from './app.js';
import logger from './config/logger.js';
import { supabase } from './config/supabase.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Optionally ping supabase to ensure it works
    const { error } = await supabase.from('system_logs').select('id').limit(1);
    if (error) {
       logger.warn('Supabase connected with warning: ' + error.message);
    } else {
       logger.info('✅ Connected to Supabase backend successfully');
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 VidNest Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📊 Analytics API: http://localhost:${PORT}/api/v1/analytics`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection! Shutting down...', { error: err.message });
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully.');
      server.close(() => {
        logger.info('Process terminated.');
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();
