'use client';

import { useEffect, useState } from 'react';

export type TimeMode = 'day' | 'night';

function getMode(): TimeMode {
  const h = new Date().getHours();
  // Jour: 8h–19h / Nuit: reste
  return h >= 8 && h < 19 ? 'day' : 'night';
}

/**
 * Returns the current time mode ('day' | 'night') based on local clock.
 * Re-evaluates at the top of every hour (or on mount).
 */
export function useDayNight(): TimeMode {
  const [mode, setMode] = useState<TimeMode>('night');

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

/**
 * Returns CSS variables / theme values for the current mode.
 * Day mode: slightly lighter, more vibrant "work hours" feel
 * Night mode: current dark navy (default)
 */
export function getDayNightTheme(mode: TimeMode) {
  if (mode === 'day') {
    return {
      bg: '#132E6E',          // légèrement plus clair le jour
      bg2: '#0C2050',
      gridOpacity: 0.20,
      accentLabel: '☀ MODE JOURNÉE',
      navBg: '#0C2560',
      navBorder: '#1A3A7C',
    };
  }
  return {
    bg: '#0E2660',            // nuit — plus sombre
    bg2: '#081A4E',
    gridOpacity: 0.18,
    accentLabel: '🌙 MODE NUIT',
    navBg: '#0A1E50',
    navBorder: '#162E64',
  };
}
