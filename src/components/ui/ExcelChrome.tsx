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
      backgroundColor: '#0A1628',
      backgroundImage:
        'linear-gradient(rgba(0,72,171,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,72,171,.09) 1px, transparent 1px)',
      backgroundSize: '56px 34px',
      backgroundPosition: '0px 48px',
    }}>
      {/* Column headers row */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        height: '28px',
        background: '#1B3A6B',
        borderBottom: '1px solid #2B5090',
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
        background: '#0D2B5E',
        borderBottom: '2px solid #1B3A6B',
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
