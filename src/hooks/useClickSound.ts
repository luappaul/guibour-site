/**
 * useClickSound
 * Returns a `handleClick` wrapper that plays the button sound
 * before calling the original handler.
 *
 * Usage:
 *   const click = useClickSound();
 *   <button onClick={click(myHandler)}>Go</button>
 *   <button onClick={click()}>No-op sound only</button>
 */

'use client';

import { useEffect, useCallback } from 'react';
import { playClick, prewarmClickSound } from '@/lib/sounds';

export function useClickSound() {
  // Pre-warm audio context on mount
  useEffect(() => {
    prewarmClickSound();
  }, []);

  /**
   * Wrap any handler (or undefined) with a click sound.
   * Returns a new function that plays the sound then calls the original.
   */
  const click = useCallback(
    <T extends unknown[]>(handler?: (...args: T) => void) =>
      (...args: T) => {
        playClick();
        handler?.(...args);
      },
    []
  );

  return click;
}
