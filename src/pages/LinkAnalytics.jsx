import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { useLinks } from '../hooks/useLinks';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  MousePointer2,
  Share2,
  Smartphone,
  Globe,
  Monitor,
  LayoutTemplate,
  CheckCircle2,
  Copy,
  Loader2,
  Clock,
  TrendingUp,
  Activity,
  User,
  PanelLeft,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
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

import { supabase } from '../lib/supabase';

// monochrome palette for charts matching the dashboard
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
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 text-sm z-50">
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
const StatCard = ({ title, value, subtitle, subtitleClassName, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300 group flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${subtitleClassName || 'text-zinc-500 dark:text-zinc-400'}`}>
                {subtitle}
              </p>
            )}
          </div>
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
    className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300 ${className}`}
  >
    <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col space-y-1">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
        {title}
      </h3>
      {subtitle && <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
    <div className="p-6 flex-1 flex flex-col">
      {children}
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════
const LinkAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchLinkAnalytics } = useLinks();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const loadAnalytics = async (silent = false) => {
      if (!silent) setLoading(true);
      const res = await fetchLinkAnalytics(id);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to load link analytics');
      }
      if (!silent) setLoading(false);
    };
    
    if (id) {
      loadAnalytics();

      // Real-time listener for THIS specific link
      const channel = supabase
        .channel(`link_detail_${id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'link_clicks', 
          filter: `link_id=eq.${id}` 
        }, () => {
          loadAnalytics(true);
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'links', 
          filter: `id=eq.${id}` 
        }, () => {
          loadAnalytics(true);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, fetchLinkAnalytics]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4 pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-zinc-500 font-medium text-sm">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics Unavailable</h2>
          <p className="text-zinc-500 dark:text-zinc-400">{error || 'Could not find data for this link.'}</p>
          <Button onClick={() => navigate('/links')} variant="outline" className="mt-4 border-zinc-200 dark:border-zinc-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Smart Links
          </Button>
        </div>
      </div>
    );
  }

  // Calculate 7-day trend
  const latestClickCount = data.dailyClicks[data.dailyClicks.length - 1]?.count || 0;
  const previousClickCount = data.dailyClicks[data.dailyClicks.length - 2]?.count || 0;
  const trendVal = latestClickCount - previousClickCount;
  const trendPercent = previousClickCount === 0 ? (latestClickCount > 0 ? 100 : 0) : ((trendVal / previousClickCount) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 pb-16">
      <Navbar />
      
      <div className="pt-28 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-8">
        {/* Top Header Row with Back Button & Title */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/links')}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white pl-0 mb-3 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Links
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex flex-wrap items-center gap-3">
              Analytics Overview
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Activity className="w-3 h-3 mr-1" />
                Live Recording
              </span>
            </h1>
          </div>
        </motion.div>

        {/* Selected Link Info Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/60">
            <div className="p-6 lg:w-2/3 flex flex-col justify-center">
               <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                  {/* QR Code */}
                  <div className="shrink-0 p-3 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                    <QRCodeSVG 
                      value={data.short_url} 
                      size={100} 
                      level="H" 
                      includeMargin={false}
                    />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Scan Link</span>
                  </div>

                  <div className="space-y-5 w-full">
                     <div>
                       <div className="flex items-center justify-between">
                         <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><PanelLeft className="w-3 h-3"/> Original Destination</p>
                       </div>
                       <a href={data.original_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-900 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-white transition-colors hover:underline underline-offset-4 line-clamp-2 truncate max-w-full block" title={data.original_url}>
                          {data.original_url}
                       </a>
                     </div>
                     
                     <div className="pt-2">
                       <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Monitor className="w-3 h-3"/> Short URL</p>
                       <div className="flex items-center gap-2">
                         <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-white font-mono text-sm inline-flex items-center group relative overflow-hidden">
                           <span className="relative z-10 font-bold">{data.short_url}</span>
                         </div>
                         <Button 
                           variant="outline" 
                           size="icon" 
                           className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm border-zinc-200 dark:border-zinc-800"
                           onClick={() => copyToClipboard(data.short_url)}
                         >
                           {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                         </Button>
                         <a href={data.short_url} target="_blank" rel="noopener noreferrer">
                           <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm border-zinc-200 dark:border-zinc-800">
                             <ExternalLink className="w-4 h-4" />
                           </Button>
                         </a>
                       </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-6 lg:w-1/3 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col justify-center items-center text-center space-y-1">
               <div className="w-12 h-12 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl flex items-center justify-center mb-2 mx-auto ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-sm">
                 <MousePointer2 className="w-6 h-6" />
               </div>
               <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Engagement</p>
               <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{data.totalClicks?.toLocaleString()}</h3>
               <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center mt-1 font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  Created {new Date(data.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
               </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Click Velocity" 
            value={trendVal >= 0 ? `+${trendVal}` : trendVal} 
            subtitle={`${Math.abs(trendPercent)}% vs yesterday`}
            subtitleClassName={trendVal >= 0 ? 'text-emerald-500' : 'text-red-500'}
            icon={TrendingUp} 
            delay={2}
          />
          <StatCard 
            title="Top Referrer" 
            value={data.topReferrers?.[0]?.source || 'None'} 
            subtitle={`${data.topReferrers?.[0]?.count || 0} visits`}
            icon={Share2} 
            delay={3}
          />
          <StatCard 
            title="Top Location" 
            value={data.topCountries?.[0]?.country || 'Unknown'} 
            subtitle={`${data.topCountries?.[0]?.count || 0} visits`}
            icon={Globe} 
            delay={4}
          />
          <StatCard 
            title="Primary Device" 
            value={data.deviceStats?.[0]?.device || 'Unknown'} 
            subtitle={`${data.deviceStats?.[0]?.count || 0} visits`}
            icon={Smartphone} 
            delay={5}
          />
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeseries Graph - Takes up 2/3 of space on large screens */}
          <ChartCard 
            title="Engagement Over Time" 
            subtitle="Clicks recorded over the last 7 days" 
            icon={Calendar} 
            delay={6}
            className="lg:col-span-2"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyClicks}>
                  <defs>
                    <linearGradient id="gradientClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="currentColor" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="inherit" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, className: 'fill-zinc-500 dark:fill-zinc-400' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, className: 'fill-zinc-500 dark:fill-zinc-400' }} allowDecimals={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Clicks"
                    stroke="currentColor" 
                    className="stroke-zinc-900 dark:stroke-white text-zinc-900 dark:text-white"
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#gradientClicks)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Map/Country Breakdown */}
          <ChartCard 
            title="Global Reach" 
            subtitle="Top visiting countries" 
            icon={Globe}
            delay={7}
          >
            <div className="flex-1 flex flex-col justify-center">
              {data.topCountries?.length > 0 ? (
                <div className="space-y-5">
                  {data.topCountries.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-900 dark:text-white truncate pl-2 border-l-2 border-zinc-900 dark:border-white">
                          {item.country === 'Unknown' ? 'Other' : item.country}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-zinc-900 dark:text-white">{item.count}</span>
                           <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono w-8 text-right">
                             {Math.round((item.count / data.totalClicks) * 100)}%
                           </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-zinc-900 dark:bg-white rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / data.totalClicks) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-sm opacity-80 py-8">
                  <Globe className="w-8 h-8 mb-2 opacity-50" />
                  No geographic data
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Audience Breakdown row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Referrers */}
           <ChartCard title="Traffic Sources" icon={Share2} delay={8}>
              <div className="-mx-6 px-6 overflow-y-auto max-h-[220px] custom-scrollbar">
               {data.topReferrers?.length > 0 ? (
                 <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                   {data.topReferrers.map((item, i) => (
                     <div key={i} className="flex justify-between items-center py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                       <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 capitalize truncate max-w-[200px]" title={item.source}>
                         {item.source === 'direct' ? 'Direct' : item.source.replace('https://', '').replace('/', '')}
                       </span>
                       <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-md">{item.count}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                  <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No referrer data</div>
               )}
              </div>
           </ChartCard>

           {/* Devices */}
           <ChartCard title="Device Types" icon={Smartphone} delay={9}>
              <div className="-mx-6 px-6 overflow-y-auto max-h-[220px] custom-scrollbar">
               {data.deviceStats?.length > 0 ? (
                 <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                   {data.deviceStats.map((item, i) => (
                     <div key={i} className="flex justify-between items-center py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                       <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 capitalize flex items-center gap-2">
                          {item.device === 'mobile' ? <Smartphone className="w-4 h-4 text-zinc-400"/> : <Monitor className="w-4 h-4 text-zinc-400"/>}
                          {item.device}
                       </span>
                       <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-md">{item.count}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                  <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No device data</div>
               )}
              </div>
           </ChartCard>

           {/* OS / Browsers */}
           <ChartCard title="Operating Systems" icon={LayoutTemplate} delay={10}>
              {data.osStats?.length > 0 ? (
                <div className="flex h-[200px] flex-col sm:flex-row items-center justify-between">
                  <div className="w-full sm:w-1/2 h-[150px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.osStats}
                            cx="50%" cy="50%"
                            innerRadius={45} outerRadius={65}
                            paddingAngle={3}
                            dataKey="count" stroke="none"
                          >
                            {data.osStats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">{data.osStats.length} OS</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col justify-center gap-3 overflow-y-auto custom-scrollbar max-h-full pl-0 sm:pl-4 mt-4 sm:mt-0">
                    {data.osStats.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate text-zinc-700 dark:text-zinc-300">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{backgroundColor: `var(--chart-${(i % 5) + 1})`}}></span>
                          <span className="truncate max-w-[80px] sm:max-w-[100px]" title={item.os}>{item.os}</span>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">No OS data</div>
              )}
           </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default LinkAnalytics;
