'use client';

interface ExcelChromeProps {
  formulaText?: string;
  children: React.ReactNode;
}

const COLUMNS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X'];

export default function ExcelChrome({ formulaText = '=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM', children }: ExcelChromeProps) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      paddingLeft: '48px', // leave room for sidebar nav
      backgroundColor: '#0E2660',
      backgroundImage:
        'linear-gradient(rgba(60,130,240,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(60,130,240,.18) 1px, transparent 1px)',
      backgroundSize: '56px 34px',
      // aligné avec les en-têtes de colonnes (28px header + 24px formula bar = 52px chrome total)
      backgroundPosition: '48px 52px',
    }}>
      {/* Shimmer — lumière glissant sur les lignes de la grille */}
      <div className="grid-shimmer" />
      {/* Fondus de bord — dégradé vers le noir à droite et en bas */}
      <div className="grid-edge-fades" />

      {/* Column headers row */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        height: '28px',
        background: '#0F2562',
        borderBottom: '1px solid #1E4080',
      }}>
        {COLUMNS.map(col => (
          <div key={col} style={{
            width: '56px',
            minWidth: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: '#5B9BD5',
            borderRight: '1px solid rgba(43,80,144,.4)',
          }}>
            {col}
          </div>
        ))}
      </div>

      {/* Formula bar */}
      <div style={{
        position: 'sticky',
        top: 28,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        height: '24px',
        background: '#091D4E',
        borderBottom: '2px solid #0F2562',
        paddingLeft: '8px',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          color: '#00D4CC',
          fontWeight: 700,
          paddingLeft: '8px',
        }}>fx</span>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          color: '#5B9BD5',
          letterSpacing: '1px',
        }}>{formulaText}</span>
      </div>

      {/* Main content area */}
      <div style={{
        paddingTop: '16px',
        minHeight: 'calc(100vh - 52px)',
      }}>
        {children}
      </div>
    </div>
  );
}
