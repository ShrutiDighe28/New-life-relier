import React, { useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeManager";
import {
    useNotifications,
    AppNotification,
    NotificationCategory,
} from "@/context/NotificationsContext";

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_NOTIFICATIONS: Omit<AppNotification, "id" | "isRead" | "date">[] = [
    {
        title: "New Appointment Booked",
        message: "Aarav Sharma has booked a video consultation for today at 10:30 AM.",
        category: "Appointments",
        route: "/doctor/(tabs)/schedule",
    },
    {
        title: "Consultation Reminder",
        message: "Your next consultation with Priya Patel starts in 30 minutes.",
        category: "Reminders",
        route: "/doctor/(tabs)/consult",
    },
    {
        title: "Appointment Cancelled",
        message: "Rajesh Verma has cancelled his 02:00 PM appointment for today.",
        category: "Appointments",
        route: "/doctor/(tabs)/schedule",
    },
    {
        title: "Prescription Updated",
        message: "Prescription for Ananya Sen has been updated and sent to the pharmacy.",
        category: "Medications",
        route: "/doctor/(tabs)/patients",
    },
    {
        title: "Lab Report Available",
        message: "HbA1c report for Rajesh Verma is now available for your review.",
        category: "Reports",
        route: "/doctor/(tabs)/patients",
    },
    {
        title: "Follow-up Due",
        message: "Vikram Malhotra is due for a post-op follow-up checkup today.",
        category: "Reminders",
        route: "/doctor/(tabs)/patients",
    },
    {
        title: "System Maintenance",
        message: "Scheduled maintenance tonight at 2:00 AM. App may be briefly unavailable.",
        category: "System",
    },
];

// ─── Category config ──────────────────────────────────────────────────────────

type CatConfig = { icon: string; color: string; bg: string };

const CAT: Record<NotificationCategory, CatConfig> = {
    Appointments: { icon: "calendar-check-outline",  color: "#2563EB", bg: "#EFF6FF" },
    Reminders:    { icon: "bell-ring-outline",        color: "#D97706", bg: "#FFFBEB" },
    Medications:  { icon: "pill",                     color: "#8B5CF6", bg: "#F5F3FF" },
    Reports:      { icon: "file-chart-outline",       color: "#0D9488", bg: "#F0FDFA" },
    SOS:          { icon: "alert-circle-outline",     color: "#EF4444", bg: "#FEF2F2" },
    System:       { icon: "information-outline",      color: "#64748B", bg: "#F1F5F9" },
};

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  === 1) return "Yesterday";
    return `${days}d ago`;
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotifRow({
    item,
    colors,
    isDark,
    onPress,
    onDelete,
    index,
}: {
    item: AppNotification;
    colors: any;
    isDark: boolean;
    onPress: () => void;
    onDelete: () => void;
    index: number;
}) {
    const cfg     = CAT[item.category] ?? CAT.System;
    const slideIn = useRef(new Animated.Value(40)).current;
    const fade    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade,    { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }),
            Animated.spring(slideIn, { toValue: 0, friction: 8,   delay: index * 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const cardBg = item.isRead
        ? isDark ? colors.card : "#FFFFFF"
        : isDark ? "#0F2A28"   : "#F0FDFA";

    const cardBorder = item.isRead
        ? isDark ? colors.cardBorder : "#E8EFF5"
        : "#CCFBF1";

    return (
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideIn }] }}>
            <TouchableOpacity
                activeOpacity={0.82}
                onPress={onPress}
                style={[
                    styles.notifCard,
                    { backgroundColor: cardBg, borderColor: cardBorder },
                    !item.isRead && styles.notifCardUnread,
                ]}
            >
                {/* Unread indicator dot */}
                {!item.isRead && <View style={styles.unreadDot} />}

                {/* Category icon */}
                <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                    <MaterialCommunityIcons name={cfg.icon as any} size={22} color={cfg.color} />
                </View>

                {/* Text content */}
                <View style={styles.notifBody}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[
                                styles.notifTitle,
                                { color: colors.text },
                                !item.isRead && { fontWeight: "800" },
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
                            {relativeTime(item.date)}
                        </Text>
                    </View>

                    <Text
                        style={[styles.notifMessage, { color: colors.textSecondary }]}
                        numberOfLines={2}
                    >
                        {item.message}
                    </Text>

                    <View style={[styles.catChip, { backgroundColor: cfg.bg }]}>
                        <MaterialCommunityIcons name={cfg.icon as any} size={10} color={cfg.color} />
                        <Text style={[styles.catChipText, { color: cfg.color }]}>
                            {item.category}
                        </Text>
                    </View>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                    onPress={onDelete}
                    hitSlop={10}
                    style={styles.deleteBtn}
                >
                    <MaterialCommunityIcons name="close" size={14} color="#94A3B8" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DoctorNotificationsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        addNotification,
    } = useNotifications();

    // Seed notifications once when the screen first opens and list is empty
    const seeded = useRef(false);
    useEffect(() => {
        if (seeded.current || notifications.length > 0) return;
        seeded.current = true;
        SEED_NOTIFICATIONS.forEach((s, i) => {
            setTimeout(() => addNotification(s), i * 60);
        });
    }, []);

    const handlePress = useCallback(
        (item: AppNotification) => {
            if (!item.isRead) markAsRead(item.id);
            if (item.route) router.push(item.route as any);
        },
        [markAsRead, router]
    );

    const hasNotifs = notifications.length > 0;

    // Header right action
    const renderHeaderAction = () => {
        if (unreadCount > 0) {
            return (
                <TouchableOpacity
                    onPress={markAllAsRead}
                    activeOpacity={0.75}
                    style={styles.headerActionBtn}
                >
                    <MaterialCommunityIcons name="check-all" size={18} color="#0D9488" />
                    <Text style={[styles.headerActionText, { color: "#0D9488" }]}>All read</Text>
                </TouchableOpacity>
            );
        }
        if (hasNotifs) {
            return (
                <TouchableOpacity
                    onPress={clearAll}
                    activeOpacity={0.75}
                    style={styles.headerActionBtn}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={17} color="#EF4444" />
                    <Text style={[styles.headerActionText, { color: "#EF4444" }]}>Clear all</Text>
                </TouchableOpacity>
            );
        }
        return <View style={{ width: 80 }} />;
    };

    return (
        <SafeAreaView
            style={[styles.root, { backgroundColor: colors.background }]}
            edges={["top"]}
        >
            {/* ── Header ─────────────────────────────────────────────── */}
            <View
                style={[
                    styles.header,
                    { borderBottomColor: isDark ? colors.cardBorder : "#F1F5F9" },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    style={[
                        styles.backBtn,
                        { backgroundColor: isDark ? colors.card : "#F8FAFC" },
                    ]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Notifications
                    </Text>
                    {unreadCount > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>

                {renderHeaderAction()}
            </View>

            {/* ── Summary strip ──────────────────────────────────────── */}
            {hasNotifs && (
                <View
                    style={[
                        styles.summaryStrip,
                        {
                            backgroundColor: isDark ? colors.card : "#F8FAFC",
                            borderBottomColor: isDark ? colors.cardBorder : "#F1F5F9",
                        },
                    ]}
                >
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                        {unreadCount > 0
                            ? `${unreadCount} unread · ${notifications.length} total`
                            : `All caught up · ${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
                    </Text>
                </View>
            )}

            {/* ── List / Empty state ─────────────────────────────────── */}
            {hasNotifs ? (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {notifications.map((item, index) => (
                        <NotifRow
                            key={item.id}
                            item={item}
                            index={index}
                            colors={colors}
                            isDark={isDark}
                            onPress={() => handlePress(item)}
                            onDelete={() => clearNotification(item.id)}
                        />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <View
                        style={[
                            styles.emptyIconBg,
                            { backgroundColor: isDark ? colors.card : "#F0FDFA" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="bell-off-outline"
                            size={52}
                            color="#0D9488"
                        />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        No Notifications
                    </Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                        You're all caught up. New alerts for appointments,{"\n"}
                        prescriptions, and reminders will appear here.
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    headerBadge: {
        backgroundColor: "#EF4444",
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
    },
    headerBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "800",
    },
    headerActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    headerActionText: {
        fontSize: 13,
        fontWeight: "700",
    },

    // Summary strip
    summaryStrip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    summaryText: {
        fontSize: 12,
        fontWeight: "600",
    },

    // List
    listContent: {
        padding: 16,
        gap: 10,
        paddingBottom: 50,
    },

    // Notification card
    notifCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 18,
        borderWidth: 1.5,
        padding: 14,
        gap: 12,
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    notifCardUnread: {
        borderLeftWidth: 4,
        borderLeftColor: "#0D9488",
    },
    unreadDot: {
        position: "absolute",
        top: 14,
        right: 38,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#0D9488",
    },
    notifIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    notifBody: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 6,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: "700",
        flex: 1,
        letterSpacing: -0.1,
    },
    notifTime: {
        fontSize: 11,
        fontWeight: "600",
        flexShrink: 0,
        marginTop: 1,
    },
    notifMessage: {
        fontSize: 13,
        lineHeight: 19,
    },
    catChip: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 2,
    },
    catChipText: {
        fontSize: 10,
        fontWeight: "700",
    },
    deleteBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        marginTop: 2,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        gap: 16,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    emptySub: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
    },
});
