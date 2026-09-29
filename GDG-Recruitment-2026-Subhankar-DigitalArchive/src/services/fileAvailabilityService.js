import * as FileSystem from 'expo-file-system';
import { STATUS } from '../utils/constants';
import { getAllFilesUnfiltered, updateAvailability } from '../database/archiveQueries';

/**
 * Determines the current availability of a single archived file.
 *  - missing:      file no longer exists (deleted / moved externally)
 *  - inaccessible: exists but cannot be read (permissions / corruption)
 *  - available:    exists and is readable
 * Never throws - problems are converted to a status so the app cannot crash.
 */
export async function checkFile(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return STATUS.MISSING;
    try {
      await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        position: 0,
        length: 1,
      });
    } catch (_) {
      // zero-byte files can throw on read; only flag as inaccessible when size > 0
      if (info.size > 0) return STATUS.INACCESSIBLE;
    }
    return STATUS.AVAILABLE;
  } catch (_) {
    return STATUS.INACCESSIBLE;
  }
}

/**
 * Integrity scan: re-checks every archived file and persists any status change.
 * Metadata rows are kept even when the physical file is gone.
 * Returns a summary { total, available, missing, inaccessible, changed }.
 */
export async function scanArchive() {
  const files = await getAllFilesUnfiltered();
  const summary = { total: files.length, available: 0, missing: 0, inaccessible: 0, changed: 0 };
  for (const f of files) {
    const status = await checkFile(f.file_uri);
    summary[status] += 1;
    if (status !== f.availability_status) {
      await updateAvailability(f.id, status);
      summary.changed += 1;
    }
  }
  return summary;
}
