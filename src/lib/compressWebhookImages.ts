export type CompressOptions = {
  maxW?: number;
  maxH?: number;
  quality?: number;     // 0..1
  budgetBytes?: number; // total cap for all files
};

async function resizeAndEncodeJPEG(file: File, maxW: number, maxH: number, quality: number): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width, maxH / bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D not available');
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality);
  });

  const name = file.name.replace(/\.\w+$/, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}

/**
 * Compress an array of image Files into JPEGs under a total-size budget.
 * Returns as many files (in order) as fit under `budgetBytes`.
 */
export async function compressFilesForBudget(
  files: File[],
  opts: CompressOptions = {},
): Promise<File[]> {
  const {
    maxW = 1280,
    maxH = 1280,
    quality = 0.72,
    budgetBytes = 4.9 * 1024 * 1024, // safety margin under Make's 5MB webhook limit
  } = opts;

  const out: File[] = [];
  let total = 0;

  for (const f of files) {
    const isImage = /^image\//i.test(f.type);
    const candidate = isImage ? await resizeAndEncodeJPEG(f, maxW, maxH, quality) : f;
    if (total + candidate.size > budgetBytes) break;
    out.push(candidate);
    total += candidate.size;
  }
  return out;
}

/**
 * Keep existing form keys while compressing. Provide entries like:
 *   [{ key: 'image1', file }, { key: 'image2', file }, ...]
 * Returns the same shape with compressed files, truncated to fit budget.
 */
export async function compressMappedEntries(
  entries: { key: string; file: File }[],
  opts: CompressOptions = {},
): Promise<{ key: string; file: File }[]> {
  const files = entries.map(e => e.file);
  const compressed = await compressFilesForBudget(files, opts);
  return compressed.map((file, idx) => ({ key: entries[idx].key, file }));
}
