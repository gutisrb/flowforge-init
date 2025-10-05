/**
 * Client-side image compression for webhook payloads.
 * - Resizes to maxW/maxH while keeping aspect.
 * - Re-encodes as JPEG at the desired quality.
 * - Enforces a total size budget (bytes) across all images.
 * - Returns a new array of File objects in the same order.
 *
 * Usage:
 *   const smallFiles = await compressFilesForBudget(files, {
 *     maxW: 1280, maxH: 1280, quality: 0.72, budgetBytes: 4.9 * 1024 * 1024
 *   });
 *   // then append smallFiles to FormData with your existing field names
 */

export type CompressOptions = {
  maxW?: number;
  maxH?: number;
  quality?: number;     // 0..1
  budgetBytes?: number; // total cap for all files
};

async function resizeAndEncodeJPEG(file: File, maxW: number, maxH: number, quality: number): Promise<File> {
  // Decode
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);

  // Draw
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D not available');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  // Encode
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality);
  });

  const name = file.name.replace(/\.\w+$/, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}

export async function compressFilesForBudget(
  files: File[],
  opts: CompressOptions = {},
): Promise<File[]> {
  const {
    maxW = 1280,
    maxH = 1280,
    quality = 0.72,
    budgetBytes = 4.9 * 1024 * 1024, // keep below Make's 5MB webhook cap
  } = opts;

  const out: File[] = [];
  let total = 0;

  for (const f of files) {
    // Only compress images; pass through other files (rare)
    const isImage = /^image\//i.test(f.type);
    const candidate = isImage ? await resizeAndEncodeJPEG(f, maxW, maxH, quality) : f;

    if (total + candidate.size > budgetBytes) {
      // stop before exceeding the cap
      break;
    }
    out.push(candidate);
    total += candidate.size;
  }
  return out;
}

/**
 * Helper that takes the original list of files (and their associated FormData keys),
 * compresses the files, and returns a list of { key, file } keeping the same keys/order.
 */
export async function compressMappedEntries(
  entries: { key: string; file: File }[],
  opts: CompressOptions = {},
): Promise<{ key: string; file: File }[]> {
  const files = entries.map(e => e.file);
  const compressed = await compressFilesForBudget(files, opts);
  // Keep same keys for the compressed ones we could include
  return compressed.map((file, idx) => ({ key: entries[idx].key, file }));
}
