import { NextRequest, NextResponse } from 'next/server';

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

// POST /api/photo  { employeeId, photo: base64DataUrl }
export async function POST(req: NextRequest) {
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

    const empId = String(employeeId).slice(0, 12);
    await redisSet(`photo:${empId}`, photo);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
