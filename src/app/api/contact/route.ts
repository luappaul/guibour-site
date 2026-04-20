import { NextRequest, NextResponse } from 'next/server';
import { escapeHtml } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard' }, { status: 429 });
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // ── Resend ──────────────────────────────────────────────────────────────
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GUIBOUR SYSTEM <noreply@guibour.fr>',
          to: ['contact@guibour.fr'],
          reply_to: email,
          subject: `[W.O.W CONTACT] ${safeSubject}`,
          html: `
            <div style="font-family:monospace;background:#1A3F78;color:#A8D8FF;padding:32px;border-radius:6px;max-width:600px">
              <div style="font-family:sans-serif;font-size:11px;color:#00C8BE;letter-spacing:4px;margin-bottom:16px">
                GUIBOUR SYSTEM — NOUVEAU MESSAGE
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <tr><td style="color:#5B9BD5;padding:6px 0;width:120px">DE :</td><td style="color:#fff">${safeName}</td></tr>
                <tr><td style="color:#5B9BD5;padding:6px 0">REPLY-TO :</td><td><a href="mailto:${safeEmail}" style="color:#00C8BE">${safeEmail}</a></td></tr>
                <tr><td style="color:#5B9BD5;padding:6px 0">OBJET :</td><td style="color:#FFE033">${safeSubject}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#0C2A62;border:1px solid #1A3E7A;border-radius:4px;font-size:14px;line-height:1.7;color:#A8D8FF">
                ${safeMessage.replace(/\n/g, '<br/>')}
              </div>
              <div style="margin-top:16px;font-size:10px;color:#2B5090;letter-spacing:2px">
                =MESSAGE_RECU() // GUIBOUR SYSTEM 2026 // guibour.fr
              </div>
            </div>
          `,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('[contact] Resend error:', err);
        // Continue — we still confirm to the user even if email fails
      }
    } else {
      // Fallback: log to console (development)
      console.log('[contact] New message (no RESEND_API_KEY set):');
      console.log({ name, email, subject, message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
