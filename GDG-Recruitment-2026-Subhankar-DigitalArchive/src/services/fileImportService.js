import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { insertFile, newId, getAllFilesUnfiltered } from '../database/archiveQueries';
import { buildMetadata, getExtension } from './metadataService';

export const ARCHIVE_DIR = FileSystem.documentDirectory + 'archive/';

export async function ensureArchiveDir() {
  const info = await FileSystem.getInfoAsync(ARCHIVE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ARCHIVE_DIR, { intermediates: true });
  }
}

/** Opens the system picker. Returns [] if the user cancels. Supports multi-select. */
export async function pickFiles() {
  const res = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: '*/*',
  });
  if (res.canceled) return [];
  return res.assets || [];
}

async function safeDelete(uri) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (_) {
    /* best effort */
  }
}

/**
 * Imports ONE file with all-or-nothing semantics:
 *   1. copy into app storage under a unique name
 *   2. verify the copy exists and is non-corrupt (size check)
 *   3. insert DB record
 * If step 1/2 fails  -> nothing in DB, partial copy removed.
 * If step 3 fails    -> copied file is removed, so no orphan and no invalid record.
 * The DB never contains a row for a file that was not fully imported.
 */
export async function importOne(asset) {
  const id = newId();
  const ext = getExtension(asset.name);
  const destUri = ARCHIVE_DIR + id + (ext ? '.' + ext : '');

  try {
    await ensureArchiveDir();
    await FileSystem.copyAsync({ from: asset.uri, to: destUri });

    const destInfo = await FileSystem.getInfoAsync(destUri);
    if (!destInfo.exists) throw new Error('Copy failed: destination file not found');
    if (asset.size != null && destInfo.size != null && destInfo.size !== asset.size) {
      throw new Error('Copy failed: file size mismatch (incomplete copy)');
    }

    await insertFile(buildMetadata({ id, asset, destUri, destInfo }));
  } catch (err) {
    await safeDelete(destUri); // rollback the physical copy
    throw err;
  } finally {
    await safeDelete(asset.uri); // remove temporary picker cache copy
  }
  return id;
}

/**
 * Imports many files one after another (keeps memory/IO bounded and UI responsive because
 * every step is awaited asynchronously). A failure on one file never aborts the others.
 * `shouldCancel()` is checked between files so the user can cancel mid-way.
 * Returns per-file results so the UI can show partial success.
 */
export async function importMany(assets, { onProgress, shouldCancel } = {}) {
  const results = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (shouldCancel && shouldCancel()) {
      results.push({ name: asset.name, status: 'cancelled' });
      continue;
    }
    onProgress && onProgress({ index: i, total: assets.length, name: asset.name, status: 'importing' });
    try {
      await importOne(asset);
      results.push({ name: asset.name, status: 'success' });
    } catch (e) {
      results.push({ name: asset.name, status: 'failed', error: e.message || String(e) });
    }
    onProgress && onProgress({ index: i, total: assets.length, name: asset.name, status: results[i].status });
  }
  return results;
}

/**
 * Crash recovery: if the app was killed after the file copy but before the DB insert,
 * an orphan file is left in the archive folder. On startup, delete any file that has no DB record.
 */
export async function cleanupOrphanFiles() {
  try {
    await ensureArchiveDir();
    const onDisk = await FileSystem.readDirectoryAsync(ARCHIVE_DIR);
    const rows = await getAllFilesUnfiltered();
    const known = new Set(rows.map((r) => r.file_uri));
    for (const name of onDisk) {
      const uri = ARCHIVE_DIR + name;
      if (!known.has(uri)) await safeDelete(uri);
    }
  } catch (_) {
    /* non-fatal */
  }
}

/** Deletes the app's archived copy of a file (original file on the device is never touched). */
export async function deletePhysicalCopy(uri) {
  await safeDelete(uri);
}
