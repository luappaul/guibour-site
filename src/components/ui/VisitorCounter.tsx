'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function SlotDigit({ digit }: { digit: string }) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (digit !== prevDigit.current) {
      setIsAnimating(true);
      // Rapidly cycle through random digits
      let count = 0;
      const interval = setInterval(() => {
        setDisplayDigit(String(Math.floor(Math.random() * 10)));
        count++;
        if (count >= 8) {
          clearInterval(interval);
          setDisplayDigit(digit);
          setIsAnimating(false);
        }
      }, 50);
      prevDigit.current = digit;
      return () => clearInterval(interval);
    }
  }, [digit]);

  return (
    <span style={{
      display: 'inline-block',
      minWidth: '0.7em',
      textAlign: 'center',
      color: isAnimating ? '#00FFEE' : '#5B9BD5',
      transition: 'color 0.15s',
    }}>
      {displayDigit}
    </span>
  );
}

function SlotNumber({ value }: { value: number }) {
  const digits = String(value).split('');
  return (
    <>
      {digits.map((d, i) => (
        <SlotDigit key={`${i}-${digits.length}`} digit={d} />
      ))}
    </>
  );
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json() as { count?: number };
      if (typeof data.count === 'number') {
        setCount(data.count);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    // Fade in after a short delay
    const fadeTimeout = setTimeout(() => setVisible(true), 500);
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [fetchCount]);

  if (count === null) return null;

  return (
    <div className="visitor-counter" style={{
      position: 'fixed',
      bottom: '12px',
      left: '60px',
      zIndex: 40,
      background: 'rgba(8, 16, 40, 0.75)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(0, 200, 190, 0.25)',
      borderRadius: '3px',
      padding: '6px 12px',
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '9px',
      letterSpacing: '1.5px',
      color: '#5B9BD5',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.8s ease-in',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ marginRight: '6px' }}>&#x1F4CA;</span>
      <SlotNumber value={count} />
      <span style={{ marginLeft: '4px' }}>EMPLOYES CONNECTES</span>
    </div>
  );
}
