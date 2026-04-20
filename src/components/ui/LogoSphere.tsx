'use client';

/**
 * LogoSphere — Globe 3D style logo corporate années 90
 * Inspiré des logos AT&T, CNN, compagnies aériennes — sphère blanche avec relief
 * Latitude / longitude en noir, dégradé radial pour effet 3D, reflet de lumière
 */
interface LogoSphereProps {
  size?: number;
  opacity?: number;
}

export default function LogoSphere({ size = 240, opacity = 1 }: LogoSphereProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.46;
  const lw = s * 0.009;    // épaisseur lignes grille
  const uid = `ls${s}`;   // unique ID pour defs SVG

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      style={{ opacity, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* Dégradé radial 3D — lumière en haut-gauche */}
        <radialGradient id={`${uid}-grad`} cx="36%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="30%"  stopColor="#EEF4FA" />
          <stop offset="65%"  stopColor="#D4E3EE" />
          <stop offset="100%" stopColor="#BACAD8" />
        </radialGradient>

        {/* Zone centrale légèrement plus sombre pour lisibilité du texte devant */}
        <radialGradient id={`${uid}-mid`} cx="50%" cy="52%" r="40%">
          <stop offset="0%"   stopColor="rgba(180,200,215,0.28)" />
          <stop offset="100%" stopColor="rgba(180,200,215,0)" />
        </radialGradient>

        {/* Clip pour les lignes intérieures */}
        <clipPath id={`${uid}-clip`}>
          <circle cx={cx} cy={cy} r={r - lw * 0.5} />
        </clipPath>

        {/* Filtre ombre portée */}
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx={s * 0.02}
            dy={s * 0.035}
            stdDeviation={s * 0.028}
            floodColor="#000000"
            floodOpacity="0.38"
          />
        </filter>
      </defs>

      {/* Ombre au sol — effet 3D */}
      <ellipse
        cx={cx + s * 0.025}
        cy={cy + r * 0.96}
        rx={r * 0.65}
        ry={r * 0.075}
        fill="rgba(0,0,0,0.18)"
      />

      {/* Corps principal de la sphère */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${uid}-grad)`}
        filter={`url(#${uid}-shadow)`}
      />

      {/* Overlay central légèrement sombre pour contraste texte */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${uid}-mid)`}
      />

      {/* ── Réseau géographique clipé à la sphère ── */}
      <g clipPath={`url(#${uid}-clip)`} fill="none">

        {/* Équateur — ligne principale, légèrement en perspective */}
        <ellipse
          cx={cx} cy={cy}
          rx={r} ry={r * 0.21}
          stroke="#192A3E"
          strokeWidth={lw * 1.5}
          opacity={0.5}
        />

        {/* Tropique du Capricorne / Cancer */}
        <ellipse
          cx={cx} cy={cy - r * 0.40}
          rx={r * 0.92} ry={r * 0.19}
          stroke="#192A3E"
          strokeWidth={lw}
          opacity={0.35}
        />
        <ellipse
          cx={cx} cy={cy + r * 0.40}
          rx={r * 0.92} ry={r * 0.19}
          stroke="#192A3E"
          strokeWidth={lw}
          opacity={0.35}
        />

        {/* Cercles polaires */}
        <ellipse
          cx={cx} cy={cy - r * 0.72}
          rx={r * 0.70} ry={r * 0.13}
          stroke="#192A3E"
          strokeWidth={lw * 0.85}
          opacity={0.25}
        />
        <ellipse
          cx={cx} cy={cy + r * 0.72}
          rx={r * 0.70} ry={r * 0.13}
          stroke="#192A3E"
          strokeWidth={lw * 0.85}
          opacity={0.25}
        />

        {/* Méridien central (vertical) */}
        <ellipse
          cx={cx} cy={cy}
          rx={r * 0.014} ry={r}
          stroke="#192A3E"
          strokeWidth={lw * 1.3}
          opacity={0.48}
        />

        {/* Méridiens latéraux ±45° */}
        <ellipse
          cx={cx} cy={cy}
          rx={r * 0.44} ry={r}
          stroke="#192A3E"
          strokeWidth={lw}
          opacity={0.30}
        />
        <ellipse
          cx={cx} cy={cy}
          rx={r * 0.80} ry={r}
          stroke="#192A3E"
          strokeWidth={lw * 0.85}
          opacity={0.22}
        />
      </g>

      {/* Contour extérieur de la sphère */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#192A3E"
        strokeWidth={s * 0.02}
        opacity={0.55}
        fill="none"
      />

      {/* Reflet de lumière principal (top-left) */}
      <ellipse
        cx={cx - r * 0.24}
        cy={cy - r * 0.27}
        rx={r * 0.21}
        ry={r * 0.12}
        fill="rgba(255,255,255,0.62)"
      />
      {/* Petit reflet vif */}
      <ellipse
        cx={cx - r * 0.17}
        cy={cy - r * 0.38}
        rx={r * 0.075}
        ry={r * 0.042}
        fill="rgba(255,255,255,0.88)"
      />
    </svg>
  );
}
