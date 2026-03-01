import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.warn('Missing Supabase environment variables in backend. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// Fallback to dummy strings to prevent crashes on initialization if env vars are perfectly missing
const urlForSupabase = supabaseUrl || 'https://placeholder.supabase.co';
const keyForSupabase = supabaseServiceKey || 'placeholder-key';

// Ensure the backend uses the service role key so it can bypass RLS for system logging and admin analytics
export const supabase = createClient(urlForSupabase, keyForSupabase, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
