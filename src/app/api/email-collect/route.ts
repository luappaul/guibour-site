import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple append-to-JSON file database for emails
// In production you'd use Vercel KV / Supabase / Resend
const DB_PATH = path.join(process.cwd(), 'data', 'emails.json');

interface EmailEntry {
  email: string;
  pseudo?: string;
  source?: string;
  date: string;
}

async function loadDB(): Promise<EmailEntry[]> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveDB(entries: EmailEntry[]) {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(entries, null, 2));
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { email, pseudo, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const entries = await loadDB();

    // Avoid duplicates
    if (entries.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    entries.push({ email, pseudo, source, date: new Date().toISOString() });
    await saveDB(entries);

    // Try to send welcome email via Resend if API key is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const employeeNum = Math.floor(Math.random() * 89999 + 10000);
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GUIBOUR SYSTEM <contact@guibour.fr>',
          to: email,
          subject: `GUIBOUR SYSTEM — Bienvenue, Employé #${employeeNum}`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0C2A62;color:#A8D8FF;font-family:'Courier New',monospace;padding:40px;margin:0;">
  <div style="max-width:500px;margin:0 auto;border:2px solid #00C8BE;padding:0;overflow:hidden;">
    <div style="background:#0047AB;padding:12px 20px;">
      <h2 style="margin:0;color:#fff;letter-spacing:4px;font-size:14px;">GUIBOUR SYSTEM</h2>
      <p style="margin:4px 0 0;color:#A8D8FF;font-size:10px;letter-spacing:2px;">DÉPARTEMENT RESSOURCES HUMAINES</p>
    </div>
    <div style="padding:24px;background:#091E4A;">
      <p style="color:#00C8BE;font-size:10px;letter-spacing:3px;margin-bottom:4px;">=BIENVENUE("NOUVEL_EMPLOYÉ")</p>
      <h1 style="color:#fff;font-size:28px;letter-spacing:4px;margin:0 0 8px;">${pseudo ? pseudo.toUpperCase() : 'EMPLOYÉ'}</h1>
      <p style="color:#A8D8FF;font-size:11px;line-height:1.8;margin:16px 0;">
        Votre dossier a été enregistré dans le système Guibour.<br>
        <strong style="color:#FFE033;">Employé N° GS-${employeeNum}</strong> — vous êtes désormais en compétition.<br><br>
        Le classement est mis à jour en temps réel sur <strong style="color:#00D4CC;">guibour.fr</strong>.<br>
        Les gagnants seront contactés personnellement.
      </p>
      <div style="background:#0047AB;padding:12px;text-align:center;margin:20px 0;">
        <a href="https://guibour.fr" style="color:#fff;text-decoration:none;font-size:12px;letter-spacing:3px;font-weight:bold;">
          RETOURNER AU JEU →
        </a>
      </div>
      <p style="color:#3C5A7A;font-size:9px;line-height:1.6;margin-top:20px;">
        Guibour System · guibour.fr · W.O.W 2026<br>
        Vous recevez cet email car vous avez participé au concours W.O.W.<br>
        Pour vous désinscrire : contact@guibour.fr
      </p>
    </div>
  </div>
</body>
</html>
          `,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('email-collect error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
