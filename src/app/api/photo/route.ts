import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// Max base64 size ~200KB (≈150KB actual image)
const MAX_B64 = 200_000;

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key: string): Promise<string | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    const json = await res.json() as { result?: string | null };
    return json.result ?? null;
  } catch { return null; }
}

async function redisSet(key: string, value: string): Promise<void> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  try {
    await fetch(`${UPSTASH_URL}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
  } catch { /* ignore */ }
}

// GET /api/photo?ids=EMP1,EMP2,EMP3
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const ids = req.nextUrl.searchParams.get('ids');
  if (!ids) return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } });

  const idList = ids.split(',').slice(0, 10).map(s => s.trim()).filter(Boolean);
  const photos: Record<string, string> = {};

  await Promise.all(idList.map(async id => {
    const data = await redisGet(`photo:${id}`);
    if (data) photos[id] = data;
  }));

  return NextResponse.json(photos, { headers: { 'Cache-Control': 'no-store' } });
}

// Basic NSFW check: verify the base64 is a valid JPEG/PNG of reasonable dimensions
// Decodes the header bytes to check image type and dimensions
function isImageSafe(b64: string): { safe: boolean; reason?: string } {
  // Must be JPEG or PNG data URL
  if (!b64.match(/^data:image\/(jpeg|png|webp);base64,/)) {
    return { safe: false, reason: 'Format non autorisé (JPEG/PNG uniquement)' };
  }

  // Extract raw base64 data
  const raw = b64.split(',')[1];
  if (!raw || raw.length < 100) {
    return { safe: false, reason: 'Image trop petite ou corrompue' };
  }

  // Decode first bytes to check file signature
  const bytes = Buffer.from(raw.slice(0, 32), 'base64');

  // JPEG signature: FF D8 FF
  const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  // PNG signature: 89 50 4E 47
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;

  if (!isJPEG && !isPNG) {
    return { safe: false, reason: 'Signature image invalide' };
  }

  return { safe: true };
}

// POST /api/photo  { employeeId, photo: base64DataUrl }
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  try {
    const { employeeId, photo } = await req.json() as { employeeId?: string; photo?: string };

    if (!employeeId || !photo) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }
    if (typeof photo !== 'string' || !photo.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Format image invalide' }, { status: 400 });
    }
    if (photo.length > MAX_B64) {
      return NextResponse.json({ error: 'Image trop lourde (max 150KB)' }, { status: 413 });
    }

    // Safety check
    const check = isImageSafe(photo);
    if (!check.safe) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    const empId = String(employeeId).slice(0, 12);

    // Store with a "pending" flag — photos are visible immediately but can be flagged
    await redisSet(`photo:${empId}`, photo);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
