'use client';

import { useState, useCallback } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';

// ─── Catalogue ────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'T-SHIRT GS', ref: 'GS-TS-001', desc: 'UNISEX · COTON BIO', price: 29, cell: 'B4', svgType: 'tshirt', tag: 'BEST SELLER' },
  { name: 'MUG CORPORATE', ref: 'GS-MG-001', desc: '30CL · CÉRAMIQUE', price: 18, cell: 'C4', svgType: 'mug', tag: null },
  { name: 'CRAVATE GS', ref: 'GS-CV-001', desc: 'BLEU MARINE · SOIE', price: 24, cell: 'D4', svgType: 'tie', tag: 'NOUVEAU' },
  { name: 'CLÉ USB EP', ref: 'GS-USB-001', desc: '8GB · USB-A', price: 22, cell: 'E4', svgType: 'usb', tag: null },
] as const;

type Product = typeof PRODUCTS[number];
interface CartLine { product: Product; qty: number }
type Screen = 'shop' | 'cart' | 'checkout' | 'confirmation';

// ─── SVG produits ─────────────────────────────────────────────
function ProductSVG({ type }: { type: string }) {
  const wrap = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
  if (type === 'tshirt') return (
    <div style={wrap}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <path d="M20 15 L10 25 L18 30 L18 65 L62 65 L62 30 L70 25 L60 15 L50 22 C47 25 33 25 30 22 Z" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <path d="M50 22 C47 25 33 25 30 22" fill="none" stroke="#0047AB" strokeWidth="1.5"/>
        <text x="40" y="48" textAnchor="middle" fontFamily="Orbitron" fontSize="8" fontWeight="800" fill="#007B8A" letterSpacing="1">GS</text>
      </svg>
    </div>
  );
  if (type === 'mug') return (
    <div style={wrap}>
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
    <div style={wrap}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <path d="M35 10 L45 10 L43 20 L48 22 L40 70 L32 22 L37 20 Z" fill="none" stroke="#0047AB" strokeWidth="2"/>
        <line x1="37" y1="30" x2="43" y2="30" stroke="#3A78C9" strokeWidth="1"/>
        <line x1="37.5" y1="38" x2="42.5" y2="38" stroke="#3A78C9" strokeWidth="1"/>
        <line x1="38" y1="46" x2="42" y2="46" stroke="#3A78C9" strokeWidth="1"/>
      </svg>
    </div>
  );
  return (
    <div style={wrap}>
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

// ─── Carte produit ────────────────────────────────────────────
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
        background: '#fff',
        border: `2px solid ${hovered ? '#0047AB' : '#C8D8E8'}`,
        display: 'flex', flexDirection: 'column', position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,71,171,.13)' : '0 2px 8px rgba(0,47,94,.05)',
      }}
    >
      {/* Top dark ref bar */}
      <div style={{ background: hovered ? '#0047AB' : '#0D2B5E', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s ease' }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#5B9BD5', letterSpacing: '2px' }}>{p.cell}</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '1px' }}>REF: {p.ref}</span>
      </div>

      {p.tag && (
        <div style={{ position: 'absolute', top: '40px', left: '10px', background: p.tag === 'NOUVEAU' ? '#00C8BE' : '#C8960A', color: '#fff', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', letterSpacing: '2px', padding: '3px 8px', zIndex: 2 }}>{p.tag}</div>
      )}

      {/* Image */}
      <div style={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: hovered ? '#EEF3F8' : '#F7FAFD', borderBottom: '1px solid #E0EAF4', transition: 'background 0.2s ease' }}>
        <ProductSVG type={p.svgType} />
      </div>

      {/* Info */}
      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: "'Lilita One', cursive", fontSize: '15px', color: '#0D2B5E', letterSpacing: '2px', marginBottom: '2px' }}>{p.name}</h3>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>{p.desc}</span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', marginBottom: '12px' }}>
          <span style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '24px', color: '#0047AB' }}>{p.price}€</span>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', letterSpacing: '1px' }}>TVA INCL.</span>
        </div>

        <button
          onClick={handleAdd}
          style={{ width: '100%', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '2px', color: '#fff', background: added ? '#00C8BE' : (hovered ? 'linear-gradient(135deg,#0047AB,#007B8A)' : '#0D2B5E'), border: 'none', padding: '11px 0', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >{added ? '✓ AJOUTÉ' : '+ AJOUTER AU PANIER'}</button>
      </div>
    </div>
  );
}

// ─── Panier (vue liste) ───────────────────────────────────────
function CartView({ cart, onUpdate, onBack, onCheckout }: {
  cart: CartLine[];
  onUpdate: (ref: string, delta: number) => void;
  onBack: () => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '5px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        PANIER <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
        <button onClick={onBack} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', background: 'none', border: '1px solid #C8D8E8', padding: '4px 12px', cursor: 'pointer', letterSpacing: '2px' }}>← BOUTIQUE</button>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '28px', color: '#C8D8E8', letterSpacing: '4px', marginBottom: '8px' }}>PANIER VIDE</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#8FA5B8', letterSpacing: '2px' }}>AJOUTEZ DES ARTICLES POUR CONTINUER</div>
        </div>
      ) : (
        <>
          <div style={{ border: '1px solid #C8D8E8', background: '#fff', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,47,94,.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 48px', background: '#0D2B5E', borderBottom: '2px solid #00C8BE' }}>
              {['ARTICLE', 'QUANTITÉ', 'TOTAL', ''].map(h => (
                <div key={h} style={{ padding: '10px 14px', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', letterSpacing: '2px' }}>{h}</div>
              ))}
            </div>
            {cart.map((line, i) => (
              <div key={line.product.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 48px', background: i % 2 === 0 ? '#fff' : '#F7FAFD', borderBottom: '1px solid #E0EAF4', alignItems: 'center' }}>
                <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#EEF3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #C8D8E8' }}>
                    <ProductSVG type={line.product.svgType} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#0D2B5E', letterSpacing: '1px' }}>{line.product.name}</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', letterSpacing: '1px', marginTop: '2px' }}>{line.product.ref}</div>
                  </div>
                </div>
                <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => onUpdate(line.product.ref, -1)} style={{ width: '24px', height: '24px', background: '#0D2B5E', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '18px', color: '#0D2B5E', minWidth: '24px', textAlign: 'center' }}>{line.qty}</span>
                  <button onClick={() => onUpdate(line.product.ref, 1)} style={{ width: '24px', height: '24px', background: '#0D2B5E', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ padding: '14px', fontFamily: "'Luckiest Guy', cursive", fontSize: '20px', color: '#0047AB' }}>{(line.product.price * line.qty).toFixed(0)}€</div>
                <div style={{ padding: '14px' }}>
                  <button onClick={() => onUpdate(line.product.ref, -999)} style={{ background: 'none', border: 'none', color: '#C8D8E8', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }} title="Supprimer">×</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '3px', marginBottom: '4px' }}>TOTAL COMMANDE</div>
              <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '32px', color: '#0047AB' }}>{total.toFixed(2)} €</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#C8D8E8', letterSpacing: '2px', marginTop: '2px' }}>TVA INCLUSE · LIVRAISON OFFERTE</div>
            </div>
            <button
              onClick={onCheckout}
              style={{ fontFamily: "'Lilita One', cursive", fontSize: '16px', letterSpacing: '3px', color: '#fff', background: 'linear-gradient(135deg,#0047AB,#007B8A)', border: 'none', padding: '16px 40px', cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,71,171,.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#1B5EBB,#008B9A)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#0047AB,#007B8A)'; }}
            >COMMANDER →</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────
interface CustomerForm {
  name: string; email: string; phone: string;
  address: string; city: string; postalCode: string; country: string; notes: string;
}

function CheckoutView({ cart, onBack, onConfirm, loading }: {
  cart: CartLine[];
  onBack: () => void;
  onConfirm: (form: CustomerForm) => void;
  loading: boolean;
}) {
  const total = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const [form, setForm] = useState<CustomerForm>({ name: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'France', notes: '' });

  const set = (k: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle: React.CSSProperties = { width: '100%', border: 'none', borderBottom: '2px solid #C8D8E8', fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#1A2B40', background: 'transparent', padding: '6px 0 10px', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', letterSpacing: '3px', marginBottom: '2px' };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onConfirm(form); };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '5px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        LIVRAISON <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
        <button onClick={onBack} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', background: 'none', border: '1px solid #C8D8E8', padding: '4px 12px', cursor: 'pointer', letterSpacing: '2px' }}>← PANIER</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', border: '1px solid #C8D8E8', padding: '28px', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '4px', marginBottom: '20px', borderBottom: '1px solid #E0EAF4', paddingBottom: '10px' }}>COORDONNÉES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>NOM COMPLET *</label>
                <input required value={form.name} onChange={set('name')} placeholder="Jean Dupont" style={inputStyle}
                  onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
              </div>
              <div>
                <label style={labelStyle}>EMAIL *</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="jean@email.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>TÉLÉPHONE</label>
              <input value={form.phone} onChange={set('phone')} placeholder="06 00 00 00 00" style={inputStyle}
                onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #C8D8E8', padding: '28px', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '4px', marginBottom: '20px', borderBottom: '1px solid #E0EAF4', paddingBottom: '10px' }}>ADRESSE DE LIVRAISON</div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>ADRESSE *</label>
              <input required value={form.address} onChange={set('address')} placeholder="12 Rue de l'Open Space" style={inputStyle}
                onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>CODE POSTAL *</label>
                <input required value={form.postalCode} onChange={set('postalCode')} placeholder="75001" style={inputStyle}
                  onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
              </div>
              <div>
                <label style={labelStyle}>VILLE *</label>
                <input required value={form.city} onChange={set('city')} placeholder="Paris" style={inputStyle}
                  onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
              </div>
              <div>
                <label style={labelStyle}>PAYS</label>
                <select value={form.country} onChange={set('country')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Canada</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>NOTES (optionnel)</label>
              <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Instructions de livraison particulières..." style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => { e.target.style.borderBottomColor = '#00C8BE'; }} onBlur={e => { e.target.style.borderBottomColor = '#C8D8E8'; }} />
            </div>
          </div>

          <div style={{ background: '#0D2B5E', padding: '20px 28px', borderTop: '3px solid #00C8BE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', letterSpacing: '2px' }}>TOTAL À RÉGLER</div>
              <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '28px', color: '#00C8BE' }}>{total.toFixed(2)} €</div>
            </div>
            <button type="submit" disabled={loading} style={{ fontFamily: "'Lilita One', cursive", fontSize: '16px', letterSpacing: '3px', color: '#fff', background: loading ? '#607888' : 'linear-gradient(135deg,#0047AB,#007B8A)', border: 'none', padding: '16px 40px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 18px rgba(0,71,171,.3)', transition: 'all .2s' }}>
              {loading ? 'TRAITEMENT...' : 'VALIDER →'}
            </button>
          </div>
        </form>

        {/* Récap commande */}
        <div style={{ background: '#fff', border: '1px solid #C8D8E8', position: 'sticky', top: '16px' }}>
          <div style={{ background: '#0D2B5E', padding: '12px 16px', borderBottom: '2px solid #00C8BE' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', letterSpacing: '3px' }}>RÉCAP. COMMANDE</div>
          </div>
          {cart.map(line => (
            <div key={line.product.ref} style={{ padding: '12px 16px', borderBottom: '1px solid #E0EAF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#0D2B5E' }}>{line.product.name}</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', marginTop: '2px' }}>x{line.qty}</div>
              </div>
              <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '18px', color: '#0047AB' }}>{(line.product.price * line.qty).toFixed(0)}€</div>
            </div>
          ))}
          <div style={{ padding: '14px 16px', background: '#EEF3F8', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#0D2B5E', letterSpacing: '2px' }}>TOTAL</span>
            <span style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '22px', color: '#0047AB' }}>{total.toFixed(2)} €</span>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E0EAF4' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#00C8BE', letterSpacing: '2px', marginBottom: '4px' }}>📦 LIVRAISON EXPRESS INCLUSE</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#8FA5B8', letterSpacing: '1px' }}>Délai estimé : 3-5 jours ouvrés</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation ─────────────────────────────────────────────
function ConfirmationView({ orderId, onReset }: { orderId: string; onReset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', animation: 'float 3s ease-in-out infinite' }}>📦</div>
      <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '32px', color: '#0D2B5E', letterSpacing: '4px' }}>COMMANDE CONFIRMÉE</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#8FA5B8', letterSpacing: '3px' }}>MERCI POUR VOTRE COMMANDE</div>

      <div style={{ background: '#EEF3F8', padding: '16px 32px', border: '1px solid #C8D8E8', borderLeft: '4px solid #00C8BE', margin: '8px 0' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '3px', marginBottom: '4px' }}>NUMÉRO DE COMMANDE</div>
        <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '22px', color: '#0047AB' }}>{orderId}</div>
      </div>

      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#607888', letterSpacing: '2px', maxWidth: '420px', lineHeight: 2 }}>
        Un email de confirmation vous sera envoyé.<br/>
        Votre commande sera expédiée sous 3 à 5 jours ouvrés.<br/>
        Pour toute question : contact@guibour.fr
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={onReset}
          style={{ fontFamily: "'Lilita One', cursive", fontSize: '14px', letterSpacing: '3px', color: '#fff', background: '#0D2B5E', border: '1px solid #3A78C9', padding: '12px 32px', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0047AB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0D2B5E'; }}
        >CONTINUER LES ACHATS</button>
      </div>

      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#C8D8E8', letterSpacing: '2px', marginTop: '16px' }}>
        =ORDER_CONFIRMED() // REF: {orderId} // GUIBOUR EXPRESS
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function ShoppingPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [screen, setScreen] = useState<Screen>('shop');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const existing = prev.find(l => l.product.ref === p.ref);
      if (existing) return prev.map(l => l.product.ref === p.ref ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { product: p, qty: 1 }];
    });
  }, []);

  const updateCart = useCallback((ref: string, delta: number) => {
    setCart(prev => prev
      .map(l => l.product.ref === ref ? { ...l, qty: Math.max(0, l.qty + delta) } : l)
      .filter(l => l.qty > 0)
    );
  }, []);

  const handleCheckout = async (form: { name: string; email: string; phone: string; address: string; city: string; postalCode: string; country: string; notes: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          lines: cart.map(l => ({ ref: l.product.ref, name: l.product.name, qty: l.qty, unitPrice: l.product.price })),
          total: cart.reduce((s, l) => s + l.product.price * l.qty, 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setCart([]);
        setScreen('confirmation');
      }
    } catch (_) {
      // Fallback : affiche confirmation même sans réseau (démo)
      setOrderId(`GS-DEMO-${Date.now().toString(36).toUpperCase()}`);
      setCart([]);
      setScreen('confirmation');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((s, l) => s + l.product.price * l.qty, 0);

  const formulaText = screen === 'cart'
    ? `=PANIER() // ${cartCount} ARTICLES // TOTAL: ${totalPrice.toFixed(2)}€`
    : screen === 'checkout'
    ? '=CHECKOUT() // SAISIE LIVRAISON // PAIEMENT SÉCURISÉ'
    : screen === 'confirmation'
    ? `=ORDER_CONFIRMED("${orderId}") // MERCI !`
    : `=CATALOGUE(MERCH,"GUIBOUR") // ARTICLES: 4 // LIVRAISON EXPRESS`;

  return (
    <div className="min-h-screen" style={{ background: '#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText={formulaText}>
        <div style={{
          background: '#EEF3F8',
          backgroundImage: 'linear-gradient(rgba(0,71,171,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,71,171,.03) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* HEADER commun */}
          <div style={{ background: 'linear-gradient(135deg,#0B1F3A 0%,#0D2B5E 60%,#0047AB 100%)', padding: '20px 48px', borderBottom: '3px solid #00C8BE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <GlobeIcon size={44} color="#00C8BE" />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '4px', marginBottom: '2px' }}>02 / BOUTIQUE</div>
                <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(18px,3.5vw,30px)', color: '#F2F8FF', letterSpacing: '3px', lineHeight: 1 }}>BOUTIQUE MERCH</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#00C8BE', letterSpacing: '3px', marginTop: '3px' }}>W.O.W — COLLECTION OFFICIELLE</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[{ label: 'ARTICLES', value: '004' }, { label: 'STOCK', value: '● DISPO' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '6px 12px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(0,200,190,.15)' }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '2px' }}>{s.label}</div>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', color: '#00C8BE', marginTop: '1px' }}>{s.value}</div>
                </div>
              ))}

              {/* Bouton panier */}
              <button
                onClick={() => setScreen(screen === 'cart' ? 'shop' : 'cart')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: cartCount > 0 ? 'rgba(0,200,190,.15)' : 'rgba(255,255,255,.06)', border: `2px solid ${cartCount > 0 ? '#00C8BE' : 'rgba(0,200,190,.15)'}`, cursor: 'pointer', transition: 'all .2s' }}
              >
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '2px' }}>🛒 PANIER</span>
                {cartCount > 0 && (
                  <span style={{ background: '#00C8BE', color: '#0D2B5E', fontFamily: "'Luckiest Guy', cursive", fontSize: '14px', padding: '1px 7px', borderRadius: '2px', minWidth: '22px', textAlign: 'center' }}>{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* PROMO STRIP — visible uniquement sur la boutique */}
          {screen === 'shop' && (
            <div style={{ background: '#0047AB', padding: '8px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {['📦 LIVRAISON EXPRESS OFFERTE', '🏅 QUALITÉ CORPORATE CERTIFIÉE', '🔒 PAIEMENT 100% SÉCURISÉ'].map(item => (
                <span key={item} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#A8D8FF', letterSpacing: '2px' }}>{item}</span>
              ))}
            </div>
          )}

          {/* CONTENU selon l'écran */}
          {screen === 'shop' && (
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '5px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                CATALOGUE <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
                <span style={{ fontSize: '7px' }}>=CATALOGUE() // 4 RÉFÉRENCES</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {PRODUCTS.map(p => <ProductCard key={p.ref} p={p} onAdd={addToCart} />)}
              </div>
              <div style={{ marginTop: '32px', padding: '16px 20px', background: '#fff', border: '1px solid #C8D8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#0D2B5E', letterSpacing: '2px', marginBottom: '3px' }}>COMMANDES SUR DEVIS</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#8FA5B8', letterSpacing: '1px' }}>Pour toute commande en volume, contactez le département RH.</div>
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#C8D8E8', letterSpacing: '2px', textAlign: 'right' }}>
                  <div>=CATALOGUE() // LIVRAISON GUIBOUR EXPRESS</div>
                  <div style={{ marginTop: '3px' }}>W.O.W · WORK OR WINDOW · 2026</div>
                </div>
              </div>
            </div>
          )}

          {screen === 'cart' && (
            <CartView cart={cart} onUpdate={updateCart} onBack={() => setScreen('shop')} onCheckout={() => setScreen('checkout')} />
          )}

          {screen === 'checkout' && (
            <CheckoutView cart={cart} onBack={() => setScreen('cart')} onConfirm={handleCheckout} loading={loading} />
          )}

          {screen === 'confirmation' && (
            <ConfirmationView orderId={orderId} onReset={() => setScreen('shop')} />
          )}
        </div>
      </ExcelChrome>
    </div>
  );
}
