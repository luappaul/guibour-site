'use client';

import React, { createContext, useContext } from 'react';
import { usePageTransition, type TransitionPhase } from '@/hooks/usePageTransition';

// Context to expose triggerTransition to ExcelNav
type TransitionContextType = {
  triggerTransition: (targetPath: string) => void;
  isTransitioning: boolean;
  phase: TransitionPhase;
};

const TransitionContext = createContext<TransitionContextType>({
  triggerTransition: () => {},
  isTransitioning: false,
  phase: 'idle',
});

export const useTransitionContext = () => useContext(TransitionContext);

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const { phase, isTransitioning, floorLabel, triggerTransition } = usePageTransition();

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning, phase }}>
      {children}
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            pointerEvents: 'all',
            overflow: 'hidden',
          }}
        >
          {/* Left door */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '50%',
              background: '#0D2B5E',
              borderRight: '2px solid #00C8BE',
              transform:
                phase === 'closing'
                  ? 'translateX(-100%)'
                  : phase === 'display'
                  ? 'translateX(0)'
                  : phase === 'opening'
                  ? 'translateX(-100%)'
                  : 'translateX(-100%)',
              transition:
                phase === 'closing'
                  ? 'none'
                  : phase === 'opening'
                  ? 'transform 0.3s ease-in'
                  : 'none',
              boxShadow: '4px 0 20px rgba(0, 200, 190, 0.2)',
              ...(phase === 'closing' ? {} : {}),
            }}
            ref={(el) => {
              if (el && phase === 'closing') {
                // Force reflow then animate
                el.style.transform = 'translateX(-100%)';
                el.getBoundingClientRect();
                el.style.transition = 'transform 0.3s ease-out';
                el.style.transform = 'translateX(0)';
              }
            }}
          >
            {/* Metallic texture lines */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,200,190,0.03) 48px, rgba(0,200,190,0.03) 50px)',
            }} />
          </div>

          {/* Right door */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '50%',
              background: '#0D2B5E',
              borderLeft: '2px solid #00C8BE',
              transform:
                phase === 'closing'
                  ? 'translateX(100%)'
                  : phase === 'display'
                  ? 'translateX(0)'
                  : phase === 'opening'
                  ? 'translateX(100%)'
                  : 'translateX(100%)',
              transition:
                phase === 'closing'
                  ? 'none'
                  : phase === 'opening'
                  ? 'transform 0.3s ease-in'
                  : 'none',
              boxShadow: '-4px 0 20px rgba(0, 200, 190, 0.2)',
            }}
            ref={(el) => {
              if (el && phase === 'closing') {
                el.style.transform = 'translateX(100%)';
                el.getBoundingClientRect();
                el.style.transition = 'transform 0.3s ease-out';
                el.style.transform = 'translateX(0)';
              }
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(0,200,190,0.03) 48px, rgba(0,200,190,0.03) 50px)',
            }} />
          </div>

          {/* Center content — floor display */}
          {(phase === 'display' || phase === 'opening') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 101,
                opacity: phase === 'opening' ? 0 : 1,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
              }}
            >
              {/* Page name */}
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 'clamp(32px, 8vw, 64px)',
                  fontWeight: 900,
                  color: '#00C8BE',
                  letterSpacing: '8px',
                  textShadow: '0 0 40px rgba(0,200,190,0.6), 0 0 80px rgba(0,200,190,0.3)',
                  textTransform: 'uppercase',
                  animation: phase === 'display' ? 'floorSlideIn 0.3s ease-out' : 'none',
                }}
              >
                {floorLabel}
              </div>

              {/* Decorative line */}
              <div
                style={{
                  width: 'clamp(80px, 25vw, 200px)',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #00C8BE, transparent)',
                  marginTop: '16px',
                  animation: phase === 'display' ? 'lineExpand 0.3s ease-out 0.1s both' : 'none',
                }}
              />
            </div>
          )}

          {/* Done phase — fade out overlay */}
          {phase === 'done' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(9, 29, 64, 0.3)',
                animation: 'fadeOut 0.2s ease-out forwards',
              }}
            />
          )}

          {/* Keyframe animations injected via style tag */}
          <style>{`
            @keyframes floorSlideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes floorFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes lineExpand {
              from { transform: scaleX(0); opacity: 0; }
              to { transform: scaleX(1); opacity: 1; }
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </TransitionContext.Provider>
  );
}
