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
      {/* Tower background image — NO dark filter */}
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
            opacity: 0.85,
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
                  padding: '2px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: isCurrent ? 900 : 600,
                  letterSpacing: '1px',
                  borderRadius: '3px',
                  color: isCurrent ? '#0A1520' : isCompleted ? '#FFFFFF' : '#D0E0F0',
                  background: isCurrent
                    ? '#00C9C8'
                    : isCompleted
                    ? 'rgba(0,168,157,0.55)'
                    : 'rgba(10,21,32,0.7)',
                  boxShadow: isCurrent
                    ? '0 0 10px rgba(0,201,200,0.7), 0 0 4px rgba(0,201,200,0.4)'
                    : 'none',
                  textShadow: isCurrent
                    ? 'none'
                    : '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)',
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
