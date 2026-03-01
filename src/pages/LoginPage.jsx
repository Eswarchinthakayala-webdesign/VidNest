import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/logo';
import { Shield, BarChart3, Clock, Download, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your download history, usage trends, and platform analytics.',
  },
  {
    icon: Clock,
    title: 'Download History',
    description: 'Access your complete download history with detailed metadata.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never shared with third parties.',
  },
  {
    icon: Download,
    title: 'Sync Everywhere',
    description: 'Your download stats sync across all your devices automatically.',
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

  const handleSuccess = async () => {
    // Supabase signInWithOAuth handles the redirect automatically, so we don't need a result here
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Logo size={44} className="text-white shrink-0" />
            <span className="text-[32px] font-black font-heading text-white tracking-tight flex items-center">VidNest</span>
          </div>
          <p className="text-white/60 text-sm">Professional Media Platform</p>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight"
          >
            Your downloads,
            <br />
            <span className="text-white/80">beautifully analyzed.</span>
          </motion.h2>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-white/80 mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © 2026 VidNest. Enterprise-grade media analytics.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <Logo size={36} className="text-foreground shrink-0" />
            <span className="text-[26px] font-black font-heading tracking-tight flex items-center">VidNest</span>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground mt-2">
              Access your download analytics and history
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={handleSuccess}
                className="w-full max-w-[320px] bg-white border border-border text-foreground font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-muted/30 transition-all flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Why sign in?</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                'Track your complete download history',
                'View personalized analytics & insights',
                'Monitor download success rates',
                'See your most-used platforms & formats',
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {text}
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center lg:text-left">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and secure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
