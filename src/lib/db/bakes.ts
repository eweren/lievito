// CRUD für das Backjournal. Keine Magic, nur Wrapper um die
// Dexie-Tabellen, mit `schemaVersion` und Storage-Persist auf erstem
// Eintrag.

import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { BakeJournalEntry, OvenType, PhotoEntry } from '$lib/types/schema';
import { getDb } from './index';
import { requestPersistentStorage } from './storage';

export interface NewBakeInput {
  bakedAt: number;
  recipeId?: string;
  rating: BakeJournalEntry['rating'];
  notes: string;
  ovenType: OvenType;
  ovenTemp?: number;
  bakingTimeSec?: number;
  tags: string[];
  calculation?: BakeJournalEntry['calculation'];
}

export async function listBakes(): Promise<BakeJournalEntry[]> {
  const db = getDb();
  return db.bakes.orderBy('bakedAt').reverse().toArray();
}

export async function getBake(id: string): Promise<BakeJournalEntry | undefined> {
  return getDb().bakes.get(id);
}

export async function createBake(
  input: NewBakeInput,
  photos: PhotoEntry[] = []
): Promise<BakeJournalEntry> {
  const db = getDb();
  const id = crypto.randomUUID();
  const entry: BakeJournalEntry = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id,
    createdAt: Date.now(),
    bakedAt: input.bakedAt,
    recipeId: input.recipeId,
    calculation: input.calculation,
    rating: input.rating,
    notes: input.notes,
    photoIds: photos.map((p) => p.id),
    ovenType: input.ovenType,
    ovenTemp: input.ovenTemp,
    bakingTimeSec: input.bakingTimeSec,
    tags: input.tags
  };

  await db.transaction('rw', db.bakes, db.photos, async () => {
    await db.bakes.add(entry);
    if (photos.length) {
      await db.photos.bulkAdd(photos.map((p) => ({ ...p, bakeId: id })));
    }
  });

  // Erste echte Daten → Persistent Storage anfragen.
  const total = await db.bakes.count();
  if (total === 1) {
    requestPersistentStorage().catch(() => undefined);
  }

  return entry;
}

export async function updateBake(
  id: string,
  patch: Partial<Omit<BakeJournalEntry, 'id' | 'createdAt' | 'schemaVersion'>>
): Promise<void> {
  await getDb().bakes.update(id, patch);
}

export async function deleteBake(id: string): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.bakes, db.photos, async () => {
    await db.photos.where('bakeId').equals(id).delete();
    await db.bakes.delete(id);
  });
}

export async function getPhotosForBake(bakeId: string): Promise<PhotoEntry[]> {
  return getDb().photos.where('bakeId').equals(bakeId).toArray();
}

export async function addPhotosToBake(bakeId: string, photos: PhotoEntry[]): Promise<void> {
  const db = getDb();
  await db.transaction('rw', db.bakes, db.photos, async () => {
    const bake = await db.bakes.get(bakeId);
    if (!bake) throw new Error('Bake existiert nicht');
    await db.photos.bulkAdd(photos.map((p) => ({ ...p, bakeId })));
    await db.bakes.update(bakeId, {
      photoIds: [...bake.photoIds, ...photos.map((p) => p.id)]
    });
  });
}
