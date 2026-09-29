import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getDb } from '../database/db';
import { getFiles, getAllTags, getTagsByFile } from '../database/archiveQueries';
import { cleanupOrphanFiles } from '../services/fileImportService';
import { scanArchive } from '../services/fileAvailabilityService';

const ArchiveContext = createContext(null);

export function ArchiveProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState(null);
  const [ready, setReady] = useState(false);

  /** Reloads files (with current search/filters) and tags from the database. */
  const refresh = useCallback(async () => {
    const [rows, allTags, tagMap] = await Promise.all([
      getFiles({ query, type: typeFilter, availability: availabilityFilter }),
      getAllTags(),
      getTagsByFile(),
    ]);
    setFiles(rows.map((r) => ({ ...r, tags: tagMap[r.id] || [] })));
    setTags(allTags);
  }, [query, typeFilter, availabilityFilter]);

  /** Re-checks every file on disk and updates statuses, then reloads. */
  const runIntegrityScan = useCallback(async () => {
    const summary = await scanArchive();
    await refresh();
    return summary;
  }, [refresh]);

  // One-time startup: init DB, clean orphans from any interrupted import, scan availability.
  useEffect(() => {
    (async () => {
      try {
        await getDb();
        await cleanupOrphanFiles();
        await scanArchive();
        // Load files with up-to-date statuses before marking ready
        await refresh();
      } catch (e) {
        console.warn('Startup error', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Reload whenever search text / filters change (after startup).
  useEffect(() => {
    if (ready) refresh().catch((e) => console.warn('Refresh error', e));
  }, [ready, refresh]);

  const clearFilters = () => {
    setQuery('');
    setTypeFilter(null);
    setAvailabilityFilter(null);
  };

  return (
    <ArchiveContext.Provider
      value={{
        files, tags, ready,
        query, setQuery,
        typeFilter, setTypeFilter,
        availabilityFilter, setAvailabilityFilter,
        clearFilters, refresh, runIntegrityScan,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
}

export function useArchive() {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used inside ArchiveProvider');
  return ctx;
}
