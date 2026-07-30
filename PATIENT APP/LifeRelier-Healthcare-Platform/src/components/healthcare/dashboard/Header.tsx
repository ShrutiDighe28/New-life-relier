import React, { useEffect, useMemo, useState } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, Animated, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";
import { useNotifications } from "@/context/NotificationsContext";
import LogoBrand from "@/components/LogoBrand";
import { useRouter } from "expo-router";

interface HeaderProps {
    title?: string;
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
                    <>
                        {title ? (
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {title}
                            </Text>
                        ) : (
                            <LogoBrand size={32} fontSize={22} />
                        )}
                    </>
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
                        style={styles.iconButton}
                        activeOpacity={0.7}
                        onPress={toggleTheme}
                    >
                        <MaterialCommunityIcons
                            name={isDark ? "weather-sunny" : "weather-night"}
                            size={24}
                            color={isDark ? "#FBBF24" : "#071739"}
                        />
                    </TouchableOpacity>
                )}

                {showNotificationButton && !searchActive && (
                    <TouchableOpacity
                        style={[styles.iconButton, { position: "relative" }]}
                        activeOpacity={0.7}
                        onPress={() => router.push("/settings/notifications")}
                    >
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={24}
                            color={colors.text}
                        />
                        {unreadCount > 0 && (
                            <View style={[styles.badge, { borderColor: colors.background }]}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
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
        paddingRight: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    searchContainer: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    searchInput: {
        fontSize: 14,
        padding: 0,
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        marginLeft: 16, // Change to marginLeft to space them uniformly from the left
        padding: 4,
    },
    notification: {
        marginLeft: 16,
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
    },
    profile: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 16,
    },
});