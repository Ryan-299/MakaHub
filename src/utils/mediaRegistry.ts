/**
 * Session Media Registry
 * 
 * Tracks submitted media object URLs (videos and images) for the active browser session
 * to prevent them from being revoked when unmounting temporary creation forms, while
 * properly cleaning up discarded or replaced temporary draft media.
 */

const submittedSessionMedia = new Set<string>();
const sessionVideoBlobs = new Map<string, Blob>();

/**
 * Register media URLs that belong to an approved/submitted property listing.
 * These will NEVER be revoked during the current browser session.
 */
export const registerSubmittedMedia = (urls: (string | undefined | null)[]) => {
  urls.forEach((url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      submittedSessionMedia.add(url);
    }
  });
};

/**
 * Check if a media URL has been submitted into an active listing.
 */
export const isMediaSubmitted = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return submittedSessionMedia.has(url);
};

/**
 * Revoke a temporary draft media URL only if it has NOT been submitted into a listing.
 */
export const revokeTemporaryMedia = (url: string | null | undefined) => {
  if (!url || typeof url !== 'string' || !url.startsWith('blob:')) {
    return;
  }
  if (!submittedSessionMedia.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revocation errors
    }
  }
};

/**
 * Store session video Blob by property ID / URL as an in-memory backup if needed
 */
export const storeSessionVideoBlob = (key: string, blob: Blob) => {
  sessionVideoBlobs.set(key, blob);
};

export const getSessionVideoBlob = (key: string): Blob | undefined => {
  return sessionVideoBlobs.get(key);
};

/**
 * Safely clean up media associated with deleted property listings.
 * Only revokes blob URLs that are not used by any remaining properties.
 */
export const cleanupDeletedPropertyMedia = (
  deletedMediaUrls: (string | undefined | null)[],
  remainingMediaUrls: (string | undefined | null)[]
) => {
  const activeSet = new Set<string>();
  remainingMediaUrls.forEach((url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      activeSet.add(url);
    }
  });

  deletedMediaUrls.forEach((url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      if (!activeSet.has(url)) {
        submittedSessionMedia.delete(url);
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation errors
        }
      }
    }
  });
};
