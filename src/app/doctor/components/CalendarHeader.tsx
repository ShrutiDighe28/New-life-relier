import React, { useState, useRef, useEffect } from 'react';
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
    const full = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    result.push({
      day: dayName,
      date: String(d).padStart(2, '0'),
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
  const flatListRef = useRef<FlatList>(null);
  const days = generateMonthDays(selectedDate);

  // Auto-scroll to selected date on mount or date change
  useEffect(() => {
    const idx = days.findIndex((d) => d.fullDate === selectedDate);
    if (idx !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: Math.max(0, idx - 2), animated: true });
      }, 100);
    }
  }, [selectedDate]);

  const onChange = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onSelect(`${year}-${month}-${day}`);
    }
  };

  const changeMonth = (delta: number) => {
    const cur = new Date(selectedDate);
    cur.setMonth(cur.getMonth() + delta);
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(Math.min(cur.getDate(), new Date(year, cur.getMonth() + 1, 0).getDate())).padStart(2, '0');
    onSelect(`${year}-${month}-${day}`);
  };

  const monthYear = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isTodaySelected = selectedDate === todayStr;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.monthNavGroup}>
          <Text style={[styles.monthText, { color: colors.text }]}>{monthYear}</Text>
          <View style={styles.navArrows}>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}
              onPress={() => changeMonth(-1)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}
              onPress={() => changeMonth(1)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightHeaderBtns}>
          {!isTodaySelected && (
            <TouchableOpacity
              style={[styles.todayBadgeBtn, { backgroundColor: '#0D948818' }]}
              onPress={() => onSelect(todayStr)}
              activeOpacity={0.75}
            >
              <Text style={styles.todayBadgeTxt}>Today</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.calendarBtn, { backgroundColor: isDark ? colors.card : '#F8FAFC', borderColor: isDark ? colors.cardBorder : '#E2E8F0' }]}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#0D9488" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.fullDate}
        contentContainerStyle={styles.dayScroll}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => {
          const isSelected = item.fullDate === selectedDate;
          return (
            <TouchableOpacity
              style={[
                styles.dayPill,
                { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: isDark ? colors.cardBorder : '#E2E8F0' },
                isSelected && styles.dayPillSelected,
              ]}
              onPress={() => onSelect(item.fullDate)}
              activeOpacity={0.85}
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
              {item.isToday && (
                <View style={[styles.todayDot, isSelected && { backgroundColor: '#FFFFFF' }]} />
              )}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightHeaderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBadgeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  todayBadgeTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayScroll: {
    paddingVertical: 6,
    gap: 8,
  },
  dayPill: {
    width: 54,
    height: 68,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 17,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0D9488',
    marginTop: 3,
  },
});
