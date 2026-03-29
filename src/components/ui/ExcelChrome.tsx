'use client';

interface ExcelChromeProps {
  formulaText?: string;
  children: React.ReactNode;
}

const COLUMNS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X'];
const ROW_COUNT = 40;

export default function ExcelChrome({ formulaText = '=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM', children }: ExcelChromeProps) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      paddingLeft: '48px', // leave room for sidebar nav
      backgroundColor: '#0A1400',
      backgroundImage:
        'linear-gradient(rgba(44,95,46,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(44,95,46,.08) 1px, transparent 1px)',
      backgroundSize: '56px 34px',
      backgroundPosition: '44px 48px',
    }}>
      {/* Column headers row */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        height: '28px',
        background: '#060E00',
        borderBottom: '1px solid #1B4332',
        paddingLeft: '44px',
      }}>
        {COLUMNS.map(col => (
          <div key={col} style={{
            width: '56px',
            minWidth: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: '#2C5F2E',
            borderRight: '1px solid #1B4332',
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
        background: '#060E00',
        borderBottom: '2px solid #1B4332',
        paddingLeft: '44px',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#5CDB5C',
          fontWeight: 700,
          paddingLeft: '8px',
        }}>fx</span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: '#4CAF50',
          letterSpacing: '1px',
        }}>{formulaText}</span>
      </div>

      {/* Row numbers column */}
      <div style={{
        position: 'fixed',
        left: '48px', // after sidebar
        top: 52, // 28 cols + 24 formula
        bottom: 0,
        width: '44px',
        background: '#060E00',
        borderRight: '1px solid #1B4332',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {Array.from({ length: ROW_COUNT }, (_, i) => (
          <div key={i} style={{
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px',
            color: '#1B4332',
            borderBottom: '1px solid #0D2B0D',
          }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div style={{
        paddingLeft: '44px',
        paddingTop: '16px',
        minHeight: 'calc(100vh - 52px)',
      }}>
        {children}
      </div>
    </div>
  );
}
