// JSON-Export/Import-Bundle. Fotos werden hier als DataURL serialisiert,
// damit der Export ein einziger File ist. ZIP-Variante kommt in Phase 4.

import { CURRENT_SCHEMA_VERSION } from '$lib/types/schema';
import type { ExportBundle, Settings } from '$lib/types/schema';
import { getDb } from './index';
import { blobToDataURL, dataUrlToBlob } from './photos';

export const APP_VERSION = '0.1.0';

export async function buildExportBundle(): Promise<ExportBundle> {
  const db = getDb();
  const [bakes, photos, timers, chats, settings] = await Promise.all([
    db.bakes.toArray(),
    db.photos.toArray(),
    db.timers.toArray(),
    db.chats.toArray(),
    db.settings.toArray()
  ]);

  const photosWithDataUrl = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      bakeId: p.bakeId,
      dataUrl: await blobToDataURL(p.blob),
      width: p.width,
      height: p.height,
      takenAt: p.takenAt
    }))
  );

  const settingsRow = (settings[0] ?? {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    units: 'metric',
    theme: 'auto',
    defaultStyle: 'neapoletana'
  }) as Settings;

  return {
    exportVersion: 1,
    exportedAt: Date.now(),
    appVersion: APP_VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    bakes,
    photos: photosWithDataUrl,
    timerSessions: timers,
    chatMessages: chats.length ? chats : undefined,
    settings: settingsRow
  };
}

export async function downloadExport(): Promise<string> {
  const bundle = await buildExportBundle();
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const today = new Date().toISOString().split('T')[0];
  const filename = `lievito-export-${today}.json`;
  triggerDownload(blob, filename);
  return filename;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ImportMode = 'merge' | 'replace';

export interface ImportSummary {
  bakesAdded: number;
  bakesSkipped: number;
  photosAdded: number;
  timersAdded: number;
  chatsAdded: number;
}

export async function importBundle(
  bundle: ExportBundle,
  mode: ImportMode = 'merge'
): Promise<ImportSummary> {
  if (bundle.exportVersion !== 1) {
    throw new Error(`Unbekannte Export-Version: ${bundle.exportVersion}`);
  }
  const db = getDb();
  const summary: ImportSummary = {
    bakesAdded: 0,
    bakesSkipped: 0,
    photosAdded: 0,
    timersAdded: 0,
    chatsAdded: 0
  };

  await db.transaction(
    'rw',
    [db.bakes, db.photos, db.timers, db.chats, db.settings],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.bakes.clear(),
          db.photos.clear(),
          db.timers.clear(),
          db.chats.clear(),
          db.settings.clear()
        ]);
      }

      const existingBakeIds = new Set(await db.bakes.toCollection().primaryKeys());
      for (const bake of bundle.bakes) {
        if (existingBakeIds.has(bake.id)) {
          summary.bakesSkipped++;
          continue;
        }
        await db.bakes.put(bake);
        summary.bakesAdded++;
      }

      const existingPhotoIds = new Set(await db.photos.toCollection().primaryKeys());
      for (const photo of bundle.photos) {
        if (existingPhotoIds.has(photo.id)) continue;
        const blob = await dataUrlToBlob(photo.dataUrl);
        await db.photos.put({
          id: photo.id,
          bakeId: photo.bakeId,
          blob,
          width: photo.width,
          height: photo.height,
          takenAt: photo.takenAt
        });
        summary.photosAdded++;
      }

      const existingTimerIds = new Set(await db.timers.toCollection().primaryKeys());
      for (const timer of bundle.timerSessions) {
        if (existingTimerIds.has(timer.id)) continue;
        await db.timers.put(timer);
        summary.timersAdded++;
      }

      if (bundle.chatMessages) {
        const existingChatIds = new Set(await db.chats.toCollection().primaryKeys());
        for (const chat of bundle.chatMessages) {
          if (existingChatIds.has(chat.id)) continue;
          await db.chats.put(chat);
          summary.chatsAdded++;
        }
      }

      if (bundle.settings) {
        await db.settings.put({ id: 'main', ...bundle.settings });
      }
    }
  );

  return summary;
}

export async function readImportFile(file: File): Promise<ExportBundle> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Datei ist kein gültiges JSON.');
  }
  validateBundleShape(parsed);
  return parsed as ExportBundle;
}

function validateBundleShape(value: unknown): asserts value is ExportBundle {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Export ist kein Objekt.');
  }
  const v = value as Record<string, unknown>;
  if (v.exportVersion !== 1) throw new Error('Unbekannte Export-Version.');
  if (!Array.isArray(v.bakes)) throw new Error('Bakes-Array fehlt.');
  if (!Array.isArray(v.photos)) throw new Error('Fotos-Array fehlt.');
}
