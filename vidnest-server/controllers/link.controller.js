import { supabase } from '../config/supabase.js';
import { nanoid } from 'nanoid';
import logger from '../config/logger.js';

class LinkController {
  
  // Utility: Fast validate
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // POST /api/v1/links/shorten
  async shortenLink(req, res) {
    try {
      const { originalUrl } = req.body;
      const userId = req.user?.id;

      if (!originalUrl || !this.isValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'A valid original URL is required' });
      }

      // Generate a unique 7-character short code
      const shortCode = nanoid(7);

      const { data, error } = await supabase
        .from('links')
        .insert([{
          user_id: userId || null,
          original_url: originalUrl,
          short_code: shortCode,
          total_clicks: 0
        }])
        .select()
        .single();

      if (error) {
        logger.error('Supabase Insert Link Error', { error: error.message });
        return res.status(500).json({ error: 'Failed to create short link' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Return generated link with full hostname
      res.status(201).json({
        message: 'Short link created',
        link: {
          ...data,
          short_url: `${baseUrl}/s/${shortCode}`
        }
      });
    } catch (error) {
      logger.error('Shorten error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/v1/links/dashboard
  async getDashboardAnalytics(req, res) {
    try {
      const userId = req.user.id;

      // 1. Get user's links
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('id, total_clicks')
        .eq('user_id', userId);

      if (linksError) throw linksError;

      const totalLinks = links.length;
      const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
      const linkIds = links.map(l => l.id);

      // If no links, return default state
      if (totalLinks === 0) {
        return res.json({
          totalLinks: 0,
          totalClicks: 0,
          clicksPerLink: 0,
          dailyClicks: [],
          topReferrers: [],
          topCountries: []
        });
      }

      // 2. Aggregate Recent Clicks
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let clickQuery = supabase
        .from('link_clicks')
        .select('clicked_at, referrer, country')
        .gte('clicked_at', sevenDaysAgo);

      // Avoid "in" empty array error
      if (linkIds.length > 0) {
        clickQuery = clickQuery.in('link_id', linkIds);
      } else {
         return res.json({
          totalLinks,
          totalClicks,
          clicksPerLink: 0,
          dailyClicks: [],
          topReferrers: [],
          topCountries: []
        });       
      }

      const { data: recentClicks, error: clicksError } = await clickQuery;

      if (clicksError) throw clicksError;

      // Process aggregations
      const dailyClicksMap = {};
      const referrersMap = {};
      const countriesMap = {};

      (recentClicks || []).forEach(click => {
        // Daily Map
        const date = click.clicked_at.split('T')[0];
        dailyClicksMap[date] = (dailyClicksMap[date] || 0) + 1;

        // Referrers
        const ref = click.referrer || 'direct';
        referrersMap[ref] = (referrersMap[ref] || 0) + 1;

        // Countries
        const country = click.country || 'Unknown';
        countriesMap[country] = (countriesMap[country] || 0) + 1;
      });

      res.json({
        totalLinks,
        totalClicks,
        clicksPerLink: totalLinks > 0 ? (totalClicks / totalLinks).toFixed(2) : 0,
        dailyClicks: Object.entries(dailyClicksMap).map(([date, count]) => ({ date, count })),
        topReferrers: Object.entries(referrersMap).map(([source, count]) => ({ source, count })).sort((a,b) => b.count - a.count).slice(0, 5),
        topCountries: Object.entries(countriesMap).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count).slice(0, 5)
      });

    } catch (error) {
      logger.error('Dashboard link analytics error', { error: error.message });
      res.status(500).json({ error: 'Failed to load analytics dashboard' });
    }
  }

  // GET /api/v1/links/:id/analytics
  async getLinkAnalytics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Ensure the link belongs to the user
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (linkError || !link) {
        return res.status(404).json({ error: 'Link not found or not authorized' });
      }

      // Fetch clicks for this link
      const { data: clicks, error: clicksError } = await supabase
        .from('link_clicks')
        .select('clicked_at, referrer, country, browser, os, device_type')
        .eq('link_id', id);

      if (clicksError) throw clicksError;

      const dailyClicksMap = {};
      const referrersMap = {};
      const countriesMap = {};
      const osMap = {};
      const deviceMap = {};
      const browserMap = {};

      (clicks || []).forEach(click => {
        const date = click.clicked_at.split('T')[0];
        dailyClicksMap[date] = (dailyClicksMap[date] || 0) + 1;

        const ref = click.referrer || 'Direct';
        referrersMap[ref] = (referrersMap[ref] || 0) + 1;

        const country = click.country || 'Unknown';
        countriesMap[country] = (countriesMap[country] || 0) + 1;

        const os = click.os || 'Unknown';
        osMap[os] = (osMap[os] || 0) + 1;
        
        const device = click.device_type || 'Desktop';
        deviceMap[device] = (deviceMap[device] || 0) + 1;

        const browser = click.browser || 'Unknown';
        browserMap[browser] = (browserMap[browser] || 0) + 1;
      });

      // Fill in 0s for missing dates in the last 7 days for the chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const dailyClicks = last7Days.map(date => ({
        date,
        count: dailyClicksMap[date] || 0
      }));

      res.json({
        totalClicks: link.total_clicks,
        created_at: link.created_at,
        original_url: link.original_url,
        short_url: `${req.protocol}://${req.get('host')}/s/${link.short_code}`,
        dailyClicks,
        topReferrers: Object.entries(referrersMap).map(([source, count]) => ({ source, count })).sort((a,b) => b.count - a.count),
        topCountries: Object.entries(countriesMap).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count),
        deviceStats: Object.entries(deviceMap).map(([device, count]) => ({ device, count })).sort((a,b) => b.count - a.count),
        osStats: Object.entries(osMap).map(([os, count]) => ({ os, count })).sort((a,b) => b.count - a.count),
        browserStats: Object.entries(browserMap).map(([browser, count]) => ({ browser, count })).sort((a,b) => b.count - a.count),
      });

    } catch (error) {
      logger.error('Link specific analytics error', { error: error.message });
      res.status(500).json({ error: 'Failed to load link analytics' });
    }
  }

  // GET /api/v1/links
  async getUserLinks(req, res) {
    try {
      const userId = req.user.id;
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch links' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const linksWithUrls = data.map(link => ({
        ...link,
        short_url: `${baseUrl}/s/${link.short_code}`
      }));

      res.json({ links: linksWithUrls });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /s/:short_code (Main Redirect)
  async handleRedirect(req, res) {
    try {
      const { shortCode } = req.params;

      // 1. Find URL
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id, original_url')
        .eq('short_code', shortCode)
        .single();

      if (linkError || !link) {
        return res.status(404).send('Link not found or has been removed.');
      }

      // 2. Redirect directly to the original source URL
      res.redirect(302, link.original_url);

      // 3. Asynchronous Analytics Write
      try {
        const ip_address = req.ip || req.connection?.remoteAddress || 'unknown';
        const user_agent = req.headers['user-agent'] || 'unknown';
        const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
        const country = req.headers['cf-ipcountry'] || 'Unknown';

        // Detect basics from User Agent
        let browser = 'Unknown';
        let os = 'Unknown';
        let device_type = 'desktop';

        if (user_agent.toLowerCase().includes('mobile')) device_type = 'mobile';
        else if (user_agent.toLowerCase().includes('tablet')) device_type = 'tablet';

        if (user_agent.includes('Win')) os = 'Windows';
        else if (user_agent.includes('Mac')) os = 'MacOS';
        else if (user_agent.includes('Linux')) os = 'Linux';
        else if (user_agent.includes('Android')) os = 'Android';
        else if (user_agent.includes('like Mac OS X')) os = 'iOS';

        if (user_agent.includes('Chrome/')) browser = 'Chrome';
        else if (user_agent.includes('Safari/') && !user_agent.includes('Chrome')) browser = 'Safari';
        else if (user_agent.includes('Firefox/')) browser = 'Firefox';
        else if (user_agent.includes('Edge/')) browser = 'Edge';
        else if (user_agent.includes('MSIE') || user_agent.includes('Trident/')) browser = 'IE';

        // Log Click
        await supabase.from('link_clicks').insert([{
          link_id: link.id,
          ip_address,
          user_agent,
          referrer,
          country,
          browser,
          os,
          device_type
        }]);

        // Increment Links Map using Stored Procedure
        const { error: rpcError } = await supabase.rpc('increment_link_clicks', { link_row_id: link.id });
        
        // Fallback for click tracking if RPC fails to install
        if (rpcError) {
          logger.warn('RPC failed for total_clicks, using read-and-modify fallback.');
          const { data: l } = await supabase.from('links').select('total_clicks').eq('id', link.id).single();
          await supabase.from('links').update({ total_clicks: (l?.total_clicks || 0) + 1 }).eq('id', link.id);
        }
      } catch (analyticsError) {
        logger.error('Failed to log link hit', { error: analyticsError.message });
      }
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error while redirecting.');
      }
    }
  }
}

export default new LinkController();
