export function formatSize(bytes) {
  if (bytes == null || isNaN(bytes)) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const DATE_FMT = { year: 'numeric', month: 'short', day: 'numeric' };
const DATETIME_FMT = { ...DATE_FMT, hour: '2-digit', minute: '2-digit' };

/** Returns a short human-readable date string. Pass full=true for date+time. */
export function formatDate(iso, full = false) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, full ? DATETIME_FMT : DATE_FMT);
}
