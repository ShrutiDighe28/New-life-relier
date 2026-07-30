import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";

export default function AdminTabLayout() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDark ? colors.textMuted : "#94A3B8",
                tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 3 },
                tabBarStyle: {
                    height: 72 + insets.bottom,
                    paddingBottom: 10 + insets.bottom,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.cardBorder,
                    backgroundColor: colors.card,
                    elevation: 12,
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[s.icon, focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }]}>
                            <MaterialCommunityIcons name={focused ? "view-dashboard" : "view-dashboard-outline"} size={22} color={focused ? colors.primary : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="doctors"
                options={{
                    title: "Doctors",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[s.icon, focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }]}>
                            <MaterialCommunityIcons name={focused ? "doctor" : "stethoscope"} size={22} color={focused ? colors.primary : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="patients"
                options={{
                    title: "Patients",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[s.icon, focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }]}>
                            <MaterialCommunityIcons name={focused ? "account-group" : "account-group-outline"} size={22} color={focused ? colors.primary : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[s.icon, focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }]}>
                            <MaterialCommunityIcons name={focused ? "chart-bar" : "chart-bar-stacked"} size={22} color={focused ? colors.primary : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[s.icon, focused && { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : colors.badgeBg }]}>
                            <MaterialCommunityIcons name={focused ? "cog" : "cog-outline"} size={22} color={focused ? colors.primary : color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const s = StyleSheet.create({
    icon: { width: 44, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
});
