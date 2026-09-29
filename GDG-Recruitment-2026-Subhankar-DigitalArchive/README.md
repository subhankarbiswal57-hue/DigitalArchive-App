# Digital Archive — GDG on Campus SRM Recruitment 2026-27 (App Development)

**Candidate:** Subhankar

## Overview
A React Native (Expo) mobile app that lets users import files (images, PDFs, documents) into
a personal archive, organize them with tags, search/filter, and safely handle files that later
become missing, moved, or unreadable — without ever crashing or losing archive metadata.

## Architecture

```
UI (Screens/Components)
        │
ArchiveContext (app-wide state, React Context)
        │
   ┌────┴────┐
Services      Database
(import,      (SQLite via expo-sqlite)
 availability,
 metadata)
        │
File System (expo-file-system) — app-private storage
```

- **UI layer** (`src/screens`, `src/components`) never talks to the database or file system directly — it goes through `ArchiveContext` and the service/query layers. This keeps UI, application logic, and storage separated.
- **Database layer** (`src/database`) is the single source of truth. The archive list is loaded from SQLite on every screen render — the app never re-scans the device file system to rebuild the archive.
- **Service layer** (`src/services`) contains all the "risky" I/O: copying files, checking file availability, extracting metadata — kept separate from both UI and raw SQL.

## Storage Strategy
- **Metadata**: SQLite database (`archive.db`) with three tables — `archive_files`, `tags`, `file_tags` (many-to-many). Chosen over key-value storage (e.g. AsyncStorage) because search/filter needs relational queries (by name, tag, type, date, status) that SQL handles natively and efficiently.
- **Files**: physical copies are stored in the app's private sandboxed directory (`FileSystem.documentDirectory + 'archive/'`), decoupled from wherever the user originally picked them from. This means the archive keeps working even if the user deletes the original file from their gallery/downloads — until the *app's own copy* goes missing, which is exactly the scenario the availability system is designed to detect.

## Important Edge Cases Handled

1. **Import cancellation** — if the user cancels the system file picker, `pickFiles()` returns an empty array and nothing is written to disk or the database.
2. **Partial copy / copy failure** — `importOne()` verifies the destination file exists and matches the source size after copying; on any failure it deletes the partial copy and never inserts a DB row. All-or-nothing per file.
3. **Partial success on multi-file import** — `importMany()` imports files one at a time and continues even if one fails, returning a per-file result list so the UI can show exactly which files succeeded/failed/were cancelled mid-way.
4. **App killed mid-import** — if the app is terminated after a file is physically copied but before its DB row is inserted, an orphaned file is left on disk. On next launch, `cleanupOrphanFiles()` compares files on disk against DB records and deletes any orphan, guaranteeing the DB never references a missing import and disk never accumulates untracked files.
5. **Externally deleted/moved/corrupted files** — `fileAvailabilityService.checkFile()` is run on app startup and on-demand (pull-to-refresh "integrity scan", and every time a file's detail screen is opened). It never throws; a file that vanished is marked `missing`, one that exists but can't be read is marked `inaccessible`, and the archive metadata is always preserved regardless of status.
6. **Removing an archive entry** — deletes the DB record and the app's own stored copy of the file. The original file on the user's device (wherever it was picked from) is never touched — this is explicitly explained to the user in a confirmation dialog before deletion.
7. **Async, non-blocking UI** — all file copying, metadata extraction, and database operations are `async/await` based and run off the main render path, so imports/scans never freeze the UI (a progress indicator with a "Cancel remaining" option is shown during multi-file imports).
8. **Persistence across restarts** — SQLite data persists automatically; startup only clears orphan files and re-validates availability, it never rebuilds the archive index from scratch.

## Tech Stack
- React Native + Expo
- `expo-sqlite` — persistent local database
- `expo-document-picker` — file selection (supports images, PDFs, documents)
- `expo-file-system` — copying files into app storage, existence/integrity checks
- `expo-sharing` — opening archived files with other installed apps
- `@react-navigation` — screen navigation

## Setup & Run
```bash
npm install
npx expo start
```
Scan the QR code with Expo Go, or press `a` for an Android emulator.

### Building the APK
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
This produces a downloadable `.apk` per the `eas.json` preview profile (direct APK, not an AAB bundle).

## Features Implemented
- Multi-file import (images, PDFs, documents) with per-file success/failure reporting
- Full metadata tracking: name, type, size, import date, last modified date, tags, file location, availability status
- Tag creation/deletion, assignment/removal per file
- Rename archive entries, remove entries (with clear original-file-is-kept messaging)
- Search by name/tag + filter by type/availability, all against persisted SQLite data
- Availability/integrity scanning (pull-to-refresh, and automatically on file-detail open)
- Graceful handling of missing/inaccessible files — no crashes, metadata retained

## Screenshots
See `assets/screenshots/` for screenshots of the working application (home screen, import flow, search/filter, file details, tag management).

## Known Limitations / Future Work
- Duplicate detection (by file content hash) is not implemented — listed as an optional enhancement.
- No automated test suite is included yet.
