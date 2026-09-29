import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const SORT_OPTIONS = [
  { label: 'Date imported', field: 'import_date' },
  { label: 'File name', field: 'file_name' },
  { label: 'File size', field: 'file_size' },
];

export default function SortModal({
  visible, onClose, sortField, setSortField, sortOrder, setSortOrder,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sort by</Text>

          {SORT_OPTIONS.map(({ label, field }) => (
            <TouchableOpacity
              key={field}
              style={[styles.option, sortField === field && styles.optionSelected]}
              onPress={() => setSortField(field)}
            >
              <Text style={[styles.optionText, sortField === field && styles.optionTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Direction</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.dir, sortOrder === 'DESC' && styles.dirSelected]}
              onPress={() => setSortOrder('DESC')}
            >
              <Text style={[styles.dirText, sortOrder === 'DESC' && styles.dirTextSelected]}>
                Desc ↓
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dir, sortOrder === 'ASC' && styles.dirSelected]}
              onPress={() => setSortOrder('ASC')}
            >
              <Text style={[styles.dirText, sortOrder === 'ASC' && styles.dirTextSelected]}>
                Asc ↑
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.done} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.subtext, marginTop: 12, marginBottom: 6 },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 6 },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 15, color: COLORS.text },
  optionTextSelected: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  dir: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  dirSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dirText: { fontSize: 14, color: COLORS.text },
  dirTextSelected: { color: '#fff', fontWeight: '600' },
  done: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  doneText: { color: '#fff', fontWeight: '700' },
});
