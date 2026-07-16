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
                tabBarActiveTintColor: "#2563EB", // Blue text for active tab
                tabBarInactiveTintColor: isDark ? "#64748B" : "#94A3B8",
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
                    borderTopColor: isDark ? colors.cardBorder : "#F1F5F9",
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
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "home" : "home-outline"}
                                size={22}
                                color={focused ? "#2563EB" : color}
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
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "file-document" : "file-document-outline"}
                                size={22}
                                color={focused ? "#2563EB" : color}
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
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name="brain"
                                size={22}
                                color={focused ? "#2563EB" : color}
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
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "calendar-month" : "calendar-month-outline"}
                                size={22}
                                color={focused ? "#2563EB" : color}
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
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "account" : "account-outline"}
                                size={22}
                                color={focused ? "#2563EB" : color}
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
    tabIconWrapperActive: {
        backgroundColor: "#EFF6FF", // Light blue capsule background for the active tab icon
    },
    tabIconWrapperActiveDark: {
        backgroundColor: "rgba(37, 99, 235, 0.15)", // Dark mode appropriate active background
    },
});