'use client';

interface ExcelChromeProps {
  formulaText?: string;
  children: React.ReactNode;
}

const COLUMNS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X'];
const ROW_COUNT = 40;

export default function ExcelChrome({ formulaText = '=LAUNCH_GAME("GUIBOUR","SINGLE_2025") → WELCOME_TO_THE_SYSTEM', children }: ExcelChromeProps) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#F4F8FB',
      backgroundImage: 'linear-gradient(#C8D8E8 1px, transparent 1px), linear-gradient(90deg, #C8D8E8 1px, transparent 1px)',
      backgroundSize: '56px 34px',
      backgroundPosition: '40px 48px',
    }}>
      {/* Column headers row */}
      <div style={{
        position: 'sticky',
        top: 48, // below nav
        zIndex: 20,
        display: 'flex',
        height: '28px',
        background: '#EBF0F5',
        borderBottom: '2px solid #C0D0DE',
        paddingLeft: '40px',
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
            color: '#607888',
            borderRight: '1px solid #C0D0DE',
          }}>
            {col}
          </div>
        ))}
      </div>

      {/* Formula bar */}
      <div style={{
        position: 'sticky',
        top: 76, // 48 nav + 28 cols
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        height: '24px',
        background: '#EBF0F5',
        borderBottom: '1px solid #C0D0DE',
        paddingLeft: '40px',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: '#0047AB',
          fontStyle: 'italic',
          paddingLeft: '8px',
        }}>fx</span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: '#607888',
          letterSpacing: '1px',
        }}>{formulaText}</span>
      </div>

      {/* Row numbers column */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 100, // 48 nav + 28 cols + 24 formula
        bottom: 0,
        width: '40px',
        background: '#EBF0F5',
        borderRight: '1px solid #C0D0DE',
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
            color: '#607888',
            borderBottom: '1px solid #C0D0DE',
          }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div style={{
        paddingLeft: '40px',
        paddingTop: '16px',
        minHeight: 'calc(100vh - 100px)',
      }}>
        {children}
      </div>
    </div>
  );
}
