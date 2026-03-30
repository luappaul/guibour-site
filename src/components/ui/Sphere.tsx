/**
 * Sphere — composant logo sphère CSS 3D
 * Simule un globe avec dégradé radial + reflet spéculaire
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
      {/* Corps de la sphère */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 32%, #C8FFC8 0%, #7AEC7A 22%, #3A8040 52%, #1B5E20 76%, #0A2E0C 100%)',
          boxShadow:
            'inset -5px -5px 12px rgba(0,0,0,.38), inset 3px 3px 7px rgba(255,255,255,.22), 0 0 18px rgba(122,236,122,.32)',
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
