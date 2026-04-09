import type { Metadata } from 'next';
import ExcelNav from '@/components/ui/ExcelNav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CGV & Règlement du concours — GUIBOUR SYSTEM',
  description: 'Conditions Générales de Vente et Règlement du concours W.O.W — guibour.fr',
  robots: 'noindex',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '10px',
        color: '#00C8BE',
        letterSpacing: '4px',
        marginBottom: '10px',
        borderBottom: '1px solid #1A3E7A',
        paddingBottom: '6px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        color: '#A8D8FF',
        lineHeight: 1.8,
        letterSpacing: '0.5px',
      }}>
        {children}
      </div>
    </div>
  );
}

export default function CGV() {
  return (
    <div className="min-h-screen" style={{ background: '#1A3F78', paddingLeft: '48px' }}>
      <ExcelNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: '#5B9BD5',
            letterSpacing: '4px',
            marginBottom: '8px',
          }}>
            GUIBOUR SYSTEM // CONCOURS W.O.W 2026
          </div>
          <h1 style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: 'clamp(24px, 4vw, 36px)',
            color: '#FFFFFF',
            letterSpacing: '4px',
            lineHeight: 1,
            marginBottom: '6px',
          }}>
            CGV & RÈGLEMENT DU CONCOURS
          </h1>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: '#2B5090',
            letterSpacing: '2px',
          }}>
            =REGLEMENT(&quot;W.O.W&quot;,&quot;2026&quot;) // SANS OBLIGATION D&apos;ACHAT
          </div>
        </div>

        {/* Sections concours */}
        <Section title="ART. 1 — ORGANISATION">
          <p>
            Le concours <strong style={{ color: '#FFE033' }}>W.O.W — Work Or Window</strong> est organisé par Guibour (ci-après &quot;l&apos;Organisateur&quot;),
            accessible via le site <strong style={{ color: '#00C8BE' }}>guibour.fr</strong>. Ce concours est gratuit et sans obligation d&apos;achat.
          </p>
        </Section>

        <Section title="ART. 2 — DURÉE">
          <p>
            Le concours se déroule du <strong>lancement du jeu W.O.W</strong> jusqu&apos;au <strong style={{ color: '#FF4444' }}>1er juin 2026 à 18h00 (heure de Paris)</strong>.
            Toute participation reçue après cette date ne sera pas prise en compte.
          </p>
        </Section>

        <Section title="ART. 3 — CONDITIONS DE PARTICIPATION">
          <p>
            La participation est ouverte à toute personne physique majeure (18 ans et plus),
            à l&apos;exclusion des membres de l&apos;équipe organisatrice et de leurs proches.
            La participation est limitée à un compte par personne (pseudo unique).
          </p>
          <p style={{ marginTop: '8px' }}>
            Pour participer, le joueur doit :<br />
            • Créer un profil avec un pseudo sur guibour.fr<br />
            • Jouer au jeu W.O.W et obtenir un score<br />
            • Figurer au classement général au terme de la période de jeu
          </p>
        </Section>

        <Section title="ART. 4 — BONUS RTT">
          <p>
            Des &quot;RTT&quot; (vies supplémentaires) peuvent être obtenus en complétant son profil (email, téléphone)
            ou en partageant le jeu via WhatsApp. Ces actions sont optionnelles et sans contrepartie financière.
          </p>
        </Section>

        <Section title="ART. 5 — DÉSIGNATION DES GAGNANTS">
          <p>
            À l&apos;issue de la période de concours, le ou les gagnant(s) seront désignés selon leur score
            au classement général. En cas d&apos;égalité, le joueur ayant atteint son score en premier sera retenu.
            Les gagnants seront contactés par email dans les <strong>15 jours suivant la clôture</strong>.
          </p>
        </Section>

        <Section title="ART. 6 — DOTATIONS">
          <p>
            La nature et la valeur des dotations seront communiquées sur le site guibour.fr.
            Les lots ne peuvent être ni remplacés, ni échangés, ni convertis en espèces, sauf cas de force majeure.
          </p>
        </Section>

        <Section title="ART. 7 — CONDITIONS GÉNÉRALES DE VENTE (BOUTIQUE)">
          <p>
            Les produits disponibles dans la boutique guibour.fr (merchandising W.O.W) sont vendus par
            l&apos;intermédiaire d&apos;un prestataire tiers (impression à la demande / dropshipping).
            Les CGV du prestataire s&apos;appliquent aux transactions effectuées. En cas de litige,
            contacter <a href="mailto:contact@guibour.fr" style={{ color: '#00C8BE' }}>contact@guibour.fr</a>.
          </p>
          <p style={{ marginTop: '8px' }}>
            Conformément à la loi, vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la réception
            de votre commande pour exercer votre droit de rétractation, sans motif ni pénalité.
          </p>
        </Section>

        <Section title="ART. 8 — PROTECTION DES DONNÉES">
          <p>
            Les données personnelles collectées dans le cadre du concours (email, pseudo) sont utilisées uniquement
            pour la gestion du concours et l&apos;envoi d&apos;une communication de bienvenue. Elles ne sont pas
            transmises à des tiers et sont supprimées 6 mois après la clôture du concours.
            Voir nos <Link href="/mentions-legales" style={{ color: '#00C8BE' }}>Mentions légales</Link> pour plus d&apos;informations.
          </p>
        </Section>

        <Section title="ART. 9 — LITIGES ET DROIT APPLICABLE">
          <p>
            Le présent règlement est soumis au droit français. Tout litige sera porté devant les juridictions
            compétentes françaises. L&apos;Organisateur se réserve le droit de modifier ou d&apos;annuler le concours
            en cas de force majeure, sans que sa responsabilité puisse être engagée.
          </p>
        </Section>

        <Section title="ART. 10 — CONTACT">
          <p>
            Pour toute question concernant ce règlement ou le concours :<br />
            <a href="mailto:contact@guibour.fr" style={{ color: '#00C8BE' }}>contact@guibour.fr</a>
          </p>
        </Section>

        {/* Back */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #1A3E7A', display: 'flex', gap: '24px' }}>
          <Link href="/" style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            color: '#5B9BD5',
            textDecoration: 'none',
            letterSpacing: '2px',
          }}>
            ← RETOUR AU SYSTÈME
          </Link>
          <Link href="/mentions-legales" style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            color: '#5B9BD5',
            textDecoration: 'none',
            letterSpacing: '2px',
          }}>
            MENTIONS LÉGALES →
          </Link>
        </div>
      </div>
    </div>
  );
}
