// Dexie-Datenbank für Lievito.
// Eine Datei, eine Wahrheit: Schema-Version, Tabellen, Migrations.
// Schemaänderungen sind additiv oder transformativ – nie destruktiv.

import Dexie, { type Table } from 'dexie';
import type {
  BakeJournalEntry,
  ChatMessage,
  PhotoEntry,
  Settings,
  TimerSession
} from '$lib/types/schema';

export const DB_VERSION = 1;
export const DB_NAME = 'lievito';

export class LievitoDB extends Dexie {
  bakes!: Table<BakeJournalEntry, string>;
  photos!: Table<PhotoEntry, string>;
  timers!: Table<TimerSession, string>;
  chats!: Table<ChatMessage, string>;
  settings!: Table<Settings & { id: string }, string>;

  constructor() {
    super(DB_NAME);

    // V1 — initiales Schema. Phase-2-Spec aus der Roadmap.
    this.version(1).stores({
      bakes: 'id, bakedAt, recipeId, ovenType, *tags',
      photos: 'id, bakeId, takenAt',
      timers: 'id, status, startedAt',
      chats: 'id, sessionId, createdAt',
      settings: 'id'
    });

    // Beispiel-Migration für die spätere V2 (auskommentiert; Skelett).
    // this.version(2)
    //   .stores({ bakes: 'id, bakedAt, recipeId, ovenType, *tags, archivedAt' })
    //   .upgrade(async (tx) => {
    //     await tx.table<BakeJournalEntry>('bakes').toCollection().modify((b) => {
    //       b.schemaVersion = 2;
    //     });
    //   });
  }
}

let _db: LievitoDB | null = null;

export function getDb(): LievitoDB {
  if (typeof window === 'undefined') {
    throw new Error('Datenbank nur im Browser verfügbar');
  }
  if (!_db) _db = new LievitoDB();
  return _db;
}

export async function exportAllForBackup(): Promise<{
  bakes: BakeJournalEntry[];
  photos: PhotoEntry[];
  timers: TimerSession[];
  chats: ChatMessage[];
  settings: (Settings & { id: string })[];
}> {
  const db = getDb();
  const [bakes, photos, timers, chats, settings] = await Promise.all([
    db.bakes.toArray(),
    db.photos.toArray(),
    db.timers.toArray(),
    db.chats.toArray(),
    db.settings.toArray()
  ]);
  return { bakes, photos, timers, chats, settings };
}

/**
 * Wird vor jeder Migration aufgerufen. Speichert ein vollständiges
 * Backup im localStorage (klein) bzw. fordert beim Nutzer Download an.
 */
export async function preMigrationBackup(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const dump = await exportAllForBackup();
    // Fotos werden hier ausgelassen (zu groß für localStorage); JSON-Dump
    // genügt zum Wiederherstellen von Metadaten, falls die Migration scheitert.
    const safe = { ...dump, photos: dump.photos.map(({ blob: _b, ...rest }) => rest) };
    localStorage.setItem('lievito.preMigrationBackup', JSON.stringify(safe));
    localStorage.setItem('lievito.preMigrationBackupAt', String(Date.now()));
  } catch (err) {
    console.warn('[db] preMigrationBackup fehlgeschlagen', err);
  }
}
