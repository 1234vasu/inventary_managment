import React from 'react';
import { useTheme, COLOR_THEMES, APPEARANCE_MODES } from '../../contexts/ThemeContext';
import {
  Palette,
  Moon,
  Sun,
  Sparkles,
  Zap,
  X,
  Check,
  RotateCcw,
  Sliders,
  Eye
} from 'lucide-react';

const ThemeCustomizer = () => {
  const {
    mode,
    setMode,
    colorTheme,
    setColorTheme,
    ambientAnimation,
    setAmbientAnimation,
    isCustomizerOpen,
    setIsCustomizerOpen,
    activeColorObj
  } = useTheme();

  if (!isCustomizerOpen) return null;

  const handleReset = () => {
    setMode('dark');
    setColorTheme('violet');
    setAmbientAnimation(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCustomizerOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#111827] midnight:bg-[#070b14] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Theme & Visuals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalize colors, mode & motion</p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customizer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900/80 dark:to-slate-950/80 border border-primary-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary-500" /> Live Theme Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/15 text-primary-500 border border-primary-500/30">
                {activeColorObj.name}
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <button className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-500/25 transition">
                  Primary Button
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/25 text-primary-400 text-xs font-bold">
                  Glow Accent
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Interface accents, glowing charts, gradients, and buttons adapt instantaneously.
              </p>
            </div>
          </div>

          {/* 1. Appearance Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Display Mode</span>
              <span className="text-[10px] font-normal text-slate-400 capitalize">{mode} Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {APPEARANCE_MODES.map((item) => {
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/15'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {item.id === 'dark' && <Moon className="w-5 h-5" />}
                    {item.id === 'midnight' && <Sparkles className="w-5 h-5" />}
                    {item.id === 'light' && <Sun className="w-5 h-5" />}
                    <span className="text-xs font-bold">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Palette Swatches */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Color Themes</span>
              <span className="text-[10px] font-normal text-slate-400">6 Curated Palettes</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_THEMES.map((theme) => {
                const isSelected = colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/15 ring-2 ring-primary-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{theme.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{theme.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Animation Controls */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Motion & Ambience
            </label>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ambient Background Glow</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Floating responsive mesh light orbs</p>
                </div>
              </div>
              <button
                onClick={() => setAmbientAnimation(!ambientAnimation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ambientAnimation ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ambientAnimation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-500/25 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
