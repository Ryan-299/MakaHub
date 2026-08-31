import { convexClient, isConvexConfigured } from './convex';
import { api } from '../../convex/_generated/api';

/**
 * Request a single-use upload URL from Convex storage.
 */
export async function generateConvexUploadUrl(): Promise<string> {
  if (!isConvexConfigured || !convexClient) {
    throw new Error('Convex is not configured. Please set VITE_CONVEX_URL in environment.');
  }
  return await convexClient.mutation(api.properties.generateUploadUrl, {});
}

/**
 * Upload a single File object directly to Convex File Storage.
 * Returns the permanent storageId.
 */
export async function uploadFileToConvex(file: File): Promise<string> {
  const uploadUrl = await generateConvexUploadUrl();
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload to Convex failed with HTTP status ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  if (!json || !json.storageId) {
    throw new Error('Upload succeeded but no storageId was returned by Convex.');
  }

  return json.storageId as string;
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
