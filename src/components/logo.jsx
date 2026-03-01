import React from 'react';

export const Logo = ({ className = '', size = 32, variant = 'monochrome' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      
      {/* The "Nest" - A clean U-shaped container, perfectly centered in the 48x48 canvas */}
      <path 
        d="M 12 12 L 12 24 A 12 12 0 0 0 36 24 L 36 12" 
        stroke={
          variant === 'light' ? 'url(#light-grad)' : 
          variant === 'dark' ? 'url(#dark-grad)' : 'currentColor'
        }
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* The "Video" - A play button visually centered inside the U */}
      <path 
        d="M 19 16 L 31 24 L 19 32 Z" 
        fill={
          variant === 'light' ? 'url(#light-grad)' : 
          variant === 'dark' ? 'url(#dark-grad)' : 'currentColor'
        }
        className="transition-all duration-300"
      />
    </svg>
  );
};
