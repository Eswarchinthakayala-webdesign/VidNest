import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../hooks/useLinks';
import { 
  Link as LinkIcon, 
  Plus, 
  ExternalLink, 
  Copy, 
  BarChart3, 
  Calendar, 
  MousePointer2,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Globe,
  Scissors
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Navbar } from '../components/navbar';

// Monochrome palette for charts matching the dashboard
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

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
            {entry.name || entry.dataKey}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-white">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ──────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, delay = 0 }) => {
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
            {value}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Chart Card Wrapper ─────────────────────────────
const ChartCard = ({ title, subtitle, icon: Icon, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300 ${className}`}
  >
    <div className="mb-6 flex flex-col space-y-1.5">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
        {title}
      </h3>
      {subtitle && <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const EmptyState = ({ message, icon: Icon = BarChart3 }) => (
  <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 space-y-3 p-8">
    <Icon className="w-10 h-10 opacity-40" />
    <p className="text-[14px] font-medium text-center">{message}</p>
  </div>
);

// ═══════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════
const LinkShortener = () => {
  const navigate = useNavigate();
  const { links, stats, loading, error, shortenLink, fetchLinkAnalytics } = useLinks();
  const [url, setUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsShortening(true);
    const result = await shortenLink(url);
    setIsShortening(false);

    if (result.success) {
      toast.success('Link shortened successfully!');
      setUrl('');
    } else {
      toast.error(result.error || 'Failed to shorten link');
    }
  };

  if (loading && links.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh] pt-28">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 pb-16">
      <Navbar />
      <div className="pt-28 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-10">
        
        {/* Header & Shortener Input */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Smart Links</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-[15px] mt-1.5">Shorten, share, and track your links with premium analytics.</p>
          </div>

        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Links" 
            value={stats?.totalLinks || 0} 
            icon={LinkIcon} 
            delay={0}
          />
          <StatCard 
            title="Total Clicks" 
            value={stats?.totalClicks || 0} 
            icon={MousePointer2} 
            delay={1}
          />
          <StatCard 
            title="Avg. Clicks/Link" 
            value={stats?.clicksPerLink || 0} 
            icon={BarChart3} 
            delay={2}
          />
          <StatCard 
            title="Top Country" 
            value={stats?.topCountries?.[0]?.country || 'N/A'} 
            icon={Globe} 
            delay={3}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard 
            title="Clicks Trend" 
            subtitle="Last 7 Days" 
            icon={Calendar} 
            className="lg:col-span-2" 
            delay={4}
          >
            <div className="h-72 mt-4">
              {stats?.dailyClicks?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyClicks}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="currentColor" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, className: 'fill-zinc-500 dark:fill-zinc-400' }} 
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
                      dataKey="count"
                      name="Clicks" 
                      stroke="currentColor" 
                      className="stroke-zinc-900 dark:stroke-white text-zinc-900 dark:text-white"
                      strokeWidth={2} 
                      fill="url(#colorClicks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No click data available yet. Share your links!" />
              )}
            </div>
          </ChartCard>

          <ChartCard 
            title="Referrer Sources" 
            subtitle="Top traffic origins" 
            icon={Share2} 
            delay={5}
          >
            <div className="h-72 mt-4">
              {stats?.topReferrers?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topReferrers}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="source"
                      stroke="none"
                    >
                      {stats.topReferrers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                <EmptyState message="No referrer data yet" />
              )}
            </div>
          </ChartCard>
        </div>

        {/* Links Table */}
        <ChartCard title="Your Short Links" subtitle="Manage and monitor your existing links." delay={6} className="overflow-hidden">
          <div className="overflow-x-auto mt-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            {links.length === 0 ? (
              <EmptyState message="No links found. Shorten your first link to see it here!" icon={Scissors} />
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider rounded-l-lg">Short URL</th>
                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Original Destination</th>
                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">Clicks</th>
                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {links.map((link, i) => (
                    <motion.tr 
                      key={link.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" 
                      onClick={() => navigate(`/links/${link.id}`)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                            {link.short_url}
                          </span>
                          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <p className="text-zinc-500 dark:text-zinc-400 truncate max-w-[300px] lg:max-w-[400px]">
                          {link.original_url}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700">
                          {link.total_clicks}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(link.short_url, link.id); }}
                          >
                            {copiedId === link.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <a href={link.short_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={(e) => { e.stopPropagation(); navigate(`/links/${link.id}`); }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default LinkShortener;
