// Anthropic-Streaming-Client für die Browser-Seite.
// Nimmt den Cloudflare-Pages-Function-Endpunkt und parst Server-Sent Events
// vom Anthropic-Format (`event: content_block_delta`).

export interface SSEEvent {
  event: string;
  data: string;
}

export interface ChatStreamOptions {
  endpoint?: string;
  signal?: AbortSignal;
  onDelta(text: string): void;
  onMessageStart?: () => void;
  onMessageEnd?: () => void;
  onError?: (err: Error) => void;
}

export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options: ChatStreamOptions
): Promise<void> {
  const endpoint = options.endpoint ?? '/api/pizzaiolo';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: options.signal
  });

  if (!response.ok) {
    let detail = '';
    try {
      const j = (await response.json()) as { error?: string };
      detail = j.error ?? '';
    } catch {
      detail = await response.text().catch(() => '');
    }
    throw new Error(detail || `HTTP ${response.status}`);
  }
  if (!response.body) throw new Error('Keine Streaming-Antwort empfangen.');

  options.onMessageStart?.();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const evt = parseSSE(raw);
      if (!evt) continue;
      handleEvent(evt, options);
    }
  }

  options.onMessageEnd?.();
}

function parseSSE(raw: string): SSEEvent | null {
  let event = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data) return null;
  return { event, data };
}

function handleEvent(evt: SSEEvent, opts: ChatStreamOptions) {
  if (evt.event !== 'content_block_delta') return;
  try {
    const parsed = JSON.parse(evt.data) as {
      delta?: { type?: string; text?: string };
    };
    const text = parsed.delta?.type === 'text_delta' ? parsed.delta.text : undefined;
    if (text) opts.onDelta(text);
  } catch {
    /* tolerate single bad event */
  }
}
