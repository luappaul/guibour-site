'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import Sphere from '@/components/ui/Sphere';

const products = [
  { name: 'T-SHIRT GS', ref: 'GS-TS-001', desc: 'UNISEX · COTON BIO', price: '29', cell: 'B4', svgType: 'tshirt', tag: 'BEST SELLER' },
  { name: 'MUG CORPORATE', ref: 'GS-MG-001', desc: '30CL · CÉRAMIQUE', price: '18', cell: 'C4', svgType: 'mug', tag: null },
  { name: 'CRAVATE GS', ref: 'GS-CV-001', desc: 'BLEU MARINE · SOIE', price: '24', cell: 'D4', svgType: 'tie', tag: 'NOUVEAU' },
  { name: 'CLÉ USB EP', ref: 'GS-USB-001', desc: '8GB · USB-A', price: '22', cell: 'E4', svgType: 'usb', tag: null },
];

function ProductSVG({ type }: { type: string }) {
  const style = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  if (type === 'tshirt') return (
    <div style={style}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <path d="M20 15 L10 25 L18 30 L18 65 L62 65 L62 30 L70 25 L60 15 L50 22 C47 25 33 25 30 22 Z" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <path d="M50 22 C47 25 33 25 30 22" fill="none" stroke="#0047AB" strokeWidth="1.5"/>
        <text x="40" y="48" textAnchor="middle" fontFamily="Orbitron" fontSize="8" fontWeight="800" fill="#007B8A" letterSpacing="1">GS</text>
      </svg>
    </div>
  );
  if (type === 'mug') return (
    <div style={style}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="18" y="25" width="34" height="38" rx="2" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <path d="M52 32 C60 32 62 38 62 42 C62 46 60 52 52 52" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <path d="M28 22 C28 18 32 16 35 19" fill="none" stroke="#3A78C9" strokeWidth="1.5" opacity="0.6"/>
        <path d="M35 20 C35 16 39 14 42 17" fill="none" stroke="#3A78C9" strokeWidth="1.5" opacity="0.6"/>
        <text x="35" y="48" textAnchor="middle" fontFamily="Orbitron" fontSize="6" fontWeight="700" fill="#007B8A">CORP.</text>
      </svg>
    </div>
  );
  if (type === 'tie') return (
    <div style={style}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <path d="M35 10 L45 10 L43 20 L48 22 L40 70 L32 22 L37 20 Z" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <line x1="37" y1="30" x2="43" y2="30" stroke="#3A78C9" strokeWidth="1"/>
        <line x1="37.5" y1="38" x2="42.5" y2="38" stroke="#3A78C9" strokeWidth="1"/>
        <line x1="38" y1="46" x2="42" y2="46" stroke="#3A78C9" strokeWidth="1"/>
      </svg>
    </div>
  );
  return (
    <div style={style}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <rect x="25" y="20" width="30" height="44" rx="3" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <rect x="30" y="12" width="20" height="10" rx="1" fill="none" stroke="#0047AB" strokeWidth="1.5"/>
        <rect x="34" y="14" width="4" height="6" fill="#007B8A"/>
        <rect x="42" y="14" width="4" height="6" fill="#007B8A"/>
        <text x="40" y="42" textAnchor="middle" fontFamily="Orbitron" fontSize="5" fontWeight="700" fill="#3A78C9">GUIBOUR</text>
        <text x="40" y="50" textAnchor="middle" fontFamily="Orbitron" fontSize="5" fill="#8FA5B8">8GB</text>
      </svg>
    </div>
  );
}

function ProductCard({ p }: { p: typeof products[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hovered ? '#0047AB' : '#C8D8E8'}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,71,171,.13)' : '0 2px 8px rgba(0,47,94,.05)',
      }}
    >
      {/* Top stripe — dark ref bar */}
      <div style={{
        background: hovered ? '#0047AB' : '#0D2B5E',
        padding: '5px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s ease',
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#5B9BD5', letterSpacing: '2px' }}>{p.cell}</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '1px' }}>REF: {p.ref}</span>
      </div>

      {/* Tag badge */}
      {p.tag && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '10px',
          background: p.tag === 'NOUVEAU' ? '#00C8BE' : '#C8960A',
          color: '#fff',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '7px',
          letterSpacing: '2px',
          padding: '3px 8px',
          zIndex: 2,
        }}>{p.tag}</div>
      )}

      {/* Product image area */}
      <div style={{
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered ? '#EEF3F8' : '#F7FAFD',
        borderBottom: '1px solid #E0EAF4',
        transition: 'background 0.2s ease',
      }}>
        <ProductSVG type={p.svgType} />
      </div>

      {/* Product info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: '16px',
          color: '#0D2B5E',
          letterSpacing: '2px',
          marginBottom: '2px',
        }}>{p.name}</h3>

        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '7px',
          color: '#8FA5B8',
          letterSpacing: '2px',
          display: 'block',
          marginBottom: '12px',
        }}>{p.desc}</span>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto', marginBottom: '14px' }}>
          <span style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: '26px',
            color: '#0047AB',
          }}>{p.price}€</span>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '7px',
            color: '#8FA5B8',
            letterSpacing: '1px',
          }}>TVA INCL.</span>
        </div>

        <button style={{
          width: '100%',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          letterSpacing: '3px',
          color: '#fff',
          background: hovered ? 'linear-gradient(135deg,#0047AB,#007B8A)' : '#0D2B5E',
          border: 'none',
          padding: '11px 0',
          cursor: 'pointer',
          boxShadow: hovered ? '0 4px 14px rgba(0,71,171,.3)' : 'none',
          transition: 'all 0.2s ease',
        }}>COMMANDER →</button>
      </div>
    </div>
  );
}

export default function ShoppingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CATALOGUE(MERCH,"GUIBOUR") // ARTICLES: 4 // LIVRAISON EXPRESS'>
        <div style={{
          background: '#EEF3F8',
          backgroundImage: 'linear-gradient(rgba(0,71,171,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,71,171,.03) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg,#0B1F3A 0%,#0D2B5E 60%,#0047AB 100%)', padding: '28px 48px', borderBottom: '3px solid #00C8BE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Sphere size={52} />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#3C5A7A', letterSpacing: '5px', marginBottom: '4px' }}>02 / BOUTIQUE</div>
                <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(22px,4vw,36px)', color: '#F2F8FF', letterSpacing: '4px', lineHeight: 1 }}>BOUTIQUE MERCH</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', letterSpacing: '4px', marginTop: '4px' }}>W.O.W — COLLECTION OFFICIELLE</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'ARTICLES', value: '004' },
                { label: 'LIVRAISON', value: 'EXPRESS' },
                { label: 'STOCK', value: '● DISPO' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(0,200,190,.15)' }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '3px' }}>{s.label}</div>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '20px', color: '#00C8BE', marginTop: '2px' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PROMO STRIP */}
          <div style={{
            background: '#0047AB',
            padding: '10px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}>
            {['📦 LIVRAISON GUIBOUR EXPRESS', '🏅 QUALITÉ CORPORATE CERTIFIÉE', '🔒 PAIEMENT SÉCURISÉ GS-4891'].map(item => (
              <span key={item} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#A8D8FF', letterSpacing: '3px' }}>{item}</span>
            ))}
          </div>

          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>

            {/* Section label */}
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '5px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              CATALOGUE COMPLET <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
              <span style={{ fontSize: '7px' }}>=CATALOGUE() // 4 RÉFÉRENCES</span>
            </div>

            {/* Products grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {products.map(p => <ProductCard key={p.ref} p={p} />)}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: '40px', padding: '20px 24px', background: '#fff', border: '1px solid #C8D8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#0D2B5E', letterSpacing: '2px', marginBottom: '4px' }}>COMMANDES SUR DEVIS</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '1px' }}>Pour toute commande en volume, contactez le département RH.</div>
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#C8D8E8', letterSpacing: '2px', textAlign: 'right' }}>
                <div>=CATALOGUE() // DISPONIBLE SUR COMMANDE</div>
                <div style={{ marginTop: '3px' }}>W.O.W · WORK OR WINDOW · 2026</div>
              </div>
            </div>

          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
