import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

const FILTERS = ["All", "Active", "New", "Critical", "Discharged"];

const PATIENTS_DATA = [
    { id: "1", name: "Aarav Sharma", age: "34", gender: "Male", condition: "Hypertension", lastVisit: "Yesterday", status: "Active", initials: "AS", isCritical: false },
    { id: "2", name: "Priya Patel", age: "28", gender: "Female", condition: "Cardiac Arrhythmia", lastVisit: "2 days ago", status: "Critical", initials: "PP", isCritical: true },
    { id: "3", name: "Rajesh Verma", age: "52", gender: "Male", condition: "Diabetes Type-2", lastVisit: "1 week ago", status: "Active", initials: "RV", isCritical: false },
    { id: "4", name: "Ananya Sen", age: "24", gender: "Female", condition: "General Checkup", lastVisit: "3 weeks ago", status: "New", initials: "AS", isCritical: false },
    { id: "5", name: "Vikram Malhotra", age: "61", gender: "Male", condition: "Post-op Recovery", lastVisit: "1 month ago", status: "Discharged", initials: "VM", isCritical: false },
];

export default function DoctorPatientsScreen() {
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredPatients = PATIENTS_DATA.filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.condition.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || p.status === activeFilter;
        return matchesQuery && matchesFilter;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.title, { color: colors.text }]}>My Patients</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{PATIENTS_DATA.length}</Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder }]}>
                    <MaterialCommunityIcons name="magnify" size={22} color="#94A3B8" />
                    <TextInput
                        placeholder="Search patients by name or condition..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: colors.text }]}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {FILTERS.map((filter) => {
                    const isSelected = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterPill,
                                { backgroundColor: isDark ? colors.card : "#F8FAFC", borderColor: colors.cardBorder },
                                isSelected && styles.filterPillSelected,
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, { color: colors.textSecondary }, isSelected && styles.filterTextSelected]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Patients List */}
            {filteredPatients.length > 0 ? (
                <FlatList
                    data={filteredPatients}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                { backgroundColor: isDark ? colors.card : "#FFFFFF", borderColor: colors.cardBorder },
                                item.isCritical && styles.criticalCard,
                            ]}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.initials}</Text>
                            </View>

                            <View style={styles.info}>
                                <View style={styles.nameRow}>
                                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                                    {item.isCritical && (
                                        <View style={styles.criticalBadge}>
                                            <Text style={styles.criticalBadgeText}>Critical</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={[styles.subText, { color: colors.textSecondary }]}>
                                    {item.age} yrs • {item.gender}
                                </Text>

                                <View style={styles.metaRow}>
                                    <View style={styles.conditionTag}>
                                        <Text style={styles.conditionText}>{item.condition}</Text>
                                    </View>
                                    <Text style={[styles.lastVisit, { color: colors.textSecondary }]}>Last: {item.lastVisit}</Text>
                                </View>
                            </View>

                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-search-outline" size={64} color="#94A3B8" />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Patients Found</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                        No records match your search criteria.
                    </Text>
                </View>
            )}
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    countBadge: {
        backgroundColor: "#F0FDFA",
        borderWidth: 1,
        borderColor: "#CCFBF1",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countBadgeText: {
        color: "#0D9488",
        fontSize: 13,
        fontWeight: "800",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        borderRadius: 20,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        height: "100%",
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
        paddingBottom: 12,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        borderWidth: 1.5,
    },
    filterPillSelected: {
        backgroundColor: "#0D9488",
        borderColor: "#0D9488",
    },
    filterText: {
        fontSize: 13,
        fontWeight: "600",
    },
    filterTextSelected: {
        color: "#FFFFFF",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 16,
        gap: 14,
    },
    criticalCard: {
        borderLeftWidth: 5,
        borderLeftColor: "#EF4444",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F0FDFA",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#0D9488",
        fontSize: 16,
        fontWeight: "800",
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
    },
    criticalBadge: {
        backgroundColor: "#FEF2F2",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    criticalBadgeText: {
        color: "#EF4444",
        fontSize: 11,
        fontWeight: "700",
    },
    subText: {
        fontSize: 13,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    conditionTag: {
        backgroundColor: "#F0FDFA",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    conditionText: {
        color: "#0F766E",
        fontSize: 12,
        fontWeight: "600",
    },
    lastVisit: {
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginTop: 12,
    },
    emptySub: {
        fontSize: 14,
        marginTop: 4,
    },
});
