import React, { useLayoutEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useArchive } from '../context/ArchiveContext';
import SearchBar from '../components/SearchBar';
import ArchiveListItem from '../components/ArchiveListItem';
import FilterModal from '../components/FilterModal';
import SortModal from '../components/SortModal';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  const {
    files, ready, query, setQuery, typeFilter, setTypeFilter,
    availabilityFilter, setAvailabilityFilter, clearFilters, runIntegrityScan,
    sortField, setSortField, sortOrder, setSortOrder,
  } = useArchive();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeFilters = (typeFilter ? 1 : 0) + (availabilityFilter ? 1 : 0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('TagManager')}>
          <Text style={styles.headerBtn}>Tags</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const s = await runIntegrityScan();
      if (s.changed > 0) {
        Alert.alert('Integrity scan', `${s.missing} missing, ${s.inaccessible} inaccessible file(s) found.`);
      }
    } catch (e) {
      Alert.alert('Scan failed', String(e.message || e));
    } finally {
      setRefreshing(false);
    }
  };

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loading}>Loading archive...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <SearchBar value={query} onChangeText={setQuery} />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Text style={styles.filterText}>Filter{activeFilters ? ` (${activeFilters})` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setSortOpen(true)}>
          <Text style={styles.filterText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <ArchiveListItem file={item} onPress={() => navigation.navigate('FileDetail', { id: item.id })} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={files.length === 0 && { flexGrow: 1, justifyContent: 'center' }}
        ListEmptyComponent={
          <EmptyState
            icon={query || activeFilters ? '🔍' : '📂'}
            title={query || activeFilters ? 'No matching files' : 'Your archive is empty'}
            subtitle={query || activeFilters ? 'Try a different search or clear filters.' : 'Tap "+  Import" to add files.'}
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Import')}>
        <Text style={styles.fabText}>+ Import</Text>
      </TouchableOpacity>

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        onClear={clearFilters}
      />

      <SortModal
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { marginTop: 10, color: COLORS.subtext },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  filterBtn: {
    marginLeft: 8, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
  },
  filterText: { color: '#fff', fontWeight: '600' },
  headerBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 18, bottom: 24, backgroundColor: COLORS.primary,
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 28, elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
