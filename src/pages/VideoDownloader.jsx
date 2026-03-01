import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/navbar';
import { DownloaderInterface } from '../components/downloader-interface';
import { Youtube, Instagram, Twitter, Tv, Facebook, Twitch, MonitorPlay, Music2, Smartphone } from 'lucide-react';

const VideoDownloader = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans flex flex-col selection:bg-zinc-200 dark:selection:bg-zinc-800 relative overflow-x-hidden">
      <Navbar />
      
      {/* Background visual effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 md:px-12 relative z-10">
        <div className="max-w-3xl text-center mb-10 mt-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-zinc-900 dark:text-white"
          >
            Video Downloader
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 dark:text-zinc-400 text-[15px]"
          >
            Paste any link from YouTube, Instagram, Twitter, or TikTok to instantly extract downloadable formats. We process the highest quality natively.
          </motion.p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="w-full max-w-4xl"
        >
           <DownloaderInterface />
        </motion.div>

        <div className="mt-32 w-full max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Supported Platforms</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Download videos natively from your favorite sites.</p>
          </motion.div>
          
          <div className="relative flex overflow-hidden w-full group py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
              className="flex w-max gap-4 pr-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 25,
                repeat: Infinity,
              }}
            >
              {[
                { name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10' },
                { name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                { name: 'Twitter / X', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
                { name: 'TikTok', icon: Smartphone, color: 'text-zinc-900 dark:text-white', bg: 'bg-zinc-200 dark:bg-zinc-800' },
                { name: 'Twitch', icon: Twitch, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { name: 'Vimeo', icon: MonitorPlay, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                { name: 'SoundCloud', icon: Music2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                // Duplicate the array for seamless infinite scrolling
                { name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10' },
                { name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                { name: 'Twitter / X', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
                { name: 'TikTok', icon: Smartphone, color: 'text-zinc-900 dark:text-white', bg: 'bg-zinc-200 dark:bg-zinc-800' },
                { name: 'Twitch', icon: Twitch, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { name: 'Vimeo', icon: MonitorPlay, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                { name: 'SoundCloud', icon: Music2, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              ].map((platform, i) => (
                <div 
                  key={`${platform.name}-${i}`}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all hover:shadow-sm cursor-default group shrink-0 w-[180px] md:w-[220px]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${platform.bg} ${platform.color}`}>
                    <platform.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{platform.name}</h3>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoDownloader;
