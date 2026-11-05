import { convexClient, isConvexConfigured } from './convex';
import { api } from '../../convex/_generated/api';

// ---------------------------------------------------------------------------
// Uploads that survive slow / unstable connections:
//   1. Photos are shrunk on the phone before uploading (e.g. 5 MB -> ~300 KB),
//      with no visible difference on screen.
//   2. A failed upload is retried automatically (up to 3 tries in total),
//      each time with a fresh upload ticket.
//   3. If it still fails, the person gets a clear message instead of
//      "Failed to fetch".
// ---------------------------------------------------------------------------

const MAX_IMAGE_SIDE = 1600; // pixels: plenty for phones and laptops
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESSION_BELOW = 300 * 1024; // already small: upload as-is
const MAX_ATTEMPTS = 3;

const UNREADABLE_PHOTO_ERROR =
  "We couldn't read this photo from your phone. Please remove it and select it again " +
  '(or take a new one) — nothing you typed has been lost.';

const FRIENDLY_UPLOAD_ERROR =
  "We couldn't upload your photo because the connection is slow or unstable. " +
  'Please check your connection and try again — nothing you typed has been lost.';

/**
 * Request a single-use upload URL from Convex storage.
 */
export async function generateConvexUploadUrl(): Promise<string> {
  if (!isConvexConfigured || !convexClient) {
    throw new Error('Convex is not configured. Please set VITE_CONVEX_URL in environment.');
  }
  return await convexClient.mutation(api.properties.generateUploadUrl, {});
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Load an image file into something we can draw, keeping phone photos the
// right way up (phones store rotation separately from the pixels).
async function loadImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Fall back to an <img> below.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Shrink a photo before upload. Anything that isn't a normal photo (videos,
 * GIFs, SVGs, small images), or anything that goes wrong, is uploaded
 * unchanged — this can never block an upload.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  const compressible = ['image/jpeg', 'image/png', 'image/webp'];

  if (!compressible.includes(file.type) || file.size < SKIP_COMPRESSION_BELOW) {
    return file;
  }

  try {
    const image = await loadImage(file);

    try {
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) return file;

      // JPEG for photos. PNG/WebP may have transparency (e.g. logos), so
      // those become WebP, which keeps it.
      const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';

      if (outputType === 'image/jpeg') {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(image.source, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, outputType, JPEG_QUALITY)
      );

      // Keep the original if the browser couldn't make the format we asked
      // for, or if the "smaller" version isn't actually smaller.
      if (!blob || blob.type !== outputType || blob.size >= file.size) {
        return file;
      }

      const extension = outputType === 'image/jpeg' ? 'jpg' : 'webp';
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';

      return new File([blob], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now(),
      });
    } finally {
      image.close();
    }
  } catch (error) {
    console.warn('Rentike: photo could not be shrunk, uploading the original.', error);
    return file;
  }
}

/**
 * Upload a single File object directly to Convex File Storage.
 * Returns the permanent storageId.
 */
export async function uploadFileToConvex(file: File): Promise<string> {
  const compressed = await compressImageIfNeeded(file);

  // Copy the file into the app's memory before sending it. Some phones'
  // gallery apps (seen on Infinix) hand the browser a file that changes or
  // disappears after it's picked; uploading straight from it then fails
  // with "Failed to fetch". A copy in memory can't change underneath us.
  let upload: File;

  try {
    const bytes = await compressed.arrayBuffer();
    upload = new File([bytes], compressed.name, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Rentike: the selected file could not be read:', error);
    throw new Error(UNREADABLE_PHOTO_ERROR);
  }

  // Give big files more time on slow connections (at least 60 seconds,
  // assuming as little as ~50 KB per second).
  const timeoutMs = Math.max(60_000, Math.ceil(upload.size / 50_000) * 1000);

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // A fresh upload ticket every attempt (tickets can expire).
      const uploadUrl = await generateConvexUploadUrl();

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': upload.type || 'application/octet-stream',
        },
        body: upload,
        signal: controller.signal,
      });

      if (!response.ok) {
        // 4xx (except timeouts / rate limits) won't fix itself by retrying.
        const retryable = response.status >= 500 || response.status === 408 || response.status === 429;
        lastError = new Error(`Upload to Convex failed with HTTP status ${response.status}: ${response.statusText}`);

        if (!retryable) break;
      } else {
        const json = await response.json();

        if (!json || !json.storageId) {
          throw new Error('Upload succeeded but no storageId was returned by Convex.');
        }

        return json.storageId as string;
      }
    } catch (error) {
      // Network drop, timeout, or the upload ticket request failed.
      lastError = error;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < MAX_ATTEMPTS) {
      await wait(1000 * attempt); // 1s, then 2s
    }
  }

  console.error('Rentike: upload failed after retries:', lastError);
  throw new Error(FRIENDLY_UPLOAD_ERROR);
}

/**
 * Upload an array of File objects to Convex File Storage.
 * Reports progress through an optional callback.
 */
export async function uploadMultipleFilesToConvex(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const storageIds: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const storageId = await uploadFileToConvex(file);
    storageIds.push(storageId);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return storageIds;
}