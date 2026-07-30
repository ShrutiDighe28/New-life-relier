import LogoBrand from "@/components/LogoBrand";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
    /** Legacy: plain subtitle rendered under the logo (kept for back-compat) */
    title?: string;
    /** Page-specific title shown as a labelled chip next to the portal badge */
    pageTitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    showSearchButton?: boolean;
    searchQuery?: string;
    onSearchQueryChange?: (text: string) => void;
    showFilterButton?: boolean;
    onFilterPress?: () => void;
    showNotificationButton?: boolean;
    showProfileButton?: boolean;
}

export default function Header({
    title,
    pageTitle,
    showBackButton = false,
    onBackPress,
    showSearchButton = false,
    searchQuery = "",
    onSearchQueryChange,
    showFilterButton = false,
    onFilterPress,
    showNotificationButton = true,
    showProfileButton = false,
}: HeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const { colors, isDark, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const [searchActive, setSearchActive] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <Animated.View
            style={[
                styles.header,
                {
                    opacity: fadeAnim,
                    backgroundColor: colors.background,
                    borderBottomColor: colors.divider,
                    paddingTop: 6,
                    minHeight: 48,
                },
            ]}
        >
            {/* Left Section: Back Button + Logo/Title or Search Row */}
            <View style={styles.leftSection}>
                {showBackButton && !searchActive && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}

                {!searchActive ? (
                    <View style={styles.brandBlock}>
                        {/* Row 1: logo wordmark */}
                        <LogoBrand size={26} fontSize={18} />

                        {/* Row 2: portal badge + optional page title */}
                        <View style={styles.badgeRow}>
                            <View style={[
                                styles.portalBadge,
                                { backgroundColor: colors.badgeBg },
                            ]}>
                                <MaterialCommunityIcons
                                    name="account-heart-outline"
                                    size={11}
                                    color={colors.badgeText}
                                />
                                <Text style={[
                                    styles.portalBadgeText,
                                    { color: colors.badgeText },
                                ]}>
                                    Patient Portal
                                </Text>
                            </View>

                            {(pageTitle || title) ? (
                                <>
                                    <View style={[styles.badgeDivider, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
                                    <Text
                                        style={[styles.pageTitleText, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {pageTitle ?? title}
                                    </Text>
                                </>
                            ) : null}
                        </View>
                    </View>
                ) : (
                    /* Search input + Filter button adjacent row */
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <View
                            style={[
                                styles.searchContainer,
                                {
                                    backgroundColor: colors.inputBg,
                                    borderColor: colors.inputBorder,
                                    borderWidth: 1,
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingHorizontal: 12,
                                    borderRadius: 12,
                                    height: 40,
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="magnify"
                                size={20}
                                color={colors.textSecondary}
                                style={{ marginRight: 6 }}
                            />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text, flex: 1 }]}
                                placeholder="Search reports..."
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={onSearchQueryChange}
                                autoFocus
                            />
                        </View>
                        {showFilterButton && (
                            <TouchableOpacity
                                style={{
                                    marginLeft: 10,
                                    padding: 8,
                                    backgroundColor: colors.inputBg,
                                    borderColor: colors.inputBorder,
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    height: 40,
                                    width: 40,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={onFilterPress}
                            >
                                <MaterialCommunityIcons
                                    name="filter-variant"
                                    size={20}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Right Section: Theme Toggle, Search Toggle, Filter, Notifications, Profile */}
            <View style={styles.rightContainer}>
                {showSearchButton && (
                    <TouchableOpacity
                        style={[styles.iconButton, searchActive && { marginRight: 0 }]}
                        onPress={() => {
                            const nextState = !searchActive;
                            setSearchActive(nextState);
                            if (!nextState && onSearchQueryChange) {
                                onSearchQueryChange("");
                            }
                        }}
                    >
                        <MaterialCommunityIcons
                            name={searchActive ? "close" : "magnify"}
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}

                {showFilterButton && !searchActive && (
                    <TouchableOpacity style={styles.iconButton} onPress={onFilterPress}>
                        <MaterialCommunityIcons
                            name="filter-outline"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}

                {!searchActive && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: isDark ? colors.card : "#F8FAFC" }]}
                        activeOpacity={0.7}
                        onPress={toggleTheme}
                    >
                        <MaterialCommunityIcons
                            name={isDark ? "weather-sunny" : "weather-night"}
                            size={20}
                            color={isDark ? "#FBBF24" : "#475569"}
                        />
                    </TouchableOpacity>
                )}

                {showNotificationButton && !searchActive && (
                    <TouchableOpacity
                        style={[styles.iconButton, { position: "relative", backgroundColor: isDark ? colors.card : "#F8FAFC" }]}
                        activeOpacity={0.7}
                        onPress={() => router.push("/settings/notifications")}
                    >
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={20}
                            color={colors.text}
                        />
                        {unreadCount > 0 && (
                            <View style={[styles.badge, { borderColor: colors.background }]}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {showProfileButton && !searchActive && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push("/(tabs)/profile")}
                    >
                        <Image
                            source={require("@/assets/images/dashboard/profile.png")}
                            style={styles.profile}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
    },
    backButton: {
        marginRight: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    // ── Brand block (logo + badge row) ───────────────────────────────────
    brandBlock: {
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 2,
    },
    portalBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    portalBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.4,
    },
    badgeDivider: {
        width: 1,
        height: 10,
        borderRadius: 1,
    },
    pageTitleText: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.1,
        flexShrink: 1,
    },
    // ── Legacy (kept for back-compat) ────────────────────────────────────
    headerTitle: {
        fontSize: 13,
        fontWeight: "600",
    },
    // ── Search ────────────────────────────────────────────────────────────
    searchContainer: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    searchInput: {
        fontSize: 14,
        padding: 0,
    },
    // ── Right icons ───────────────────────────────────────────────────────
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        paddingHorizontal: 2,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
    },
    profile: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
});