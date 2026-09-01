import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AmbientBackground = () => {
  const { ambientAnimation, mode } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Dynamic Theme Glow Orb 1 - Top Left */}
      <div
        className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[130px] opacity-30 dark:opacity-25 midnight:opacity-35 transition-all duration-700 ${
          ambientAnimation ? 'animate-orb-1' : ''
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(var(--primary-raw), 0.65) 0%, rgba(var(--primary-raw), 0.1) 70%, transparent 100%)',
        }}
      />

      {/* Dynamic Theme Glow Orb 2 - Bottom Right */}
      <div
        className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-25 dark:opacity-20 midnight:opacity-30 transition-all duration-700 ${
          ambientAnimation ? 'animate-orb-2' : ''
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(var(--primary-raw), 0.5) 0%, rgba(var(--primary-raw), 0.05) 75%, transparent 100%)',
        }}
      />

      {/* Dynamic Theme Glow Orb 3 - Center Ambient Fill */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] opacity-10 dark:opacity-15 midnight:opacity-20 transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(var(--primary-raw), 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Subtle Cyber Grid Mesh Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035] midnight:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(var(--primary-raw), 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--primary-raw), 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

export default AmbientBackground;
