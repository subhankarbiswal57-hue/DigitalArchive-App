import * as SQLite from 'expo-sqlite';

let dbPromise = null;

/**
 * Opens (once) and initialises the persistent SQLite database.
 * Schema creation is idempotent so it is safe to run on every launch.
 * The archive is NEVER rebuilt from the device file system - the DB is the source of truth.
 */
export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('archive.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS archive_files (
          id TEXT PRIMARY KEY NOT NULL,
          file_name TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          mime_type TEXT,
          file_size INTEGER,
          import_date TEXT NOT NULL,
          last_modified_date TEXT,
          file_uri TEXT NOT NULL,
          availability_status TEXT NOT NULL DEFAULT 'available'
        );

        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE
        );

        CREATE TABLE IF NOT EXISTS file_tags (
          file_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          PRIMARY KEY (file_id, tag_id),
          FOREIGN KEY (file_id) REFERENCES archive_files(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_files_name ON archive_files(file_name);
        CREATE INDEX IF NOT EXISTS idx_files_type ON archive_files(file_type);
      `);
      return db;
    })();
  }
  return dbPromise;
}
