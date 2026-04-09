import type { Metadata } from 'next';
import ExcelNav from '@/components/ui/ExcelNav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales — GUIBOUR SYSTEM',
  description: 'Mentions légales du site guibour.fr',
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

export default function MentionsLegales() {
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
            GUIBOUR SYSTEM // DOCUMENT OFFICIEL
          </div>
          <h1 style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: 'clamp(28px, 5vw, 42px)',
            color: '#FFFFFF',
            letterSpacing: '4px',
            lineHeight: 1,
            marginBottom: '6px',
          }}>
            MENTIONS LÉGALES
          </h1>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: '#2B5090',
            letterSpacing: '2px',
          }}>
            =LEGAL_NOTICE(&quot;guibour.fr&quot;) // CONFORME LOI N°2004-575
          </div>
        </div>

        {/* Sections */}
        <Section title="1. ÉDITEUR DU SITE">
          <p>Le site <strong style={{ color: '#00C8BE' }}>guibour.fr</strong> est édité par :</p>
          <p style={{ marginTop: '8px' }}>
            <strong>Guibour</strong> (personne physique)<br />
            Email de contact : <a href="mailto:contact@guibour.fr" style={{ color: '#00C8BE' }}>contact@guibour.fr</a><br />
            Site web : <a href="https://guibour.fr" style={{ color: '#00C8BE' }}>https://guibour.fr</a>
          </p>
        </Section>

        <Section title="2. HÉBERGEMENT">
          <p>
            Ce site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133<br />
            Covina, CA 91723 — États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00C8BE' }}>https://vercel.com</a>
          </p>
        </Section>

        <Section title="3. PROPRIÉTÉ INTELLECTUELLE">
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos, musiques, graphismes, jeu W.O.W) est la propriété exclusive de Guibour,
            sauf mentions contraires. Toute reproduction totale ou partielle est interdite sans autorisation préalable écrite.
          </p>
          <p style={{ marginTop: '8px' }}>
            Le jeu <strong>W.O.W — Work Or Window</strong> et tous ses éléments graphiques et sonores sont des œuvres originales protégées par le droit d&apos;auteur.
          </p>
        </Section>

        <Section title="4. DONNÉES PERSONNELLES">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679), vous disposez des droits suivants
            concernant vos données personnelles :
          </p>
          <p style={{ marginTop: '8px' }}>
            • Droit d&apos;accès, de rectification et de suppression<br />
            • Droit à la portabilité<br />
            • Droit d&apos;opposition au traitement
          </p>
          <p style={{ marginTop: '8px' }}>
            Les données collectées (adresse email, pseudo) lors de l&apos;inscription au concours W.O.W sont utilisées exclusivement dans le cadre dudit concours
            et ne sont pas transmises à des tiers. Pour exercer vos droits, contactez :
            <a href="mailto:contact@guibour.fr" style={{ color: '#00C8BE', marginLeft: '4px' }}>contact@guibour.fr</a>
          </p>
        </Section>

        <Section title="5. COOKIES">
          <p>
            Ce site utilise des données de session stockées localement (localStorage) pour mémoriser votre profil de joueur.
            Aucun cookie tiers n&apos;est utilisé à des fins publicitaires.
            Des cookies analytiques anonymisés peuvent être utilisés pour mesurer l&apos;audience.
          </p>
        </Section>

        <Section title="6. LIMITATION DE RESPONSABILITÉ">
          <p>
            Guibour s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées sur ce site. Toutefois, il ne peut être tenu responsable
            des erreurs, omissions ou résultats qui pourraient être obtenus par mauvais usage de ces informations.
            Les liens hypertextes présents sur ce site peuvent renvoyer vers des sites tiers dont Guibour ne maîtrise pas le contenu.
          </p>
        </Section>

        <Section title="7. DROIT APPLICABLE">
          <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable,
            les tribunaux français seront seuls compétents.
          </p>
        </Section>

        {/* Back */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #1A3E7A' }}>
          <Link href="/" style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            color: '#5B9BD5',
            textDecoration: 'none',
            letterSpacing: '2px',
          }}>
            ← RETOUR AU SYSTÈME
          </Link>
        </div>
      </div>
    </div>
  );
}
