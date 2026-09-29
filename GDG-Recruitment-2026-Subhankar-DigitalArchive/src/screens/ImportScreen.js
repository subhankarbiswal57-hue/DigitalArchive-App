import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { pickFiles, importMany } from '../services/fileImportService';
import { useArchive } from '../context/ArchiveContext';
import { COLORS } from '../utils/constants';

export default function ImportScreen({ navigation }) {
  const { refresh } = useArchive();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const cancelRef = useRef(false);

  const start = async () => {
    setResults([]);
    let assets;
    try {
      assets = await pickFiles();
    } catch (e) {
      setResults([{ name: 'File picker', status: 'failed', error: e.message || String(e) }]);
      return;
    }
    if (!assets.length) return; // user cancelled the picker - nothing was written anywhere

    cancelRef.current = false;
    setImporting(true);
    try {
      const res = await importMany(assets, {
        onProgress: setProgress,
        shouldCancel: () => cancelRef.current,
      });
      setResults(res);
    } finally {
      setImporting(false);
      setProgress(null);
      await refresh();
    }
  };

  const ok = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const cancelled = results.filter((r) => r.status === 'cancelled').length;

  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        Select one or more files (images, PDFs, documents). Each file is copied into the app's private
        archive storage. Files that fail are skipped and never leave a broken record.
      </Text>

      <TouchableOpacity style={[styles.btn, importing && styles.disabled]} disabled={importing} onPress={start}>
        <Text style={styles.btnText}>Select Files</Text>
      </TouchableOpacity>

      {importing && (
        <View style={styles.progress}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.progressText}>
            Importing {progress ? `${progress.index + 1}/${progress.total}: ${progress.name}` : '...'}
          </Text>
          <TouchableOpacity onPress={() => (cancelRef.current = true)}>
            <Text style={styles.cancel}>Cancel remaining</Text>
          </TouchableOpacity>
        </View>
      )}

      {results.length > 0 && (
        <Text style={styles.summary}>
          {ok} imported • {failed} failed{cancelled ? ` • ${cancelled} cancelled` : ''}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(r, i) => r.name + i}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.rowStatus, { color: item.status === 'success' ? COLORS.ok : item.status === 'failed' ? COLORS.danger : COLORS.warn }]}>
              {item.status}
            </Text>
            {item.error ? <Text style={styles.err}>{item.error}</Text> : null}
          </View>
        )}
      />

      {results.length > 0 && !importing && (
        <TouchableOpacity style={[styles.btn, { marginTop: 8 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back to Archive</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.bg },
  info: { color: COLORS.subtext, marginBottom: 14, lineHeight: 20 },
  btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  progress: { alignItems: 'center', marginVertical: 16 },
  progressText: { marginTop: 8, color: COLORS.text },
  cancel: { marginTop: 8, color: COLORS.danger, fontWeight: '600' },
  summary: { marginVertical: 12, fontWeight: '600', color: COLORS.text },
  row: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  rowName: { fontSize: 14, color: COLORS.text },
  rowStatus: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  err: { fontSize: 12, color: COLORS.danger, marginTop: 2 },
});
