'use client';

import { GameAssets } from '@/lib/assetLoader';

interface Props {
  currentLevel: number;
  totalLevels: number;
  assets: GameAssets | null;
}

export default function TowerProgress({ currentLevel, totalLevels, assets }: Props) {
  const towerImg = assets?.tower;

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: '18%',
        minWidth: '80px',
        maxWidth: '180px',
        height: '100%',
        background: '#0A1520',
        border: '2px solid #00C9C8',
        boxSizing: 'border-box',
      }}
    >
      {/* Tower background image — bright & luminous */}
      {towerImg && (
        <img
          src={towerImg.src}
          alt="Tour de progression"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 1,
            filter: 'brightness(1.35) saturate(1.15) contrast(1.05)',
          }}
        />
      )}
      {/* Subtle teal glow overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,201,200,0.12) 0%, rgba(0,201,200,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Left edge scanline effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(0,201,200,0.15) 0%, transparent 15%, transparent 85%, rgba(0,201,200,0.15) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floor markers */}
      <div
        className="relative flex flex-col-reverse justify-between"
        style={{ height: '100%', padding: '8px 4px', zIndex: 1 }}
      >
        {Array.from({ length: totalLevels }, (_, i) => {
          const isCompleted = i < currentLevel;
          const isCurrent = i === currentLevel;

          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                height: `${100 / totalLevels}%`,
                minHeight: '12px',
              }}
            >
              <div
                style={{
                  width: '92%',
                  padding: isCurrent ? '3px 4px' : '2px 4px',
                  textAlign: 'center',
                  fontSize: isCurrent ? '15px' : '13px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '1.5px',
                  borderRadius: '4px',
                  color: isCurrent
                    ? '#0A1520'
                    : isCompleted
                    ? '#FFFFFF'
                    : '#FFFFFF',
                  background: isCurrent
                    ? '#00FFFC'
                    : isCompleted
                    ? 'rgba(0,168,157,0.75)'
                    : 'rgba(10,21,32,0.85)',
                  border: isCurrent
                    ? '1px solid #FFFFFF'
                    : isCompleted
                    ? '1px solid rgba(0,201,200,0.5)'
                    : '1px solid rgba(0,201,200,0.35)',
                  boxShadow: isCurrent
                    ? '0 0 18px rgba(0,255,252,0.95), 0 0 8px rgba(0,255,252,0.7), inset 0 0 6px rgba(255,255,255,0.4)'
                    : isCompleted
                    ? '0 0 4px rgba(0,201,200,0.4)'
                    : '0 1px 2px rgba(0,0,0,0.5)',
                  textShadow: isCurrent
                    ? '0 0 6px rgba(255,255,255,0.8)'
                    : '0 1px 2px rgba(0,0,0,1), 0 0 8px rgba(0,201,200,0.6)',
                  transition: 'all 0.3s ease',
                }}
              >
                {String(i).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
