import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/logo';
import { Shield, BarChart3, Clock, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Precision Analytics',
    description: 'Track download velocity, trends, and platform reach with real-time accuracy.',
  },
  {
    icon: Clock,
    title: 'Download Ledger',
    description: 'A complete, searchable history of every video you have ever extracted.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Enterprise-grade encryption for your link history and personal metadata.',
  },
  {
    icon: Download,
    title: 'Native Sync',
    description: 'Your collection stays in perfect sync across all your devices, everywhere.',
  },
];

const LoginPage = () => {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col lg:flex-row transition-colors duration-500 overflow-hidden">
      
      {/* ─── Left Panel — Abstract Branding (Desktop Only) ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative bg-zinc-50 dark:bg-zinc-950 p-16 flex-col justify-between border-r border-zinc-200 dark:border-zinc-900">
        {/* Background Visuals - Premium Subtle Blurs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-200/40 dark:bg-zinc-800/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-300/30 dark:bg-zinc-800/10 rounded-full blur-[100px]" />
        </div>

        {/* Brand Identity */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg">
              <Logo size={32} className="shrink-0" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white block leading-none">VidNest</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mt-1 block">Professional Media Cloud</span>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-5xl xl:text-6xl font-black text-zinc-900 dark:text-white leading-[1.1] tracking-tight mb-12">
              Your downloads, <br />
              <span className="text-zinc-400 dark:text-zinc-600">beautifully analyzed.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                className="group p-5 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mb-4 transition-colors group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">{feature.title}</h3>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="relative z-10 italic">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            &copy; 2026 VidNest Enterprise Media Systems.
          </p>
        </div>
      </div>

      {/* ─── Right Panel — High Conversion Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Subtle Background for Mobile */}
        <div className="lg:hidden absolute inset-0 -z-10 bg-zinc-50 dark:bg-zinc-950 transition-colors pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-200 dark:bg-zinc-900 rounded-full blur-[100px] opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px] space-y-10"
        >
          {/* Brand Header for Mobile */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg">
              <Logo size={36} className="shrink-0" />
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">VidNest</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Professional Media Platform</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Welcome Back.</h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Sign in to manage your collection and view analytics.
            </p>
          </div>

          {/* Social Auth Action */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="group relative w-full bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#18181b] dark:hover:shadow-[6px_6px_0px_#ffffff] flex items-center justify-center gap-4"
            >
              <svg 
                className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Separator */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800/80" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
                <span className="bg-white dark:bg-black px-4 transition-colors">Enterprise Security</span>
              </div>
            </div>

            {/* Feature List (Visible on Mobile) */}
            <div className="space-y-4 pt-2">
              {[
                'Unlimited high-speed extraction',
                'Advanced content analytics dashboard',
                'Device-agnostic history syncing',
                'Private and encrypted storage',
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-zinc-900 dark:text-white" />
                  </div>
                  {text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-8 text-center lg:text-left">
            <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-medium">
              By continuing, you acknowledge our <span className="text-zinc-900 dark:text-white underline underline-offset-4 cursor-pointer">Terms of Service</span> and <span className="text-zinc-900 dark:text-white underline underline-offset-4 cursor-pointer">Privacy Policy</span>. Your data is protected by industry standard encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
