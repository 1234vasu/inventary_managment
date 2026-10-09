import React, { createContext, useContext, useEffect, useState } from 'react';

export const COLOR_THEMES = [
  {
    id: 'violet',
    name: 'Cyber Violet',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#c4b5fd',
    previewGradient: 'from-violet-500 to-purple-600',
    description: 'Electric neon purple glow (Default)',
    raw: '139, 92, 246',
    hex: '#8b5cf6',
    shades: {
      50: '245 243 255',
      100: '237 233 254',
      200: '221 214 254',
      300: '196 181 253',
      400: '167 139 250',
      500: '139 92 246',
      600: '124 58 237',
      700: '109 40 217',
      800: '91 33 182',
      900: '76 29 149',
      950: '46 16 101',
    }
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#6ee7b7',
    previewGradient: 'from-emerald-400 to-teal-600',
    description: 'Cyber mint and matrix green',
    raw: '16, 185, 129',
    hex: '#10b981',
    shades: {
      50: '236 253 245',
      100: '209 250 229',
      200: '167 243 208',
      300: '110 231 183',
      400: '52 211 153',
      500: '16 185 129',
      600: '5 150 105',
      700: '4 120 87',
      800: '6 95 70',
      900: '6 78 59',
      950: '2 44 34',
    }
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    primary: '#06b6d4',
    secondary: '#0284c7',
    accent: '#67e8f9',
    previewGradient: 'from-cyan-400 to-blue-600',
    description: 'Oceanic azure & cyan neon',
    raw: '6, 182, 212',
    hex: '#06b6d4',
    shades: {
      50: '236 254 255',
      100: '207 250 254',
      200: '165 243 252',
      300: '103 232 249',
      400: '34 211 238',
      500: '6 182 212',
      600: '8 145 178',
      700: '14 116 144',
      800: '21 94 117',
      900: '22 78 99',
      950: '8 51 68',
    }
  },
  {
    id: 'rose',
    name: 'Sunset Flare',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fda4af',
    previewGradient: 'from-rose-400 to-pink-600',
    description: 'Vibrant coral, rose & sunset',
    raw: '244, 63, 94',
    hex: '#f43f5e',
    shades: {
      50: '255 241 242',
      100: '255 228 230',
      200: '254 205 211',
      300: '253 164 175',
      400: '251 113 133',
      500: '244 63 94',
      600: '225 29 72',
      700: '190 18 60',
      800: '159 18 57',
      900: '136 19 55',
      950: '76 5 25',
    }
  },
  {
    id: 'amber',
    name: 'Solar Gold',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fcd34d',
    previewGradient: 'from-amber-400 to-orange-600',
    description: 'Radiant golden amber',
    raw: '245, 158, 11',
    hex: '#f59e0b',
    shades: {
      50: '255 251 235',
      100: '254 243 199',
      200: '253 230 138',
      300: '252 211 77',
      400: '251 191 36',
      500: '245 158 11',
      600: '217 119 6',
      700: '180 83 9',
      800: '146 64 14',
      900: '120 53 15',
      950: '69 26 3',
    }
  },
  {
    id: 'crimson',
    name: 'Crimson Nova',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#fca5a5',
    previewGradient: 'from-red-500 to-rose-700',
    description: 'Intense ruby & scarlet blaze',
    raw: '239, 68, 68',
    hex: '#ef4444',
    shades: {
      50: '254 242 242',
      100: '254 226 226',
      200: '254 202 202',
      300: '252 165 165',
      400: '248 113 113',
      500: '239 68 68',
      600: '220 38 38',
      700: '185 28 28',
      800: '153 27 27',
      900: '127 29 29',
      950: '69 10 10',
    }
  }
];

export const APPEARANCE_MODES = [
  {
    id: 'dark',
    name: 'Dark Cyber',
    desc: 'Deep navy slate',
    vars: {
      '--bg-primary': '#0b0f19',
      '--bg-secondary': '#111827',
      '--bg-tertiary': '#1a2438',
      '--card-bg': 'rgba(17, 24, 39, 0.88)',
      '--card-glass': 'rgba(17, 24, 39, 0.7)',
      '--text-primary': '#f9fafb',
      '--text-secondary': '#9ca3af',
      '--text-muted': '#6b7280',
      '--border-color': 'rgba(255, 255, 255, 0.08)',
      '--border-subtle': 'rgba(255, 255, 255, 0.04)',
      '--shadow-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      '--shadow-card': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight OLED',
    desc: 'Pure pitch black',
    vars: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#070b12',
      '--bg-tertiary': '#0f172a',
      '--card-bg': 'rgba(7, 11, 18, 0.96)',
      '--card-glass': 'rgba(7, 11, 18, 0.82)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a1a1aa',
      '--text-muted': '#52525b',
      '--border-color': 'rgba(255, 255, 255, 0.14)',
      '--border-subtle': 'rgba(255, 255, 255, 0.06)',
      '--shadow-soft': '0 4px 25px -2px rgba(0, 0, 0, 0.8)',
      '--shadow-card': '0 12px 30px -5px rgba(0, 0, 0, 0.85)'
    }
  },
  {
    id: 'light',
    name: 'Frost Light',
    desc: 'Crisp soft white',
    vars: {
      '--bg-primary': '#f8fafc',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f1f5f9',
      '--card-bg': 'rgba(255, 255, 255, 0.94)',
      '--card-glass': 'rgba(255, 255, 255, 0.82)',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#94a3b8',
      '--border-color': '#e2e8f0',
      '--border-subtle': 'rgba(226, 232, 240, 0.6)',
      '--shadow-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      '--shadow-card': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)'
    }
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Mode: 'dark' | 'midnight' | 'light'
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('app_mode');
    if (saved) return saved;
    return 'dark';
  });

  // Color Theme: 'violet' | 'emerald' | 'cyan' | 'rose' | 'amber' | 'crimson'
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('app_color_theme');
    if (saved) return saved;
    return 'violet';
  });

  // Ambient animations enabled
  const [ambientAnimation, setAmbientAnimation] = useState(() => {
    const saved = localStorage.getItem('app_ambient_anim');
    return saved !== null ? saved === 'true' : true;
  });

  // Theme customizer drawer visibility
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Update HTML classes
    root.classList.remove('dark', 'midnight');
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'midnight') {
      root.classList.add('dark', 'midnight');
    }

    COLOR_THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${colorTheme}`);

    // 2. Direct JavaScript CSS Variable Injection for Maximum Specificity & Instant Update
    const currentTheme = COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];
    const currentMode = APPEARANCE_MODES.find((m) => m.id === mode) || APPEARANCE_MODES[0];

    // Inject all primary shades
    Object.entries(currentTheme.shades).forEach(([shade, val]) => {
      root.style.setProperty(`--primary-${shade}`, val);
    });

    root.style.setProperty('--primary-raw', currentTheme.raw);
    root.style.setProperty('--primary-hex', currentTheme.hex);
    root.style.setProperty('--accent-glow', `rgba(${currentTheme.raw}, ${mode === 'light' ? 0.12 : 0.22})`);
    root.style.setProperty('--accent-glow-strong', `rgba(${currentTheme.raw}, ${mode === 'light' ? 0.25 : 0.45})`);
    root.style.setProperty('--border-hover', `rgba(${currentTheme.raw}, 0.45)`);

    // Inject mode background and text variables
    Object.entries(currentMode.vars).forEach(([cssVar, val]) => {
      root.style.setProperty(cssVar, val);
    });

    // 3. Save to localStorage
    localStorage.setItem('app_mode', mode);
    localStorage.setItem('theme', mode === 'light' ? 'light' : 'dark');
    localStorage.setItem('app_color_theme', colorTheme);
    localStorage.setItem('app_ambient_anim', String(ambientAnimation));
  }, [mode, colorTheme, ambientAnimation]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeColorObj = COLOR_THEMES.find((t) => t.id === colorTheme) || COLOR_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        colorTheme,
        setColorTheme,
        ambientAnimation,
        setAmbientAnimation,
        isCustomizerOpen,
        setIsCustomizerOpen,
        toggleTheme,
        activeColorObj,
        theme: mode === 'light' ? 'light' : 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
