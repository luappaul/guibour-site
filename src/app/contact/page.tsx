'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import Logo from '@/components/ui/Logo';

const contactInfo = [
  { label: 'EMAIL', value: 'contact@guibour.fr' },
  { label: 'SITE', value: 'guibour.fr' },
  { label: 'STATUS', value: 'SYSTÈME OPÉRATIONNEL' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FB' }}>
      <ExcelNav />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 48px)',
      }}>
        {/* LEFT - Dark column */}
        <div style={{
          background: '#080D14',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
        }}>
          {/* Subtle grid */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,168,157,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,157,0.04) 1px, transparent 1px)',
            backgroundSize: '52px 32px',
          }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Logo */}
            <div style={{ marginBottom: '48px' }}>
              <Logo variant="dark" size="md" />
            </div>

            {/* Contact blocks */}
            {contactInfo.map(info => (
              <div key={info.label} style={{
                borderLeft: '2px solid #00C9C8',
                paddingLeft: '16px',
                marginBottom: '24px',
              }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '7px',
                  color: '#00C9C8',
                  letterSpacing: '4px',
                  display: 'block',
                  marginBottom: '4px',
                }}>
                  {info.label}
                </span>
                <span style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  letterSpacing: '1px',
                }}>
                  {info.value}
                </span>
              </div>
            ))}

            {/* Footer text */}
            <div style={{
              marginTop: '48px',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '7px',
              color: '#1A4040',
              letterSpacing: '2px',
              lineHeight: '1.8',
            }}>
              GUIBOUR CORP. — DOCUMENT INTERNE<br />
              REF: GS-CONTACT-001<br />
              © 2025 GUIBOUR SYSTEM
            </div>
          </div>
        </div>

        {/* RIGHT - White column with form */}
        <div style={{
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#1A2530',
                letterSpacing: '3px',
                marginBottom: '16px',
              }}>
                MESSAGE ENVOYÉ
              </h2>
              <p style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '9px',
                color: '#607888',
                letterSpacing: '2px',
              }}>
                La direction vous répondra après la pause café.
              </p>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '24px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: '#00A89D',
                  background: '#080D14',
                  border: '1px solid #00A89D',
                  padding: '12px 32px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,168,157,0.15)',
                }}
              >
                NOUVEAU MESSAGE
              </button>
            </div>
          ) : (
            <>
              <h2 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A2530',
                letterSpacing: '3px',
                marginBottom: '32px',
              }}>
                ENVOYER UN MESSAGE
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px',
                    color: '#607888',
                    letterSpacing: '3px',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    NOM / PSEUDO
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Votre pseudo..."
                    style={{
                      width: '100%',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '12px',
                      color: '#1A2530',
                      background: '#F4F8FB',
                      border: '1px solid #C8D8E8',
                      padding: '10px 14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A89D'}
                    onBlur={(e) => e.target.style.borderColor = '#C8D8E8'}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px',
                    color: '#607888',
                    letterSpacing: '3px',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '12px',
                      color: '#1A2530',
                      background: '#F4F8FB',
                      border: '1px solid #C8D8E8',
                      padding: '10px 14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A89D'}
                    onBlur={(e) => e.target.style.borderColor = '#C8D8E8'}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px',
                    color: '#607888',
                    letterSpacing: '3px',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    OBJET
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sujet du message..."
                    style={{
                      width: '100%',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '12px',
                      color: '#1A2530',
                      background: '#F4F8FB',
                      border: '1px solid #C8D8E8',
                      padding: '10px 14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A89D'}
                    onBlur={(e) => e.target.style.borderColor = '#C8D8E8'}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '7px',
                    color: '#607888',
                    letterSpacing: '3px',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    MESSAGE
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Votre message..."
                    style={{
                      width: '100%',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '12px',
                      color: '#1A2530',
                      background: '#F4F8FB',
                      border: '1px solid #C8D8E8',
                      padding: '10px 14px',
                      outline: 'none',
                      resize: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A89D'}
                    onBlur={(e) => e.target.style.borderColor = '#C8D8E8'}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    color: '#00A89D',
                    background: '#080D14',
                    border: '1px solid #00A89D',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0,168,157,0.15), inset 0 0 20px rgba(0,168,157,0.05)',
                  }}
                >
                  ENVOYER &rarr;
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
