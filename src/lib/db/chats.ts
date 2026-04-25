// Chat-Verlauf in IndexedDB. Optional: Nutzer kann opt-out (Switch
// im UI), dann wird nichts persistiert.

import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { ChatMessage, Diagnosis } from '$lib/types/schema';
import { getDb } from './index';

export async function listChatSessions(): Promise<{ sessionId: string; lastAt: number; firstUser: string }[]> {
  const all = await getDb().chats.toArray();
  const sessions = new Map<string, { sessionId: string; lastAt: number; firstUser: string }>();
  for (const m of all.sort((a, b) => a.createdAt - b.createdAt)) {
    const existing = sessions.get(m.sessionId);
    if (!existing) {
      sessions.set(m.sessionId, {
        sessionId: m.sessionId,
        lastAt: m.createdAt,
        firstUser: m.role === 'user' ? m.content : ''
      });
    } else {
      existing.lastAt = Math.max(existing.lastAt, m.createdAt);
      if (!existing.firstUser && m.role === 'user') existing.firstUser = m.content;
    }
  }
  return [...sessions.values()].sort((a, b) => b.lastAt - a.lastAt);
}

export async function listMessages(sessionId: string): Promise<ChatMessage[]> {
  return getDb()
    .chats.where('sessionId')
    .equals(sessionId)
    .sortBy('createdAt');
}

export async function appendMessage(
  sessionId: string,
  role: ChatMessage['role'],
  content: string,
  diagnosis?: Diagnosis
): Promise<ChatMessage> {
  const msg: ChatMessage = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    sessionId,
    role,
    content,
    createdAt: Date.now(),
    diagnosis
  };
  await getDb().chats.add(msg);
  return msg;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await getDb().chats.where('sessionId').equals(sessionId).delete();
}
