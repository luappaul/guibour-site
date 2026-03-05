'use client';

import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';

const products = [
  {
    name: 'T-SHIRT GS',
    ref: 'GS-TS-001',
    desc: 'UNISEX',
    price: '29',
    cell: 'B4',
    svgType: 'tshirt',
  },
  {
    name: 'MUG CORPORATE',
    ref: 'GS-MG-001',
    desc: '30CL',
    price: '18',
    cell: 'C4',
    svgType: 'mug',
  },
  {
    name: 'CRAVATE GS',
    ref: 'GS-CV-001',
    desc: 'BLEU',
    price: '24',
    cell: 'D4',
    svgType: 'tie',
  },
  {
    name: 'CLÉ USB EP',
    ref: 'GS-USB-001',
    desc: '8GB',
    price: '22',
    cell: 'E4',
    svgType: 'usb',
  },
];

function ProductSVG({ type }: { type: string }) {
  const style = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  if (type === 'tshirt') {
    return (
      <div style={style}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M20 15 L10 25 L18 30 L18 65 L62 65 L62 30 L70 25 L60 15 L50 22 C47 25 33 25 30 22 Z"
            fill="none" stroke="#0047AB" strokeWidth="2" />
          <path d="M50 22 C47 25 33 25 30 22" fill="none" stroke="#0047AB" strokeWidth="1.5" />
          <text x="40" y="48" textAnchor="middle" fontFamily="Oxanium" fontSize="8" fontWeight="800" fill="#0047AB" letterSpacing="1">GS</text>
        </svg>
      </div>
    );
  }
  if (type === 'mug') {
    return (
      <div style={style}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <rect x="18" y="25" width="34" height="38" rx="2" fill="none" stroke="#0047AB" strokeWidth="2" />
          <path d="M52 32 C60 32 62 38 62 42 C62 46 60 52 52 52" fill="none" stroke="#0047AB" strokeWidth="2" />
          <path d="M28 22 C28 18 32 16 35 19" fill="none" stroke="#00A89D" strokeWidth="1.5" opacity="0.6" />
          <path d="M35 20 C35 16 39 14 42 17" fill="none" stroke="#00A89D" strokeWidth="1.5" opacity="0.6" />
          <text x="35" y="48" textAnchor="middle" fontFamily="Oxanium" fontSize="6" fontWeight="700" fill="#0047AB">CORP.</text>
        </svg>
      </div>
    );
  }
  if (type === 'tie') {
    return (
      <div style={style}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path d="M35 10 L45 10 L43 20 L48 22 L40 70 L32 22 L37 20 Z" fill="none" stroke="#0047AB" strokeWidth="2" />
          <line x1="37" y1="30" x2="43" y2="30" stroke="#00A89D" strokeWidth="1" />
          <line x1="37.5" y1="38" x2="42.5" y2="38" stroke="#00A89D" strokeWidth="1" />
          <line x1="38" y1="46" x2="42" y2="46" stroke="#00A89D" strokeWidth="1" />
        </svg>
      </div>
    );
  }
  // USB
  return (
    <div style={style}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="25" y="20" width="30" height="44" rx="3" fill="none" stroke="#0047AB" strokeWidth="2" />
        <rect x="30" y="12" width="20" height="10" rx="1" fill="none" stroke="#0047AB" strokeWidth="1.5" />
        <rect x="34" y="14" width="4" height="6" fill="#00A89D" />
        <rect x="42" y="14" width="4" height="6" fill="#00A89D" />
        <text x="40" y="42" textAnchor="middle" fontFamily="Oxanium" fontSize="5" fontWeight="700" fill="#0047AB">GUIBOUR</text>
        <text x="40" y="50" textAnchor="middle" fontFamily="Share Tech Mono" fontSize="5" fill="#607888">8GB</text>
      </svg>
    </div>
  );
}

export default function ShoppingPage() {
  return (
    <div className="min-h-screen">
      <ExcelNav />
      <ExcelChrome formulaText='=CATALOGUE(MERCH,"GUIBOUR") // ARTICLES: 4'>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 24px' }}>
          {/* Sub-bar path */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #C8D8E8',
            marginBottom: '32px',
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: '#607888',
              letterSpacing: '2px',
            }}>
              GUIBOUR.FR / CATALOGUE / TOUS LES ARTICLES
            </span>
          </div>

          {/* Page title */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: '#00A89D',
              letterSpacing: '6px',
            }}>02 / BOUTIQUE</span>
            <h1 style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#1A2530',
              letterSpacing: '2px',
              marginTop: '8px',
            }}>MERCH</h1>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #00A89D, transparent)',
              marginTop: '8px',
            }} />
          </div>

          {/* Products grid - 4 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: '#C8D8E8',
            border: '1px solid #C8D8E8',
          }}>
            {products.map(p => (
              <div key={p.ref} style={{
                background: 'white',
                padding: '20px',
                position: 'relative',
              }}>
                {/* Cell reference */}
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px',
                  color: '#C0D0DE',
                  letterSpacing: '1px',
                }}>
                  {p.cell}
                </span>

                {/* Product SVG */}
                <div style={{
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F4F8FB',
                  border: '1px solid #C8D8E8',
                  marginBottom: '16px',
                }}>
                  <ProductSVG type={p.svgType} />
                </div>

                {/* Product name */}
                <h3 style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#1A2530',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  {p.name}
                </h3>

                {/* SKU */}
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px',
                  color: '#607888',
                  display: 'block',
                  marginTop: '4px',
                }}>
                  REF: {p.ref} / {p.desc}
                </span>

                {/* Price */}
                <span style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#00A89D',
                  display: 'block',
                  marginTop: '12px',
                }}>
                  {p.price}&euro;
                </span>

                {/* Add to cart button */}
                <button style={{
                  marginTop: '12px',
                  width: '100%',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  letterSpacing: '2px',
                  color: '#00A89D',
                  background: '#080D14',
                  border: '1px solid #00A89D',
                  padding: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(0,168,157,0.1)',
                }}>
                  AJOUTER AU PANIER
                </button>
              </div>
            ))}
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
