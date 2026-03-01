import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. SUPABASE INITIALIZATION
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
// Use Service Role Key for backend to bypass RLS for logging clicks
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);


// ==========================================
// 2. AUTHENTICATION MIDDLEWARE
// ==========================================
// Verifies the Supabase JWT sent from the client
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // We can use a separate supabase client with the anon key to verify the user token
    const anonClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseKey);
    const { data: { user }, error } = await anonClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};


// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};


// ==========================================
// 4. API ROUTES
// ==========================================

/**
 * POST /api/shorten
 * Protected route: Creates a short link for the authenticated user
 */
app.post('/api/shorten', authMiddleware, async (req, res) => {
  try {
    const { original_url } = req.body;
    const user_id = req.user.id;

    if (!original_url || !isValidUrl(original_url)) {
      return res.status(400).json({ error: 'A valid original_url is required' });
    }

    // Generate a unique 7-character short code
    const short_code = nanoid(7);

    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id,
        original_url,
        short_code,
        total_clicks: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error.message);
      return res.status(500).json({ error: 'Failed to create short link' });
    }

    // Return the generated short URL data
    res.status(201).json({
      message: 'Short link created',
      link: {
        ...data,
        short_url: `${req.protocol}://${req.get('host')}/s/${short_code}`
      }
    });
  } catch (error) {
    console.error('Shorten error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * GET /s/:short_code
 * Public route: Redirects to the original URL and tracks analytics
 */
app.get('/s/:short_code', async (req, res) => {
  try {
    const { short_code } = req.params;

    // 1. Find the original URL
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, original_url')
      .eq('short_code', short_code)
      .single();

    if (linkError || !link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // 2. Redirect the user immediately for speed (HTTP 302)
    res.redirect(302, link.original_url);

    // 3. Asynchronously record the click & analytics (don't block the redirect)
    const ip_address = req.ip || req.connection?.remoteAddress || 'unknown';
    const user_agent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'direct';
    
    // Simple mock country detection - in production use GeoIP lite or Cloudflare headers
    const country = req.headers['cf-ipcountry'] || 'Unknown';

    try {
      // Insert click log
      await supabase.from('link_clicks').insert([{
        link_id: link.id,
        ip_address,
        user_agent,
        referrer,
        country
      }]);

      // Increment the total_clicks counter on the link using an RPC call or direct update
      // Direct update strategy: wait, since Supabase JS doesn't have native atomic increment,
      // using an RPC (stored procedure) is best. Assuming a `increment_click` RPC exists:
      const { error: rpcError } = await supabase.rpc('increment_link_clicks', { link_row_id: link.id });
      
      // Fallback if RPC isn't created:
      if (rpcError) {
        console.warn('RPC failed, falling back to read-then-write (not atomic)');
        const { data: l } = await supabase.from('links').select('total_clicks').eq('id', link.id).single();
        await supabase.from('links').update({ total_clicks: (l?.total_clicks || 0) + 1 }).eq('id', link.id);
      }
    } catch (analyticsError) {
      console.error('Failed to record analytics:', analyticsError.message);
    }
    
  } catch (error) {
    console.error('Redirect error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});


/**
 * GET /api/links
 * Protected route: Get all links created by the user with their stats
 */
app.get('/api/links', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Since RLS is active, the user can theoretically query safely,
    // but we use the service role key and explicitly filter by user_id
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch links' });
    }

    const linksWithUrls = data.map(link => ({
      ...link,
      short_url: `${req.protocol}://${req.get('host')}/s/${link.short_code}`
    }));

    res.json({ links: linksWithUrls });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * GET /api/dashboard
 * Protected route: Returns analytics summary for the user's links
 */
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1. Get user's links
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, total_clicks')
      .eq('user_id', user_id);

    if (linksError) throw linksError;

    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
    const linkIds = links.map(l => l.id);

    // If they have no links, return empty default stats
    if (totalLinks === 0) {
      return res.json({
        totalLinks: 0,
        totalClicks: 0,
        clicksPerLink: 0,
        recentClicks: [],
        topReferrers: [],
        topCountries: []
      });
    }

    // 2. Aggregate Recent Clicks (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentClicks, error: clicksError } = await supabase
      .from('link_clicks')
      .select('clicked_at, referrer, country')
      .in('link_id', linkIds)
      .gte('clicked_at', sevenDaysAgo);

    if (clicksError) throw clicksError;

    // Process aggregations
    const dailyClicks = {};
    const stringReferrers = {};
    const stringCountries = {};

    recentClicks.forEach(click => {
      // Daily map
      const date = click.clicked_at.split('T')[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;

      // Referrers
      const ref = click.referrer;
      stringReferrers[ref] = (stringReferrers[ref] || 0) + 1;

      // Countries
      const country = click.country;
      stringCountries[country] = (stringCountries[country] || 0) + 1;
    });

    res.json({
      totalLinks,
      totalClicks,
      clicksPerLink: totalLinks > 0 ? (totalClicks / totalLinks).toFixed(2) : 0,
      dailyClicks: Object.entries(dailyClicks).map(([date, count]) => ({ date, count })),
      topReferrers: Object.entries(stringReferrers).map(([source, count]) => ({ source, count })).sort((a,b) => b.count - a.count).slice(0, 5),
      topCountries: Object.entries(stringCountries).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count).slice(0, 5)
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics dashboard' });
  }
});


// ==========================================
// 5. SERVER BOOTSTRAP
// ==========================================
const PORT = process.env.URL_PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener Analytics Engine running on port ${PORT}`);
  console.log(`Test link creation at: POST http://localhost:${PORT}/api/shorten`);
});
