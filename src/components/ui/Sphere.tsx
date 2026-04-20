/**
 * Sphere — composant logo sphère CSS 3D
 * V8 — Corporate 90s — bleu navy
 */

interface SphereProps {
  size?: number;
  /** Animation glow (sphereGlow) activée par défaut */
  animated?: boolean;
  style?: React.CSSProperties;
}

export default function Sphere({ size = 44, animated = true, style }: SphereProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Corps de la sphère — bleu navy vers cyan */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 32%, #A8D8FF 0%, #5B9BD5 22%, #0047AB 52%, #0D2B5E 76%, #060F20 100%)',
          boxShadow:
            'inset -5px -5px 12px rgba(0,0,0,.40), inset 3px 3px 7px rgba(255,255,255,.22), 0 0 18px rgba(0,71,171,.32)',
          animation: animated ? 'sphereGlow 4s ease-in-out infinite' : undefined,
        }}
      />
      {/* Reflet spéculaire */}
      <div
        style={{
          position: 'absolute',
          top: '13%',
          left: '19%',
          width: '32%',
          height: '22%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,.55), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
