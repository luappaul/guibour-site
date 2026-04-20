'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TimeMode, getDayNightTheme, DayNightTheme } from '@/hooks/useDayNight';

type ThemeOverride = TimeMode | 'auto';

interface ThemeContextValue {
  mode: TimeMode;
  theme: DayNightTheme;
  override: ThemeOverride;
  isManual: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getAutoMode(): TimeMode {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? 'day' : 'night';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<ThemeOverride>('auto');
  const [autoMode, setAutoMode] = useState<TimeMode>('day');

  // Load persisted override from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('guibour-theme-override');
      if (stored === 'day' || stored === 'night' || stored === 'auto') {
        setOverride(stored);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto mode calculation (same logic as useDayNight)
  useEffect(() => {
    setAutoMode(getAutoMode());

    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setAutoMode(getAutoMode());
      const interval = setInterval(() => setAutoMode(getAutoMode()), 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msToNextHour);

    return () => clearTimeout(timeout);
  }, []);

  const toggleTheme = useCallback(() => {
    setOverride(prev => {
      const next: ThemeOverride = prev === 'auto' ? 'day' : prev === 'day' ? 'night' : 'auto';
      try {
        localStorage.setItem('guibour-theme-override', next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const mode: TimeMode = override === 'auto' ? autoMode : override;
  const theme = getDayNightTheme(mode);
  const isManual = override !== 'auto';

  return (
    <ThemeContext.Provider value={{ mode, theme, override, isManual, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
