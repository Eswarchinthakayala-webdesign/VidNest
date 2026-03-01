import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

function useAnalyticsAPI(endpoint, options = {}) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { autoFetch = true, params = {} } = options;

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE}/analytics/${endpoint}?${queryString}` : `${API_BASE}/analytics/${endpoint}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Remove credentials: 'include' as Supabase JWT is in Authorization header, no local cookies needed from our backend
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      console.error(`Analytics API error [${endpoint}]:`, err);
    } finally {
      setLoading(false);
    }
  }, [token, endpoint, JSON.stringify(params)]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
}

// Pre-built hooks for specific endpoints
export function useUserSummary() {
  return useAnalyticsAPI('user-summary');
}

export function useUserTrend(days = 30) {
  return useAnalyticsAPI('user-trend', { params: { days } });
}

export function useRecentDownloads(limit = 10) {
  return useAnalyticsAPI('recent-downloads', { params: { limit } });
}

export function usePlatformDistribution() {
  return useAnalyticsAPI('platform-distribution');
}

export function useFormatDistribution() {
  return useAnalyticsAPI('format-distribution');
}

export function useDailyDownloads(days = 30) {
  return useAnalyticsAPI('daily-downloads', { params: { days } });
}

export function useSystemHealth() {
  return useAnalyticsAPI('system-health');
}

export function useErrorRate() {
  return useAnalyticsAPI('error-rate');
}

export function useHourlyUsage() {
  return useAnalyticsAPI('hourly-usage');
}
