'use client';

import { useState, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Erreur serveur');
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  const fieldStyle = (name: string) => ({
    background: focused === name ? 'rgba(0,255,235,.06)' : 'rgba(255,255,255,.02)',
    border: `1px solid ${focused === name ? 'rgba(0,255,235,.5)' : 'rgba(0,255,235,.07)'}`,
    padding: '12px 16px 10px',
    transition: 'all .2s',
    boxShadow: focused === name ? '0 0 18px rgba(0,255,235,.1), inset 0 0 8px rgba(0,255,235,.03)' : 'none',
  });

  const labelStyle = (name: string): React.CSSProperties => ({
    display: 'block',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '7px',
    color: focused === name ? '#00FFEE' : '#3C5A7A',
    letterSpacing: '3px',
    marginBottom: '6px',
    textShadow: focused === name ? '0 0 6px rgba(0,255,235,.6)' : 'none',
    transition: 'all .2s',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', border: 'none', background: 'transparent',
    fontFamily: "'Orbitron', sans-serif", fontSize: '12px',
    color: '#E0F0FF', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR") // FORMULAIRE_INTERNE // W.O.W'>

        <div style={{
          backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* ── HEADER ── */}
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
                  04 / CONTACT
                </div>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: 'clamp(22px,4vw,36px)', color: '#F2F8FF',
                  letterSpacing: '4px', lineHeight: 1,
                  textShadow: '0 0 24px rgba(0,255,235,.18)',
                }}>
                  NOUS CONTACTER
                </div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                  color: '#00FFEE', letterSpacing: '4px', marginTop: '4px',
                  textShadow: '0 0 8px rgba(0,255,235,.6)',
                }}>
                  W.O.W — FORMULAIRE INTERNE RH
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'HEURES', value: '9H – 18H · LUN–VEN', glow: false },
                { label: 'STATUT', value: '● OPÉRATIONNEL',     glow: true  },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px 18px',
                  background: 'rgba(0,255,235,.03)',
                  border: '1px solid rgba(0,255,235,.12)',
                }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#2A4060', letterSpacing: '3px' }}>{item.label}</div>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: '11px',
                    color: item.glow ? '#00FFEE' : '#A8D8FF', marginTop: '4px',
                    textShadow: item.glow ? '0 0 10px rgba(0,255,235,.7)' : 'none',
                  }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          {sent ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', minHeight: '60vh', gap: '20px', padding: '40px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: '2px solid #00FFEE',
                boxShadow: '0 0 30px rgba(0,255,235,.4), inset 0 0 20px rgba(0,255,235,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', color: '#00FFEE',
              }}>✓</div>

              <div style={{
                fontFamily: "'Lilita One', cursive", fontSize: '36px', color: '#FFF',
                letterSpacing: '4px', textAlign: 'center',
                textShadow: '0 0 20px rgba(0,255,235,.3)',
              }}>MESSAGE ENVOYÉ</div>

              <div style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                color: '#00FFEE', letterSpacing: '3px', textAlign: 'center', opacity: 0.65,
              }}>
                LA DIRECTION VOUS RÉPONDRA APRÈS LA PAUSE CAFÉ.
              </div>

              <div style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060',
                letterSpacing: '2px', padding: '8px 18px',
                border: '1px solid rgba(0,255,235,.08)',
                background: 'rgba(0,255,235,.02)',
              }}>
                =MAIL_SENT() // REF: {Math.floor(Math.random() * 90000) + 10000}
              </div>

              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '16px',
                  fontFamily: "'Lilita One', cursive", fontSize: '14px', letterSpacing: '3px',
                  color: '#fff', background: 'transparent',
                  border: '2px solid rgba(0,255,235,.35)', padding: '13px 34px',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(0,255,235,.12)',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#00FFEE';
                  e.currentTarget.style.color = '#00FFEE';
                  e.currentTarget.style.boxShadow = '0 0 28px rgba(0,255,235,.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,255,235,.35)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,235,.12)';
                }}
              >
                NOUVEAU MESSAGE
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 180px)' }}>

              {/* ── LEFT — identité ── */}
              <div style={{
                background: 'rgba(0,0,0,.2)',
                borderRight: '1px solid rgba(0,255,235,.08)',
                padding: '40px 28px',
                display: 'flex', flexDirection: 'column', gap: '24px',
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  paddingBottom: '28px', borderBottom: '1px solid rgba(0,255,235,.08)',
                }}>
                  <GlobeIcon size={64} color="#00FFEE" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Lilita One', cursive", fontSize: '22px', color: '#FFF',
                      letterSpacing: '3px', textShadow: '0 0 18px rgba(0,255,235,.2)',
                    }}>GUIBOUR</div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                      color: '#00FFEE', letterSpacing: '6px', marginTop: '3px',
                      textShadow: '0 0 8px rgba(0,255,235,.55)',
                    }}>S Y S T E M</div>
                  </div>
                </div>

                {[
                  { icon: '✉', label: 'EMAIL', value: 'contact@guibour.fr' },
                  { icon: '📍', label: 'BUREAU', value: 'OPEN SPACE · 7ème ÉTAGE' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                        color: '#00FFEE', letterSpacing: '3px', marginBottom: '4px', opacity: 0.55,
                      }}>{item.label}</div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#8AB4CC', lineHeight: 1.5 }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Note interne */}
                <div style={{
                  marginTop: 'auto', padding: '16px',
                  background: 'rgba(0,255,235,.03)',
                  border: '1px solid rgba(0,255,235,.1)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* scan line animation */}
                  <div className="scan-line-h" />
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                    color: '#2E6058', letterSpacing: '1px', lineHeight: 1.8,
                  }}>
                    Tout message envoyé avant 17h sera traité après la pause café du lendemain.
                  </div>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                    color: '#1C3830', letterSpacing: '2px', marginTop: '8px',
                  }}>
                    =NOTE("DOSSIER_RH #GS-001")
                  </div>
                </div>
              </div>

              {/* ── RIGHT — formulaire ── */}
              <div style={{ padding: '48px' }}>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '36px' }}>
                  <div style={{
                    fontFamily: "'Lilita One', cursive", fontSize: '22px', color: '#FFF',
                    letterSpacing: '3px', textShadow: '0 0 14px rgba(0,255,235,.12)',
                  }}>ENVOYER UN MESSAGE</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3550', letterSpacing: '3px' }}>
                    =FORM("GS-CONTACT")
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '2px' }}>
                    {([
                      { name: 'name',  label: 'NOM / PSEUDO',   type: 'text',  placeholder: 'Votre pseudo...' },
                      { name: 'email', label: 'EMAIL',           type: 'email', placeholder: 'votre@email.com' },
                    ] as const).map(f => (
                      <div key={f.name} style={fieldStyle(f.name)}>
                        <label style={labelStyle(f.name)}>{f.label}</label>
                        <input
                          name={f.name} type={f.type} required placeholder={f.placeholder}
                          onFocus={() => setFocused(f.name)}
                          onBlur={() => setFocused(null)}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ ...fieldStyle('subject'), marginBottom: '2px' }}>
                    <label style={labelStyle('subject')}>OBJET</label>
                    <input
                      name="subject" type="text" required placeholder="Sujet du message..."
                      onFocus={() => setFocused('subject')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ ...fieldStyle('message'), marginBottom: '22px' }}>
                    <label style={labelStyle('message')}>MESSAGE</label>
                    <textarea
                      name="message" required rows={6} placeholder="Votre message..."
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  </div>

                  {error && (
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#FF4444',
                      letterSpacing: '1px', marginBottom: '14px', padding: '10px 14px',
                      background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.3)',
                      boxShadow: '0 0 10px rgba(255,68,68,.1)',
                    }}>⚠ {error}</div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1A3050', letterSpacing: '2px' }}>
                      © 2026 GUIBOUR — W.O.W
                    </div>
                    <button
                      type="submit" disabled={sending}
                      style={{
                        fontFamily: "'Lilita One', cursive", fontSize: '16px', letterSpacing: '4px',
                        color: sending ? 'rgba(0,255,235,.5)' : '#fff',
                        background: 'transparent',
                        border: `2px solid ${sending ? 'rgba(0,255,235,.25)' : 'rgba(0,255,235,.55)'}`,
                        padding: '14px 44px',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        boxShadow: sending ? 'none' : '0 0 22px rgba(0,255,235,.18), inset 0 0 12px rgba(0,255,235,.04)',
                        transition: 'all .25s ease',
                        opacity: sending ? 0.55 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!sending) {
                          e.currentTarget.style.borderColor = '#00FFEE';
                          e.currentTarget.style.color = '#00FFEE';
                          e.currentTarget.style.textShadow = '0 0 10px rgba(0,255,235,.7)';
                          e.currentTarget.style.boxShadow = '0 0 38px rgba(0,255,235,.38), inset 0 0 16px rgba(0,255,235,.06)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!sending) {
                          e.currentTarget.style.borderColor = 'rgba(0,255,235,.55)';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.textShadow = 'none';
                          e.currentTarget.style.boxShadow = '0 0 22px rgba(0,255,235,.18), inset 0 0 12px rgba(0,255,235,.04)';
                        }
                      }}
                    >
                      {sending ? 'ENVOI...' : 'ENVOYER →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </ExcelChrome>

      <style>{`
        .scan-line-h {
          position: absolute; left: 0; right: 0; height: 1px; top: 0;
          background: linear-gradient(90deg, transparent, rgba(0,255,235,.5), transparent);
          animation: scanDown 4s linear infinite;
        }
        @keyframes scanDown {
          0%   { top: 0%;   opacity: 1; }
          95%  { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        ::placeholder { color: rgba(80,130,160,.3) !important; }
      `}</style>
    </div>
  );
}
