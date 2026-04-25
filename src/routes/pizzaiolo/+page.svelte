<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { streamChat } from '$lib/chat/client';
  import { parseDiagnosis, stripDiagnosisBlock } from '$lib/chat/parse-diagnosis';
  import { appendMessage, listMessages } from '$lib/db/chats';
  import type { ChatMessage } from '$lib/types/schema';

  const STORAGE_AGREE = 'lievito.pizzaiolo.aiTerms';
  const STORAGE_PERSIST = 'lievito.pizzaiolo.persist';

  let acceptedAi = $state(false);
  let persistChat = $state(true);
  let sessionId = $state('');
  let messages = $state<ChatMessage[]>([]);
  let draft = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);
  let streamBuffer = $state('');
  let inputEl: HTMLTextAreaElement | undefined = $state();

  onMount(async () => {
    acceptedAi = localStorage.getItem(STORAGE_AGREE) === '1';
    const persistRaw = localStorage.getItem(STORAGE_PERSIST);
    if (persistRaw === '0') persistChat = false;
    sessionId =
      sessionStorage.getItem('lievito.pizzaiolo.session') ?? newSession();
    if (persistChat) {
      messages = await listMessages(sessionId);
    }
  });

  function newSession() {
    const id = crypto.randomUUID();
    sessionStorage.setItem('lievito.pizzaiolo.session', id);
    return id;
  }

  function acceptAi() {
    acceptedAi = true;
    localStorage.setItem(STORAGE_AGREE, '1');
  }

  function togglePersist() {
    persistChat = !persistChat;
    localStorage.setItem(STORAGE_PERSIST, persistChat ? '1' : '0');
  }

  async function send(e?: Event) {
    e?.preventDefault();
    if (!draft.trim() || busy) return;
    error = null;
    const content = draft.trim();
    draft = '';
    streamBuffer = '';

    const userMsg: ChatMessage = {
      schemaVersion: 1,
      id: crypto.randomUUID(),
      sessionId,
      role: 'user',
      content,
      createdAt: Date.now()
    };
    messages = [...messages, userMsg];
    if (persistChat) {
      await appendMessage(sessionId, 'user', content);
    }

    busy = true;
    try {
      await streamChat(
        messages.map((m) => ({ role: m.role, content: m.content })),
        {
          onDelta: (text) => {
            streamBuffer += text;
          }
        }
      );
      const diagnosis = parseDiagnosis(streamBuffer) ?? undefined;
      const visible = diagnosis ? stripDiagnosisBlock(streamBuffer) : streamBuffer;
      const assistant: ChatMessage = {
        schemaVersion: 1,
        id: crypto.randomUUID(),
        sessionId,
        role: 'assistant',
        content: visible,
        createdAt: Date.now(),
        diagnosis
      };
      messages = [...messages, assistant];
      if (persistChat) {
        await appendMessage(sessionId, 'assistant', visible, diagnosis);
      }
    } catch (e) {
      error = (e as Error).message ?? 'Anfrage fehlgeschlagen';
    } finally {
      busy = false;
      streamBuffer = '';
      await tick();
      inputEl?.focus();
    }
  }

  async function reset() {
    sessionId = newSession();
    messages = [];
    streamBuffer = '';
  }
</script>

<svelte:head>
  <title>Pizzaiolo – Lievito</title>
</svelte:head>

<div class="container chat">
  <header class="page-header">
    <p class="kicker">Phase 3 · Contorno</p>
    <h1>Pizzaiolo</h1>
    <p class="lead">
      Beschreib dein Teig-Problem, bekomm strukturierte Diagnose. Die KI sieht nur das,
      was du tippst – kein Ortsverlauf, keine IDs.
    </p>
  </header>

  {#if !acceptedAi}
    <Card title="Hinweis vor der ersten Nutzung">
      <p>
        Anfragen an den Pizzaiolo werden an die Anthropic-API gesendet. Inhalt
        deiner Nachricht verlässt dabei dein Gerät. Antworten werden lokal
        gestreamt, optional auch im Backjournal gespeichert.
      </p>
      <p>Tageslimit: 20 Anfragen pro IP. Kein Account, kein Login.</p>
      <p>
        <Button onclick={acceptAi}>Verstanden, weiter</Button>
      </p>
    </Card>
  {:else}
    <div class="settings">
      <label>
        <input type="checkbox" checked={persistChat} onchange={togglePersist} />
        Verlauf lokal speichern
      </label>
      <button type="button" onclick={reset}>Neue Sitzung</button>
    </div>

    <ul class="messages" aria-live="polite">
      {#each messages as msg (msg.id)}
        <li class="msg" data-role={msg.role}>
          <strong>{msg.role === 'user' ? 'Du' : 'Pizzaiolo'}</strong>
          <p>{msg.content}</p>
          {#if msg.diagnosis}
            <div class="diagnosis">
              <h4>Mögliche Ursachen</h4>
              <ul>
                {#each msg.diagnosis.causes as c, i (i)}
                  <li>
                    <span class="badge {c.likelihood}">{c.likelihood}</span>
                    <strong>{c.title}</strong>
                    <span class="explain">{c.explanation}</span>
                  </li>
                {/each}
              </ul>
              <h4>Lösungen</h4>
              <ul>
                {#each msg.diagnosis.solutions as s, i (i)}
                  <li>
                    <span class="badge {s.difficulty}">{s.difficulty}</span>
                    <strong>{s.title}</strong>
                    <ol>
                      {#each s.steps as step, j (j)}<li>{step}</li>{/each}
                    </ol>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </li>
      {/each}
      {#if streamBuffer}
        <li class="msg" data-role="assistant">
          <strong>Pizzaiolo</strong>
          <p class="streaming">{streamBuffer}</p>
        </li>
      {/if}
    </ul>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <form onsubmit={send} class="composer">
      <textarea
        bind:this={inputEl}
        bind:value={draft}
        rows="3"
        placeholder="Mein Cornicione blieb flach. Tipo 00, 65 % Hydration, 24 h bei 18 °C…"
        disabled={busy}
      ></textarea>
      <Button type="submit" disabled={busy || draft.trim().length === 0}>
        {busy ? 'Pizzaiolo denkt…' : 'Fragen'}
      </Button>
    </form>
  {/if}
</div>

<style>
  .chat {
    max-width: 50rem;
  }
  .page-header {
    margin-bottom: var(--space-6);
  }
  .kicker {
    color: var(--color-accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .lead {
    color: var(--color-text-muted);
    margin-top: var(--space-2);
  }
  .settings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
  .settings button {
    color: var(--color-text-muted);
  }
  .settings button:hover {
    color: var(--color-text);
  }
  .messages {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-3);
    display: grid;
    gap: var(--space-3);
  }
  .msg {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }
  .msg[data-role='user'] {
    background: color-mix(in oklch, var(--color-accent), var(--color-surface) 92%);
  }
  .msg strong {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    display: block;
    margin-bottom: var(--space-1);
  }
  .msg p {
    white-space: pre-line;
  }
  .streaming::after {
    content: '▌';
    margin-left: 0.15em;
    color: var(--color-accent);
    animation: blink 1s steps(2, start) infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
  .diagnosis {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px dashed var(--color-border);
  }
  .diagnosis h4 {
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    margin-block: var(--space-2);
  }
  .diagnosis ul,
  .diagnosis ol {
    padding-left: 1rem;
    display: grid;
    gap: var(--space-2);
  }
  .badge {
    display: inline-block;
    padding: 0.05em 0.5em;
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: var(--space-2);
    color: var(--color-pergamena);
    background: var(--color-text-muted);
  }
  .badge.high,
  .badge.hard {
    background: var(--color-danger);
  }
  .badge.medium {
    background: var(--color-warning);
    color: var(--color-forno);
  }
  .badge.low,
  .badge.easy {
    background: var(--color-success);
  }
  .explain {
    color: var(--color-text-muted);
    margin-left: var(--space-2);
  }
  .composer {
    display: grid;
    gap: var(--space-2);
  }
  textarea {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    font: inherit;
    color: var(--color-text);
    resize: vertical;
  }
  .error {
    color: var(--color-danger);
    margin-bottom: var(--space-3);
  }
</style>
