import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { Appointment } from '@/context/AppointmentsContext';
import { getDaysInMonth, getStartDayOfWeek, parseAppointmentDate, getSpecialtyColor } from '@/utils/calendarUtils';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 80) / 7;

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface ModernCalendarProps {
    appointments: Appointment[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export default function ModernCalendar({ appointments, onDateSelect, selectedDate }: ModernCalendarProps) {
    const { colors, isDark } = useTheme();

    const [currentMonth, setCurrentMonth] = useState(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    const [showYearPicker, setShowYearPicker] = useState(false);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const handleToday = useCallback(() => {
        const now = new Date();
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        onDateSelect(now);
    }, [onDateSelect]);

    const handleDayPress = useCallback((day: number) => {
        const selected = new Date(year, month, day);
        if (selected < today) return;
        onDateSelect(selected);
    }, [year, month, today, onDateSelect]);

    const handleMonthYearSelect = useCallback((m: number, y: number) => {
        setCurrentMonth(new Date(y, m, 1));
        setShowYearPicker(false);
    }, []);

    // Build appointment dots map
    const appMap = useMemo(() => {
        const map: Record<number, { colors: string[]; count: number }> = {};
        appointments.forEach((app) => {
            const appDate = parseAppointmentDate(app.date);
            if (appDate && appDate.getFullYear() === year && appDate.getMonth() === month) {
                const dayNum = appDate.getDate();
                const color = getSpecialtyColor(app.specialty);
                if (!map[dayNum]) {
                    map[dayNum] = { colors: [color], count: 1 };
                } else {
                    if (!map[dayNum].colors.includes(color)) map[dayNum].colors.push(color);
                    map[dayNum].count++;
                }
            }
        });
        return map;
    }, [appointments, year, month]);

    const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

    const calendarCells = useMemo(() => {
        const startOffset = getStartDayOfWeek(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const cells: React.ReactNode[] = [];

        // Empty offset cells
        for (let i = 0; i < startOffset; i++) {
            cells.push(<View key={`empty-${i}`} style={styles.cell} />);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const isPast = cellDate < today;
            const isSelected = selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day;
            const isToday = isCurrentMonthView && today.getDate() === day;
            const appData = appMap[day];

            cells.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={styles.cell}
                    onPress={() => handleDayPress(day)}
                    disabled={isPast}
                    activeOpacity={0.6}
                >
                    <View style={[
                        styles.dayCellInner,
                        isSelected && { backgroundColor: colors.primary },
                        isToday && !isSelected && {
                            borderWidth: 2,
                            borderColor: colors.primary,
                        },
                        isPast && { opacity: 0.3 },
                    ]}>
                        <Text style={[
                            styles.dayText,
                            { color: colors.text },
                            isSelected && { color: '#FFFFFF', fontWeight: '700' },
                            isToday && !isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}>
                            {day}
                        </Text>
                    </View>
                    {appData && !isSelected && (
                        <View style={styles.dotsRow}>
                            {appData.colors.slice(0, 3).map((c, i) => (
                                <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                            ))}
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return cells;
    }, [year, month, selectedDate, appMap, colors, isDark, today, isCurrentMonthView, handleDayPress]);

    // Year picker years
    const yearRange = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let y = currentYear - 2; y <= currentYear + 5; y++) years.push(y);
        return years;
    }, []);

    return (
        <View style={[styles.container, {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
        }]}>
            {/* Header with month/year + nav */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.6}>
                    <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setShowYearPicker(true)}
                    style={styles.monthYearBtn}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.monthYearText, { color: colors.text }]}>
                        {MONTH_NAMES[month]} {year}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.6}>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Today button */}
            {!isCurrentMonthView && (
                <TouchableOpacity
                    onPress={handleToday}
                    style={[styles.todayBtn, { backgroundColor: `${colors.primary}15` }]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="calendar-today" size={14} color={colors.primary} />
                    <Text style={[styles.todayBtnText, { color: colors.primary }]}>Today</Text>
                </TouchableOpacity>
            )}

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
                {WEEKDAYS.map((d, i) => (
                    <View key={i} style={styles.cell}>
                        <Text style={[styles.weekdayText, { color: colors.textSecondary }]}>{d}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
                {calendarCells}
            </View>

            {/* Month/Year Picker Modal */}
            <Modal visible={showYearPicker} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowYearPicker(false)}
                >
                    <View style={[styles.pickerCard, {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    }]}>
                        <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Month & Year</Text>

                        {/* Year row */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
                            {yearRange.map(y => (
                                <TouchableOpacity
                                    key={y}
                                    style={[
                                        styles.yearChip,
                                        { borderColor: isDark ? '#475569' : '#E2E8F0' },
                                        y === year && { backgroundColor: colors.primary, borderColor: colors.primary },
                                    ]}
                                    onPress={() => setCurrentMonth(new Date(y, month, 1))}
                                >
                                    <Text style={[
                                        styles.yearChipText,
                                        { color: colors.textSecondary },
                                        y === year && { color: '#FFFFFF' },
                                    ]}>{y}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Month grid */}
                        <View style={styles.monthGrid}>
                            {MONTH_NAMES.map((m, i) => (
                                <TouchableOpacity
                                    key={m}
                                    style={[
                                        styles.monthChip,
                                        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                                        i === month && year === currentMonth.getFullYear() && {
                                            backgroundColor: colors.primary,
                                        },
                                    ]}
                                    onPress={() => handleMonthYearSelect(i, year)}
                                >
                                    <Text style={[
                                        styles.monthChipText,
                                        { color: colors.text },
                                        i === month && year === currentMonth.getFullYear() && { color: '#FFFFFF' },
                                    ]}>
                                        {m.slice(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthYearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '700',
    },
    todayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 12,
        gap: 4,
    },
    todayBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    cell: {
        width: `${100 / 7}%`,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    weekdayText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCellInner: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    dotsRow: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 2,
        gap: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerCard: {
        width: width - 48,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },
    yearScroll: {
        marginBottom: 20,
    },
    yearChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    yearChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    monthChip: {
        width: '30%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    monthChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
