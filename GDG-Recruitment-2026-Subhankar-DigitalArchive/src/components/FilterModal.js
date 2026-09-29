import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TagChip from './TagChip';
import { COLORS, FILE_TYPES, STATUS } from '../utils/constants';

export default function FilterModal({
  visible, onClose, typeFilter, setTypeFilter, availabilityFilter, setAvailabilityFilter, onClear,
}) {
  const toggle = (current, value, setter) => setter(current === value ? null : value);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Filters</Text>

          <Text style={styles.label}>File type</Text>
          <View style={styles.row}>
            {Object.values(FILE_TYPES).map((t) => (
              <TagChip key={t} label={t} selected={typeFilter === t} onPress={() => toggle(typeFilter, t, setTypeFilter)} />
            ))}
          </View>

          <Text style={styles.label}>Availability</Text>
          <View style={styles.row}>
            {Object.values(STATUS).map((s) => (
              <TagChip
                key={s} label={s} selected={availabilityFilter === s}
                onPress={() => toggle(availabilityFilter, s, setAvailabilityFilter)}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClear}><Text style={styles.clear}>Clear all</Text></TouchableOpacity>
            <TouchableOpacity style={styles.done} onPress={onClose}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.subtext, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  clear: { color: COLORS.danger, fontSize: 15 },
  done: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  doneText: { color: '#fff', fontWeight: '600' },
});
