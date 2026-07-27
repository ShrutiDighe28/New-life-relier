import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/utils/themeManager';

// Helper to generate days for a given month based on a reference date (YYYY-MM-DD)
const generateMonthDays = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const result = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const cur = new Date(year, month, d);
    const dayName = cur.toLocaleDateString('en-US', { weekday: 'short' });
    const full = cur.toISOString().split('T')[0];
    result.push({
      day: dayName,
      date: d.toString().padStart(2, '0'),
      fullDate: full,
      isToday: cur.toDateString() === today.toDateString(),
    });
  }
  return result;
};

interface CalendarHeaderProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export default function CalendarHeader({ selectedDate, onSelect }: CalendarHeaderProps) {
  const { colors, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const days = generateMonthDays(selectedDate);

  const onChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      const newDate = date.toISOString().split('T')[0];
      onSelect(newDate);
    }
  };

  const monthYear = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.monthText, { color: colors.text }]}>{monthYear}</Text>
        <TouchableOpacity
          style={[styles.calendarBtn, { backgroundColor: isDark ? colors.card : '#F8FAFC' }]}
          onPress={() => setShowPicker(true)}
        >
          <MaterialCommunityIcons name="calendar-range" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.fullDate}
        contentContainerStyle={styles.dayScroll}
        renderItem={({ item }) => {
          const isSelected = item.fullDate === selectedDate;
          return (
            <TouchableOpacity
              style={[
                styles.dayPill,
                { backgroundColor: isDark ? colors.card : '#F8FAFC', borderColor: colors.cardBorder },
                isSelected && styles.dayPillSelected,
              ]}
              onPress={() => onSelect(item.fullDate)}
            >
              <Text
                style={[styles.dayName, { color: colors.textSecondary }, isSelected && styles.dayTextSelected]}
              >
                {item.day}
              </Text>
              <Text
                style={[styles.dateNum, { color: colors.text }, isSelected && styles.dayTextSelected]}
              >
                {item.date}
              </Text>
              {item.isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: '#FFFFFF' }]} />}
            </TouchableOpacity>
          );
        }}
      />
      {showPicker && (
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayScroll: {
    paddingVertical: 10,
    gap: 10,
  },
  dayPill: {
    width: 60,
    height: 76,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0D9488',
    marginTop: 4,
  },
});
