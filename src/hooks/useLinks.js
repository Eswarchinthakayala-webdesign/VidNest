import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

export function useLinks() {
  const { token } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchLinks = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE}/links`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch links');
      setLinks(data.links || []);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/links/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, [token]);

  const shortenLink = async (originalUrl) => {
    if (!token) return { success: false, error: 'Auth required' };
    try {
      const res = await fetch(`${API_BASE}/links/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ originalUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to shorten link');
      await fetchLinks(true);
      return { success: true, link: data.link };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const fetchLinkAnalytics = useCallback(async (id) => {
    if (!token) return { success: false, error: 'Auth required' };
    try {
      const res = await fetch(`${API_BASE}/links/${id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch link analytics');
      return { success: true, data };
    } catch (err) {
      console.error('Link analytics error:', err);
      return { success: false, error: err.message };
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchLinks();
    fetchStats();

    // ═══════════════════════════════════════════════
    //  REAL-TIME DATABASE SYNC
    // ═══════════════════════════════════════════════

    // 1. Listen for status changes on the links table (total_clicks updates)
    const linksChannel = supabase
      .channel('links_realtime')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'links' 
      }, (payload) => {
        // Silent refresh so user doesn't see a loading spinner
        fetchLinks(true);
        fetchStats(true);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('✅ Realtime: Links sync active');
      });

    // 2. Listen for new analytical records in link_clicks
    const clicksChannel = supabase
      .channel('clicks_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'link_clicks' 
      }, () => {
        fetchStats(true);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('✅ Realtime: Clicks logic active');
      });

    return () => {
      supabase.removeChannel(linksChannel);
      supabase.removeChannel(clicksChannel);
    };
  }, [token, fetchLinks, fetchStats]);

  return { 
    links, 
    stats, 
    loading, 
    error, 
    shortenLink, 
    fetchLinkAnalytics, 
    refresh: () => { fetchLinks(); fetchStats(); } 
  };
}
