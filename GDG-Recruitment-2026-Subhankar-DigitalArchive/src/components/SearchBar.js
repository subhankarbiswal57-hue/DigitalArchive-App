import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="Search by file name or tag..."
        placeholderTextColor={COLORS.subtext}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: COLORS.text,
  },
});
