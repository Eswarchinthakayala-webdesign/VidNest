import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Link as LinkIcon, Download, Play, Tv, 
  Check, X, AlertCircle, HardDrive, Clock, Eye, AlertTriangle, Share2, Copy
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Spinner } from './ui/spinner';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export const DownloaderInterface = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [activeDownload, setActiveDownload] = useState(null); // { formatId, progress, loaded, total, speed }
  const [copiedShortUrl, setCopiedShortUrl] = useState(false);
  const inputRef = useRef(null);

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Size unknown';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec === 0) return 'Calculating...';
    const mbps = bytesPerSec / (1024 * 1024);
    if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
    return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  };

  const formatResolutionDisplay = (res) => {
    if (!res) return 'Unknown Quality';
    if (typeof res === 'string' && res.toLowerCase() === 'audio only') return 'Audio Only';
    if (typeof res === 'string' && res.includes('x')) {
      const parts = res.split('x');
      return `${parts[1]}p`;
    }
    if (!isNaN(res)) {
      return `${res}p`;
    }
    return res;
  };

  const handleFetchMetadata = async () => {
    if (!url) {
      toast.error('Please enter a video URL');
      return;
    }

    try {
      // Basic client-side validation
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsFetchingMetadata(true);
    setError(null);
    setMetadata(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:5000/api/v1/video/metadata', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch video data');
      }

      setMetadata(data);
      toast.success('Video loaded successfully');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Could not load video');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleDownload = async (format) => {
    if (activeDownload) {
      toast.warning('A download is already in progress');
      return;
    }

    const totalSize = format.filesize || 0;
    setActiveDownload({ formatId: format.formatId, progress: 0, loaded: 0, total: totalSize, speed: 0 });
    const toastId = toast.loading(`Starting download: ${format.resolution}...`);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('http://localhost:5000/api/v1/video/download', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          url, 
          format: format.formatId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Download failed on server');
      }

      // Handle file stream with progress tracking
      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : (format.filesize || 0);
      let loaded = 0;
      let lastLoaded = 0;
      let lastTime = Date.now();
      let currentSpeed = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        const now = Date.now();
        const elapsed = (now - lastTime) / 1000;
        if (elapsed >= 0.3) {
          currentSpeed = (loaded - lastLoaded) / elapsed;
          lastLoaded = loaded;
          lastTime = now;
        }

        const progress = total ? Math.round((loaded / total) * 100) : 0;
        setActiveDownload(prev => {
          if (prev && (prev.progress !== progress || prev.loaded !== loaded)) {
            return { formatId: format.formatId, progress, loaded, total, speed: currentSpeed };
          }
          return prev;
        });
      }

      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Try to determine safe filename
      const safeTitle = metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'video';
      const ext = format.ext || 'mp4';
      a.download = `vidnest_${safeTitle}_${format.resolution}.${ext}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success('Download completed successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Download failed: ${err.message}`, { id: toastId });
    } finally {
      setActiveDownload(null);
    }
  };

  const copyShortUrl = () => {
    if (metadata?.shortUrl) {
      navigator.clipboard.writeText(metadata.shortUrl);
      setCopiedShortUrl(true);
      toast.success('Shareable link copied!');
      setTimeout(() => setCopiedShortUrl(false), 2000);
    }
  };

  // Auto-fetch from URL parameter
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && urlParam !== url) {
      setUrl(urlParam);
      // Trigger fetch after a tiny delay to ensure everything is mounted
      setTimeout(() => {
        handleFetchMetadata();
      }, 100);
    }
  }, [searchParams]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFetchMetadata();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto focus-within:z-10 transition-all">
      {/* Search Input Area */}
      <motion.div 
        className="mb-10 w-full"
        initial={{ y: 0 }}
        animate={{ y: metadata ? -10 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className={`relative flex flex-col md:flex-row items-stretch md:items-center bg-zinc-900 border ${error ? 'border-red-500/50 ring-red-500/20' : 'border-zinc-800 focus-within:ring-1 focus-within:ring-white focus-within:border-transparent'} rounded-xl p-1 shadow-sm transition-all gap-2 md:gap-0`}>
          <div className="hidden md:flex items-center justify-center w-10 h-10 text-zinc-400 ml-2 shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input 
            ref={inputRef}
            type="url" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isFetchingMetadata || activeDownload !== null}
            placeholder="Paste any link from YouTube, Instagram, Twitter, or TikTok..." 
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 md:py-0 text-[15px] w-full text-white placeholder:text-zinc-500 disabled:opacity-50 font-medium"
          />
          <Button 
            onClick={handleFetchMetadata}
            disabled={isFetchingMetadata || activeDownload !== null || !url.trim()}
            className="rounded-lg px-6 h-12 md:h-10 shrink-0 font-bold text-sm bg-white text-zinc-900 hover:bg-zinc-200 md:ml-2 w-full md:w-auto transition-colors"
          >
            {isFetchingMetadata ? (
              <>
                <Spinner className="mr-2" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Fetch Video
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-2 text-sm text-destructive font-medium"
            >
              <AlertTriangle className="w-4 h-4"/>
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {metadata && !error && (
          <motion.div
            key="metadata"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-6">
              {/* Top: Thumbnail & Info */}
              <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-950 p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start z-10 w-full">
                <div className="relative aspect-video w-full md:w-1/2 lg:w-[45%] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0 bg-zinc-100 dark:bg-zinc-900">
                  {metadata.thumbnail ? (
                    <img 
                      src={metadata.thumbnail} 
                      alt="Video Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <Play className="w-12 h-12 mb-2 opacity-20"/>
                      No thumbnail available
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-md text-white border border-white/10">
                     <span className="text-xs font-medium">Video Thumbnail</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5">
                     <Clock className="w-3 h-3"/>
                     {formatDuration(metadata.duration)}
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white leading-tight mt-2">
                     {metadata.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                     {metadata.uploader && (
                        <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                          Video by {metadata.uploader}
                        </div>
                     )}
                     
                     {metadata.viewCount && (
                       <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-medium text-zinc-700 dark:text-white">
                          <Eye className="w-4 h-4 text-zinc-500"/>
                          {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(metadata.viewCount)} views
                       </div>
                     )}
                     
                     <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-medium text-zinc-700 dark:text-white">
                        <HardDrive className="w-4 h-4 text-zinc-500"/>
                        {metadata.formats?.length || 0} formats
                     </div>
                  </div>

                  {/* Shareable Link Integration */}
                  {metadata.shortUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5" />
                          Shareable Link
                        </span>
                        {copiedShortUrl && (
                          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Copied
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-100 dark:bg-black/40 border border-indigo-500/20 px-4 py-2 rounded-lg text-sm font-mono truncate text-zinc-700 dark:text-zinc-300 select-all">
                          {metadata.shortUrl}
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10 shrink-0 hover:bg-indigo-500/20 text-indigo-400"
                          onClick={copyShortUrl}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-[11px] text-zinc-500 italic">
                        Anyone with this link will be redirected to the original video page.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bottom: Formats List */}
              <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-950 flex flex-col z-10 p-5 md:p-8">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-5 flex md:items-center flex-col md:flex-row gap-4 justify-between text-zinc-900 dark:text-white">
                  <div>
                    <h3 className="font-bold text-xl">Available Formats</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Select your preferred download quality below</p>
                  </div>
                </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {metadata.formats && metadata.formats.length > 0 ? (
                      [...metadata.formats]
                        .sort((a, b) => {
                           const ah = parseInt(a.resolution?.split('x')[1]) || 0;
                           const bh = parseInt(b.resolution?.split('x')[1]) || 0;
                           return bh - ah;
                        })
                        .map((format, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + (Math.min(idx, 20) * 0.02) }}
                          key={`${format.formatId}-${idx}`} 
                          className={`w-full flex flex-col p-5 rounded-2xl border transition-all relative ${
                            activeDownload?.formatId === format.formatId 
                              ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 shadow-md ring-1 ring-black/5 dark:ring-white/5' 
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md cursor-pointer group/format'
                          }`}
                          onClick={() => !activeDownload && handleDownload(format)}
                        >
                          <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                                activeDownload?.formatId === format.formatId
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-[1.02]'
                                  : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover/format:bg-zinc-200 dark:group-hover/format:bg-zinc-800 group-hover/format:text-black dark:group-hover/format:text-white'
                              }`}>
                                {format.resolution === 'audio only' ? <Tv className="w-5 h-5 sm:w-6 sm:h-6 opacity-60"/> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1"/>}
                              </div>
                              <div className="text-left py-1 flex-1 min-w-0">
                                <div className="text-[15px] sm:text-[17px] font-extrabold text-black dark:text-white flex items-center gap-2 truncate">
                                  {formatResolutionDisplay(format.resolution)}
                                  {(parseInt(format.resolution?.split('x')[1]) >= 1080) && (
                                     <span className="text-[10px] uppercase tracking-wider font-extrabold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-2 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0">HD</span>
                                  )}
                                </div>
                                <div className="text-[12px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 sm:mt-1.5 font-semibold flex items-center gap-2 sm:gap-2.5 flex-wrap">
                                  <span className="uppercase bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0">{format.ext}</span>
                                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                  <span className="text-zinc-600 dark:text-zinc-300 font-medium truncate">{formatSize(format.filesize)}</span>
                                  {format.vcodec !== 'none' && format.acodec === 'none' && (
                                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 font-medium shrink-0"><Tv className="w-3 h-3 opacity-60" /> No Audio</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center shrink-0">
                              <Button 
                                variant="outline"
                                size="icon" 
                                className={`h-12 w-12 rounded-full shrink-0 border-2 transition-all ${
                                  activeDownload?.formatId === format.formatId 
                                    ? 'border-transparent bg-black dark:bg-white text-white dark:text-black opacity-50 cursor-not-allowed shadow-inner' 
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white shadow-sm group-hover/format:shadow-md group-hover/format:border-zinc-300 dark:group-hover/format:border-zinc-700'
                                }`}
                                disabled={activeDownload !== null}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(format);
                                }}
                              >
                                {activeDownload?.formatId === format.formatId ? (
                                <Spinner className="w-5 h-5 text-white dark:text-black" />
                              ) : (
                                <Download className="w-5 h-5"/>
                              )}
                            </Button>
                            </div>
                          </div>

                          {/* === Professional Download Progress Panel === */}
                          <AnimatePresence>
                            {activeDownload?.formatId === format.formatId && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="z-20 overflow-hidden"
                              >
                                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/50 p-4">
                                  {/* Stats Row */}
                                  <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="relative flex items-center justify-center w-5 h-5">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-black/30 dark:bg-white/30 animate-ping"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black dark:bg-white"></span>
                                      </div>
                                      <span className="text-[12px] font-extrabold uppercase tracking-widest text-black dark:text-white">
                                        Downloading
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
                                        {formatSpeed(activeDownload.speed)}
                                      </span>
                                      <span className="text-[14px] font-black tabular-nums text-black dark:text-white">
                                        {activeDownload.progress}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="relative w-full h-2.5 bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                      className="absolute top-0 left-0 h-full rounded-full bg-black dark:bg-white"
                                      initial={{ width: '0%' }}
                                      animate={{ width: `${activeDownload.progress}%` }}
                                      transition={{ duration: 0.4, ease: 'easeOut' }}
                                    />
                                    {/* Shimmer overlay */}
                                    <div
                                      className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
                                      style={{ width: `${activeDownload.progress}%` }}
                                    >
                                      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />
                                    </div>
                                  </div>

                                  {/* Size Info */}
                                  <div className="flex items-center justify-between mt-2.5">
                                    <span className="text-[12px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                                      {formatBytes(activeDownload.loaded)}
                                      {activeDownload.total > 0 && (
                                        <span className="text-zinc-400 dark:text-zinc-500 font-medium"> / {formatBytes(activeDownload.total)}</span>
                                      )}
                                    </span>
                                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
                                      {activeDownload.progress < 100 ? 'Saving safely to your device' : 'Finalizing...'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full h-40 flex flex-col items-center justify-center text-zinc-500 font-medium">
                        <AlertCircle className="w-10 h-10 mb-3 opacity-50"/>
                        No downloadable formats found
                      </div>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloaderInterface;
