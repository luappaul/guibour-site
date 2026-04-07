'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── CONFIG : remplace par tes vrais liens ────────────────────────────────────
const MUSIQUES = [
  { titre: 'TITRE_1',   url: 'https://youtu.be/XXXX',                         plateforme: 'YOUTUBE'    },
  { titre: 'TITRE_2',   url: 'https://open.spotify.com/track/XXXX',           plateforme: 'SPOTIFY'    },
  { titre: 'CLIP',      url: 'https://youtu.be/XXXX',                         plateforme: 'YOUTUBE'    },
];

// ─── STATUTS hologramme ───────────────────────────────────────────────────────
const STATUTS = [
  'EN LIGNE — RÉUNION ANNULÉE (comme d\'hab)',
  'EN LIGNE — En train d\'écrire un son sur votre question',
  'DISPONIBLE — Sauf entre 14h et 14h05 (sieste stratégique)',
  'EN LIGNE — Café n°3 en cours de traitement',
  'PRÉSENT — Mais mentalement déjà en tournée',
  'DISPONIBLE — Ticket ouvert depuis 47 min. Normal.',
];

// ─── ERREURS SATIRIQUES ───────────────────────────────────────────────────────
const ERRORS_POOL = [
  'Erreur 404<br/><strong>Artiste introuvable.<br/>(Plus trouvé depuis lundi)</strong>',
  'Impression échouée.<br/><strong>GUIBOUR_EP01.pdf introuvable.</strong>',
  'Mémoire insuffisante.<br/><strong>Trop de lucidité dans le système.<br/>Veuillez libérer de l\'espace mental.</strong>',
  'CTRL+Z impossible.<br/><strong>Vous ne pouvez pas annuler<br/>votre rupture de contrat émotionnel.</strong>',
  'AVERTISSEMENT :<br/><strong>=#REF! + (Mélancolie/Temps)<br/>Formule incorrecte — voir FAQ.</strong>',
];

// ─── RÉPONSES ─────────────────────────────────────────────────────────────────
type Musique = typeof MUSIQUES[0];
type Message = { id: number; from: 'bot' | 'user'; html: string; music?: Musique | null; time: string };

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;
};

const KEYWORD_RESPONSES: { keys: string[]; reply: (m?: Musique) => string; redirect?: boolean }[] = [
  {
    keys: ['bonjour','salut','hello','bonsoir','coucou','hey','yo','cc'],
    reply: () => `Bonjour.<br/><br/>Je suis disponible entre 09h03 et 09h07.<br/>Après, je suis en réunion avec moi-même.<br/><br/>Durée estimée : indéfinie.<br/>Objet : refaire ma vie.`,
  },
  {
    keys: ['musique','morceau','son','titre','écouter','clip','vidéo','spotify','youtube','stream'],
    reply: () => `Notre département Distribution Audio (moi) a bien reçu votre demande.<br/><br/>
Statut : <strong>DISPONIBLE — TOUTES PLATEFORMES</strong><br/><br/>
Note interne : "Écouter GUIBOUR compte comme formation continue."<br/>Source : arrêté du 14 mars 2024, non ratifié par les RH.`,
    redirect: true,
  },
  {
    keys: ['concert','live','scène','date','agenda','quand'],
    reply: () => `Nos prochaines "réunions de travail ouvertes au public" sont en cours de planification.<br/><br/>
Vous serez informé par mail.<br/>Objet : <em>"Recrute : auditeur émotionnel — Q3."</em><br/><br/>
Newsletter disponible. Format : mail d'entreprise ultra formel.`,
  },
  {
    keys: ['projet','guibour','c\'est quoi','keski','qui es','t\'es qui'],
    reply: () => `DOSSIER CLASSIFIÉ — Accès niveau 3 requis.<br/><br/>
<strong>GUIBOUR CORP.</strong> est une structure musicale déguisée en entreprise.<br/><br/>
▪ Activité : Rap / Production sonore<br/>
▪ Ancienne vie : Cadre sup. à La Défense<br/>
▪ Capital : 1 EP en cours / ∞ réunions évitées / 0 tableur Excel depuis le départ<br/><br/>
Slogan interne : <em>"Travaillez moins, écoutez plus."</em>`,
  },
  {
    keys: ['ça va','comment tu','kpi','moral','bien','forme','comment vas'],
    reply: () => `Rapport de performance — Semaine en cours :<br/><br/>
▪ Moral : 43% ↑ (+2pts vs S-1)<br/>
▪ Cafés consommés : 3 / objectif Q3 : 4<br/>
▪ Réunions évitées : 2<br/>
▪ Morceaux écrits cette nuit : 1<br/>
▪ Excel ouvert : 0 ✓<br/><br/>
Bilan : <strong>acceptable</strong>.`,
  },
  {
    keys: ['contact','mail','email','joindre','répondre'],
    reply: () => `Pour toute demande, contactez :<br/><br/>
<strong>guibour@extranet.biz</strong><br/><br/>
Délai de traitement : 3 à 5 jours ouvrés. Ou jamais.<br/>To-do actuelle :<br/><br/>
<em>1. Finir le son. 2. Pleurer un peu. 3. Répondre aux mails.</em>`,
  },
  {
    keys: ['instagram','insta','tiktok','réseaux','follow','linkedin','abonner'],
    reply: () => `Suivez les indicateurs de performance GUIBOUR sur toutes les plateformes.<br/><br/>
Format des publications : communiqués corporate, fiches de paie satiriques, organigrammes émotionnels.<br/><br/>
Lien en bio. (Il y a toujours un lien en bio.)`,
  },
  {
    keys: ['ennui','t\'ennuies','open space','bureau','chiant','boring'],
    reply: () => `RAPPORT D'ACTIVITÉ — OPEN SPACE :<br/><br/>
14h37 : Troisième café de la journée. Il est froid.<br/>
14h39 : Réunion annulée. Comme d'habitude.<br/>
14h41 : Morceau écrit mentalement sur le chemin des toilettes.<br/>
14h43 : Quelqu'un imprime 47 pages en couleur. Pour rien.<br/><br/>
<em>C'est de là que vient la musique.</em>`,
  },
  {
    keys: ['merci','thanks','cool','bravo','excellent','super'],
    reply: () => `Votre satisfaction a été enregistrée.<br/><br/>
Elle contribue à notre taux de bonheur interne (actuellement : 43%).<br/><br/>
En retour, vous recevez :<br/>
▪ 1 cravate de remerciement (symbolique)<br/>
▪ 1 accès prioritaire au prochain morceau<br/>
▪ 1 RTT émotionnel`,
  },
];

const REDIRECT_TEMPLATES: ((m: Musique) => string)[] = [
  (m) => `Votre demande a été analysée par notre département des Émotions (en sous-effectif depuis 2019).<br/><br/>
Après consultation de notre roadmap Q3, nous vous recommandons d'écouter <strong>"${m.titre}"</strong> en urgence.<br/><br/>
Cela devrait répondre à 78% de vos interrogations existentielles.`,
  (m) => `Notre IA interne a détecté un manque critique de contenu GUIBOUR dans votre semaine.<br/><br/>
Prescription immédiate du département R&D émotionnel :`,
  (m) => `Votre demande dépasse le périmètre de ma fiche de poste.<br/><br/>
(Mon poste étant "artiste en rupture de ban", le périmètre est flou.)<br/><br/>
En compensation, voici quelque chose d'utile pour une fois :`,
  (m) => `Je reviens de réunion (14h → 15h43 comme d'habitude).<br/><br/>
En compensation, voici notre production la plus récente :`,
  (m) => `Dossier transmis au service compétent. Ticket : #RTT-${Math.floor(Math.random()*9000)+1000}<br/><br/>En attendant :`,
];

const DEFAULTS = [
  `Votre message a bien été reçu et affecté au ticket #RTT-${Math.floor(Math.random()*9000)+1000}.<br/><br/>Délai de traitement : entre maintenant et ma retraite anticipée.<br/><br/>Avez-vous essayé d'éteindre et de rallumer votre carrière ?`,
  `Erreur 404 — Réponse pertinente introuvable.<br/><br/>Votre question sera présentée en comité lors de notre prochaine réunion. Annulée le 3ème jeudi.`,
  `Je transmets votre demande au département concerné.<br/><br/>Le département concerné c'est moi. Mais en mode artiste. Donc un autre moi. Sans tableur Excel.`,
  `Message reçu. Je suis en train d'écrire un son sur exactement ce sujet.<br/><br/>Continuez à poser des questions absurdes. C'est ça qui m'inspire.`,
  `Notre FAQ interne est en cours de rédaction.<br/><br/>ETA : jamais. Le prestataire (moi) est parti écrire un refrain.`,
  `Je suis actuellement en mode "absence automatique".<br/><br/><em>"Bonjour, je suis en tournée intérieure. Je prendrai connaissance de vos demandes à mon retour. Ou pas."</em><br/><br/>— Guibour, Directeur des Émotions Sonores`,
];

function getReply(q: string): { html: string; music: Musique | null } {
  const lower = q.toLowerCase();
  const doRedirect = Math.random() < 0.28;

  for (const r of KEYWORD_RESPONSES) {
    if (r.keys.some(k => lower.includes(k))) {
      const needsMusic = r.redirect === true;
      const m = (needsMusic || doRedirect) ? MUSIQUES[Math.floor(Math.random() * MUSIQUES.length)] : null;
      return { html: r.reply(m ?? undefined), music: m };
    }
  }

  if (doRedirect && MUSIQUES.length > 0) {
    const m = MUSIQUES[Math.floor(Math.random() * MUSIQUES.length)];
    const fn = REDIRECT_TEMPLATES[Math.floor(Math.random() * REDIRECT_TEMPLATES.length)];
    return { html: fn(m), music: m };
  }

  return { html: DEFAULTS[Math.floor(Math.random() * DEFAULTS.length)], music: null };
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────
export default function GuibourChat() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [msgId, setMsgId]         = useState(0);
  const [status, setStatus]       = useState(STATUTS[0]);
  const [errorHtml, setErrorHtml] = useState<string | null>(null);
  const messagesEndRef            = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Message d'accueil à l'ouverture
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 0,
        from: 'bot',
        html: `Bonjour.<br/><br/>Vous avez atteint le support interne de <strong>GUIBOUR CORP.</strong><br/>Temps de traitement : <em>immédiat à jamais</em>. Qualité : <em>discutable mais sincère</em>.<br/><br/>Ce service fonctionne entre deux cafés, une crise de sens et un son en cours d'écriture.`,
        music: null,
        time: now(),
      }]);
      setMsgId(1);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Rotation statuts
  useEffect(() => {
    const t = setInterval(() => setStatus(STATUTS[Math.floor(Math.random() * STATUTS.length)]), 30000);
    return () => clearInterval(t);
  }, []);

  const addMsg = useCallback((msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: msgId }]);
    setMsgId(n => n + 1);
  }, [msgId]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');

    addMsg({ from: 'user', html: text, music: null, time: now() });
    setTyping(true);

    const delay = 900 + Math.random() * 700 + text.length * 7;
    setTimeout(() => {
      setTyping(false);
      const { html, music } = getReply(text);
      setMessages(prev => [...prev, { id: msgId + 1, from: 'bot', html, music, time: now() }]);
      setMsgId(n => n + 1);
    }, delay);
  }, [input, typing, addMsg, msgId]);

  const quickSend = (text: string) => { setInput(text); };
  useEffect(() => { if (input && !typing) { /* let user see it then send */ } }, [input]);

  // ─── STYLES ──────────────────────────────────────────────────────────────────
  const S = {
    // Floating badge button
    badge: {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0',
      cursor: 'pointer',
      filter: open ? 'none' : 'drop-shadow(0 0 12px rgba(0,200,120,0.5))',
      transition: 'filter 0.3s',
    },
    badgeCard: {
      background: open ? '#1A3A1A' : 'linear-gradient(160deg,#1A3A1A,#0D1F0D)',
      border: `2px solid ${open ? '#00FF66' : '#00C878'}`,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: open ? '0 0 0 1px #003322, 0 0 30px rgba(0,255,102,0.4)' : '0 0 0 1px #003322',
      transition: 'all 0.2s',
      minWidth: '160px',
    },
    badgeIcon: {
      fontSize: '22px',
      filter: 'drop-shadow(0 0 6px #00FF66)',
      animation: 'guibour-pulse 2.5s ease-in-out infinite',
    },
    badgeText: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '9px',
      color: '#00FF66',
      letterSpacing: '2px',
      lineHeight: 1.5,
      textShadow: '0 0 8px rgba(0,255,102,0.6)',
    },
    badgeDot: {
      width: '7px',
      height: '7px',
      background: '#00FF66',
      borderRadius: '50%',
      boxShadow: '0 0 8px #00FF66',
      animation: 'guibour-dot 2s ease-in-out infinite',
      marginLeft: 'auto',
      flexShrink: 0,
    },
    // Window
    window: {
      position: 'fixed' as const,
      bottom: '108px',
      right: '24px',
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 8999,
      background: '#fff',
      border: '3px solid #1A3A1A',
      boxShadow: '6px 6px 0 #0A2A0A, 0 0 60px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column' as const,
      maxHeight: 'calc(100vh - 140px)',
      animation: 'guibour-open 0.18s ease-out',
    },
    // Title bar
    titleBar: {
      background: 'linear-gradient(90deg,#1A3A1A,#0D2A0D)',
      padding: '5px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      borderBottom: '2px solid #0A1A0A',
    },
    titleText: {
      fontFamily: "'Orbitron', monospace",
      fontSize: '9px',
      color: '#80D850',
      letterSpacing: '2px',
      textShadow: '0 0 6px rgba(128,216,80,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    winBtns: { display: 'flex', gap: '3px' },
    winBtn: {
      width: '18px',
      height: '14px',
      background: '#3A6A2A',
      border: '1px solid #1A4A1A',
      fontSize: '8px',
      color: '#C0F090',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontFamily: 'monospace',
    },
    // Hologram header
    holoHeader: {
      background: '#0D1F0D',
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '2px solid #1A4A1A',
      flexShrink: 0,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    holoFrame: {
      width: '72px',
      height: '72px',
      border: '2px solid #00FF66',
      background: '#020D02',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 0 20px rgba(0,255,102,0.4), inset 0 0 15px rgba(0,255,102,0.08)',
      animation: 'guibour-breathe 4s ease-in-out infinite',
      position: 'relative' as const,
    },
    holoEmoji: { fontSize: '38px', filter: 'drop-shadow(0 0 10px #00FF66)', position: 'relative' as const, zIndex: 2 },
    holoName: {
      fontFamily: "'VT323', 'Orbitron', monospace",
      fontSize: '32px',
      color: '#00FF66',
      letterSpacing: '5px',
      lineHeight: 1,
      textShadow: '0 0 10px #00FF66, 0 0 30px rgba(0,255,102,0.4)',
      animation: 'guibour-flicker 6s linear infinite',
    },
    holoTitle: { color: '#3AAA5A', fontSize: '8px', letterSpacing: '1px', marginTop: '3px', lineHeight: 1.6, opacity: 0.85 },
    holoDivider: { height: '1px', background: 'linear-gradient(90deg,#00FF66,transparent)', margin: '6px 0', opacity: 0.4 },
    holoStatus: { display: 'flex', alignItems: 'center', gap: '6px' },
    statusDot: {
      width: '6px', height: '6px', background: '#00FF66', borderRadius: '50%',
      boxShadow: '0 0 8px #00FF66', animation: 'guibour-dot 2.5s ease-in-out infinite', flexShrink: 0,
    },
    statusTxt: { color: '#2A8A4A', fontSize: '8px', letterSpacing: '0.5px' },
    // Messages
    messagesArea: {
      flex: 1,
      overflowY: 'auto' as const,
      background: '#FFFFFF',
      padding: '14px 12px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      minHeight: '200px',
      maxHeight: '280px',
    },
    msgBot: { alignSelf: 'flex-start' as const, maxWidth: '90%', display: 'flex', flexDirection: 'column' as const },
    msgUser: { alignSelf: 'flex-end' as const, maxWidth: '85%', display: 'flex', flexDirection: 'column' as const },
    metaBot: { fontSize: '8px', color: '#4A6A30', letterSpacing: '1px', marginBottom: '3px' },
    metaUser: { fontSize: '8px', color: '#5A7A40', letterSpacing: '1px', marginBottom: '3px', textAlign: 'right' as const },
    bubbleBot: {
      background: '#F4F4F4',
      borderLeft: '3px solid #3A7A2A',
      padding: '9px 12px',
      fontSize: '11.5px',
      lineHeight: 1.65,
      color: '#1A1A10',
      boxShadow: '1px 1px 0 rgba(0,0,0,0.06)',
    },
    bubbleUser: {
      background: '#1A3A1A',
      borderRight: '3px solid #80D850',
      padding: '9px 12px',
      fontSize: '11.5px',
      lineHeight: 1.65,
      color: '#C0F090',
      textAlign: 'right' as const,
    },
    sig: { fontSize: '7.5px', color: '#9A9A7A', marginTop: '4px', fontStyle: 'italic', letterSpacing: '0.2px' },
    redirectBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '8px',
      padding: '5px 12px',
      background: '#0D1F0D',
      color: '#00FF66',
      fontFamily: "'Orbitron', monospace",
      fontSize: '8px',
      letterSpacing: '1.5px',
      textDecoration: 'none',
      border: '1px solid #00FF66',
      cursor: 'pointer',
      animation: 'guibour-glow 2.5s ease-in-out infinite',
    },
    platform: {
      background: '#00FF66',
      color: '#020D02',
      padding: '1px 5px',
      fontSize: '7px',
      fontWeight: 'bold' as const,
      letterSpacing: '1px',
    },
    // Typing
    typingRow: {
      padding: '6px 12px',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      flexShrink: 0,
    },
    typingBubble: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      background: '#F4F4F4',
      borderLeft: '3px solid #3A7A2A',
    },
    // Quick actions
    quickSection: {
      background: '#F8F8F5',
      borderTop: '1px solid #E0E0D0',
      borderBottom: '1px solid #E0E0D0',
      padding: '7px 10px',
      flexShrink: 0,
    },
    quickLabel: { fontFamily: "'Orbitron', monospace", fontSize: '7px', color: '#8A8A6A', letterSpacing: '1.5px', marginBottom: '5px' },
    quickBtns: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px' },
    qBtn: {
      padding: '3px 9px',
      background: 'transparent',
      border: '1px solid #C0C0A0',
      fontFamily: "'Orbitron', monospace",
      fontSize: '8px',
      color: '#4A4A30',
      cursor: 'pointer',
      letterSpacing: '0.3px',
      transition: 'all 0.08s',
    },
    // Input
    inputZone: {
      background: '#FFFFFF',
      padding: '10px 12px',
      borderTop: '2px solid #1A3A1A',
      flexShrink: 0,
    },
    inputLabel: { fontFamily: "'Orbitron', monospace", fontSize: '7.5px', color: '#5A5A40', letterSpacing: '1.5px', marginBottom: '6px' },
    inputRow: { display: 'flex', gap: '6px' },
    chatInput: {
      flex: 1,
      background: '#FAFAFA',
      border: '2px solid #C0C0A0',
      padding: '7px 10px',
      fontFamily: "'Orbitron', monospace",
      fontSize: '10px',
      color: '#1A1A10',
      outline: 'none',
    },
    sendBtn: {
      background: '#1A3A1A',
      color: '#80D850',
      border: '2px solid #3A6A2A',
      padding: '7px 14px',
      fontFamily: "'Orbitron', monospace",
      fontSize: '8px',
      letterSpacing: '1.5px',
      cursor: 'pointer',
      textTransform: 'uppercase' as const,
    },
    // Status bar
    statusBar: {
      background: '#1A3A1A',
      padding: '4px 10px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '7px',
      color: '#5AAA3A',
      letterSpacing: '1px',
      flexShrink: 0,
      fontFamily: "'Orbitron', monospace",
    },
    // Error popup
    errorOverlay: {
      position: 'fixed' as const, inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
    },
    errorWindow: {
      background: '#FFFFFF',
      border: '3px solid #8A1A1A',
      boxShadow: '4px 4px 0 #5A0A0A',
      minWidth: '260px',
      maxWidth: '320px',
      fontFamily: "'Orbitron', monospace",
    },
    errorTb: {
      background: 'linear-gradient(90deg,#8A1A1A,#5A0A0A)',
      padding: '5px 10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    errorBody: { padding: '18px', textAlign: 'center' as const },
  };

  const QUICK = [
    ['🎵 La musique', 'Ta musique c\'est où ?'],
    ['🎤 Concerts', 'T\'as des concerts ?'],
    ['📁 Projet', 'C\'est quoi ton projet ?'],
    ['📊 KPIs', 'Ça va ?'],
    ['📧 Contact', 'Contact ?'],
  ];

  return (
    <>
      {/* ── CSS animations injectées ── */}
      <style>{`
        @keyframes guibour-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes guibour-dot { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes guibour-breathe {
          0%,100%{box-shadow:0 0 18px rgba(0,255,102,.35),inset 0 0 15px rgba(0,255,102,.08)}
          50%{box-shadow:0 0 40px rgba(0,255,102,.65),inset 0 0 28px rgba(0,255,102,.15)}
        }
        @keyframes guibour-flicker { 0%,90%,94%,96%,100%{opacity:1} 91%{opacity:0.7} 93%{opacity:0.9} 95%{opacity:0.6} }
        @keyframes guibour-glow { 0%,100%{box-shadow:0 0 5px rgba(0,255,102,.3)} 50%{box-shadow:0 0 18px rgba(0,255,102,.6)} }
        @keyframes guibour-open { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes guibour-tdot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
        .guibour-qbtn:hover{background:#1A3A1A!important;color:#80D850!important;border-color:#1A3A1A!important}
        .guibour-input:focus{border-color:#3A6A2A!important;box-shadow:0 0 0 2px rgba(58,106,42,0.2)!important}
        .guibour-winbtn:hover{background:#4A8A3A!important}
        .guibour-send:hover{background:#2A5A2A!important}
        .guibour-badge:hover .guibour-badge-card{box-shadow:0 0 0 1px #003322,0 0 40px rgba(0,255,102,0.6)!important}
        /* Holo scanlines */
        .guibour-holo::before{
          content:'';position:absolute;inset:0;
          background:repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(0,255,100,.02) 3px,rgba(0,255,100,.02) 4px);
          pointer-events:none;z-index:1;
        }
        /* Messages scrollbar */
        .guibour-msgs::-webkit-scrollbar{width:5px}
        .guibour-msgs::-webkit-scrollbar-track{background:#F0F0F0}
        .guibour-msgs::-webkit-scrollbar-thumb{background:#C0C0A0}
        /* typing dots */
        .guibour-tdot{width:5px;height:5px;background:#3A7A2A;border-radius:50%;animation:guibour-tdot 1.3s ease-in-out infinite}
        .guibour-tdot:nth-child(2){animation-delay:.22s}
        .guibour-tdot:nth-child(3){animation-delay:.44s}
      `}</style>

      {/* ── FLOATING BADGE ── */}
      <div style={S.badge} className="guibour-badge" onClick={() => setOpen(v => !v)}>
        <div style={S.badgeCard} className="guibour-badge-card">
          <span style={S.badgeIcon}>🕴️</span>
          <div style={S.badgeText}>
            <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '3px' }}>GUIBOUR</div>
            <div style={{ fontSize: '7.5px', opacity: 0.8 }}>SUPPORT INTERNE</div>
          </div>
          <div style={S.badgeDot}></div>
        </div>
        {/* Petit label sous le badge */}
        <div style={{
          background: '#0D1F0D',
          border: '1px solid #1A3A1A',
          borderTop: 'none',
          padding: '2px 12px',
          fontFamily: "'Orbitron', monospace",
          fontSize: '6.5px',
          color: '#3A8A3A',
          letterSpacing: '1.5px',
          width: '100%',
          textAlign: 'center',
        }}>
          {open ? '▼ FERMER' : '▲ AIDE INTERNE'}
        </div>
      </div>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div style={S.window}>

          {/* Title bar */}
          <div style={S.titleBar}>
            <div style={S.titleText}>
              <span>📎</span>
              <span>GUIBOUR CORP. — ASSISTANCE v2.3</span>
            </div>
            <div style={S.winBtns}>
              {['_','□'].map(c => (
                <button key={c} style={S.winBtn} className="guibour-winbtn">{c}</button>
              ))}
              <button
                style={{ ...S.winBtn, background: '#6A1A1A', borderColor: '#4A0A0A' }}
                className="guibour-winbtn"
                onClick={() => setOpen(false)}
              >×</button>
            </div>
          </div>

          {/* Hologram header */}
          <div style={S.holoHeader} className="guibour-holo">
            <div style={S.holoFrame}>
              {/* Remplace ce span par <img> de ta photo avec filter hologramme */}
              <span style={S.holoEmoji}>🕴️</span>
              {/* <img src="/game/player/guibour-idle.png" style={{width:'100%',height:'100%',objectFit:'cover',filter:'hue-rotate(100deg) saturate(3) brightness(0.6) contrast(1.5)',mixBlendMode:'screen',position:'relative',zIndex:2}} alt="Guibour" /> */}
            </div>
            <div style={{ flex: 1, zIndex: 2, position: 'relative' }}>
              <div style={S.holoName}>GUIBOUR</div>
              <div style={S.holoTitle}>
                CONSULTANT EN RUPTURE ARTISTIQUE<br />
                EX-CADRE SUP. — LA DÉFENSE, BÅTIMENT C
              </div>
              <div style={S.holoDivider}></div>
              <div style={S.holoStatus}>
                <div style={S.statusDot}></div>
                <div style={S.statusTxt}>{status}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={S.messagesArea} className="guibour-msgs">
            {messages.map(msg => (
              <div key={msg.id} style={msg.from === 'bot' ? S.msgBot : S.msgUser}>
                <div style={msg.from === 'bot' ? S.metaBot : S.metaUser}>
                  {msg.from === 'bot'
                    ? `GUIBOUR // ${msg.time} — OBJET : Re: votre demande`
                    : `VOUS // ${msg.time}`}
                </div>
                <div style={msg.from === 'bot' ? S.bubbleBot : S.bubbleUser}>
                  <span dangerouslySetInnerHTML={{ __html: msg.html }} />
                  {msg.music && (
                    <div>
                      <a
                        href={msg.music.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={S.redirectBtn}
                      >
                        ▶ <span style={S.platform}>{msg.music.plateforme}</span>
                        &nbsp;&nbsp;"{msg.music.titre}"
                      </a>
                    </div>
                  )}
                </div>
                {msg.from === 'bot' && (
                  <div style={S.sig}>
                    Cordialement, Guibour | Consultant Musical — guibour@extranet.biz | Envoyé depuis Outlook 2003
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={S.msgBot}>
                <div style={S.metaBot}>GUIBOUR — rédige une réponse professionnelle...</div>
                <div style={S.typingBubble}>
                  <div className="guibour-tdot"></div>
                  <div className="guibour-tdot"></div>
                  <div className="guibour-tdot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div style={S.quickSection}>
            <div style={S.quickLabel}>SUJETS FRÉQUENTS :</div>
            <div style={S.quickBtns}>
              {QUICK.map(([label, text]) => (
                <button
                  key={label}
                  style={S.qBtn}
                  className="guibour-qbtn"
                  onClick={() => {
                    setInput(text);
                    setTimeout(() => {
                      const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
                      inputRef.current?.dispatchEvent(evt);
                    }, 50);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={S.inputZone}>
            <div style={S.inputLabel}>NOUVEAU MESSAGE — À : GUIBOUR &lt;guibour@extranet.biz&gt;</div>
            <div style={S.inputRow}>
              <input
                ref={inputRef}
                style={S.chatInput}
                className="guibour-input"
                placeholder="Objet de votre demande..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                maxLength={200}
              />
              <button style={S.sendBtn} className="guibour-send" onClick={send}>
                ENVOYER
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div style={S.statusBar}>
            <span>SESSION #RTT-2026</span>
            <span>MSG : {messages.filter(m => m.from === 'user').length}</span>
            <span>MORAL : 43%</span>
          </div>

        </div>
      )}

      {/* ── ERROR POPUP ── */}
      {errorHtml && (
        <div style={S.errorOverlay} onClick={() => setErrorHtml(null)}>
          <div style={S.errorWindow} onClick={e => e.stopPropagation()}>
            <div style={S.errorTb}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize:'8px', color:'#FFB0B0', letterSpacing:'1px' }}>
                ⚠ GUIBOUR.EXE — ERREUR
              </span>
              <span style={{ color:'#FFB0B0', cursor:'pointer', fontSize:'12px' }} onClick={() => setErrorHtml(null)}>×</span>
            </div>
            <div style={S.errorBody}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🖨️</div>
              <div
                style={{ fontFamily:"'Orbitron',monospace", fontSize:'10px', color:'#2A2010', lineHeight:1.7, marginBottom:'14px' }}
                dangerouslySetInnerHTML={{ __html: errorHtml }}
              />
              <button
                style={{
                  padding: '4px 24px',
                  background: '#F0EEE0',
                  border: '2px solid #8A8060',
                  fontFamily: "'Orbitron',monospace",
                  fontSize: '9px',
                  cursor: 'pointer',
                }}
                onClick={() => setErrorHtml(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
