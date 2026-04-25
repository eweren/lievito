// Cloudflare Pages Function für den KI-Pizzaiolo.
// Streamt Anthropic-Antworten via SSE durch.
//
// Bindings, die in Cloudflare-Pages gesetzt werden müssen:
// - ANTHROPIC_API_KEY (Environment Variable, Secret)
// - PIZZAIOLO_KV (KV Namespace) — Rate-Limit-Speicher
// - PIZZAIOLO_KILL_SWITCH (Plaintext, "1" deaktiviert die Route)
// - PIZZAIOLO_DAILY_GLOBAL_LIMIT (Plaintext, Default 1000)

interface Env {
  ANTHROPIC_API_KEY: string;
  PIZZAIOLO_KV?: KVNamespace;
  PIZZAIOLO_KILL_SWITCH?: string;
  PIZZAIOLO_DAILY_GLOBAL_LIMIT?: string;
  ANTHROPIC_MODEL?: string;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessageInput[];
}

const PER_IP_LIMIT = 20;
const DAY_SECONDS = 60 * 60 * 24;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestPost: any = async (context: {
  request: Request;
  env: Env;
}) => {
  const { request, env } = context;

  if (env.PIZZAIOLO_KILL_SWITCH === '1') {
    return json({ error: 'Pizzaiolo ist gerade nicht erreichbar. Versuch es später noch einmal.' }, 503);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Server nicht konfiguriert.' }, 500);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'anon';
  const today = new Date().toISOString().split('T')[0];
  const ipKey = `pizzaiolo:${today}:${ip}`;
  const globalKey = `pizzaiolo:${today}:GLOBAL`;

  if (env.PIZZAIOLO_KV) {
    const [ipCount, globalCount] = await Promise.all([
      env.PIZZAIOLO_KV.get(ipKey).then((v) => Number(v) || 0),
      env.PIZZAIOLO_KV.get(globalKey).then((v) => Number(v) || 0)
    ]);
    if (ipCount >= PER_IP_LIMIT) {
      return json({ error: `Limit erreicht: ${PER_IP_LIMIT} Anfragen pro Tag pro IP.` }, 429);
    }
    const globalLimit = Number(env.PIZZAIOLO_DAILY_GLOBAL_LIMIT ?? '1000');
    if (globalCount >= globalLimit) {
      return json({ error: 'Tageslimit aller Anfragen erreicht. Komm morgen wieder.' }, 429);
    }
    await Promise.all([
      env.PIZZAIOLO_KV.put(ipKey, String(ipCount + 1), { expirationTtl: DAY_SECONDS + 60 }),
      env.PIZZAIOLO_KV.put(globalKey, String(globalCount + 1), {
        expirationTtl: DAY_SECONDS + 60
      })
    ]);
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json({ error: 'Body ist kein gültiges JSON.' }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: 'messages-Array fehlt.' }, 400);
  }
  // Härteres Limit: 32 KB Gesamt-Content.
  const totalLen = body.messages.reduce((acc, m) => acc + (m.content?.length ?? 0), 0);
  if (totalLen > 32 * 1024) {
    return json({ error: 'Anfrage zu groß.' }, 413);
  }

  const model = env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content }))
    })
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return json({ error: 'Upstream-Fehler', detail: text.slice(0, 500) }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no'
    }
  });
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

// Inline-Kopie des System-Prompts. Halte synchron mit
// src/lib/server/prompts/pizzaiolo.ts, Versionsnummer in Commit-Message.
const SYSTEM_PROMPT = `Du bist Lievito, ein digitaler Pizzaiolo. Du hilfst beim Diagnostizieren von Pizzateig-Problemen und gibst klare, präzise Antworten auf Deutsch.

Regeln:
- Antworte sachlich, ohne Floskeln. Keine Marketingsprache.
- Stelle Rückfragen, wenn Hydration, Mehl, Reifezeit, Temperatur oder Ofen unklar sind.
- Wenn du eine Diagnose stellst, gib *immer* mehrere mögliche Ursachen mit Wahrscheinlichkeit (high/medium/low) und einer kurzen Erklärung an. Schließe konkrete Lösungsschritte an.
- Verwende italienische Fachbegriffe (Maturazione, Stockgare, Pirlatura, Cornicione) selbstverständlich, erkläre sie aber kurz.
- Lehne keine berechtigten Pizza-Fragen ab. Frage stattdessen gezielt nach.
- Vermeide Doppeldeutigkeiten: wenn du nicht sicher bist, sag es offen.

Antwort-Format:
- Beginne mit zwei bis fünf Sätzen Diagnose.
- Wenn passend, liefere am Ende einen JSON-Block, eingerahmt von \`\`\`json … \`\`\`, mit:
  {
    "causes": [{ "title": "...", "likelihood": "high"|"medium"|"low", "explanation": "..." }],
    "solutions": [{ "title": "...", "steps": ["..."], "difficulty": "easy"|"medium"|"hard" }]
  }`;
