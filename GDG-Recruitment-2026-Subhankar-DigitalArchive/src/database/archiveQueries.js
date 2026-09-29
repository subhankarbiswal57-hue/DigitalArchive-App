import { getDb } from './db';

export function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------ FILES ------------------------------ */

export async function insertFile(file) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO archive_files
      (id, file_name, original_name, file_type, mime_type, file_size,
       import_date, last_modified_date, file_uri, availability_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      file.id,
      file.fileName,
      file.originalName,
      file.fileType,
      file.mimeType ?? null,
      file.fileSize ?? null,
      file.importDate,
      file.lastModifiedDate ?? null,
      file.fileUri,
      file.availabilityStatus ?? 'available',
    ]
  );
}

/**
 * Search + filter runs entirely on persisted data (SQL), not on device files.
 * filters: { query, type, availability }
 */
export async function getFiles({ query = '', type = null, availability = null } = {}) {
  const db = await getDb();
  const where = [];
  const params = [];

  const q = query.trim();
  if (q) {
    where.push(`(f.file_name LIKE ? OR EXISTS (
      SELECT 1 FROM file_tags ft JOIN tags t ON t.id = ft.tag_id
      WHERE ft.file_id = f.id AND t.name LIKE ?))`);
    params.push(`%${q}%`, `%${q}%`);
  }
  if (type) {
    where.push('f.file_type = ?');
    params.push(type);
  }
  if (availability) {
    where.push('f.availability_status = ?');
    params.push(availability);
  }

  const sql = `SELECT f.* FROM archive_files f
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY f.import_date DESC`;
  return db.getAllAsync(sql, params);
}

export async function getAllFilesUnfiltered() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM archive_files');
}

export async function getFileById(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM archive_files WHERE id = ?', [id]);
}

export async function renameFile(id, newName) {
  const db = await getDb();
  await db.runAsync('UPDATE archive_files SET file_name = ? WHERE id = ?', [newName, id]);
}

export async function deleteFileRecord(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM archive_files WHERE id = ?', [id]);
}

export async function updateAvailability(id, status) {
  const db = await getDb();
  await db.runAsync('UPDATE archive_files SET availability_status = ? WHERE id = ?', [status, id]);
}

/* ------------------------------ TAGS ------------------------------ */

export async function getAllTags() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM tags ORDER BY name COLLATE NOCASE');
}

export async function createTag(name) {
  const db = await getDb();
  const id = newId();
  await db.runAsync('INSERT INTO tags (id, name) VALUES (?, ?)', [id, name.trim()]);
  return id;
}

export async function deleteTag(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]); // file_tags rows cascade
}

export async function addTagToFile(fileId, tagId) {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO file_tags (file_id, tag_id) VALUES (?, ?)', [fileId, tagId]);
}

export async function removeTagFromFile(fileId, tagId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?', [fileId, tagId]);
}

/** Returns a map: fileId -> [{id, name}, ...] */
export async function getTagsByFile() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT ft.file_id, t.id, t.name FROM file_tags ft JOIN tags t ON t.id = ft.tag_id ORDER BY t.name`
  );
  const map = {};
  for (const r of rows) {
    if (!map[r.file_id]) map[r.file_id] = [];
    map[r.file_id].push({ id: r.id, name: r.name });
  }
  return map;
}
