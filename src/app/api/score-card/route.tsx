import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pseudo = searchParams.get('pseudo') || 'EMPLOYE';
  const score = parseInt(searchParams.get('score') || '0', 10);
  const level = parseInt(searchParams.get('level') || '1', 10);

  const formattedScore = score.toLocaleString('fr-FR');

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0D2B5E',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            opacity: 0.06,
            backgroundImage:
              'linear-gradient(rgba(0,200,190,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,190,1) 1px, transparent 1px)',
            backgroundSize: '56px 34px',
          }}
        />

        {/* Cyan neon border */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            border: '3px solid #00C8BE',
            display: 'flex',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            bottom: '16px',
            border: '1px solid rgba(0,200,190,0.25)',
            display: 'flex',
            borderRadius: '2px',
          }}
        />

        {/* Header bar */}
        <div
          style={{
            background: '#0047AB',
            margin: '8px 8px 0',
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              color: '#A8D8FF',
              letterSpacing: '4px',
              display: 'flex',
            }}
          >
            GUIBOUR SYSTEM — FICHE EMPLOYE
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#5B9BD5',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            W.O.W // 2026
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 60px',
            gap: '16px',
          }}
        >
          {/* Logo GUIBOUR */}
          <div
            style={{
              fontSize: '72px',
              color: '#FFFFFF',
              fontWeight: 900,
              letterSpacing: '8px',
              display: 'flex',
              textShadow: '0 0 30px rgba(0,200,190,0.3)',
            }}
          >
            GUIBOUR
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#00C8BE',
              letterSpacing: '12px',
              display: 'flex',
              marginTop: '-8px',
            }}
          >
            SYSTEM
          </div>

          {/* Separator */}
          <div
            style={{
              width: '600px',
              height: '2px',
              background: '#00C8BE',
              display: 'flex',
              margin: '4px 0',
            }}
          />

          {/* EMPLOYE label */}
          <div
            style={{
              fontSize: '14px',
              color: '#5B9BD5',
              letterSpacing: '6px',
              display: 'flex',
            }}
          >
            EMPLOYE
          </div>

          {/* Pseudo */}
          <div
            style={{
              fontSize: '52px',
              color: '#FFFFFF',
              fontWeight: 700,
              letterSpacing: '4px',
              display: 'flex',
            }}
          >
            {pseudo.toUpperCase()}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '8px',
            }}
          >
            {/* Productivite */}
            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(0,200,190,0.3)',
                padding: '16px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: '4px',
                minWidth: '260px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#5B9BD5',
                  letterSpacing: '4px',
                  display: 'flex',
                  marginBottom: '8px',
                }}
              >
                PRODUCTIVITE
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: '#00C8BE',
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {formattedScore} PTS
              </div>
            </div>

            {/* Etage maximum */}
            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,224,51,0.3)',
                padding: '16px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: '4px',
                minWidth: '260px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#5B9BD5',
                  letterSpacing: '4px',
                  display: 'flex',
                  marginBottom: '8px',
                }}
              >
                ETAGE MAXIMUM
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: '#FFE033',
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {String(level).padStart(2, '0')}/25
              </div>
            </div>
          </div>
        </div>

        {/* Certified stamp */}
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'rotate(-12deg)',
          }}
        >
          <div
            style={{
              border: '3px solid rgba(255,68,68,0.7)',
              borderRadius: '8px',
              padding: '8px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: '#FF4444', letterSpacing: '3px', display: 'flex' }}>
              CERTIFIE
            </div>
            <div style={{ fontSize: '18px', color: '#FF4444', fontWeight: 700, letterSpacing: '2px', display: 'flex' }}>
              W.O.W 2026
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div
          style={{
            background: '#00C8BE',
            margin: '0 8px 8px',
            padding: '10px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#0D2B5E', fontWeight: 700, letterSpacing: '3px', display: 'flex' }}>
            GUIBOUR.FR
          </div>
          <div style={{ fontSize: '12px', color: '#0D2B5E', letterSpacing: '2px', display: 'flex' }}>
            W.O.W — WORK OR WINDOW
          </div>
          <div style={{ fontSize: '12px', color: '#0D2B5E', letterSpacing: '2px', display: 'flex' }}>
            #GUIBOUR2026
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
