import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

export function systemLogger(req, res, next) {
  const startTime = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const responseTimeMs = Date.now() - startTime;
    const errorFlag = res.statusCode >= 400;

    // Supabase will automatically create created_at default timestamp
    supabase
      .from('system_logs')
      .insert([{
        endpoint: req.originalUrl,
        method: req.method,
        status_code: res.statusCode,
        response_time_ms: responseTimeMs,
        error_flag: errorFlag,
        message: errorFlag ? `HTTP ${res.statusCode}` : null,
        ip_address: req.ip || req.connection?.remoteAddress,
      }])
      .then(({ error }) => {
        if (error) logger.error('Failed to log system request to Supabase', { error: error.message });
      });

    originalEnd.apply(res, args);
  };

  next();
}
