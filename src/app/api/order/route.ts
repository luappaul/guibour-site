import { NextRequest, NextResponse } from 'next/server';
import { escapeHtml } from '@/lib/sanitize';

// ──────────────────────────────────────────────────────────────
//  CONFIGURATION FOURNISSEUR (à remplir quand tu as les coordonnées)
// ──────────────────────────────────────────────────────────────
const SUPPLIER_CONFIG = {
  // email du fournisseur — remplacer quand disponible
  email: process.env.SUPPLIER_EMAIL ?? 'fournisseur@a-configurer.com',
  // webhook URL (Zapier / Make / n8n) — optionnel
  webhookUrl: process.env.SUPPLIER_WEBHOOK_URL ?? null,
  // nom affiché dans les mails
  name: process.env.SUPPLIER_NAME ?? 'Fournisseur Guibour',
};

const STORE_CONFIG = {
  name: 'GUIBOUR SYSTEM',
  email: process.env.STORE_EMAIL ?? 'contact@guibour.fr',
  orderPrefix: 'GS',
};

export interface OrderLine {
  ref: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OrderPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  lines: OrderLine[];
  total: number;
  notes?: string;
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${STORE_CONFIG.orderPrefix}-${ts}-${rand}`;
}

function buildCustomerEmail(orderId: string, payload: OrderPayload): string {
  const safeName = escapeHtml(payload.customer.name);
  const safeAddress = escapeHtml(payload.customer.address);
  const safePostalCode = escapeHtml(payload.customer.postalCode);
  const safeCity = escapeHtml(payload.customer.city);
  const safeCountry = escapeHtml(payload.customer.country);

  const linesHtml = payload.lines
    .map(l => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(l.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${l.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(l.unitPrice * l.qty).toFixed(2)} €</td>
    </tr>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:monospace;background:#EEF3F8;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #0D2B5E;">
    <div style="background:#0D2B5E;padding:20px 28px;border-bottom:3px solid #00C8BE;">
      <h1 style="color:#fff;font-family:monospace;letter-spacing:4px;margin:0;font-size:20px;">GUIBOUR SYSTEM</h1>
      <p style="color:#00C8BE;font-size:10px;letter-spacing:3px;margin:4px 0 0;">CONFIRMATION DE COMMANDE</p>
    </div>
    <div style="padding:28px;">
      <p style="color:#0D2B5E;font-size:13px;">Bonjour <strong>${safeName}</strong>,</p>
      <p style="color:#607888;font-size:12px;">Votre commande a bien été reçue. Elle sera traitée et expédiée sous 3 à 5 jours ouvrés.</p>

      <div style="background:#EEF3F8;padding:12px 16px;border-left:3px solid #00C8BE;margin:20px 0;">
        <p style="margin:0;font-size:11px;color:#3C5A7A;letter-spacing:2px;">N° COMMANDE</p>
        <p style="margin:4px 0 0;font-size:18px;color:#0D2B5E;font-weight:700;">${orderId}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#0D2B5E;">
            <th style="padding:8px;color:#A8D8FF;text-align:left;font-size:10px;letter-spacing:2px;">ARTICLE</th>
            <th style="padding:8px;color:#A8D8FF;text-align:center;font-size:10px;letter-spacing:2px;">QTÉ</th>
            <th style="padding:8px;color:#A8D8FF;text-align:right;font-size:10px;letter-spacing:2px;">TOTAL</th>
          </tr>
        </thead>
        <tbody>${linesHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:10px;font-weight:700;color:#0D2B5E;font-size:13px;">TOTAL</td>
            <td style="padding:10px;font-weight:700;color:#0047AB;font-size:16px;text-align:right;">${payload.total.toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:24px;padding:16px;background:#F7FAFD;border:1px solid #C8D8E8;">
        <p style="margin:0 0 4px;font-size:10px;color:#8FA5B8;letter-spacing:2px;">LIVRAISON À</p>
        <p style="margin:0;font-size:13px;color:#1A2B40;">${safeName}<br>
        ${safeAddress}<br>
        ${safePostalCode} ${safeCity}<br>
        ${safeCountry}</p>
      </div>

      <p style="margin-top:24px;font-size:11px;color:#8FA5B8;">
        Pour toute question : <a href="mailto:${STORE_CONFIG.email}" style="color:#0047AB;">${STORE_CONFIG.email}</a>
      </p>
      <p style="font-size:10px;color:#C8D8E8;letter-spacing:2px;margin-top:20px;">© 2026 GUIBOUR SYSTEM — W.O.W</p>
    </div>
  </div>
</body>
</html>`;
}

function buildSupplierEmail(orderId: string, payload: OrderPayload): string {
  const linesTxt = payload.lines
    .map(l => `  - ${escapeHtml(l.ref)} | ${escapeHtml(l.name)} | QTÉ: ${l.qty} | PU: ${l.unitPrice}€`)
    .join('\n');

  return `NOUVELLE COMMANDE GUIBOUR SYSTEM
========================================
N° COMMANDE : ${orderId}
DATE        : ${new Date().toISOString()}

ARTICLES :
${linesTxt}

TOTAL : ${payload.total.toFixed(2)} €

LIVRAISON À :
  Nom     : ${escapeHtml(payload.customer.name)}
  Email   : ${escapeHtml(payload.customer.email)}
  Tél     : ${escapeHtml(payload.customer.phone)}
  Adresse : ${escapeHtml(payload.customer.address)}
  CP/Ville: ${escapeHtml(payload.customer.postalCode)} ${escapeHtml(payload.customer.city)}
  Pays    : ${escapeHtml(payload.customer.country)}
${payload.notes ? `\nNOTES : ${escapeHtml(payload.notes)}` : ''}

========================================
Merci de procéder à l'expédition sous 48h ouvrées.
`;
}

async function notifySupplier(orderId: string, payload: OrderPayload) {
  // Option A : webhook (Zapier / Make / n8n)
  if (SUPPLIER_CONFIG.webhookUrl) {
    try {
      await fetch(SUPPLIER_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customer: payload.customer,
          lines: payload.lines,
          total: payload.total,
          supplierEmail: buildSupplierEmail(orderId, payload),
        }),
      });
    } catch (e) {
      console.error('[GUIBOUR ORDER] Webhook supplier error:', e);
    }
  }

  // Option B : log structuré (en attendant l'intégration email/webhook réel)
  console.log('[GUIBOUR ORDER] New order for supplier:', {
    orderId,
    supplier: SUPPLIER_CONFIG.email,
    customer: payload.customer.email,
    lines: payload.lines,
    total: payload.total,
    supplierInstructions: buildSupplierEmail(orderId, payload),
  });
}

// ──────────────────────────────────────────────────────────────
//  HANDLER POST /api/order
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload: OrderPayload = await req.json();

    // Validation basique
    if (!payload.customer?.email || !payload.lines?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const orderId = generateOrderId();

    // Notify supplier (fire-and-forget)
    notifySupplier(orderId, payload).catch(console.error);

    // TODO: quand un service d'email est configuré (Resend, SendGrid, Nodemailer…),
    // décommenter et brancher ici :
    // await sendEmail({
    //   to: payload.customer.email,
    //   subject: `Confirmation commande ${orderId} — GUIBOUR SYSTEM`,
    //   html: buildCustomerEmail(orderId, payload),
    // });

    // Log pour debug/audit
    console.log('[GUIBOUR ORDER] Created:', orderId, 'for', payload.customer.email);

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Commande reçue',
      estimatedDelivery: '3-5 jours ouvrés',
      // On renvoie le HTML de confirmation pour affichage côté client
      confirmationEmailPreview: buildCustomerEmail(orderId, payload),
    });
  } catch (err) {
    console.error('[GUIBOUR ORDER] Error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
