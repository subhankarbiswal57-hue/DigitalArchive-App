import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.subtext, marginTop: 6, textAlign: 'center' },
});
