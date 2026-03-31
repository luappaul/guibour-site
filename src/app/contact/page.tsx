'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import Sphere from '@/components/ui/Sphere';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR_CORP") // FORMULAIRE_INTERNE'>
        <div style={{ background: '#EEF3F8', minHeight: 'calc(100vh - 52px)' }}>

          {/* ── HEADER BANDE NAVY ── */}
          <div style={{
            background: '#0D2B5E',
            padding: '28px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #0047AB',
          }}>
            {/* Logo + titre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Sphere size={48} />
              <div>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: '28px', color: '#00D4CC',
                  letterSpacing: '4px', lineHeight: 1,
                }}>NOUS CONTACTER</div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px', color: '#3C5A7A',
                  letterSpacing: '4px', marginTop: '4px',
                }}>03 / W.O.W — FORMULAIRE INTERNE</div>
              </div>
            </div>

            {/* Info rapide */}
            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { label: 'EMAIL', value: 'contact@guibour.fr' },
                { label: 'STATUS', value: '● OPÉRATIONNEL' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px', color: '#2B5090',
                    letterSpacing: '3px', marginBottom: '3px',
                  }}>{item.label}</div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '11px', color: '#8FA5B8',
                  }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CORPS ── */}
          {sent ? (
            /* Confirmation */
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: '60vh', gap: '16px',
            }}>
              <div style={{
                fontFamily: "'Lilita One', cursive",
                fontSize: '40px', color: '#0D2B5E',
                letterSpacing: '4px', textAlign: 'center',
              }}>MESSAGE ENVOYÉ</div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '10px', color: '#8FA5B8',
                letterSpacing: '3px', textAlign: 'center',
              }}>LA DIRECTION VOUS RÉPONDRA APRÈS LA PAUSE CAFÉ.</div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '8px', color: '#C8D8E8',
                letterSpacing: '2px', marginTop: '8px',
              }}>=MAIL_SENT() // REF: {Math.floor(Math.random() * 90000) + 10000}</div>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '24px',
                  fontFamily: "'Lilita One', cursive",
                  fontSize: '14px', letterSpacing: '3px',
                  color: '#fff', background: '#0D2B5E',
                  border: '1px solid #3A78C9',
                  padding: '12px 32px', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0047AB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0D2B5E'; }}
              >
                NOUVEAU MESSAGE
              </button>
            </div>
          ) : (
            /* Formulaire */
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px' }}>

              {/* Titre section */}
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '36px',
              }}>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: '22px', color: '#0D2B5E', letterSpacing: '3px',
                }}>ENVOYER UN MESSAGE</div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px', color: '#C8D8E8', letterSpacing: '3px',
                }}>=FORM("GS-CONTACT")</div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

                {/* Nom + Email côte à côte */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#C8D8E8', marginBottom: '1px' }}>
                  <div style={{ background: '#fff', padding: '4px 0' }}>
                    <label style={{
                      display: 'block',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '7px', color: '#8FA5B8',
                      letterSpacing: '3px', padding: '10px 16px 0',
                    }}>NOM / PSEUDO</label>
                    <input
                      type="text" required placeholder="Votre pseudo..."
                      style={{
                        width: '100%', border: 'none', borderBottom: '2px solid transparent',
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '13px', color: '#1A2B40',
                        background: 'transparent',
                        padding: '6px 16px 10px', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderBottomColor = '#0047AB'; }}
                      onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
                    />
                  </div>
                  <div style={{ background: '#fff', padding: '4px 0' }}>
                    <label style={{
                      display: 'block',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '7px', color: '#8FA5B8',
                      letterSpacing: '3px', padding: '10px 16px 0',
                    }}>EMAIL</label>
                    <input
                      type="email" required placeholder="votre@email.com"
                      style={{
                        width: '100%', border: 'none', borderBottom: '2px solid transparent',
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '13px', color: '#1A2B40',
                        background: 'transparent',
                        padding: '6px 16px 10px', outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderBottomColor = '#0047AB'; }}
                      onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
                    />
                  </div>
                </div>

                {/* Objet */}
                <div style={{ background: '#fff', marginBottom: '1px', padding: '4px 0' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px', color: '#8FA5B8',
                    letterSpacing: '3px', padding: '10px 16px 0',
                  }}>OBJET</label>
                  <input
                    type="text" required placeholder="Sujet du message..."
                    style={{
                      width: '100%', border: 'none', borderBottom: '2px solid transparent',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '13px', color: '#1A2B40',
                      background: 'transparent',
                      padding: '6px 16px 10px', outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderBottomColor = '#0047AB'; }}
                    onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
                  />
                </div>

                {/* Message */}
                <div style={{ background: '#fff', marginBottom: '24px', padding: '4px 0' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px', color: '#8FA5B8',
                    letterSpacing: '3px', padding: '10px 16px 0',
                  }}>MESSAGE</label>
                  <textarea
                    required rows={6} placeholder="Votre message..."
                    style={{
                      width: '100%', border: 'none', borderBottom: '2px solid transparent',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '13px', color: '#1A2B40',
                      background: 'transparent',
                      padding: '6px 16px 14px', outline: 'none',
                      resize: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderBottomColor = '#0047AB'; }}
                    onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px', color: '#C8D8E8', letterSpacing: '2px',
                  }}>
                    © 2026 GUIBOUR — REF: GS-CONTACT-001
                  </div>
                  <button
                    type="submit"
                    style={{
                      fontFamily: "'Lilita One', cursive",
                      fontSize: '16px', letterSpacing: '4px',
                      color: '#fff',
                      background: 'linear-gradient(135deg, #0047AB, #007B8A)',
                      border: 'none',
                      padding: '14px 40px', cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(0,71,171,.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)';
                      e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,71,171,.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)';
                      e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,71,171,.25)';
                    }}
                  >
                    ENVOYER →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </ExcelChrome>
    </div>
  );
}
