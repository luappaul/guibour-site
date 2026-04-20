'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function Typewriter({
  text,
  speed = 35,
  delay = 0,
  className,
  style,
  onComplete,
}: TypewriterProps) {
  const [charCount, setCharCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);
  const prevTextRef = useRef(text);
  const completedRef = useRef(false);

  // Reset only if text actually changes
  useEffect(() => {
    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      setCharCount(0);
      setShowCursor(true);
      setStarted(false);
      completedRef.current = false;
    }
  }, [text]);

  // Delay before starting
  useEffect(() => {
    if (started) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay, started]);

  // Character-by-character typing
  useEffect(() => {
    if (!started) return;
    if (charCount >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
        // Hide cursor 1s after completion
        const cursorTimer = setTimeout(() => setShowCursor(false), 1000);
        return () => clearTimeout(cursorTimer);
      }
      return;
    }

    const interval = setInterval(() => {
      setCharCount(prev => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [started, charCount, text, speed, onComplete]);

  return (
    <span className={className} style={style}>
      {text.slice(0, charCount)}
      {showCursor && (
        <span
          style={{
            animation: 'typewriterBlink 0.5s step-end infinite',
            fontWeight: 'normal',
          }}
        >
          |
        </span>
      )}
    </span>
  );
}
