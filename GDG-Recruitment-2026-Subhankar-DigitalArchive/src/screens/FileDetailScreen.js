import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useArchive } from '../context/ArchiveContext';
import {
  getFileById, renameFile, deleteFileRecord, addTagToFile, removeTagFromFile, updateAvailability,
} from '../database/archiveQueries';
import { getTagsByFile } from '../database/archiveQueries';
import { checkFile } from '../services/fileAvailabilityService';
import { deletePhysicalCopy } from '../services/fileImportService';
import TagChip from '../components/TagChip';
import { COLORS, STATUS } from '../utils/constants';
import { formatSize, formatDate } from '../utils/formatters';

export default function FileDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { tags: allTags, refresh } = useArchive();
  const [file, setFile] = useState(null);
  const [fileTags, setFileTags] = useState([]);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const f = await getFileById(id);
    if (!f) {
      navigation.goBack();
      return;
    }
    // re-check availability every time details open
    const status = await checkFile(f.file_uri);
    if (status !== f.availability_status) {
      await updateAvailability(f.id, status);
      f.availability_status = status;
    }
    const map = await getTagsByFile();
    setFile(f);
    setName(f.file_name);
    setFileTags(map[id] || []);
  }, [id, navigation]);

  useEffect(() => { load().catch((e) => console.warn(e)); }, [load]);

  if (!file) return <View style={styles.container} />;

  const assigned = new Set(fileTags.map((t) => t.id));

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert('Invalid name', 'Name cannot be empty.');
    await renameFile(id, trimmed);
    await refresh();
    Alert.alert('Saved', 'Entry renamed. (The stored file itself is unchanged.)');
    load();
  };

  const toggleTag = async (tag) => {
    if (assigned.has(tag.id)) await removeTagFromFile(id, tag.id);
    else await addTagToFile(id, tag.id);
    await refresh();
    load();
  };

  const openFile = async () => {
    if (file.availability_status !== STATUS.AVAILABLE) {
      return Alert.alert('File not available', 'The file is missing or inaccessible. Its metadata is still kept in the archive.');
    }
    try {
      if (!(await Sharing.isAvailableAsync())) throw new Error('No app available to open this file');
      await Sharing.shareAsync(file.file_uri, { mimeType: file.mime_type || undefined });
    } catch (e) {
      Alert.alert('Cannot open file', e.message || String(e));
    }
  };

  const remove = () => {
    Alert.alert(
      'Remove from archive?',
      'This removes the entry AND deletes the archived copy stored inside this app. ' +
        'The original file on your device (where you imported it from) is NOT touched.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFileRecord(id);          // 1. remove DB record first
              await deletePhysicalCopy(file.file_uri); // 2. then the app-owned copy (orphan cleanup covers a crash between 1 and 2)
              await refresh();
              navigation.goBack();
            } catch (e) {
              Alert.alert('Remove failed', e.message || String(e));
            }
          },
        },
      ]
    );
  };

  const rows = [
    ['Original name', file.original_name],
    ['Type', file.file_type],
    ['Size', formatSize(file.file_size)],
    ['Imported', formatDate(file.import_date)],
    ['Last modified', formatDate(file.last_modified_date)],
    ['Status', file.availability_status],
    ['Location', file.file_uri],
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.section}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <TouchableOpacity style={styles.btn} onPress={saveName}><Text style={styles.btnText}>Save name</Text></TouchableOpacity>

      <Text style={styles.section}>Details</Text>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.key}>{k}</Text>
          <Text style={styles.val} selectable>{String(v)}</Text>
        </View>
      ))}

      <Text style={styles.section}>Tags (tap to assign / remove)</Text>
      <View style={styles.tagRow}>
        {allTags.length === 0 ? (
          <Text style={styles.muted}>No tags yet. Create some in Manage Tags.</Text>
        ) : (
          allTags.map((t) => <TagChip key={t.id} label={t.name} selected={assigned.has(t.id)} onPress={() => toggleTag(t)} />)
        )}
      </View>

      <TouchableOpacity style={[styles.btn, { marginTop: 18 }]} onPress={openFile}>
        <Text style={styles.btnText}>Open file</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.danger]} onPress={remove}>
        <Text style={styles.btnText}>Remove from archive</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  section: { fontSize: 14, fontWeight: '700', color: COLORS.subtext, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 15 },
  btn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  danger: { backgroundColor: COLORS.danger },
  btnText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  key: { width: 110, color: COLORS.subtext, fontSize: 13 },
  val: { flex: 1, color: COLORS.text, fontSize: 13 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  muted: { color: COLORS.subtext },
});
