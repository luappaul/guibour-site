'use client';

import { useState, useCallback } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';

// ─── Catalogue ────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'T-SHIRT GS',    ref: 'GS-TS-001', desc: 'UNISEX · COTON BIO', price: 29, cell: 'B4', svgType: 'tshirt', tag: 'BEST SELLER' },
  { name: 'MUG CORPORATE', ref: 'GS-MG-001', desc: '30CL · CÉRAMIQUE',   price: 18, cell: 'C4', svgType: 'mug',    tag: null          },
  { name: 'CRAVATE GS',    ref: 'GS-CV-001', desc: 'BLEU MARINE · SOIE', price: 24, cell: 'D4', svgType: 'tie',    tag: 'NOUVEAU'     },
  { name: 'CLÉ USB EP',    ref: 'GS-USB-001', desc: '8GB · USB-A',       price: 22, cell: 'E4', svgType: 'usb',    tag: null          },
] as const;

type Product = typeof PRODUCTS[number];
interface CartLine { product: Product; qty: number }
type Screen = 'shop' | 'cart' | 'checkout' | 'confirmation';

// ─── SVG produits (neon cyan) ──────────────────────────────────
function ProductSVG({ type, glow }: { type: string; glow?: boolean }) {
  const c = '#00FFEE';
  const c2 = 'rgba(0,255,238,.5)';
  const wrap: React.CSSProperties = {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    filter: glow ? `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 14px rgba(0,255,238,.3))` : `drop-shadow(0 0 3px ${c2})`,
    transition: 'filter .3s',
  };

  if (type === 'tshirt') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <path d="M20 15 L10 25 L18 30 L18 65 L62 65 L62 30 L70 25 L60 15 L50 22 C47 25 33 25 30 22 Z"
          fill="none" stroke={c} strokeWidth="2"/>
        <path d="M50 22 C47 25 33 25 30 22" fill="none" stroke={c} strokeWidth="1.5"/>
        <text x="40" y="48" textAnchor="middle" fontFamily="Orbitron" fontSize="8" fontWeight="800"
          fill={c} letterSpacing="1" opacity=".85">GS</text>
      </svg>
    </div>
  );
  if (type === 'mug') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <rect x="18" y="25" width="34" height="38" rx="2" fill="none" stroke={c} strokeWidth="2"/>
        <path d="M52 32 C60 32 62 38 62 42 C62 46 60 52 52 52" fill="none" stroke={c} strokeWidth="2"/>
        <path d="M28 22 C28 18 32 16 35 19" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5"/>
        <path d="M35 20 C35 16 39 14 42 17" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5"/>
        <text x="35" y="48" textAnchor="middle" fontFamily="Orbitron" fontSize="6" fontWeight="700"
          fill={c} opacity=".8">CORP.</text>
      </svg>
    </div>
  );
  if (type === 'tie') return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <path d="M35 10 L45 10 L43 20 L48 22 L40 70 L32 22 L37 20 Z"
          fill="none" stroke={c} strokeWidth="2"/>
        <line x1="37" y1="30" x2="43" y2="30" stroke={c} strokeWidth="1" opacity=".6"/>
        <line x1="37.5" y1="38" x2="42.5" y2="38" stroke={c} strokeWidth="1" opacity=".6"/>
        <line x1="38" y1="46" x2="42" y2="46" stroke={c} strokeWidth="1" opacity=".6"/>
      </svg>
    </div>
  );
  return (
    <div style={wrap}>
      <svg width="90" height="90" viewBox="0 0 80 80">
        <rect x="25" y="20" width="30" height="44" rx="3" fill="none" stroke={c} strokeWidth="2"/>
        <rect x="30" y="12" width="20" height="10" rx="1" fill="none" stroke={c} strokeWidth="1.5"/>
        <rect x="34" y="14" width="4" height="6" fill={c} opacity=".8"/>
        <rect x="42" y="14" width="4" height="6" fill={c} opacity=".8"/>
        <text x="40" y="42" textAnchor="middle" fontFamily="Orbitron" fontSize="5" fontWeight="700"
          fill={c} opacity=".9">GUIBOUR</text>
        <text x="40" y="50" textAnchor="middle" fontFamily="Orbitron" fontSize="5"
          fill={c} opacity=".6">8GB</text>
      </svg>
    </div>
  );
}

// ─── Carte produit ─────────────────────────────────────────────
function ProductCard({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(160deg, rgba(0,255,238,.07) 0%, rgba(0,30,80,.9) 100%)'
          : 'rgba(5,15,45,.75)',
        border: `1px solid ${hovered ? 'rgba(0,255,238,.55)' : 'rgba(0,255,238,.1)'}`,
        display: 'flex', flexDirection: 'column', position: 'relative',
        transition: 'all 0.25s ease',
        boxShadow: hovered
          ? '0 0 28px rgba(0,255,238,.15), inset 0 0 20px rgba(0,255,238,.04)'
          : '0 2px 12px rgba(0,0,0,.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Reference bar */}
      <div style={{
        background: hovered ? 'rgba(0,255,238,.08)' : 'rgba(0,0,0,.4)',
        padding: '6px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${hovered ? 'rgba(0,255,238,.2)' : 'rgba(0,255,238,.05)'}`,
        transition: 'all .25s',
      }}>
        <span style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: hovered ? '#00FFEE' : '#2A4060', letterSpacing: '2px',
          textShadow: hovered ? '0 0 6px rgba(0,255,238,.8)' : 'none',
          transition: 'all .25s',
        }}>{p.cell}</span>
        <span style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: '#1E3050', letterSpacing: '1px',
        }}>REF: {p.ref}</span>
      </div>

      {/* Tag badge */}
      {p.tag && (
        <div style={{
          position: 'absolute', top: '42px', left: '10px', zIndex: 2,
          background: p.tag === 'NOUVEAU' ? 'rgba(0,255,238,.15)' : 'rgba(255,200,10,.12)',
          color: p.tag === 'NOUVEAU' ? '#00FFEE' : '#FFD700',
          border: `1px solid ${p.tag === 'NOUVEAU' ? 'rgba(0,255,238,.5)' : 'rgba(255,200,10,.4)'}`,
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px', letterSpacing: '2px', padding: '3px 8px',
          textShadow: p.tag === 'NOUVEAU' ? '0 0 8px rgba(0,255,238,.7)' : '0 0 8px rgba(255,200,10,.6)',
        }}>{p.tag}</div>
      )}

      {/* Product illustration */}
      <div style={{
        height: '140px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered
          ? 'radial-gradient(ellipse at center, rgba(0,255,238,.06) 0%, transparent 70%)'
          : 'transparent',
        transition: 'background .3s',
      }}>
        <ProductSVG type={p.svgType} glow={hovered} />
      </div>

      {/* Info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: "'Lilita One', cursive", fontSize: '16px',
          color: hovered ? '#FFFFFF' : '#A8C8E8',
          letterSpacing: '2px', marginBottom: '3px',
          textShadow: hovered ? '0 0 12px rgba(0,255,238,.2)' : 'none',
          transition: 'all .25s',
        }}>{p.name}</h3>
        <span style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: '#2A4060', letterSpacing: '2px', display: 'block', marginBottom: '12px',
        }}>{p.desc}</span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto', marginBottom: '14px' }}>
          <span style={{
            fontFamily: "'Lilita One', cursive", fontSize: '26px',
            color: hovered ? '#00FFEE' : '#5B8FBF',
            textShadow: hovered ? '0 0 16px rgba(0,255,238,.6)' : 'none',
            transition: 'all .25s',
          }}>{p.price}€</span>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3050', letterSpacing: '1px' }}>TVA INCL.</span>
        </div>

        <button
          onClick={handleAdd}
          style={{
            width: '100%',
            fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '2px',
            color: added ? '#000' : (hovered ? '#00FFEE' : '#4A7AA8'),
            background: added
              ? '#00FFEE'
              : hovered
              ? 'rgba(0,255,238,.1)'
              : 'rgba(0,50,100,.4)',
            border: `1px solid ${added ? '#00FFEE' : hovered ? 'rgba(0,255,238,.6)' : 'rgba(0,100,160,.3)'}`,
            padding: '11px 0', cursor: 'pointer',
            boxShadow: hovered && !added ? '0 0 14px rgba(0,255,238,.2)' : 'none',
            transition: 'all .2s ease',
          }}
        >{added ? '✓ AJOUTÉ' : '+ AJOUTER AU PANIER'}</button>
      </div>
    </div>
  );
}

// ─── Panier lateral ────────────────────────────────────────────
function CartPanel({
  cart, total, onQty, onCheckout, onClose,
}: {
  cart: CartLine[]; total: number;
  onQty: (ref: string, delta: number) => void;
  onCheckout: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      width: '320px', flexShrink: 0,
      background: 'rgba(2,8,28,.9)',
      border: '1px solid rgba(0,255,238,.15)',
      borderRadius: '2px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 0 30px rgba(0,255,238,.08)',
    }}>
      <div style={{
        background: 'rgba(0,255,238,.05)', padding: '12px 16px',
        borderBottom: '1px solid rgba(0,255,238,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#00FFEE', letterSpacing: '3px', textShadow: '0 0 8px rgba(0,255,238,.6)' }}>
          PANIER // {cart.reduce((s, l) => s + l.qty, 0)} ARTICLE(S)
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#2A4060', cursor: 'pointer',
          fontSize: '16px', padding: '0 4px',
        }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {cart.length === 0 ? (
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#1E3050',
            letterSpacing: '2px', padding: '24px', textAlign: 'center',
          }}>PANIER VIDE</div>
        ) : cart.map(line => (
          <div key={line.product.ref} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px',
            borderBottom: '1px solid rgba(0,255,238,.05)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#A8C8E8', letterSpacing: '1px' }}>
                {line.product.name}
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3050', marginTop: '2px' }}>
                {line.product.price}€ × {line.qty} = {line.product.price * line.qty}€
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[-1, +1].map(d => (
                <button key={d} onClick={() => onQty(line.product.ref, d)} style={{
                  width: '22px', height: '22px', background: 'rgba(0,255,238,.08)',
                  border: '1px solid rgba(0,255,238,.2)', color: '#00FFEE',
                  cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,238,.2)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(0,255,238,.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,238,.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                >{d > 0 ? '+' : '−'}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(0,255,238,.12)', background: 'rgba(0,0,0,.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '3px' }}>TOTAL</span>
            <span style={{
              fontFamily: "'Lilita One', cursive", fontSize: '24px', color: '#00FFEE',
              textShadow: '0 0 14px rgba(0,255,238,.6)',
            }}>{total}€</span>
          </div>
          <button onClick={onCheckout} style={{
            width: '100%', fontFamily: "'Lilita One', cursive", fontSize: '15px',
            letterSpacing: '3px', color: '#000',
            background: 'linear-gradient(135deg, #00FFEE, #00C8BE)',
            border: 'none', padding: '13px', cursor: 'pointer',
            boxShadow: '0 0 22px rgba(0,255,238,.4)',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(0,255,238,.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,238,.4)'; }}
          >VALIDER LA COMMANDE →</button>
        </div>
      )}
    </div>
  );
}

export default function ShoppingPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [screen, setScreen] = useState<Screen>('shop');
  const [showCart, setShowCart] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', address: '' });
  const [orderRef] = useState(() => 'GS-' + Math.floor(Math.random() * 90000 + 10000));

  const total = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  const handleAdd = useCallback((p: Product) => {
    setCart(prev => {
      const existing = prev.find(l => l.product.ref === p.ref);
      return existing
        ? prev.map(l => l.product.ref === p.ref ? { ...l, qty: l.qty + 1 } : l)
        : [...prev, { product: p, qty: 1 }];
    });
    setShowCart(true);
  }, []);

  const handleQty = useCallback((ref: string, delta: number) => {
    setCart(prev =>
      prev
        .map(l => l.product.ref === ref ? { ...l, qty: l.qty + delta } : l)
        .filter(l => l.qty > 0)
    );
  }, []);

  if (screen === 'confirmation') {
    return (
      <div className="min-h-screen" style={{ background: '#0E2660' }}>
        <ExcelNav />
        <ExcelChrome formulaText='=ORDER_CONFIRMED() // MERCI // W.O.W'>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 'calc(100vh - 52px)', gap: '20px', padding: '40px',
            backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
            backgroundSize: '56px 34px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '2px solid #00FFEE',
              boxShadow: '0 0 30px rgba(0,255,235,.5), inset 0 0 20px rgba(0,255,235,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', color: '#00FFEE',
            }}>✓</div>
            <div style={{
              fontFamily: "'Lilita One', cursive", fontSize: '36px', color: '#FFF',
              letterSpacing: '4px', textAlign: 'center',
              textShadow: '0 0 24px rgba(0,255,235,.3)',
            }}>COMMANDE REÇUE</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#00FFEE', letterSpacing: '3px', opacity: .7 }}>
              ON VOUS ENVOIE ÇA... APRÈS LA PAUSE CAFÉ.
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#1E3050',
              padding: '8px 18px', border: '1px solid rgba(0,255,235,.08)',
              background: 'rgba(0,255,235,.02)', letterSpacing: '2px',
            }}>
              =ORDER_REF("{orderRef}") // STATUS: PROCESSING
            </div>
            <button
              onClick={() => { setScreen('shop'); setCart([]); setShowCart(false); }}
              style={{
                marginTop: '16px', fontFamily: "'Lilita One', cursive", fontSize: '14px',
                letterSpacing: '3px', color: '#fff', background: 'transparent',
                border: '2px solid rgba(0,255,235,.4)', padding: '13px 34px', cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FFEE'; e.currentTarget.style.color = '#00FFEE'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,255,235,.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,235,.4)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
            >CONTINUER LES ACHATS</button>
          </div>
        </ExcelChrome>
      </div>
    );
  }

  if (screen === 'checkout') {
    return (
      <div className="min-h-screen" style={{ background: '#0E2660' }}>
        <ExcelNav />
        <ExcelChrome formulaText='=CHECKOUT() // LIVRAISON_INFO // W.O.W'>
          <div style={{
            backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
            backgroundSize: '56px 34px', minHeight: 'calc(100vh - 52px)',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg,#06101F,#0B1E4A,#0A2C70)',
              padding: '28px 48px 24px', borderBottom: '2px solid rgba(0,255,235,.15)',
              display: 'flex', alignItems: 'center', gap: '20px',
            }}>
              <GlobeIcon size={44} color="#00FFEE" />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '5px' }}>BOUTIQUE</div>
                <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '28px', color: '#FFF', letterSpacing: '3px', textShadow: '0 0 20px rgba(0,255,235,.15)' }}>
                  FINALISER LA COMMANDE
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '0', minHeight: 'calc(100vh - 195px)' }}>

              {/* Form */}
              <div style={{ padding: '40px 48px' }}>
                <form onSubmit={e => { e.preventDefault(); setScreen('confirmation'); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '500px' }}>
                  {[
                    { key: 'name',    label: 'NOM COMPLET',     type: 'text',  placeholder: 'Votre nom...' },
                    { key: 'email',   label: 'EMAIL',            type: 'email', placeholder: 'votre@email.com' },
                    { key: 'address', label: 'ADRESSE LIVRAISON',type: 'text',  placeholder: '123 rue du Bureau...' },
                  ].map(f => (
                    <div key={f.key} style={{
                      background: 'rgba(255,255,255,.02)',
                      border: '1px solid rgba(0,255,235,.07)',
                      padding: '12px 16px 10px', marginBottom: '2px',
                    }}>
                      <label style={{ display: 'block', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#2A4060', letterSpacing: '3px', marginBottom: '6px' }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} required placeholder={f.placeholder}
                        value={checkoutForm[f.key as keyof typeof checkoutForm]}
                        onChange={ev => setCheckoutForm(prev => ({ ...prev, [f.key]: ev.target.value }))}
                        style={{
                          width: '100%', border: 'none', background: 'transparent',
                          fontFamily: "'Orbitron', sans-serif", fontSize: '12px',
                          color: '#E0F0FF', outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => { e.currentTarget.closest('div')!.style.border = '1px solid rgba(0,255,235,.5)'; e.currentTarget.closest('div')!.style.boxShadow = '0 0 14px rgba(0,255,235,.08)'; }}
                        onBlur={e => { e.currentTarget.closest('div')!.style.border = '1px solid rgba(0,255,235,.07)'; e.currentTarget.closest('div')!.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setScreen('shop')} style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '2px',
                      color: '#2A4060', background: 'transparent',
                      border: '1px solid rgba(0,255,235,.1)', padding: '13px 24px', cursor: 'pointer',
                    }}>← RETOUR</button>
                    <button type="submit" style={{
                      flex: 1, fontFamily: "'Lilita One', cursive", fontSize: '16px', letterSpacing: '3px',
                      color: '#000', background: 'linear-gradient(135deg,#00FFEE,#00C8BE)',
                      border: 'none', padding: '13px', cursor: 'pointer',
                      boxShadow: '0 0 22px rgba(0,255,235,.4)',
                    }}>CONFIRMER LA COMMANDE →</button>
                  </div>
                </form>
              </div>

              {/* Order recap */}
              <div style={{
                background: 'rgba(0,0,0,.25)', borderLeft: '1px solid rgba(0,255,235,.08)',
                padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '0',
              }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00FFEE', letterSpacing: '3px', marginBottom: '16px', textShadow: '0 0 8px rgba(0,255,235,.5)' }}>
                  RÉCAPITULATIF
                </div>
                {cart.map(line => (
                  <div key={line.product.ref} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: '1px solid rgba(0,255,235,.05)',
                  }}>
                    <div>
                      <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#A8C8E8' }}>{line.product.name}</div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3050' }}>QTÉ: {line.qty}</div>
                    </div>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '15px', color: '#00FFEE', alignSelf: 'center' }}>
                      {line.product.price * line.qty}€
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,255,235,.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '3px' }}>TOTAL</span>
                  <span style={{ fontFamily: "'Lilita One', cursive", fontSize: '28px', color: '#00FFEE', textShadow: '0 0 14px rgba(0,255,235,.6)' }}>{total}€</span>
                </div>
              </div>
            </div>
          </div>
        </ExcelChrome>
      </div>
    );
  }

  // ── SHOP VIEW ────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=BOUTIQUE("W.O.W") // CATALOGUE_MERCH // SAISON_01'>

        <div style={{
          backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#06101F 0%,#0B1E4A 60%,#0A2C70 100%)',
            padding: '28px 48px 24px',
            borderBottom: '2px solid rgba(0,255,235,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <GlobeIcon size={52} color="#00FFEE" />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '5px', marginBottom: '4px' }}>
                  03 / BOUTIQUE
                </div>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: 'clamp(22px,4vw,36px)', color: '#F2F8FF',
                  letterSpacing: '4px', lineHeight: 1,
                  textShadow: '0 0 24px rgba(0,255,235,.18)',
                }}>BOUTIQUE W.O.W</div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                  color: '#00FFEE', letterSpacing: '4px', marginTop: '4px',
                  textShadow: '0 0 8px rgba(0,255,235,.6)',
                }}>MERCH OFFICIEL — SAISON 01</div>
              </div>
            </div>

            {/* Cart button */}
            <button
              onClick={() => setShowCart(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '2px',
                color: itemCount > 0 ? '#00FFEE' : '#2A4060',
                background: itemCount > 0 ? 'rgba(0,255,235,.08)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${itemCount > 0 ? 'rgba(0,255,235,.4)' : 'rgba(0,255,235,.08)'}`,
                padding: '12px 20px', cursor: 'pointer',
                boxShadow: itemCount > 0 ? '0 0 18px rgba(0,255,235,.2)' : 'none',
                transition: 'all .25s',
                textShadow: itemCount > 0 ? '0 0 8px rgba(0,255,235,.6)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,235,.55)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,235,.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = itemCount > 0 ? 'rgba(0,255,235,.4)' : 'rgba(0,255,235,.08)'; e.currentTarget.style.boxShadow = itemCount > 0 ? '0 0 18px rgba(0,255,235,.2)' : 'none'; }}
            >
              🛒 PANIER
              {itemCount > 0 && (
                <span style={{
                  background: '#00FFEE', color: '#000',
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px', fontWeight: 700,
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{itemCount}</span>
              )}
            </button>
          </div>

          {/* Main content */}
          <div style={{
            display: 'flex', gap: '0', alignItems: 'flex-start',
            padding: '32px 32px 48px',
          }}>

            {/* Products grid */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '2px',
              marginRight: showCart ? '24px' : '0',
              transition: 'margin .3s',
            }}>
              {PRODUCTS.map(p => (
                <ProductCard key={p.ref} p={p} onAdd={handleAdd} />
              ))}

              {/* Note Excel dégagée */}
              <div style={{
                gridColumn: '1 / -1', marginTop: '16px',
                fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                color: '#1A2E48', letterSpacing: '2px', lineHeight: 1.8,
                padding: '12px', border: '1px solid rgba(0,255,235,.04)',
                background: 'rgba(0,255,235,.01)',
              }}>
                =NOTE("LIVRAISON SOUS 5 JOURS OUVRÉS · SERVICE EXPÉDITION · RDC GAUCHE · EXT.342")
                <br />
                =DISCLAIMER("CES ARTICLES SONT RÉELS ET FICTIFS À LA FOIS. VOUS LES RECEVREZ PEUT-ÊTRE. OU PAS.")
              </div>
            </div>

            {/* Cart panel */}
            {showCart && (
              <CartPanel
                cart={cart} total={total}
                onQty={handleQty}
                onCheckout={() => setScreen('checkout')}
                onClose={() => setShowCart(false)}
              />
            )}
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
