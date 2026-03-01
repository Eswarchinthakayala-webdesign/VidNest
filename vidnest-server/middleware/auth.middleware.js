import { createClient } from '@supabase/supabase-js';
import logger from '../config/logger.js';

/**
 * Verify Supabase JWT token middleware
 * Extracts JWT from Authorization header and uses Supabase to verify it.
 */
export async function authMiddleware(req, res, next) {
  try {
    let token;

    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.vidnest_token) {
      token = req.cookies.vidnest_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // We create an anon supabase client just to verify the user token
    // (You can also do a simple JWT verification with the supbase JWT secret)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional Auth Middleware
 * Attaches user if token is present and valid
 */
export async function optionalAuth(req, res, next) {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.vidnest_token) {
      token = req.cookies.vidnest_token;
    }

    if (token) {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

      const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabaseAuthClient.auth.getUser(token);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently continue
    next();
  }
}
