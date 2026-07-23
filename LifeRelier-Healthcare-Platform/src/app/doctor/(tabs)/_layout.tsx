import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeManager";

export default function DoctorTabLayout() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#0D9488",
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
                name="dashboard"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "home" : "home-outline"}
                                size={22}
                                color={focused ? "#0D9488" : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="schedule"
                options={{
                    title: "Schedule",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "calendar-month" : "calendar-month-outline"}
                                size={22}
                                color={focused ? "#0D9488" : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="patients"
                options={{
                    title: "Patients",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name={focused ? "account-group" : "account-group-outline"}
                                size={22}
                                color={focused ? "#0D9488" : color}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="consult"
                options={{
                    title: "Consult",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconWrapper, focused && (isDark ? styles.tabIconWrapperActiveDark : styles.tabIconWrapperActive)]}>
                            <MaterialCommunityIcons
                                name="stethoscope"
                                size={22}
                                color={focused ? "#0D9488" : color}
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
                                color={focused ? "#0D9488" : color}
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
        width: 44,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    tabIconWrapperActive: {
        backgroundColor: "#F0FDFA",
    },
    tabIconWrapperActiveDark: {
        backgroundColor: "rgba(13, 148, 136, 0.15)",
    },
});
