import React, { useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function SearchBar({ value, onChangeText }) {
  const timer = useRef(null);

  // Debounce: wait 250 ms after the user stops typing before firing onChangeText
  const handleChange = useCallback(
    (text) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onChangeText(text), 250);
    },
    [onChangeText]
  );

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="Search by file name or tag..."
        placeholderTextColor={COLORS.subtext}
        defaultValue={value}
        onChangeText={handleChange}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel="Search archive"
        accessibilityHint="Type to filter files by name or tag"
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clear}
          onPress={() => onChangeText('')}
          accessibilityLabel="Clear search"
        >
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, position: 'relative' },
  input: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 8, paddingRight: 36, fontSize: 15, color: COLORS.text,
  },
  clear: {
    position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center',
  },
  clearText: { color: COLORS.subtext, fontSize: 16 },
});
