'use client';

import { useEffect, useRef } from 'react';

export default function ClickRipple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Limit to 5 simultaneous ripples
      while (container.children.length >= 5) {
        container.removeChild(container.children[0]);
      }

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(0, 71, 171, 0.35);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: clickRippleExpand 0.4s ease-out forwards;
      `;

      container.appendChild(ripple);

      // Remove after animation
      setTimeout(() => {
        if (ripple.parentNode === container) {
          container.removeChild(ripple);
        }
      }, 400);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
