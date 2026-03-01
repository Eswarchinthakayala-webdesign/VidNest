import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { Logo } from './logo';
import { 
  Menu, X, Github, 
  Home, Info, Laptop, CreditCard, HelpCircle,
  BarChart3, LogIn, LogOut, ChevronDown, User, Link as LinkIcon
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "./ui/sheet"
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Features', href: '#features', icon: <Laptop className="w-4 h-4" /> },
  { name: 'How It Works', href: '#how-it-works', icon: <Home className="w-4 h-4" /> },
  { name: 'FAQ', href: '#faq', icon: <HelpCircle className="w-4 h-4" /> },

];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out border-b border-transparent ${
          isScrolled 
            ? 'h-[72px] bg-background/70 backdrop-blur-xl border-border/40 shadow-sm' 
            : 'h-20 bg-gradient-to-b from-background/90 to-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <Link to="/" className="relative z-10 flex-shrink-0">
            <motion.div 
              className="flex items-center gap-2.5 cursor-pointer group relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-foreground/10 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Logo size={36} className="text-foreground transition-all duration-300 relative z-10" />
              <span className="font-heading font-black text-[20px] sm:text-[22px] tracking-tight text-foreground flex items-center relative z-10">
                VidNest
              </span>
            </motion.div>
          </Link>
          
          {/* Center: Desktop Navigation */}
          {isHomePage && (
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 xl:gap-2 h-full z-0">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onMouseEnter={() => setActiveLink(link.name)}
                  onMouseLeave={() => setActiveLink('')}
                  className="relative px-5 h-10 flex items-center justify-center text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="relative z-10">{link.name}</span>
                  {activeLink === link.name && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-muted/60 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {/* Subtle Hover Underline */}
                  <span className="absolute bottom-1.5 left-5 right-5 h-[2px] bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out opacity-20" />
                </a>
              ))}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
            <div className="hidden md:flex items-center">
              <ModeToggle />
            </div>

         
            
            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2.5 p-1 pr-3 lg:pr-4 bg-muted/30 hover:bg-muted/80 border border-border/40 rounded-full transition-all duration-300 shadow-sm"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-border/60 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-semibold text-foreground/90 truncate max-w-[100px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 bg-card/95 backdrop-blur-3xl border border-border/60 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                        <p className="text-[15px] font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-[13px] text-muted-foreground truncate font-medium mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        {[
                          { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
                          { path: "/links", label: "Short Links", icon: LinkIcon },
                          { path: "/downloader", label: "Downloader", icon: Laptop }
                        ].map((item) => (
                          <Link
                            key={item.label}
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-foreground/80 rounded-xl hover:bg-muted hover:text-foreground transition-all duration-200"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <item.icon className="w-4 h-4 text-muted-foreground" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-border/40">
                        <button
                          onClick={() => { setShowUserMenu(false); handleLogout(); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-[14px] font-bold rounded-xl hover:bg-red-500/10 text-red-500/90 hover:text-red-500 transition-colors group"
                        >
                          <span className="flex items-center gap-3">
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            Sign out
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="ghost" className="rounded-full px-5 h-10 font-bold text-sm hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors">
                  Log in
                </Button>
              </Link>
            )}
            
            {/* Primary CTA Button */}
            <Link to="/downloader" className="hidden sm:block relative group ml-1 sm:ml-2">
              <div className="absolute -inset-[2px] bg-gradient-to-r from-muted-foreground/0 via-foreground/30 to-muted-foreground/0 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-active:opacity-50" />
              <Button 
                className="relative h-10 px-6 rounded-full font-bold text-sm bg-foreground text-background shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.98] border border-transparent overflow-hidden"
              >
                <span className="relative z-10 tracking-wide">Try Now</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/20 to-transparent translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
              </Button>
            </Link>

            {/* Mobile Nav Trigger */}
            <div className="lg:hidden ml-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground/80 hover:bg-muted hover:text-foreground rounded-full transition-colors flex-shrink-0">
                    <Menu className="w-[22px] h-[22px]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col border-l-border/30 w-full sm:max-w-md bg-background/95 backdrop-blur-2xl p-0 shadow-2xl">
                  
                  <div className="p-6 pb-0 flex items-center justify-between border-b border-border/20 mb-4 pb-4">
                    <div className="flex items-center gap-3">
                       <Logo size={32} className="text-foreground" />
                       <span className="font-heading font-black text-2xl tracking-tight text-foreground">VidNest</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col px-4 flex-1 overflow-y-auto">
                    {isAuthenticated && (
                      <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-[20px] mb-6 border border-border/40">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-border/50 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg shadow-sm">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base text-foreground truncate">{user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate font-medium">{user?.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 mb-6">
                      {isAuthenticated && (
                         <>
                           <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/60 rounded-[16px] transition-all font-bold text-[17px] text-foreground/90 group">
                             <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-colors"><BarChart3 className="w-5 h-5" /></div>
                             Dashboard
                           </Link>
                           <Link to="/links" className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/60 rounded-[16px] transition-all font-bold text-[17px] text-foreground/90 group">
                             <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-colors"><LinkIcon className="w-5 h-5" /></div>
                             Short Links
                           </Link>
                         </>
                      )}
                      
                      {isHomePage && navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/60 rounded-[16px] transition-all font-bold text-[17px] text-foreground/90 group">
                          <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-colors">
                            {link.icon}
                          </div>
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 pt-4 border-t border-border/30 bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between px-4 py-3 bg-card border border-border/50 rounded-2xl shadow-sm mb-4">
                      <span className="font-bold text-[15px]">Toggle Theme</span>
                      <ModeToggle />
                    </div>

                    <Link to="/downloader" className="w-full inline-block">
                      <Button className="w-full h-14 rounded-2xl text-[17px] font-bold shadow-lg bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all">
                        Try Now
                      </Button>
                    </Link>

                    {isAuthenticated ? (
                      <Button variant="ghost" onClick={handleLogout} className="w-full h-14 rounded-2xl text-[16px] font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500">
                        <LogOut className="w-5 h-5 mr-2" /> Sign Out
                      </Button>
                    ) : (
                      <Link to="/login" className="w-full inline-block">
                        <Button variant="outline" className="w-full h-14 rounded-2xl text-[16px] font-bold border-border/60 hover:bg-muted">
                          <LogIn className="w-5 h-5 mr-2 text-muted-foreground" /> Log In
                        </Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
          </div>
        </div>
      </nav>
    </>
  );
};
