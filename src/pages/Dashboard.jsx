import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Download, TrendingUp, Clock, CheckCircle2,
  XCircle, HardDrive, Activity, Users, Globe, Cpu,
  MemoryStick, Timer, AlertTriangle, Wifi, ChevronDown,
  ExternalLink, Zap, PieChart as PieChartIcon, ArrowUpRight,
  ArrowDownRight, Shield, Server,
  Youtube, Instagram, Twitter, Facebook, Twitch, Music2, Radio, Smartphone
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  useUserSummary, useUserTrend, useRecentDownloads,
  usePlatformDistribution, useFormatDistribution,
  useDailyDownloads, useSystemHealth, useErrorRate,
  useHourlyUsage
} from '../hooks/useAnalytics';
import { Navbar } from '../components/navbar';

// Monochrome palette for charts
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

const STATUS_COLORS = {
  success: 'text-emerald-600 dark:text-emerald-400',
  failed: 'text-red-500 dark:text-red-400',
  processing: 'text-amber-500 dark:text-amber-400',
  pending: 'text-zinc-500 dark:text-zinc-400',
};

// ─── Animated Counter ──────────────────────────────
const AnimatedNumber = ({ value, suffix = '', prefix = '' }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="tabular-nums"
    >
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </motion.span>
  );
};

// ─── Stat Card ──────────────────────────────────────
const StatCard = ({ title, value, suffix = '', prefix = '', icon: Icon, trend, trendLabel, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-2">
              {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(trend)}% {trendLabel || 'vs last week'}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Chart Card Wrapper ─────────────────────────────
const ChartCard = ({ title, subtitle, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300 ${className}`}
  >
    <div className="mb-6 flex flex-col space-y-1.5">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

// ─── Custom Tooltip ────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-medium text-zinc-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-zinc-600 dark:text-zinc-400 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || '#a1a1aa' }} />
            {entry.name}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-white">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Loading Skeleton ──────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800/60 rounded-lg ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// ─── Format helpers ──────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatTime(ms) {
  if (!ms) return '0s';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getPlatformIcon(platform) {
  const map = {
    'YouTube': <Youtube className="w-3.5 h-3.5" />,
    'Instagram': <Instagram className="w-3.5 h-3.5" />,
    'TikTok': <Smartphone className="w-3.5 h-3.5" />,
    'Twitter/X': <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>,
    'Facebook': <Facebook className="w-3.5 h-3.5" />,
    'Vimeo': <Youtube className="w-3.5 h-3.5" />,
    'Reddit': <Globe className="w-3.5 h-3.5" />,
    'Twitch': <Twitch className="w-3.5 h-3.5" />,
    'SoundCloud': <Radio className="w-3.5 h-3.5" />,
    'Spotify': <Music2 className="w-3.5 h-3.5" />,
  };
  return map[platform] || <Globe className="w-3.5 h-3.5" />;
}

// ═══════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════
const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: summary, loading: summaryLoading } = useUserSummary();
  const { data: trend } = useUserTrend(30);
  const { data: recentDownloads } = useRecentDownloads(10);
  const { data: platformDist } = usePlatformDistribution();
  const { data: formatDist } = useFormatDistribution();
  const { data: dailyDownloads } = useDailyDownloads(30);
  const { data: systemHealth } = useSystemHealth();
  const { data: errorRate } = useErrorRate();
  const { data: hourlyUsage } = useHourlyUsage();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Platform Analytics', icon: PieChartIcon },
    { id: 'system', label: 'System', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-2xl font-semibold shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Welcome back, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-[15px] mt-1.5">
                  Here's your analytics overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">System Online</span>
            </div>
          </div>
        </motion.div>

        {/* Minimal Pill Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-200/50 dark:bg-zinc-900 rounded-xl mb-10 w-max max-w-full overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-[10px] font-semibold text-[14px] transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.02)]'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab
                summary={summary}
                summaryLoading={summaryLoading}
                trend={trend}
                recentDownloads={recentDownloads}
                platformDist={platformDist}
                formatDist={formatDist}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsTab
                platformDist={platformDist}
                formatDist={formatDist}
                dailyDownloads={dailyDownloads}
                hourlyUsage={hourlyUsage}
                systemHealth={systemHealth}
              />
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SystemTab
                systemHealth={systemHealth}
                errorRate={errorRate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  OVERVIEW TAB
// ═══════════════════════════════════════════════════
const OverviewTab = ({ summary, summaryLoading, trend, recentDownloads, platformDist, formatDist }) => {
  if (summaryLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Downloads"
          value={summary?.totalDownloads || 0}
          icon={Download}
          delay={0}
        />
        <StatCard
          title="Downloads This Week"
          value={summary?.downloadsThisWeek || 0}
          icon={TrendingUp}
          delay={1}
        />
        <StatCard
          title="Success Rate"
          value={summary?.successRate || 0}
          suffix="%"
          icon={CheckCircle2}
          delay={2}
        />
        <StatCard
          title="Failed Downloads"
          value={summary?.failedCount || 0}
          icon={XCircle}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Favorite Platform"
          value={summary?.mostUsedPlatform || 'N/A'}
          icon={Globe}
          delay={4}
        />
        <StatCard
          title="Preferred Format"
          value={summary?.favoriteFormat || 'N/A'}
          icon={HardDrive}
          delay={5}
        />
        <StatCard
          title="Avg Processing"
          value={formatTime(summary?.avgProcessingTime)}
          icon={Clock}
          delay={6}
        />
        <StatCard
          title="Avg File Size"
          value={formatBytes(summary?.avgFileSize)}
          icon={HardDrive}
          delay={7}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Download Trend */}
        <ChartCard
          title="Download Trend"
          subtitle="Last 30 days"
          delay={8}
          className="lg:col-span-2"
        >
          <div className="h-72 mt-4">
            {trend?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.data}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }}
                    tickFormatter={(val) => val.slice(5)}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} 
                    allowDecimals={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    name="Downloads"
                    stroke="currentColor"
                    className="stroke-zinc-900 dark:stroke-white text-zinc-900 dark:text-white"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No download data yet" />
            )}
          </div>
        </ChartCard>

        {/* Platform Distribution */}
        <ChartCard title="Platform Usage" subtitle="All time" delay={9}>
          <div className="h-72 mt-4">
            {platformDist?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDist.data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {platformDist.data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => <span className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No platform data yet" />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Recent Downloads Table */}
      <ChartCard title="Recent Downloads" subtitle="Last 10 downloads" delay={10}>
        <div className="overflow-x-auto mt-4">
          {recentDownloads?.downloads?.length > 0 ? (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider rounded-l-lg">Platform</th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell">URL</th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Format</th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Size</th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right hidden lg:table-cell rounded-r-lg">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recentDownloads.downloads.map((dl, i) => (
                  <motion.tr
                    key={dl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-sm">
                          {getPlatformIcon(dl.platform)}
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">{dl.platform}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 max-w-[200px] text-zinc-500 dark:text-zinc-400">
                        <span className="truncate text-xs">{dl.originalUrl}</span>
                        <a href={dl.originalUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="uppercase text-[11px] font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-md">
                        {dl.format}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell text-zinc-500 dark:text-zinc-400 text-sm">
                      {dl.fileSize ? formatBytes(dl.fileSize) : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${STATUS_COLORS[dl.status] || 'text-zinc-400'}`}>
                        {dl.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                        {dl.status === 'failed' && <XCircle className="w-4 h-4" />}
                        {dl.status === 'processing' && <Clock className="w-4 h-4 animate-spin" />}
                        {dl.status.charAt(0).toUpperCase() + dl.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-500 dark:text-zinc-400 text-xs hidden lg:table-cell font-medium">
                      {timeAgo(dl.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState message="No downloads recorded yet. Start downloading to see your history!" />
          )}
        </div>
      </ChartCard>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  PLATFORM ANALYTICS TAB
// ═══════════════════════════════════════════════════
const AnalyticsTab = ({ platformDist, formatDist, dailyDownloads, hourlyUsage, systemHealth }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Downloads Today" value={systemHealth?.today?.totalDownloads || 0} icon={Download} delay={0} />
      <StatCard title="Downloads This Month" value={systemHealth?.thisMonth?.totalDownloads || 0} icon={TrendingUp} delay={1} />
      <StatCard title="Active Users Today" value={systemHealth?.today?.activeUsers || 0} icon={Users} delay={2} />
      <StatCard title="Avg Response Time" value={systemHealth?.today?.avgResponseTime || 0} suffix="ms" icon={Timer} delay={3} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Platform Distribution" subtitle="Downloads by platform" delay={4}>
        <div className="h-80 mt-4">
          {platformDist?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformDist.data}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {platformDist.data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No platform data available" />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Format Distribution" subtitle="Most popular formats" delay={5}>
        <div className="h-80 mt-4">
          {formatDist?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatDist.data} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid horizontal={true} vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, className: 'fill-zinc-700 dark:fill-zinc-300', fontWeight: 600 }}
                  width={60}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Downloads"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  className="fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No format data available" />
          )}
        </div>
      </ChartCard>
    </div>

    <ChartCard title="Daily Downloads" subtitle="Last 30 days — all users" delay={6}>
      <div className="h-80 mt-4">
        {dailyDownloads?.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyDownloads.data}>
              <defs>
                <linearGradient id="dailySuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dailyFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} tickFormatter={(val) => val.slice(5)} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} allowDecimals={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
              <Area type="monotone" dataKey="success" name="Success" strokeWidth={2} stroke="#10b981" className="text-emerald-500" fill="url(#dailySuccess)" />
              <Area type="monotone" dataKey="failed" name="Failed" strokeWidth={2} stroke="#ef4444" className="text-red-500" strokeDasharray="5 5" fill="url(#dailyFailed)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No daily data available" />
        )}
      </div>
    </ChartCard>

    <ChartCard title="Peak Usage Time" subtitle="Downloads per hour (last 7 days)" delay={7}>
      <div className="h-72 mt-4">
        {hourlyUsage?.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyUsage.data} margin={{ top: 10 }}>
              <CartesianGrid vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, className: 'fill-zinc-500 dark:fill-zinc-400' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} allowDecimals={false} dx={-10} />
              <Tooltip cursor={{fill: 'var(--color-hover)'}} content={<CustomTooltip />} />
              <Bar dataKey="count" name="Downloads" radius={[4, 4, 0, 0]} barSize={24} className="fill-zinc-800 dark:fill-zinc-200" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No hourly data available" />
        )}
      </div>
    </ChartCard>
  </div>
);

// ═══════════════════════════════════════════════════
//  SYSTEM TAB
// ═══════════════════════════════════════════════════
const SystemTab = ({ systemHealth, errorRate }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Server Uptime" value={systemHealth?.server?.uptimeFormatted || '—'} icon={Activity} delay={0} />
      <StatCard title="Memory (Heap)" value={systemHealth?.server?.memoryUsage?.heapUsed || '—'} icon={Cpu} delay={1} />
      <StatCard title="Error Rate" value={systemHealth?.today?.errorRate || 0} suffix="%" icon={AlertTriangle} delay={2} />
      <StatCard title="Node Version" value={systemHealth?.server?.nodeVersion || '—'} icon={Server} delay={3} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Server Resources" subtitle="Current memory usage" delay={4}>
        <div className="space-y-6 mt-4">
          {systemHealth?.server?.memoryUsage && Object.entries(systemHealth.server.memoryUsage).map(([key, val], i) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-zinc-500 dark:text-zinc-400 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-bold text-zinc-900 dark:text-white">{val}</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(30 + i * 15, 90)}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="h-full bg-zinc-900 dark:bg-white rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Today's Activity" subtitle="Real-time overview" delay={5}>
        <div className="space-y-1 mt-2">
          <InfoRow icon={Download} label="Total Downloads" value={systemHealth?.today?.totalDownloads} />
          <InfoRow icon={Users} label="Active Users" value={systemHealth?.today?.activeUsers} />
          <InfoRow icon={XCircle} label="Errors Today" value={systemHealth?.today?.errors} />
          <InfoRow icon={Timer} label="Avg Response" value={`${systemHealth?.today?.avgResponseTime || 0}ms`} />
          <InfoRow icon={Shield} label="Error Rate" value={`${systemHealth?.today?.errorRate || 0}%`} />
          <InfoRow icon={TrendingUp} label="Downloads (Month)" value={systemHealth?.thisMonth?.totalDownloads} />
        </div>
      </ChartCard>
    </div>

    <ChartCard title="Error Rate Over Time" subtitle="Hourly error rate — last 24 hours" delay={6}>
      <div className="h-72 mt-4">
        {errorRate?.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorRate.data}>
              <CartesianGrid vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, className: 'fill-zinc-500 dark:fill-zinc-400' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} unit="%" dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="errorRate"
                name="Error Rate %"
                strokeWidth={2}
                stroke="#ef4444"
                dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No error data available — that's a good sign! 🎉" />
        )}
      </div>
    </ChartCard>
  </div>
);

// ─── Helper Components ──────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 px-2 -mx-2 rounded-lg transition-colors">
    <div className="flex items-center gap-3 text-[14px] text-zinc-600 dark:text-zinc-400 font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <span className="text-[14px] font-bold text-zinc-900 dark:text-white">
      {value ?? '—'}
    </span>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
    <BarChart3 className="w-10 h-10 mb-4 opacity-40" />
    <p className="text-[14px] font-medium text-center max-w-xs">{message}</p>
  </div>
);

export default Dashboard;
