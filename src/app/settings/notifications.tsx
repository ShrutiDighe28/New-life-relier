import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNotifications, NotificationCategory, AppNotification } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";

export default function NotificationsFeedScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, clearNotification } = useNotifications();

    const [showSettings, setShowSettings] = useState(false);

    // Old preference states
    const [meds, setMeds] = useState(true);
    const [appt, setAppt] = useState(true);
    const [env, setEnv] = useState(false);
    const [diet, setDiet] = useState(true);
    const [newsletter, setNewsletter] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSavePreferences = () => {
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setShowSettings(false);
        }, 1200);
    };

    const getIconForCategory = (category: NotificationCategory) => {
        switch (category) {
            case 'Appointments': return 'calendar-clock';
            case 'Reminders': return 'clock-alert-outline';
            case 'Medications': return 'pill';
            case 'Reports': return 'file-document-outline';
            case 'SOS': return 'alert-circle-outline';
            case 'System': return 'information-outline';
            default: return 'bell-outline';
        }
    };

    const getIconColor = (category: NotificationCategory) => {
        switch (category) {
            case 'Appointments': return '#2563EB';
            case 'Reminders': return '#F59E0B';
            case 'Medications': return '#10B981';
            case 'Reports': return '#8B5CF6';
            case 'SOS': return '#EF4444';
            case 'System': return '#64748B';
            default: return '#64748B';
        }
    };

    const handlePressNotification = (notif: AppNotification) => {
        if (!notif.isRead) {
            markAsRead(notif.id);
        }
        if (notif.route) {
            router.push(notif.route as any);
        }
    };

    const formatRelativeDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            
            const diffHrs = Math.floor(diffMins / 60);
            if (diffHrs < 24) return `${diffHrs}h ago`;
            
            const diffDays = Math.floor(diffHrs / 24);
            if (diffDays < 7) return `${diffDays}d ago`;
            
            return date.toLocaleDateString();
        } catch(e) {
            return '';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSettings(true)}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.actionsRow, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.unreadText, { color: colors.textSecondary }]}>
                    {unreadCount} Unread
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.actionTextBlue}>Mark all read</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearAll}>
                        <Text style={styles.actionTextRed}>Clear all</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="bell-sleep-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
                    <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>You have no new notifications.</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {notifications.map((notif) => (
                        <TouchableOpacity
                            key={notif.id}
                            style={[
                                styles.notifCard,
                                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                                !notif.isRead && { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderColor: isDark ? '#2563EB' : '#BFDBFE' }
                            ]}
                            onPress={() => handlePressNotification(notif)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${getIconColor(notif.category)}20` }]}>
                                <MaterialCommunityIcons name={getIconForCategory(notif.category)} size={24} color={getIconColor(notif.category)} />
                            </View>
                            <View style={styles.notifContent}>
                                <View style={styles.notifHeader}>
                                    <Text style={[styles.notifTitle, { color: colors.text }, !notif.isRead && { fontWeight: '700' }]} numberOfLines={1}>
                                        {notif.title}
                                    </Text>
                                    <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
                                        {formatRelativeDate(notif.date)}
                                    </Text>
                                </View>
                                <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                                    {notif.message}
                                </Text>
                            </View>
                            {!notif.isRead && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Settings Modal */}
            <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSettings(false)}>
                <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
                    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSettings(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Preferences</Text>
                        <View style={{ width: 38 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={[styles.sectionHeading, { color: colors.text }]}>Preferences</Text>
                        
                        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            {/* Prescription Reminders */}
                            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                                <View style={styles.rowMeta}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Prescription Reminders</Text>
                                    <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Receive dosage alarms for Metformin, Atorvastatin, etc.</Text>
                                </View>
                                <Switch
                                    value={meds}
                                    onValueChange={setMeds}
                                    trackColor={{ false: colors.cardBorder, true: "#93C5FD" }}
                                    thumbColor={meds ? "#2563EB" : "#94A3B8"}
                                />
                            </View>

                            {/* Appointment alerts */}
                            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                                <View style={styles.rowMeta}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Appointment Alerts</Text>
                                    <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Get push alerts 24 hours prior to scheduled physician visits.</Text>
                                </View>
                                <Switch
                                    value={appt}
                                    onValueChange={setAppt}
                                    trackColor={{ false: colors.cardBorder, true: "#93C5FD" }}
                                    thumbColor={appt ? "#2563EB" : "#94A3B8"}
                                />
                            </View>

                            {/* Env Tracker */}
                            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                                <View style={styles.rowMeta}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Weekly Environmental Reports</Text>
                                    <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Receive updates on pollen counts, UV intensity and local AQI.</Text>
                                </View>
                                <Switch
                                    value={env}
                                    onValueChange={setEnv}
                                    trackColor={{ false: colors.cardBorder, true: "#93C5FD" }}
                                    thumbColor={env ? "#2563EB" : "#94A3B8"}
                                />
                            </View>

                            {/* Dietary alerts */}
                            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
                                <View style={styles.rowMeta}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Dietary Danger Warnings</Text>
                                    <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Alert immediately if barcode scans fail allergen profiles check.</Text>
                                </View>
                                <Switch
                                    value={diet}
                                    onValueChange={setDiet}
                                    trackColor={{ false: colors.cardBorder, true: "#93C5FD" }}
                                    thumbColor={diet ? "#2563EB" : "#94A3B8"}
                                />
                            </View>

                            {/* Newsletter */}
                            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                                <View style={styles.rowMeta}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Wellness Newsletters</Text>
                                    <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>Get custom medical recommendations tailored to your reports.</Text>
                                </View>
                                <Switch
                                    value={newsletter}
                                    onValueChange={setNewsletter}
                                    trackColor={{ false: colors.cardBorder, true: "#93C5FD" }}
                                    thumbColor={newsletter ? "#2563EB" : "#94A3B8"}
                                />
                            </View>
                        </View>

                        {/* Confirm Btn */}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSavePreferences}>
                            <Text style={styles.saveBtnText}>Save Notification Preferences</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    
                    {/* Toast success */}
                    {saved && (
                        <View style={styles.toast}>
                            <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                            <Text style={styles.toastText}>Preferences saved successfully!</Text>
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    unreadText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionTextBlue: {
        color: '#2563EB',
        fontSize: 13,
        fontWeight: '600',
    },
    actionTextRed: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    notifTime: {
        fontSize: 11,
    },
    notifMessage: {
        fontSize: 13,
        lineHeight: 18,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2563EB',
        marginLeft: 8,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
    },
    // Settings modal styles
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 24,
        marginBottom: 10,
    },
    settingsCard: {
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    rowMeta: {
        flex: 1,
        paddingRight: 16,
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: "700",
    },
    rowDesc: {
        fontSize: 10,
        marginTop: 2,
        lineHeight: 14,
    },
    saveBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 24,
    },
    saveBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
