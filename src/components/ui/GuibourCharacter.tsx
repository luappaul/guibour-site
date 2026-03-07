'use client';

interface GuibourCharacterProps {
  size?: number;
  animate?: boolean;
  variant?: 'idle' | 'run';
}

export default function GuibourCharacter({ size = 120, animate = true, variant = 'run' }: GuibourCharacterProps) {
  const src = variant === 'run' ? '/guibour-run.png' : '/guibour-idle.png';

  return (
    <div style={{
      display: 'inline-block',
      height: `${size}px`,
      animation: animate ? 'walkCycle 10s linear infinite' : undefined,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Guibour"
        style={{
          height: '100%',
          width: 'auto',
          imageRendering: 'auto',
        }}
      />
    </div>
  );
}
