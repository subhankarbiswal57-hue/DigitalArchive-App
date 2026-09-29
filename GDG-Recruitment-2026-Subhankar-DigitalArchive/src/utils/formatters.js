export function formatSize(bytes) {
  if (bytes == null || isNaN(bytes)) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDate(iso) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString();
}
