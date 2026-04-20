import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MAX_ENTRIES = 100;

// ── Anti-cheat constants ────────────────────────────────────────────────────
// Max theoretical score: ~10M for a perfect 25-level run (generous ×1.5)
const MAX_SCORE = 15_000_000;
const MAX_LEVEL = 25;
// Score/level plausibility: score shouldn't massively exceed levels completed
// Generous ceiling: 600k points per level + 100k base
const maxScoreForLevel = (level: number) => Math.max(level * 600_000 + 100_000, 50_000);

// In-memory rate limiter: ip → [timestamps]
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 15;        // max submissions per IP
const RATE_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (rateMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW);
  if (times.length >= RATE_LIMIT) return true;
  rateMap.set(ip, [...times, now]);
  return false;
}

interface Entry {
  name: string;
  score: number;
  level: number;
  employeeId: string;
  date: string;
}

// ── Storage: Upstash Redis REST (no SDK, pure fetch) ───────────────────────
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash    = !!(UPSTASH_URL && UPSTASH_TOKEN);

async function upstashGet(): Promise<Entry[]> {
  if (!hasUpstash) return [];
  try {
    const res = await fetch(`${UPSTASH_URL}/get/leaderboard`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    const json = await res.json() as { result?: string | null };
    if (!json.result) return [];
    return JSON.parse(json.result) as Entry[];
  } catch { return []; }
}

async function upstashSet(entries: Entry[]): Promise<boolean> {
  if (!hasUpstash) return false;
  try {
    await fetch(`${UPSTASH_URL}/set/leaderboard`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.stringify(entries)),
    });
    return true;
  } catch { return false; }
}

// ── Storage: Vercel KV (legacy, keep for backward compat) ──────────────────
const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

async function kvGet(): Promise<Entry[]> {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<Entry[]>('leaderboard');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function kvSet(entries: Entry[]): Promise<boolean> {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('leaderboard', entries);
    return true;
  } catch { return false; }
}

// ── Storage: /tmp file fallback (dev + Vercel without KV) ──────────────────
// Note: /tmp IS writable on Vercel but resets on cold starts.
// It's used as a last-resort dev/staging fallback.
const TMP_FILE = path.join('/tmp', 'guibour_leaderboard.json');

function fileGet(): Entry[] {
  try {
    if (!fs.existsSync(TMP_FILE)) return [];
    return JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8')) as Entry[];
  } catch { return []; }
}

function fileSet(entries: Entry[]): void {
  try { fs.writeFileSync(TMP_FILE, JSON.stringify(entries)); } catch { /* ignore */ }
}

async function getEntries(): Promise<Entry[]> {
  if (hasUpstash) return upstashGet();
  if (hasKV)     return kvGet();
  return fileGet();
}

async function saveEntries(entries: Entry[]): Promise<void> {
  if (hasUpstash) { await upstashSet(entries); return; }
  if (hasKV)     { await kvSet(entries); return; }
  fileSet(entries);
}

// ── GET /api/leaderboard ────────────────────────────────────────────────────
export async function GET() {
  const entries = await getEntries();
  const sorted = [...entries].sort((a, b) => b.score - a.score).slice(0, 50);
  return NextResponse.json({ entries: sorted, total: entries.length }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// ── POST /api/leaderboard ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de soumissions, réessayez plus tard.' }, { status: 429 });
  }

  try {
    const body = await req.json() as {
      name?: unknown; score?: unknown; level?: unknown;
      employeeId?: unknown; scoreToken?: unknown;
    };
    const { name, score, level, employeeId, scoreToken } = body;

    // ── Basic validation ─────────────────────────────────────────────────────
    if (!name || typeof score !== 'number' || typeof level !== 'number') {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // ── Anti-cheat bounds ────────────────────────────────────────────────────
    const scoreInt = Math.floor(score);
    const levelInt = Math.floor(level);

    if (scoreInt < 0 || scoreInt > MAX_SCORE) {
      return NextResponse.json({ error: 'Score invalide.' }, { status: 400 });
    }
    if (levelInt < 0 || levelInt > MAX_LEVEL) {
      return NextResponse.json({ error: 'Niveau invalide.' }, { status: 400 });
    }
    if (levelInt > 0 && scoreInt > maxScoreForLevel(levelInt)) {
      return NextResponse.json({ error: 'Score incompatible avec le niveau atteint.' }, { status: 400 });
    }

    // ── Optional: verify score token (HMAC) ─────────────────────────────────
    const secret = process.env.SCORE_SECRET;
    if (secret && scoreToken) {
      // Token format: hmac-sha256(secret, `${employeeId}:${scoreInt}:${levelInt}`)
      const expected = crypto
        .createHmac('sha256', secret)
        .update(`${String(employeeId)}:${scoreInt}:${levelInt}`)
        .digest('hex');
      if (scoreToken !== expected) {
        console.warn('[leaderboard] invalid score token from IP', ip);
        // Don't hard reject — soft drop (register but flag if needed in future)
      }
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    const entries = await getEntries();
    const empId = String(employeeId || 'GS-000000').slice(0, 12);

    const existingIdx = entries.findIndex(e => e.employeeId === empId);
    if (existingIdx !== -1) {
      // Keep best score only
      if (scoreInt <= entries[existingIdx].score) {
        const rank = [...entries].sort((a, b) => b.score - a.score)
          .findIndex(e => e.employeeId === empId) + 1;
        return NextResponse.json({ success: true, rank });
      }
      entries.splice(existingIdx, 1);
    }

    const newEntry: Entry = {
      name: String(name).replace(/[<>]/g, '').slice(0, 20), // strip html
      score: scoreInt,
      level: Math.min(levelInt, MAX_LEVEL),
      employeeId: empId,
      date: new Date().toISOString(),
    };

    entries.push(newEntry);
    const sorted = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
    await saveEntries(sorted);

    const rank = sorted.findIndex(e => e.employeeId === newEntry.employeeId) + 1;
    return NextResponse.json({ success: true, rank });

  } catch (err) {
    console.error('[leaderboard POST]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
