import { NextRequest, NextResponse } from 'next/server';
import { escapeHtml } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `REF-${code}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  // Rate limit: 3 per minute
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, 3, 60000)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessaie dans 1 minute.' }, { status: 429 });
  }

  let body: { referrerPseudo?: string; referrerEmail?: string; friendEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { referrerPseudo, referrerEmail, friendEmail } = body;

  if (!referrerPseudo || typeof referrerPseudo !== 'string') {
    return NextResponse.json({ error: 'referrerPseudo requis' }, { status: 400 });
  }

  if (!friendEmail || !isValidEmail(friendEmail)) {
    return NextResponse.json({ error: 'Email ami invalide' }, { status: 400 });
  }

  const code = generateCode();
  const data = {
    referrerPseudo: referrerPseudo.slice(0, 50),
    referrerEmail: referrerEmail || null,
    friendEmail,
    used: false,
    createdAt: new Date().toISOString(),
  };

  // Store in Vercel KV if available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`referral:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 30 }); // 30 days
    } catch {
      // continue without storage
    }
  }

  // Send email via Resend if configured
  if (process.env.RESEND_API_KEY) {
    const safePseudo = escapeHtml(referrerPseudo.slice(0, 50));
    const challengeUrl = `https://guibour.fr?ref=${code}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A1520;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0C2A62;border:2px solid #00C8BE;border-radius:8px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0047AB,#007B8A);padding:20px 30px;text-align:center;">
      <div style="font-size:10px;letter-spacing:6px;color:#A8D8FF;margin-bottom:8px;">GUIBOUR SYSTEM // W.O.W</div>
      <div style="font-size:24px;font-weight:bold;color:#FFE033;letter-spacing:4px;">AVIS DE D&Eacute;FI PROFESSIONNEL</div>
    </div>

    <!-- Body -->
    <div style="padding:40px 30px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">&#9876;&#65039;</div>
      <div style="font-size:22px;font-weight:bold;color:#FFFFFF;margin-bottom:12px;">
        ${safePseudo} t&rsquo;a d&eacute;fi&eacute; de faire mieux que lui sur GUIBOUR SYSTEM W.O.W
      </div>
      <div style="font-size:14px;color:#5B9BD5;margin-bottom:32px;line-height:1.6;">
        Ton coll&egrave;gue pense que tu ne peux pas battre son score.<br/>
        Prouve-lui qu&rsquo;il a tort.
      </div>

      <!-- CTA Button -->
      <a href="${challengeUrl}" target="_blank" style="
        display:inline-block;
        padding:18px 48px;
        background:linear-gradient(135deg,#0047AB,#007B8A);
        color:#FFFFFF;
        font-size:20px;
        font-weight:bold;
        letter-spacing:4px;
        text-decoration:none;
        border:2px solid #00C8BE;
        border-radius:4px;
      ">RELEVER LE D&Eacute;FI &rarr;</a>
    </div>

    <!-- Footer -->
    <div style="background:#091E4A;padding:20px 30px;text-align:center;border-top:1px solid #1A3E7A;">
      <div style="font-size:11px;color:#5B9BD5;line-height:1.8;">
        Si tu bats son score, il perdra un RTT. Si tu perds, c&rsquo;est toi le loser.
      </div>
      <div style="font-size:9px;color:#2B5090;margin-top:12px;letter-spacing:2px;">
        GUIBOUR SYSTEM // guibour.fr // #WOW2026
      </div>
    </div>
  </div>
</body>
</html>`;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GUIBOUR SYSTEM <noreply@guibour.fr>',
          to: [friendEmail],
          subject: `${referrerPseudo} te défie sur GUIBOUR SYSTEM W.O.W !`,
          html,
        }),
      });
    } catch {
      // Email send failed silently
    }
  }

  return NextResponse.json({ success: true, code });
}
