'use client';

import { useEffect, useState } from 'react';

export type TimeMode = 'day' | 'night';

function getMode(): TimeMode {
  const h = new Date().getHours();
  // Jour: 6h-18h / Nuit: 18h-6h
  return h >= 6 && h < 18 ? 'day' : 'night';
}

/**
 * Returns the current time mode ('day' | 'night') based on local clock.
 * Re-evaluates at the top of every hour (or on mount).
 */
export function useDayNight(): TimeMode {
  // Default to 'day' to avoid dark flash on SSR/hydration
  const [mode, setMode] = useState<TimeMode>('day');

  useEffect(() => {
    setMode(getMode());

    // Schedule recalculation at next hour boundary
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setMode(getMode());
      // Then re-check every hour
      const interval = setInterval(() => setMode(getMode()), 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msToNextHour);

    return () => clearTimeout(timeout);
  }, []);

  return mode;
}

export interface DayNightTheme {
  bg: string;
  bg2: string;
  gridOpacity: number;
  neonGlow: 'strong' | 'subtle';
  accentLabel: string;
  navBg: string;
  navBorder: string;
  gridColor: string;
  neonTextShadow: string;
  chromeBg: string;
}

/**
 * Returns CSS variables / theme values for the current mode.
 * Day mode: open space eclaire au neon blanc — lighter, grid more visible
 * Night mode: building la nuit avec les neons allumes — darker, neons brilliant
 */
export function getDayNightTheme(mode: TimeMode): DayNightTheme {
  if (mode === 'day') {
    return {
      bg: '#1A3F78',
      bg2: '#142E60',
      gridOpacity: 0.18,
      neonGlow: 'subtle',
      accentLabel: '☀ MODE JOURNEE',
      navBg: '#142E60',
      navBorder: '#1E4A8C',
      gridColor: 'rgba(60,130,240,.22)',
      neonTextShadow: '0 0 8px rgba(0,255,238,.3)',
      chromeBg: '#142E60',
    };
  }
  return {
    bg: '#0E1E38',
    bg2: '#0A1628',
    gridOpacity: 0.10,
    neonGlow: 'strong',
    accentLabel: '🌙 MODE NUIT',
    navBg: '#0A1628',
    navBorder: '#1A3060',
    gridColor: 'rgba(60,130,240,.12)',
    neonTextShadow: '0 0 20px rgba(0,255,238,.7), 0 0 40px rgba(0,255,238,.3)',
    chromeBg: '#0C1A30',
  };
}
