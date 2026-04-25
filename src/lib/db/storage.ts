// Storage-Quota + Persistence-API-Helfer.

export interface StorageInfo {
  usage: number;
  quota: number;
  percent: number;
  persisted: boolean;
}

export async function estimateStorage(): Promise<StorageInfo | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  const percent = quota > 0 ? usage / quota : 0;
  let persisted = false;
  try {
    persisted = (await navigator.storage.persisted?.()) ?? false;
  } catch {
    persisted = false;
  }
  return { usage, quota, percent, persisted };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}
