import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function TagChip({ label, selected = false, onPress, small = false }) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[styles.chip, small && styles.small, selected && styles.selected]}
    >
      <Text style={[styles.text, small && styles.smallText, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
    marginRight: 6, marginBottom: 6,
  },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text: { color: COLORS.text, fontSize: 13 },
  smallText: { fontSize: 11 },
  selectedText: { color: '#fff' },
});
