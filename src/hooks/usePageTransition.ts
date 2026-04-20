'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

const FLOOR_MAP: Record<string, string> = {
  '/':          'ACCUEIL',
  '/resultats': 'CLASSEMENT',
  '/jukebox':   'SALLE D\u2019\u00c9COUTE',
  '/shopping':  'BOUTIQUE',
  '/contact':   'CONTACT',
};

export type TransitionPhase = 'idle' | 'closing' | 'display' | 'opening' | 'done';

export function usePageTransition() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [floorLabel, setFloorLabel] = useState('');

  // Trigger transition programmatically (called from ExcelNav before navigation)
  const triggerTransition = useCallback((targetPath: string) => {
    if (phase !== 'idle') return;
    setFloorLabel(FLOOR_MAP[targetPath] || targetPath.toUpperCase());
    setPhase('closing');
  }, [phase]);

  // Advance phases with timers
  useEffect(() => {
    if (phase === 'idle') return;

    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'closing':
        timer = setTimeout(() => setPhase('display'), 300);
        break;
      case 'display':
        timer = setTimeout(() => setPhase('opening'), 400);
        break;
      case 'opening':
        timer = setTimeout(() => setPhase('done'), 300);
        break;
      case 'done':
        timer = setTimeout(() => setPhase('idle'), 200);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase]);

  // Track pathname changes to detect external navigation (browser back/forward)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      // If no transition is running, trigger one for browser navigation
      if (phase === 'idle') {
        setFloorLabel(FLOOR_MAP[pathname] || pathname.toUpperCase());
        setPhase('closing');
      }
    }
  }, [pathname, phase]);

  const isTransitioning = phase !== 'idle';

  return {
    phase,
    isTransitioning,
    floorLabel,
    triggerTransition,
  };
}
