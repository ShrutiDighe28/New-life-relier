import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/utils/themeManager';
import { Appointment } from '@/context/AppointmentsContext';
import { getDaysInMonth, getStartDayOfWeek, parseAppointmentDate, getSpecialtyColor } from '@/utils/calendarUtils';

const { width } = Dimensions.get('window');

interface ModernCalendarProps {
    appointments: Appointment[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export default function ModernCalendar({ appointments, onDateSelect, selectedDate }: ModernCalendarProps) {
    const { colors, isDark } = useTheme();
    
    // We maintain an internal state for the month currently being viewed
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handlePrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDayPress = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (selected < today) return; // Prevent selecting past dates
        onDateSelect(selected);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const startOffset = getStartDayOfWeek(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const cells: React.ReactNode[] = [];

        // Map of days to appointment details for indicator dots
        const appMap: Record<number, { color: string; count: number }> = {};
        appointments.forEach((app) => {
            const appDate = parseAppointmentDate(app.date);
            if (appDate && appDate.getFullYear() === year && appDate.getMonth() === month) {
                const dayNum = appDate.getDate();
                const color = getSpecialtyColor(app.specialty);
                appMap[dayNum] = { color, count: (appMap[dayNum]?.count || 0) + 1 };
            }
        });

        const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

        // Header Days
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const headerCells = weekDays.map((day, i) => (
            <View key={`header-${i}`} style={styles.calendarCell}>
                <Text style={[styles.headerDayText, { color: colors.textSecondary }]}>{day}</Text>
            </View>
        ));

        // Empty cells for offset
        for (let i = 0; i < startOffset; i++) {
            cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const isPast = cellDate < today;
            const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
            const isToday = isCurrentMonthView && today.getDate() === day;

            const appData = appMap[day];

            let activeStyle = null;
            let textStyle = null;

            if (isSelected) {
                activeStyle = { backgroundColor: colors.primary };
                textStyle = { color: '#FFFFFF' };
            } else if (isToday) {
                activeStyle = { backgroundColor: isDark ? '#334155' : '#E2E8F0' };
                textStyle = { color: colors.primary };
            }

            cells.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={styles.calendarCell}
                    onPress={() => handleDayPress(day)}
                    disabled={isPast}
                >
                    <View style={[styles.calendarCellDay, activeStyle, isPast && { opacity: 0.3 }]}>
                        <Text style={[styles.calendarCellDayText, { color: activeStyle ? textStyle?.color : colors.text }]}>{day}</Text>
                    </View>
                    {appData && !isSelected && (
                        <View style={[styles.indicatorDot, { backgroundColor: appData.color }]} />
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <View>
                <View style={styles.calendarRow}>{headerCells}</View>
                <View style={styles.calendarGrid}>{cells}</View>
            </View>
        );
    }, [currentMonth, appointments, selectedDate, colors, isDark]);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={[styles.monthYearText, { color: colors.text }]}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            {renderCalendarGrid}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '600',
    },
    calendarRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: `${100 / 7}%`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        height: 40,
    },
    headerDayText: {
        fontSize: 12,
        fontWeight: '500',
    },
    calendarCellDay: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarCellDayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    indicatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: -2,
    },
});
