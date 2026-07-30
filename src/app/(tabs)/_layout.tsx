import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDark ? colors.textMuted : "#94A3B8",
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    marginTop: 4,
                },
                tabBarStyle: {
                    height: 74 + insets.bottom,
                    paddingBottom: 12 + insets.bottom,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.cardBorder,
                    backgroundColor: colors.card,
                    elevation: 12,
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[
                            styles.tabIconWrapper,
                            focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }
                        ]}>
                            <MaterialCommunityIcons
                                name={focused ? "home" : "home-outline"}
                                size={22}
                                color={focused ? colors.primary : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="reports"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[
                            styles.tabIconWrapper,
                            focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }
                        ]}>
                            <MaterialCommunityIcons
                                name={focused ? "file-document" : "file-document-outline"}
                                size={22}
                                color={focused ? colors.primary : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="aihub"
                options={{
                    title: "AI Hub",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[
                            styles.tabIconWrapper,
                            focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }
                        ]}>
                            <MaterialCommunityIcons
                                name="brain"
                                size={22}
                                color={focused ? colors.primary : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="appointments"
                options={{
                    title: "Appointments",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[
                            styles.tabIconWrapper,
                            focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }
                        ]}>
                            <MaterialCommunityIcons
                                name={focused ? "calendar-month" : "calendar-month-outline"}
                                size={22}
                                color={focused ? colors.primary : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[
                            styles.tabIconWrapper,
                            focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }
                        ]}>
                            <MaterialCommunityIcons
                                name={focused ? "account" : "account-outline"}
                                size={22}
                                color={focused ? colors.primary : color}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIconWrapper: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        width: 50,
        height: 28,
    },
});