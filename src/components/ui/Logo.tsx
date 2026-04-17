'use client';

type LogoVariant = 'dark' | 'light' | 'horizontal';

interface LogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function GlobeSVG({ size = 80, color = '#0047AB', accentColor = '#00C8BE', glowColor }: { size?: number; color?: string; accentColor?: string; glowColor?: string }) {
  const r = size * 0.425;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {glowColor && (
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Orbit rings */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.375} fill="none" stroke={accentColor} strokeWidth={size * 0.02}
        transform={`rotate(-22 ${cx} ${cy})`}
        filter={glowColor ? 'url(#glow)' : undefined}
      />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.375} fill="none" stroke={color} strokeWidth={size * 0.015}
        transform={`rotate(38 ${cx} ${cy})`} opacity={0.6}
      />
      {/* Central sphere */}
      <circle cx={cx} cy={cy} r={r * 0.53} fill="none" stroke={color} strokeWidth={size * 0.02} />
      {/* Grid lines on sphere */}
      <ellipse cx={cx} cy={cy} rx={r * 0.53} ry={r * 0.2} fill="none" stroke={color} strokeWidth={size * 0.012} opacity={0.5} />
      <line x1={cx - r * 0.53} y1={cy} x2={cx + r * 0.53} y2={cy} stroke={color} strokeWidth={size * 0.012} opacity={0.5} />
      <line x1={cx} y1={cy - r * 0.53} x2={cx} y2={cy + r * 0.53} stroke={color} strokeWidth={size * 0.012} opacity={0.5} />
      {/* Accent dot on orbit */}
      <circle cx={cx + r} cy={cy} r={size * 0.04} fill={accentColor} />
    </svg>
  );
}

export default function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { globe: 26, title: 13, sub: 7, gap: 4, sepW: 80, letterSpacing: '2px', subSpacing: '6px' },
    md: { globe: 50, title: 30, sub: 11, gap: 10, sepW: 160, letterSpacing: '2px', subSpacing: '10px' },
    lg: { globe: 80, title: 60, sub: 16, gap: 16, sepW: 280, letterSpacing: '2px', subSpacing: '16px' },
    xl: { globe: 90, title: 72, sub: 14, gap: 12, sepW: 320, letterSpacing: '2px', subSpacing: '18px' },
  };

  const s = sizeMap[size];
  const isDark = variant === 'dark';
  const isHorizontal = variant === 'horizontal';

  if (isHorizontal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <GlobeSVG
          size={s.globe}
          color="#0047AB"
          accentColor="#00C8BE"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: `${s.title}px`,
            fontWeight: 800,
            color: '#1A2530',
            letterSpacing: s.letterSpacing,
            lineHeight: 1,
          }}>
            GUIBOUR
          </span>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: `${s.sub}px`,
            fontWeight: 300,
            color: '#00A89D',
            letterSpacing: s.subSpacing,
            lineHeight: 1,
            marginTop: '2px',
          }}>
            SYSTEM
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <GlobeSVG
        size={s.globe}
        color="#0047AB"
        accentColor={isDark ? '#00C8BE' : '#00A89D'}
        glowColor={isDark ? '#00C8BE' : undefined}
      />
      <span style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: `${s.title}px`,
        fontWeight: 800,
        color: isDark ? 'white' : '#1A2530',
        letterSpacing: s.letterSpacing,
        lineHeight: 1,
        marginTop: `${s.gap}px`,
        ...(isDark ? { textShadow: '0 0 14px rgba(0,168,157,0.8), 0 0 40px rgba(0,168,157,0.3)' } : {}),
      }}>
        GUIBOUR
      </span>
      {/* Separator */}
      <div style={{
        width: `${s.sepW}px`,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #00A89D, #00C8BE, transparent)',
        margin: `${s.gap * 0.6}px 0`,
        ...(isDark ? { boxShadow: '0 0 8px #00C8BE' } : {}),
      }} />
      <span style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: `${s.sub}px`,
        fontWeight: 300,
        color: isDark ? '#00C8BE' : '#607888',
        letterSpacing: s.subSpacing,
        lineHeight: 1,
      }}>
        SYSTEM
      </span>
    </div>
  );
}

export { GlobeSVG };
