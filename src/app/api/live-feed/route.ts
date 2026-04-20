import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface LiveFeedEvent {
  pseudo: string;
  event: string;
  level: number;
  timestamp: number;
}

const MAX_EVENTS = 20;

// ── Helpers: read/write KV ────────────────────────────────────────────────
async function getEvents(): Promise<LiveFeedEvent[]> {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<LiveFeedEvent[]>('live-feed');
    return data ?? [];
  } catch {
    return [];
  }
}

async function setEvents(events: LiveFeedEvent[]): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('live-feed', events.slice(-MAX_EVENTS));
  } catch {
    // Vercel KV unavailable (local dev)
  }
}

// ── GET: Server-Sent Events stream ────────────────────────────────────────
export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial events
      const events = await getEvents();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(events)}\n\n`));

      let lastTimestamp = events.length > 0 ? events[events.length - 1].timestamp : 0;

      const interval = setInterval(async () => {
        if (closed) { clearInterval(interval); return; }
        try {
          const current = await getEvents();
          const newEvents = current.filter(e => e.timestamp > lastTimestamp);
          if (newEvents.length > 0) {
            lastTimestamp = newEvents[newEvents.length - 1].timestamp;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(newEvents)}\n\n`));
          }
        } catch {
          // ignore
        }
      }, 3000);

      // Cleanup after 5 minutes (prevent zombie connections)
      setTimeout(() => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch {}
      }, 5 * 60 * 1000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ── POST: Add a new event ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pseudo, event, level } = body;

    if (!pseudo || !event || typeof level !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const newEvent: LiveFeedEvent = {
      pseudo: String(pseudo).slice(0, 20),
      event: String(event).slice(0, 80),
      level: Math.max(0, Math.min(level, 25)),
      timestamp: Date.now(),
    };

    const events = await getEvents();
    events.push(newEvent);
    await setEvents(events);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
