import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/navbar';
import { Logo } from '../components/logo';
import { ModeToggle } from '../components/mode-toggle';
import { Button } from '../components/ui/button';
import { DownloaderInterface } from '../components/downloader-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { 
  Zap, Download, Shield, EyeOff, Smartphone, Link as LinkIcon, HelpCircle,
  CircleCheck, Play, CloudDownload, MousePointerClick, Check, Youtube, Instagram, Twitter, Tv,ArrowRight,AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};


const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Dotted Grid (Supports Dark/Light) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,#000_60%,transparent_100%)] -z-20 pointer-events-none"></div>

      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="max-w-4xl"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-foreground text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
            </span>
            VidNest is now live
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tighter mb-6">
            Download Videos Instantly. <br/>
            <span className="text-muted-foreground">Clean. Fast. Secure.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            VidNest lets you save online videos effortlessly with premium speed and highest quality. No ads, no watermarks, just pure convenience.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="w-full max-w-3xl mx-auto mt-4 relative z-20">
             <DownloaderInterface />
          </motion.div>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-muted-foreground font-medium mt-12 mb-8 lg:mb-0">
            <div className="flex items-center gap-2"><CircleCheck className="w-4 h-4 text-primary"/> Support for 4K</div>
            <div className="flex items-center gap-2"><CircleCheck className="w-4 h-4 text-primary"/> 100% Free Uses</div>
            <div className="flex items-center gap-2"><CircleCheck className="w-4 h-4 text-primary"/> No Install Required</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const LightningAnimatedIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 relative z-10 text-primary">
    <motion.path
      d="M18 4L4 18h10l-2 10 14-14H16l2-10z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      initial={{ pathLength: 0, fill: "currentColor", fillOpacity: 0 }}
      whileInView={{ 
        pathLength: 1, 
        fillOpacity: [0, 0.15, 0] 
      }}
      transition={{ 
        pathLength: { duration: 1.5, ease: "easeInOut" }, 
        fillOpacity: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.5 } 
      }}
    />
    <motion.path
      d="M16 2v28"
      stroke="currentColor"
      strokeWidth="0.5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 0.4, 0] }}
      transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
      className="mix-blend-overlay"
      strokeDasharray="4 4"
    />
  </svg>
);

const PlayAnimatedIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 relative z-10 text-primary overflow-visible">
    <motion.circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      className="origin-center"
    />
    <motion.circle cx="16" cy="16" r="6" fill="currentColor"
       initial={{ scale: 1, opacity: 0.2 }}
       animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
       transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
       className="origin-center"
    />
    <path d="M13 11l8 5-8 5v-10z" fill="currentColor" />
  </svg>
);

const ShieldAnimatedIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 relative z-10 text-primary">
    <motion.path 
       d="M16 3L4 8v8c0 7.5 5.5 13 12 15 6.5-2 12-7.5 12-15V8l-12-5z" 
       stroke="currentColor"
       strokeWidth="1.5"
       strokeLinejoin="round"
       strokeLinecap="round"
       initial={{ pathLength: 0 }}
       whileInView={{ pathLength: 1 }}
       transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path 
       d="M16 3L4 8v8c0 7.5 5.5 13 12 15 6.5-2 12-7.5 12-15V8l-12-5z" 
       fill="currentColor"
       initial={{ opacity: 0 }}
       animate={{ opacity: [0, 0.15, 0] }}
       transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
    />
    <motion.path
       d="M11 16l3.5 3.5L22 12"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
       initial={{ pathLength: 0 }}
       whileInView={{ pathLength: 1 }}
       transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
    />
  </svg>
);

const FeaturesSection = () => {
  const features = [
    { 
       icon: <LightningAnimatedIcon />, 
       title: "Lightning Fast Downloads", 
       desc: "Our proprietary global edge network ensures your videos finish downloading before you blink." 
    },
    { 
       icon: <PlayAnimatedIcon />, 
       title: "High Quality Formats", 
       desc: "Select up to 4K resolution. We never compress or degrade your video quality." 
    },
    { 
       icon: <ShieldAnimatedIcon />, 
       title: "Secure & Private", 
       desc: "No tracking, no logs. Your data represents you, so we make sure it stays strictly yours." 
    }
  ];

  return (
    <section id="features" className="scroll-mt-24 py-32 relative overflow-hidden bg-background">
      {/* Subtle Noise / Grid Base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 dark:opacity-100 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Radial soft glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* Animated SVG Flow Line in background */}
      <div className="absolute top-1/2 left-0 right-0 h-[300px] -translate-y-1/2 -z-10 pointer-events-none overflow-hidden opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
               <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.5" />
               <stop offset="75%" stopColor="#ec4899" stopOpacity="0.5" />
               <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <filter id="flowGlow2" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="6" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <motion.path 
             d="M 0 150 C 300 50, 400 250, 600 150 C 800 50, 900 250, 1200 150" 
             fill="none" 
             stroke="url(#flowGradient2)" 
             strokeWidth="2" 
             filter="url(#flowGlow2)"
             initial={{ pathLength: 0 }}
             whileInView={{ pathLength: 1 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 2.5, ease: "easeInOut" }}
          />

          <circle r="3" fill="#a855f7" filter="url(#flowGlow2)">
             <animateMotion dur="8s" repeatCount="indefinite" path="M 0 150 C 300 50, 400 250, 600 150 C 800 50, 900 250, 1200 150" />
          </circle>
          <circle r="2" fill="#ec4899" filter="url(#flowGlow2)">
             <animateMotion dur="11s" begin="3s" repeatCount="indefinite" path="M 0 150 C 300 50, 400 250, 600 150 C 800 50, 900 250, 1200 150" />
          </circle>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-6 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5" />
            Enterprise Grade
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-heading font-black mb-6 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Pro-grade features,<br/> built for everyone.
          </h2>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="h-1 w-24 bg-gradient-to-r from-primary via-[#a855f7] to-[#ec4899] mx-auto rounded-full mb-8 origin-left"
          />
          
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            We stripped away the complexity and left exactly what you need to manage your media securely and efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative z-20">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] blur-xl" />
              
              <Card className="relative h-full flex flex-col border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden z-10 rounded-[24px] transition-all duration-500 group-hover:border-primary/30 group-hover:bg-card/60 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]">
                
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pt-10 pb-6 px-8 relative z-20">
                  <div className="relative w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6 overflow-hidden group-hover:bg-primary/5 group-hover:border-primary/30 transition-all duration-500 shadow-sm">
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div
                       whileHover={{ scale: 1.05 }}
                       transition={{ duration: 0.3, ease: "easeOut" }}
                       className="relative z-10 text-muted-foreground group-hover:text-primary transition-colors duration-500"
                    >
                      {f.icon}
                    </motion.div>
                  </div>
                  <CardTitle className="font-heading text-2xl font-bold transition-colors duration-300">
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-10 px-8 flex-1 relative z-20">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    {f.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { number: "01", title: "Paste URL", desc: "Copy the link of the video from any supported platform and paste it into our search bar." },
    { number: "02", title: "Choose Format", desc: "Our engine will process the link and offer various qualities—select MP4, MP3, or 4K." },
    { number: "03", title: "Download Instantly", desc: "Hit download and let our high-speed edge servers send the file directly to your device." }
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 py-32 relative overflow-hidden bg-background">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Radial center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-6 tracking-tight">How It Works</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            In three incredibly simple steps, you can save media from anywhere directly to your local drive.
          </p>
        </motion.div>

        <div className="relative mt-20">
          {/* Animated SVG Connection Lines (Desktop only) */}
          <div className="hidden md:block absolute top-0 left-0 right-0 h-[200px] -z-10 overflow-visible pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="gradientPulse" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Base faded line */}
              <path 
                d="M 166 48 C 333 48, 333 144, 500 144 C 666 144, 666 48, 833 48" 
                fill="none" 
                stroke="currentColor" 
                className="text-border/40" 
                strokeWidth="2" 
                strokeDasharray="6 6" 
              />
              
              {/* Animated glowing structural line */}
              <motion.path 
                 d="M 166 48 C 333 48, 333 144, 500 144 C 666 144, 666 48, 833 48" 
                 fill="none" 
                 stroke="url(#gradientPulse)" 
                 strokeWidth="4"
                 strokeLinecap="round"
                 initial={{ pathLength: 0, opacity: 0 }}
                 whileInView={{ pathLength: 1, opacity: 1 }}
                 viewport={{ once: true, margin: "-150px" }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Glowing Particle following the path continuously */}
              <circle r="5" fill="currentColor" className="text-foreground" filter="url(#glow)">
                 <animateMotion 
                    dur="3.5s" 
                    repeatCount="indefinite" 
                    path="M 166 48 C 333 48, 333 144, 500 144 C 666 144, 666 48, 833 48" 
                 />
              </circle>
            </svg>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-8 relative">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                className={`relative flex flex-col items-center text-center group ${i === 1 ? 'md:mt-24' : ''}`}
              >
                {/* Glowing ring around the number */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-foreground/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center mb-8 relative z-10 shadow-lg group-hover:border-foreground/40 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-4xl font-heading font-black bg-clip-text text-transparent bg-gradient-to-br from-muted-foreground to-foreground group-hover:from-foreground group-hover:to-foreground transition-all duration-300 relative z-20">
                    {step.number}
                  </span>
                </motion.div>

                <h3 className="text-2xl font-bold font-heading mb-4 group-hover:text-foreground transition-colors duration-300">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ComparisonSection = () => {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Dynamic background effects */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 bg-gradient-to-b from-transparent via-muted/30 to-transparent -z-10 skew-y-[-3deg]" />
      
      <div className="max-w-7xl mx-auto px-6 grid xl:grid-cols-2 gap-16 lg:gap-24 items-center flex-col-reverse xl:grid-flow-col relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full order-2 xl:order-1"
        >
          {/* Animated Glow Behind Dashboard */}
          <div className="absolute inset-0 bg-foreground/5 blur-[80px] -z-10 rounded-full" />
          
          {/* Dashboard Mockup Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-border transition-colors duration-500">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-50" />
            
            <div className="flex justify-between items-end mb-10 pb-6 border-b border-border/50">
               <div>
                  <h4 className="font-heading font-bold text-2xl mb-2 text-foreground">Total Downloads</h4>
                  <p className="text-sm text-muted-foreground font-medium">This month</p>
               </div>
               <div className="text-right">
                  <h4 className="font-heading font-black text-3xl md:text-4xl text-foreground mb-2">12,485</h4>
                  <div className="inline-flex items-center gap-1 bg-foreground/10 text-foreground px-2.5 py-1 rounded-full text-sm font-semibold border border-foreground/20">
                     +14.5% <ArrowRight className="w-3 h-3 -rotate-45" />
                  </div>
               </div>
            </div>
            
            <div className="space-y-2">
              {[
                { title: "React Tutorial 4K", platform: "Youtube", size: "1.2 GB", icon: Youtube },
                { title: "Design Process Reel", platform: "Instagram", size: "45 MB", icon: Instagram },
                { title: "Product Launch Thread", platform: "Twitter", size: "12 MB", icon: Twitter }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                  className="flex justify-between items-center group/item hover:bg-muted/50 p-3 md:p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-border/60 cursor-pointer"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg border border-border/80 bg-background/50 flex items-center justify-center text-muted-foreground group-hover/item:text-foreground group-hover/item:border-border group-hover/item:shadow-sm transition-all duration-300">
                      <item.icon className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-foreground/90 group-hover/item:text-foreground transition-colors">{item.title}</p>
                      <p className="text-[13px] text-muted-foreground font-medium">{item.platform}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50 group-hover/item:bg-card group-hover/item:text-foreground transition-all duration-300">
                    {item.size}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50">
               <Button className="w-full text-base h-12 rounded-lg font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                 Open Dashboard
                 <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-1 xl:order-2 max-w-2xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-bold tracking-wider uppercase mb-6"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            The Alternative
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-6 tracking-tight leading-[1.1]">
            Why standard tools fail,<br className="hidden md:block" /> and we <span className="text-muted-foreground italic">don't.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
            Most downloaders inject malware, display popups, and limit your speed. We built VidNest to function like a professional SaaS: clean, limitless, and blazingly fast.
          </p>

          <ul className="space-y-5">
            {[
              "Enterprise-grade download speeds globally.",
              "Bank-level encryption (TLS 1.3) everywhere.",
              "100% ad-free experience, no popups ever.",
              "Native apps and progressive web app (PWA) support."
            ].map((benefit, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-7 h-7 rounded-full bg-foreground/5 text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-border group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors duration-300">
                  <Check className="w-4 h-4 stroke-[2.5px]"/>
                </div>
                <span className="text-foreground/90 font-medium text-[17px] group-hover:text-foreground transition-colors">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      q: "Is generating short links completely free?",
      a: "Yes. VidNest is completely free to use. You can generate unlimited short links and download media without any hidden fees, subscriptions, or usage caps."
    },
    {
      q: "Is my usage private and secure?",
      a: "Absolutely. We operate with a strict privacy-first approach. Your requests are processed securely and are never sold, tracked, or permanently stored. Your activity remains yours."
    },
    {
      q: "What formats and platforms are supported?",
      a: "We support high-quality downloads in MP4 (video), WebM (video), and MP3 (audio-only). VidNest works with YouTube, Instagram, Twitter/X, and many other major platforms — delivering resolutions up to 4K when available."
    },
    {
      q: "Are there any limits or restrictions?",
      a: "No. There are no daily limits, no throttling, and no paywalls. You can generate and download as much as you need — completely free."
    }
  ];

  return (
    <section id="faq" className="scroll-mt-24 py-32 max-w-4xl mx-auto px-6 relative">
      <div className="text-center mb-16 md:mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-bold tracking-wider uppercase mb-6"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Support
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mb-6 tracking-tight"
        >
          Frequently asked <span className="text-muted-foreground italic">questions.</span>
        </motion.h2>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <AccordionItem 
                value={`item-${i}`} 
                className="border border-border/50 bg-card/30 hover:bg-card/80 transition-colors backdrop-blur-sm rounded-2xl mb-4 px-2 md:px-6 overflow-hidden data-[state=open]:bg-card/80 data-[state=open]:border-border/80 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-lg md:text-xl font-bold hover:text-foreground transition-colors py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] md:text-base pb-6 font-medium">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 px-6 md:px-8 max-w-[1400px] mx-auto">
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-foreground/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 z-0" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-foreground/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3 z-0" />

        <div className="relative z-10 px-6 py-24 md:py-32 flex flex-col items-center text-center text-foreground">
   
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-black mb-6 tracking-tighter leading-[1.05] max-w-4xl"
          >
            Stop wrestling with <br className="hidden md:block"/> basic downloaders.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mb-10 leading-snug"
          >
            Join over 100,000 creators, marketers, and individuals backing up their content locally at superhuman speeds.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4"
          >
            <Link to="/downloader" className="w-full sm:w-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-muted-foreground/0 via-foreground/30 to-muted-foreground/0 rounded-xl blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Button className="w-full cursor-pointer sm:w-auto relative h-14 md:h-16 px-10 rounded-xl font-black text-lg bg-foreground text-background shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-[2px] active:translate-y-[1px] active:scale-[0.98] border border-transparent overflow-hidden">
                <span className="relative z-10 tracking-tight">Get Started For Free</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/20 to-transparent translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
              </Button>
            </Link>
            
   
          </motion.div>
          
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.5 }}
             className="mt-8 text-sm font-semibold text-muted-foreground flex items-center gap-2"
          >
            <Shield className="w-4 h-4"/> No credit card required. Free for life..
          </motion.p>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className=" border-border/50 bg-background  pb-8">
      <div className="max-w-7xl border-t border-border/50 mx-auto px-6">
           <div className="pt-8  flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VidNest Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Youtube className="w-4 h-4" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>
     
      </div>
    </footer>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;