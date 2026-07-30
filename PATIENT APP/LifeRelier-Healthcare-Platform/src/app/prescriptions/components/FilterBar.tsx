import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface FilterBarProps {
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  selectedFilter: string;
  onChangeFilter: (filter: string) => void;
}

export default function FilterBar({
  searchQuery,
  onChangeSearch,
  selectedFilter,
  onChangeFilter,
}: FilterBarProps) {
  const filters = [
    { id: 'all', label: 'All Records' },
    { id: 'recent', label: 'Recent (7 Days)' },
    { id: 'high_confidence', label: 'High Confidence (>90%)' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by medicine, doctor, or hospital..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onChangeSearch}
          accessibilityLabel="Search prescriptions"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabs}
      >
        {filters.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, isActive && styles.activeFilterTab]}
              onPress={() => onChangeFilter(filter.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${filter.label}`}
            >
              <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primaryText,
    height: '100%',
    padding: 0, // Reset default Android paddings
  },
  filterTabs: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterTab: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#2563EB',
  },
});
