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
      {/* Tower background image — full brightness, no filter */}
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
                  width: '94%',
                  padding: isCurrent ? '5px 4px' : '3px 4px',
                  textAlign: 'center',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '1px',
                  borderRadius: '5px',
                  color: isCurrent
                    ? '#001A1A'
                    : isCompleted
                    ? '#FFFFFF'
                    : '#FFFFFF',
                  background: isCurrent
                    ? 'linear-gradient(180deg, #00FFFC 0%, #00C8BE 100%)'
                    : isCompleted
                    ? 'rgba(0,168,157,0.85)'
                    : 'rgba(10,21,32,0.88)',
                  border: isCurrent
                    ? '2px solid #FFFFFF'
                    : isCompleted
                    ? '1.5px solid rgba(0,255,252,0.6)'
                    : '1.5px solid rgba(0,255,252,0.45)',
                  boxShadow: isCurrent
                    ? '0 0 22px rgba(0,255,252,1), 0 0 10px rgba(0,255,252,0.8), inset 0 0 8px rgba(255,255,255,0.5)'
                    : isCompleted
                    ? '0 0 6px rgba(0,201,200,0.5)'
                    : '0 2px 4px rgba(0,0,0,0.6), inset 0 0 2px rgba(0,255,252,0.2)',
                  textShadow: isCurrent
                    ? '0 0 8px rgba(255,255,255,0.9)'
                    : '0 1px 2px rgba(0,0,0,1), 0 0 10px rgba(0,201,200,0.8)',
                  transition: 'all 0.3s ease',
                  lineHeight: 1.1,
                }}
              >
                <div style={{ fontSize: isCurrent ? '18px' : '15px', lineHeight: 1 }}>
                  {String(i).padStart(2, '0')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
