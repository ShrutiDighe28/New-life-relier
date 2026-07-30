import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { prescriptionService } from './services/prescriptionService';
import { Prescription } from './types';
import PrescriptionCard from './components/PrescriptionCard';
import EmptyState from './components/EmptyState';
import FilterBar from './components/FilterBar';
import { COLORS, SPACING } from '@/constants/theme';

export default function PrescriptionHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const loadPrescriptions = async () => {
    setIsLoading(true);
    const data = await prescriptionService.getPrescriptions();
    setPrescriptions(data);
    applyFiltersAndSearch(data, searchQuery, selectedFilter);
    setIsLoading(false);
  };

  // Reload history when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [searchQuery, selectedFilter])
  );

  const applyFiltersAndSearch = (
    allData: Prescription[],
    query: string,
    filter: string
  ) => {
    let result = [...allData];

    // 1. Apply Search Query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      result = result.filter((item) => {
        const matchesDoctor = item.doctorName.toLowerCase().includes(lowerQuery);
        const matchesHospital = item.hospitalName.toLowerCase().includes(lowerQuery);
        const matchesMedicines = item.medicines?.some((med) =>
          med.name.toLowerCase().includes(lowerQuery)
        );
        return matchesDoctor || matchesHospital || matchesMedicines;
      });
    }

    // 2. Apply Filters
    if (filter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter((item) => new Date(item.scanDate) >= sevenDaysAgo);
    } else if (filter === 'high_confidence') {
      result = result.filter((item) => item.confidence >= 90);
    }

    setFilteredPrescriptions(result);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(prescriptions, query, selectedFilter);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    applyFiltersAndSearch(prescriptions, searchQuery, filter);
  };

  const handleScanPrescription = () => {
    router.push('/ai/prescription-scanner');
  };

  const handleCardPress = (id: string) => {
    router.push(`/prescriptions/details/${id}` as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={COLORS.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Health Records</Text>
        
        {/* Quick scan icon on top right */}
        <TouchableOpacity 
          style={styles.scanHeaderButton}
          onPress={handleScanPrescription}
          accessibilityRole="button"
          accessibilityLabel="Scan a new prescription"
        >
          <Camera size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onChangeSearch={handleSearchChange}
        selectedFilter={selectedFilter}
        onChangeFilter={handleFilterChange}
      />

      {/* History List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrescriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PrescriptionCard
              prescription={item}
              onPress={() => handleCardPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState onPressScan={handleScanPrescription} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanHeaderButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
