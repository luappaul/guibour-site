'use client';

interface GlobeIconProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

/**
 * Globe wireframe SVG — style "réseau mondial"
 * Inspiré des icônes de globe standard (lignes de latitude et longitude).
 */
export default function GlobeIcon({ size = 80, color = '#00C8BE', opacity = 1 }: GlobeIconProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.45;          // rayon principal
  const sw = s * 0.028;        // épaisseur principale
  const sw2 = s * 0.018;       // épaisseur secondaire
  const sw3 = s * 0.012;       // épaisseur tertiaire

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      style={{ opacity, display: 'block' }}
      aria-hidden="true"
    >
      {/* Cercle extérieur */}
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={sw} />

      {/* Méridien central (vertical) */}
      <ellipse cx={cx} cy={cy} rx={r * 0.01} ry={r} stroke={color} strokeWidth={sw2} />

      {/* Méridiens intermédiaires */}
      <ellipse cx={cx} cy={cy} rx={r * 0.38} ry={r} stroke={color} strokeWidth={sw2} opacity={0.75} />
      <ellipse cx={cx} cy={cy} rx={r * 0.7} ry={r} stroke={color} strokeWidth={sw3} opacity={0.55} />
      <ellipse cx={cx} cy={cy} rx={r * 0.92} ry={r} stroke={color} strokeWidth={sw3} opacity={0.35} />

      {/* Équateur */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.18} stroke={color} strokeWidth={sw2} opacity={0.8} />

      {/* Parallèles nord/sud */}
      <ellipse cx={cx} cy={cy - r * 0.38} rx={r * 0.92} ry={r * 0.14} stroke={color} strokeWidth={sw3} opacity={0.6} />
      <ellipse cx={cx} cy={cy + r * 0.38} rx={r * 0.92} ry={r * 0.14} stroke={color} strokeWidth={sw3} opacity={0.6} />
      <ellipse cx={cx} cy={cy - r * 0.68} rx={r * 0.73} ry={r * 0.1} stroke={color} strokeWidth={sw3} opacity={0.4} />
      <ellipse cx={cx} cy={cy + r * 0.68} rx={r * 0.73} ry={r * 0.1} stroke={color} strokeWidth={sw3} opacity={0.4} />
    </svg>
  );
}
