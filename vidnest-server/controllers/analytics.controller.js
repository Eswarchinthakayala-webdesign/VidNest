import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

class AnalyticsController {
  // ═══════════════════════════════════════════════
  //  USER ANALYTICS (requires auth)
  // ═══════════════════════════════════════════════

  async getUserSummary(req, res) {
    try {
      const userId = req.user.id;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total downloads
      const { count: totalDownloads, error: totalErr } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Downloads this week
      const { count: downloadsThisWeek, error: weekErr } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneWeekAgo);

      // Success / Failed count
      const { count: successCount, error: succErr } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'success');

      const { count: failedCount, error: failErr } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'failed');

      // Fetch all user downloads for aggregations (since standard supabase rest API doesn't have complex aggregations)
      const { data: userDownloads, error: dataErr } = await supabase
        .from('downloads')
        .select('platform, format, processing_time_ms, file_size')
        .eq('user_id', userId);

      if (totalErr || weekErr || succErr || failErr || dataErr) throw new Error('Query error');

      let mostUsedPlatform = 'N/A';
      let favoriteFormat = 'N/A';
      let avgProcessingTime = 0;
      let avgFileSize = 0;

      if (userDownloads && userDownloads.length > 0) {
        const platformMap = {};
        const formatMap = {};
        let totalProcessing = 0;
        let validProcessingCount = 0;
        let totalSize = 0;
        let validSizeCount = 0;

        userDownloads.forEach(d => {
          if (d.platform) platformMap[d.platform] = (platformMap[d.platform] || 0) + 1;
          if (d.format) formatMap[d.format] = (formatMap[d.format] || 0) + 1;
          if (d.processing_time_ms) {
            totalProcessing += d.processing_time_ms;
            validProcessingCount++;
          }
          if (d.file_size) {
            totalSize += Number(d.file_size);
            validSizeCount++;
          }
        });

        if (Object.keys(platformMap).length) mostUsedPlatform = Object.keys(platformMap).reduce((a, b) => platformMap[a] > platformMap[b] ? a : b);
        if (Object.keys(formatMap).length) favoriteFormat = Object.keys(formatMap).reduce((a, b) => formatMap[a] > formatMap[b] ? a : b);
        if (validProcessingCount) avgProcessingTime = Math.round(totalProcessing / validProcessingCount);
        if (validSizeCount) avgFileSize = totalSize / validSizeCount;
      }

      const successRate = totalDownloads > 0
        ? ((successCount / totalDownloads) * 100).toFixed(1)
        : 0;

      return res.json({
        totalDownloads,
        downloadsThisWeek,
        successCount,
        failedCount,
        successRate: parseFloat(successRate),
        mostUsedPlatform,
        favoriteFormat,
        avgProcessingTime,
        avgFileSize,
      });
    } catch (error) {
      logger.error('User summary error', { error: error.message });
      return res.status(500).json({ error: 'Failed to get user summary' });
    }
  }

  async getUserTrend(req, res) {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('created_at, status')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyMap = {};
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyMap[key] = { date: key, downloads: 0, success: 0, failed: 0 };
      }

      downloads.forEach((d) => {
        const key = d.created_at.split('T')[0];
        if (dailyMap[key]) {
          dailyMap[key].downloads++;
          if (d.status === 'success') dailyMap[key].success++;
          if (d.status === 'failed') dailyMap[key].failed++;
        }
      });

      return res.json({ period: `${days} days`, data: Object.values(dailyMap) });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get user trend' });
    }
  }

  async getRecentDownloads(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const serialized = downloads.map((d) => ({
        ...d,
        id: d.id,
        originalUrl: d.original_url,
        fileSize: d.file_size ? Number(d.file_size) : null,
        processingTimeMs: d.processing_time_ms,
        createdAt: d.created_at,
        errorMessage: d.error_message,
        // map other props if needed for frontend, but frontend should map dynamically
      }));

      return res.json({ downloads: serialized });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get recent downloads' });
    }
  }

  // ═══════════════════════════════════════════════
  //  GLOBAL / ADMIN ANALYTICS
  // ═══════════════════════════════════════════════

  async getPlatformDistribution(req, res) {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('platform');

      if (error) throw error;

      const stats = {};
      data.forEach(d => {
        stats[d.platform] = (stats[d.platform] || 0) + 1;
      });

      const formatted = Object.keys(stats)
        .map(key => ({ name: key, value: stats[key] }))
        .sort((a, b) => b.value - a.value);

      return res.json({ data: formatted });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get platform distribution' });
    }
  }

  async getFormatDistribution(req, res) {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('format');

      if (error) throw error;

      const stats = {};
      data.forEach(d => {
        stats[d.format] = (stats[d.format] || 0) + 1;
      });

      const formatted = Object.keys(stats)
        .map(key => ({ name: key, value: stats[key] }))
        .sort((a, b) => b.value - a.value);

      return res.json({ data: formatted });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get format distribution' });
    }
  }

  async getDailyDownloads(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('created_at, status')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyMap = {};
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyMap[key] = { date: key, total: 0, success: 0, failed: 0 };
      }

      downloads.forEach((d) => {
        const key = d.created_at.split('T')[0];
        if (dailyMap[key]) {
          dailyMap[key].total++;
          if (d.status === 'success') dailyMap[key].success++;
          if (d.status === 'failed') dailyMap[key].failed++;
        }
      });

      return res.json({ period: `${days} days`, data: Object.values(dailyMap) });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get daily downloads' });
    }
  }

  async getSystemHealth(req, res) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [{ count: todayDownloads }, { count: monthDownloads }, { data: userLogs }, { count: todayErrors }] = await Promise.all([
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', thisMonth),
        supabase.from('downloads').select('user_id').gte('created_at', today),
        supabase.from('system_logs').select('*', { count: 'exact', head: true }).eq('error_flag', true).gte('created_at', today),
      ]);

      const uniqueUsers = new Set((userLogs || []).map(l => l.user_id)).size;

      const { data: sysLogs } = await supabase
        .from('system_logs')
        .select('response_time_ms, error_flag')
        .gte('created_at', today);

      let totalLogs = 0;
      let totalErrLogs = 0;
      let totalTime = 0;
      
      if (sysLogs) {
        totalLogs = sysLogs.length;
        sysLogs.forEach(l => {
          if (l.error_flag) totalErrLogs++;
          if (l.response_time_ms) totalTime += l.response_time_ms;
        });
      }

      const avgResponseTime = totalLogs ? totalTime / totalLogs : 0;
      const memory = process.memoryUsage();
      const errorRate = totalLogs > 0 ? ((totalErrLogs / totalLogs) * 100).toFixed(2) : 0;

      return res.json({
        server: {
          uptime: Math.round(process.uptime()),
          uptimeFormatted: formatUptime(process.uptime()),
          memoryUsage: {
            rss: formatBytes(memory.rss),
            heapUsed: formatBytes(memory.heapUsed),
            heapTotal: formatBytes(memory.heapTotal),
            external: formatBytes(memory.external),
          },
          nodeVersion: process.version,
          platform: process.platform,
        },
        today: {
          totalDownloads: todayDownloads || 0,
          activeUsers: uniqueUsers,
          errors: todayErrors || 0,
          errorRate: parseFloat(errorRate),
          avgResponseTime: Math.round(avgResponseTime),
        },
        thisMonth: {
          totalDownloads: monthDownloads || 0,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get system health' });
    }
  }

  async getErrorRate(req, res) {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('system_logs')
        .select('created_at, error_flag')
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const hourlyMap = {};
      for (let i = 0; i < 24; i++) {
        const hour = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
        const key = `${hour.getHours().toString().padStart(2, '0')}:00`;
        hourlyMap[key] = { hour: key, total: 0, errors: 0, errorRate: 0 };
      }

      logs.forEach((log) => {
        const d = new Date(log.created_at);
        const key = `${d.getHours().toString().padStart(2, '0')}:00`;
        if (hourlyMap[key]) {
          hourlyMap[key].total++;
          if (log.error_flag) hourlyMap[key].errors++;
        }
      });

      Object.values(hourlyMap).forEach((h) => {
        h.errorRate = h.total > 0 ? parseFloat(((h.errors / h.total) * 100).toFixed(2)) : 0;
      });

      return res.json({ data: Object.values(hourlyMap) });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get error rate' });
    }
  }

  async getHourlyUsage(req, res) {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('created_at')
        .gte('created_at', since);

      if (error) throw error;

      const hourlyMap = {};
      for (let i = 0; i < 24; i++) {
        const key = `${i.toString().padStart(2, '0')}:00`;
        hourlyMap[key] = { hour: key, count: 0 };
      }

      downloads.forEach((d) => {
        const hour = new Date(d.created_at);
        const key = `${hour.getHours().toString().padStart(2, '0')}:00`;
        if (hourlyMap[key]) hourlyMap[key].count++;
      });

      return res.json({ data: Object.values(hourlyMap) });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get hourly usage' });
    }
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export default new AnalyticsController();
