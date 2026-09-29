# Architecture Notes — Digital Archive

## Database Schema

```
archive_files
├── id (PK)
├── file_name
├── original_name
├── file_type        (image | pdf | document | other)
├── mime_type
├── file_size
├── import_date
├── last_modified_date
├── file_uri          (path inside app's private storage)
└── availability_status (available | missing | inaccessible)

tags
├── id (PK)
└── name (unique)

file_tags (many-to-many)
├── file_id (FK -> archive_files.id, ON DELETE CASCADE)
└── tag_id  (FK -> tags.id, ON DELETE CASCADE)
```

## Import Flow (all-or-nothing per file)
1. User picks file(s) via system document picker.
2. For each file: copy into `documentDirectory/archive/<id>.<ext>`.
3. Verify destination exists and size matches source.
4. Insert metadata row into `archive_files`.
5. On any failure at steps 2-4: delete the partial copy, skip the DB insert, record the failure — move to the next file.
6. Temporary picker-cache file is always cleaned up in a `finally` block.

## Crash Recovery
On every app startup:
1. Compare files physically present in the archive folder against `file_uri` values in the database.
2. Any file on disk with no matching DB row (orphan, from a crash between copy and insert) is deleted.
3. Run an availability scan over all DB records and update statuses.

## Availability States
- `available` — file exists and is readable.
- `missing` — file no longer exists at its stored path.
- `inaccessible` — file exists but could not be read (permissions/corruption).

Metadata rows are never deleted automatically when a file becomes missing/inaccessible — only an explicit user action ("Remove from archive") deletes a record.
