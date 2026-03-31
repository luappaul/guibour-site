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
      {/* Tower background image */}
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
            opacity: 0.3,
          }}
        />
      )}

      {/* Floor markers */}
      <div
        className="relative flex flex-col-reverse justify-between"
        style={{ height: '100%', padding: '8px 4px', zIndex: 1 }}
      >
        {Array.from({ length: totalLevels }, (_, i) => {
          const isCompleted = i < currentLevel;
          const isCurrent = i === currentLevel;
          const isFuture = i > currentLevel;

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
                  width: '90%',
                  padding: '1px 0',
                  textAlign: 'center',
                  fontSize: '8px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: isCurrent ? 800 : 400,
                  letterSpacing: '0.5px',
                  borderRadius: '2px',
                  color: isCurrent ? '#0A1520' : isCompleted ? '#fff' : '#607888',
                  background: isCurrent
                    ? '#00C9C8'
                    : isCompleted
                    ? 'rgba(0,168,157,0.4)'
                    : isFuture
                    ? 'rgba(96,120,136,0.2)'
                    : 'transparent',
                  boxShadow: isCurrent ? '0 0 8px rgba(0,168,157,0.6)' : 'none',
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
