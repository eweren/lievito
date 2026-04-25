// Foto-Verarbeitung im Browser.
// Resize auf max. 1600 px lange Kante, JPEG-Qualität 0.8. Speicherung als
// Blob in IndexedDB – nie als Base64, das verdreifacht die Größe.

import type { PhotoEntry } from '$lib/types/schema';

const MAX_DIMENSION = 1600;
const QUALITY = 0.8;

export async function processImageFile(file: File, bakeId: string): Promise<PhotoEntry> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scale(bitmap.width, bitmap.height, MAX_DIMENSION);

  const canvas = canHaveOffscreen()
    ? new OffscreenCanvas(width, height)
    : (() => {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        return c;
      })();
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error('Canvas-Kontext nicht verfügbar');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY })
      : await new Promise<Blob>((resolve, reject) =>
          (canvas as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error('toBlob lieferte null'))),
            'image/jpeg',
            QUALITY
          )
        );

  return {
    id: crypto.randomUUID(),
    bakeId,
    blob,
    width,
    height,
    takenAt: file.lastModified ?? Date.now()
  };
}

function scale(
  w: number,
  h: number,
  max: number
): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const factor = w >= h ? max / w : max / h;
  return { width: Math.round(w * factor), height: Math.round(h * factor) };
}

function canHaveOffscreen(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

export function blobToObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
