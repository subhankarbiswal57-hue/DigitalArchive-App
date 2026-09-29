import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TagChip from './TagChip';
import { COLORS, STATUS } from '../utils/constants';
import { formatSize, formatDate } from '../utils/formatters';

const TYPE_LABEL = { image: 'IMG', pdf: 'PDF', document: 'DOC', video: 'VID', audio: 'AUD', other: 'FILE' };

function statusInfo(status) {
  if (status === STATUS.MISSING) return { text: 'Missing', color: COLORS.danger };
  if (status === STATUS.INACCESSIBLE) return { text: 'Inaccessible', color: COLORS.warn };
  return { text: 'Available', color: COLORS.ok };
}

export default function ArchiveListItem({ file, onPress }) {
  const st = statusInfo(file.availability_status);
  const unavailable = file.availability_status !== STATUS.AVAILABLE;

  return (
    <TouchableOpacity style={[styles.card, unavailable && styles.dim]} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{TYPE_LABEL[file.file_type] || 'FILE'}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{file.file_name}</Text>
        <Text style={styles.meta}>
          {formatSize(file.file_size)} · {formatDate(file.import_date)}
          {file.tags.length > 0 ? ` · ${file.tags.length} tag${file.tags.length > 1 ? 's' : ''}` : ''}
        </Text>
        <View style={styles.tags}>
          {file.tags.slice(0, 3).map((t) => (
            <TagChip key={t.id} label={t.name} small />
          ))}
          {file.tags.length > 3 && (
            <TagChip label={`+${file.tags.length - 3}`} small />
          )}
        </View>
      </View>
      <View style={[styles.status, { borderColor: st.color }]}>
        <Text style={[styles.statusText, { color: st.color }]}>{st.text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    marginHorizontal: 12, marginVertical: 5, padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dim: { opacity: 0.6 },
  badge: {
    width: 46, height: 46, borderRadius: 10, backgroundColor: '#e8f0fe',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  badgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  status: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
});
