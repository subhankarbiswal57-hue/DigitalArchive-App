import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useArchive } from '../context/ArchiveContext';
import { createTag, deleteTag } from '../database/archiveQueries';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/constants';

export default function TagManagerScreen() {
  const { tags, refresh } = useArchive();
  const [name, setName] = useState('');

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert('Invalid tag', 'Tag name cannot be empty.');
    try {
      await createTag(trimmed);
      setName('');
      await refresh();
    } catch (e) {
      Alert.alert('Could not create tag', /UNIQUE/i.test(String(e.message)) ? 'A tag with this name already exists.' : String(e.message || e));
    }
  };

  const remove = (tag) => {
    Alert.alert('Delete tag?', `"${tag.name}" will be removed from all files. The files themselves are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteTag(tag.id); await refresh(); },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input} placeholder="New tag / category name" value={name}
          onChangeText={setName} onSubmitEditing={add} placeholderTextColor={COLORS.subtext}
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}><Text style={styles.addText}>Add</Text></TouchableOpacity>
      </View>

      <FlatList
        data={tags}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<EmptyState title="No tags yet" subtitle="Create tags to organize your files." />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => remove(item)}><Text style={styles.del}>Delete</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  addRow: { flexDirection: 'row', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 15 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, justifyContent: 'center', borderRadius: 10, marginLeft: 8 },
  addText: { color: '#fff', fontWeight: '700' },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff',
    padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  itemText: { fontSize: 15, color: COLORS.text },
  del: { color: COLORS.danger, fontWeight: '600' },
});
