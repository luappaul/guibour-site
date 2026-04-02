'use client';

import { useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <div className="min-h-screen" style={{ background:'#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=CONTACT("GUIBOUR") // FORMULAIRE_INTERNE // W.O.W'>
        <div style={{
          background:'#EEF3F8',
          backgroundImage:'linear-gradient(rgba(0,71,171,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,71,171,.03) 1px,transparent 1px)',
          backgroundSize:'56px 34px',
          minHeight:'calc(100vh - 52px)',
        }}>

          {/* HEADER */}
          <div style={{ background:'linear-gradient(135deg,#0B1F3A 0%,#0D2B5E 60%,#0047AB 100%)', padding:'28px 48px', borderBottom:'3px solid #00C8BE', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
              <GlobeIcon size={52} color="#00C8BE" />
              <div>
                <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'9px', color:'#3C5A7A', letterSpacing:'5px', marginBottom:'4px' }}>03 / CONTACT</div>
                <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'clamp(22px,4vw,36px)', color:'#F2F8FF', letterSpacing:'4px', lineHeight:1 }}>NOUS CONTACTER</div>
                <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#00C8BE', letterSpacing:'4px', marginTop:'4px' }}>W.O.W — FORMULAIRE INTERNE RH</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              {[
                { label:'HEURES', value:'9H – 18H · LUN–VEN' },
                { label:'STATUT', value:'● OPÉRATIONNEL' },
              ].map(item => (
                <div key={item.label} style={{ padding:'8px 16px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(0,200,190,.15)' }}>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#3C5A7A', letterSpacing:'3px' }}>{item.label}</div>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'11px', color:'#A8D8FF', marginTop:'3px' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {sent ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'16px' }}>
              <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'36px', color:'#0D2B5E', letterSpacing:'4px', textAlign:'center' }}>MESSAGE ENVOYÉ</div>
              <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'10px', color:'#8FA5B8', letterSpacing:'3px', textAlign:'center' }}>LA DIRECTION VOUS RÉPONDRA APRÈS LA PAUSE CAFÉ.</div>
              <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#C8D8E8', letterSpacing:'2px', marginTop:'8px' }}>=MAIL_SENT() // REF: {Math.floor(Math.random()*90000)+10000}</div>
              <button onClick={() => setSent(false)} style={{ marginTop:'24px', fontFamily:"'Lilita One', cursive", fontSize:'14px', letterSpacing:'3px', color:'#fff', background:'#0D2B5E', border:'1px solid #3A78C9', padding:'12px 32px', cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background='#0047AB'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#0D2B5E'; }}
              >NOUVEAU MESSAGE</button>
            </div>
          ) : (
            /* CORPS — 2 colonnes */
            <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', minHeight:'calc(100vh - 180px)' }}>

              {/* COLONNE GAUCHE — carte identité */}
              <div style={{ background:'#0D2B5E', borderRight:'2px solid #1B3A6B', padding:'40px 28px', display:'flex', flexDirection:'column', gap:'24px' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', paddingBottom:'24px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                  <GlobeIcon size={64} color="#00C8BE" />
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'22px', color:'#FFFFFF', letterSpacing:'3px', animation:'glowWhite 3s ease-in-out infinite' }}>GUIBOUR</div>
                    <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#00D4CC', letterSpacing:'5px', marginTop:'2px' }}>SYSTEM</div>
                  </div>
                </div>

                {/* Infos */}
                {[
                  { icon:'✉', label:'EMAIL', value:'contact@guibour.fr' },
                  { icon:'📍', label:'BUREAU', value:'OPEN SPACE · 7ème ÉTAGE' },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'16px', marginTop:'2px', flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#3C5A7A', letterSpacing:'3px', marginBottom:'3px' }}>{item.label}</div>
                      <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'10px', color:'#8FA5B8', lineHeight:1.5 }}>{item.value}</div>
                    </div>
                  </div>
                ))}

                {/* Note bas de page */}
                <div style={{ marginTop:'auto', padding:'16px', background:'rgba(0,200,190,.06)', border:'1px solid rgba(0,200,190,.15)', borderRadius:'2px' }}>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#3C7A6A', letterSpacing:'1px', lineHeight:1.8 }}>
                    Tout message envoyé avant 17h sera traité après la pause café du lendemain.
                  </div>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#2B4A60', letterSpacing:'2px', marginTop:'8px' }}>
                    =NOTE("DOSSIER RH #GS-CONTACT-001")
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE — formulaire */}
              <div style={{ padding:'48px 48px' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'16px', marginBottom:'32px' }}>
                  <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'22px', color:'#0D2B5E', letterSpacing:'3px' }}>ENVOYER UN MESSAGE</div>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#C8D8E8', letterSpacing:'3px' }}>=FORM("GS-CONTACT")</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'#C8D8E8', marginBottom:'1px' }}>
                    {[{label:'NOM / PSEUDO', type:'text', ph:'Votre pseudo...'},{label:'EMAIL', type:'email', ph:'votre@email.com'}].map(f => (
                      <div key={f.label} style={{ background:'#fff', padding:'4px 0' }}>
                        <label style={{ display:'block', fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#8FA5B8', letterSpacing:'3px', padding:'10px 16px 0' }}>{f.label}</label>
                        <input type={f.type} required placeholder={f.ph} style={{ width:'100%', border:'none', borderBottom:'2px solid transparent', fontFamily:"'Orbitron', sans-serif", fontSize:'13px', color:'#1A2B40', background:'transparent', padding:'6px 16px 10px', outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                          onFocus={e => { e.target.style.borderBottomColor='#00C8BE'; }}
                          onBlur={e => { e.target.style.borderBottomColor='transparent'; }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', marginBottom:'1px', padding:'4px 0' }}>
                    <label style={{ display:'block', fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#8FA5B8', letterSpacing:'3px', padding:'10px 16px 0' }}>OBJET</label>
                    <input type="text" required placeholder="Sujet du message..." style={{ width:'100%', border:'none', borderBottom:'2px solid transparent', fontFamily:"'Orbitron', sans-serif", fontSize:'13px', color:'#1A2B40', background:'transparent', padding:'6px 16px 10px', outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                      onFocus={e => { e.target.style.borderBottomColor='#00C8BE'; }}
                      onBlur={e => { e.target.style.borderBottomColor='transparent'; }} />
                  </div>
                  <div style={{ background:'#fff', marginBottom:'24px', padding:'4px 0' }}>
                    <label style={{ display:'block', fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#8FA5B8', letterSpacing:'3px', padding:'10px 16px 0' }}>MESSAGE</label>
                    <textarea required rows={6} placeholder="Votre message..." style={{ width:'100%', border:'none', borderBottom:'2px solid transparent', fontFamily:"'Orbitron', sans-serif", fontSize:'13px', color:'#1A2B40', background:'transparent', padding:'6px 16px 14px', outline:'none', resize:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                      onFocus={e => { e.target.style.borderBottomColor='#00C8BE'; }}
                      onBlur={e => { e.target.style.borderBottomColor='transparent'; }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#C8D8E8', letterSpacing:'2px' }}>© 2026 GUIBOUR — W.O.W</div>
                    <button type="submit" style={{ fontFamily:"'Lilita One', cursive", fontSize:'16px', letterSpacing:'4px', color:'#fff', background:'linear-gradient(135deg,#0047AB,#007B8A)', border:'none', padding:'14px 40px', cursor:'pointer', boxShadow:'0 4px 18px rgba(0,71,171,.25)', transition:'all .2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background='linear-gradient(135deg,#1B5EBB,#008B9A)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(0,71,171,.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='linear-gradient(135deg,#0047AB,#007B8A)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(0,71,171,.25)'; }}
                    >ENVOYER →</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </ExcelChrome>
    </div>
  );
}
