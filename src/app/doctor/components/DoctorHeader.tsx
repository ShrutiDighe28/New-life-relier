import LogoBrand from "@/components/LogoBrand";
import { useTheme } from "@/utils/themeManager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DoctorHeaderProps {
    /** Page title shown as a chip next to the portal badge */
    title?: string;
    /** Show a back arrow instead of the logo+badge block */
    showBack?: boolean;
    /** Called when back is pressed; defaults to router.back() */
    onBackPress?: () => void;
    /** Right-hand action button (optional) */
    rightAction?: {
        icon: string;
        onPress: () => void;
        badgeCount?: number;
    };
    /** Show the theme-toggle sun/moon button */
    showThemeToggle?: boolean;
}

export default function DoctorHeader({
    title,
    showBack = false,
    onBackPress,
    rightAction,
    showThemeToggle = true,
}: DoctorHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark, toggleTheme } = useTheme();

    const handleBack = () => {
        if (onBackPress) onBackPress();
        else router.back();
    };

    return (
        <>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? colors.background : "#FFFFFF"}
            />
            <View
                style={[
                    styles.wrapper,
                    {
                        backgroundColor: isDark ? colors.background : "#FFFFFF",
                        borderBottomColor: isDark ? colors.cardBorder : "#F1F5F9",
                        paddingTop: insets.top > 0 ? 4 : 8,
                    },
                ]}
            >
                {/* LEFT: back button OR logo + portal badge + page title */}
                <View style={styles.left}>
                    {showBack ? (
                        <>
                            <TouchableOpacity
                                onPress={handleBack}
                                style={[
                                    styles.iconBtn,
                                    { backgroundColor: isDark ? colors.card : "#F8FAFC" },
                                ]}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="arrow-left"
                                    size={22}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                            {title ? (
                                <Text
                                    style={[styles.backTitle, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {title}
                                </Text>
                            ) : null}
                        </>
                    ) : (
                        <View style={styles.brandBlock}>
                            {/* Row 1: logo wordmark */}
                            <LogoBrand size={26} fontSize={18} />

                            {/* Row 2: portal badge + optional page title */}
                            <View style={styles.badgeRow}>
                                <View
                                    style={[
                                        styles.portalBadge,
                                        {
                                            backgroundColor: isDark
                                                ? "rgba(37,99,235,0.18)"
                                                : "#EFF6FF",
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="stethoscope"
                                        size={11}
                                        color={isDark ? "#93C5FD" : "#2563EB"}
                                    />
                                    <Text
                                        style={[
                                            styles.portalBadgeText,
                                            { color: isDark ? "#93C5FD" : "#2563EB" },
                                        ]}
                                    >
                                        Doctor Portal
                                    </Text>
                                </View>

                                {title ? (
                                    <>
                                        <View
                                            style={[
                                                styles.badgeDivider,
                                                {
                                                    backgroundColor: isDark
                                                        ? "#334155"
                                                        : "#CBD5E1",
                                                },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.pageTitleText,
                                                { color: colors.textSecondary },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {title}
                                        </Text>
                                    </>
                                ) : null}
                            </View>
                        </View>
                    )}
                </View>

                {/* RIGHT: theme toggle + optional action */}
                <View style={styles.right}>
                    {showThemeToggle && (
                        <TouchableOpacity
                            onPress={toggleTheme}
                            style={[
                                styles.iconBtn,
                                { backgroundColor: isDark ? colors.card : "#F8FAFC" },
                            ]}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={isDark ? "weather-sunny" : "weather-night"}
                                size={20}
                                color={isDark ? "#FBBF24" : "#475569"}
                            />
                        </TouchableOpacity>
                    )}

                    {rightAction && (
                        <TouchableOpacity
                            onPress={rightAction.onPress}
                            style={[
                                styles.iconBtn,
                                styles.iconBtnRight,
                                { backgroundColor: isDark ? colors.card : "#F8FAFC" },
                            ]}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={rightAction.icon as any}
                                size={20}
                                color={colors.text}
                            />
                            {rightAction.badgeCount && rightAction.badgeCount > 0 ? (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {rightAction.badgeCount > 9
                                            ? "9+"
                                            : rightAction.badgeCount}
                                    </Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        minHeight: 58,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    brandBlock: {
        flexDirection: "column",
        justifyContent: "center",
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
        gap: 6,
    },
    portalBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    portalBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.1,
    },
    badgeDivider: {
        width: 1,
        height: 10,
        borderRadius: 1,
    },
    pageTitleText: {
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.1,
    },
    backTitle: {
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.3,
        marginLeft: 10,
        flex: 1,
    },
    right: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnRight: {
        position: "relative",
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
        paddingHorizontal: 3,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
    },
});
