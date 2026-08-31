/**
 * Utility functions for relative time and date formatting.
 * Provides live relative timestamps (e.g., "Just now", "5 mins ago", "2 hours ago")
 * without permanently storing static strings.
 */

export function formatRelativeTime(timestamp?: string | number | Date | null): string {
  if (!timestamp) return 'Just now';

  let date: Date;

  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    // If it's already an ISO string or valid date string
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) {
      date = new Date(parsed);
    } else {
      // If it's already a legacy relative string (e.g. "2 hours ago", "Yesterday", "Today, 9:15 AM")
      return timestamp;
    }
  } else {
    return 'Just now';
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If timestamp is slightly in the future (due to slight clock skew), show "Just now"
  if (diffMs < 0 && diffMs > -60000) {
    return 'Just now';
  }

  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) {
    return 'Just now';
  }

  if (diffSec < 90) {
    return '1 min ago';
  }

  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  if (diffHour === 1) {
    return '1 hour ago';
  }

  if (diffHour < 24) {
    return `${diffHour} hours ago`;
  }

  if (diffDay === 1) {
    return 'Yesterday';
  }

  if (diffDay < 7) {
    return `${diffDay} days ago`;
  }

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek === 1) {
    return '1 week ago';
  }

  if (diffWeek < 4) {
    return `${diffWeek} weeks ago`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth <= 1) {
    return '1 month ago';
  }

  if (diffMonth < 12) {
    return `${diffMonth} months ago`;
  }

  // Format as short localized date
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Formats a timestamp as full date and time string.
 */
export function formatDateTime(timestamp?: string | number | Date | null): string {
  if (!timestamp) return '';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}
