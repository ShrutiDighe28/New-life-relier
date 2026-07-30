import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import { useTheme } from "@/utils/themeManager";
import {
    fetchEnvironmentalData,
    searchCity,
    EnvironmentalData,
    CitySearchResult,
} from "@/services/environmentService";
import { analyzeEnvironmentalData, EnvironmentAnalysis } from "@/services/geminiService";

export default function EnvironmentalTrackerScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<EnvironmentalData | null>(null);
    const [warnings, setWarnings] = useState<EnvironmentAnalysis["warnings"]>([]);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (forceCoords?: { lat: number, lon: number, name?: string }) => {
        try {
            setLoading(true);
            let lat = 18.5204;
            let lon = 73.8567;
            let locName = "Pune, Maharashtra";

            if (forceCoords) {
                lat = forceCoords.lat;
                lon = forceCoords.lon;
                if (forceCoords.name) locName = forceCoords.name;
            } else {
                // Request Permission
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert("Permission Denied", "Using default location (Pune, Maharashtra). Please enable location services to see your local environmental data.");
                } else {
                    try {
                        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                        lat = location.coords.latitude;
                        lon = location.coords.longitude;
                        locName = "Current Location";
                    } catch (locErr) {
                        console.log("GPS fetch failed, falling back to default.", locErr);
                        Alert.alert("GPS Error", "Could not fetch current location. Using default location.");
                    }
                }
            }

            // Fetch Live Data
            const envData = await fetchEnvironmentalData(lat, lon, locName === "Current Location" ? undefined : locName);
            setData(envData);

            // Fetch Gemini Insights
            const aiInsights = await analyzeEnvironmentalData(envData);
            setWarnings(aiInsights.warnings);

        } catch (error) {
            console.error("Error loading environmental data:", error);
            Alert.alert("Error", "Failed to fetch environmental data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (data) {
            // Keep current location if not using GPS
            const isCustom = data.locationName !== "Current Location" && !data.locationName.includes("Unknown");
            if (isCustom) {
                loadData({ lat: data.latitude, lon: data.longitude, name: data.locationName });
            } else {
                loadData();
            }
        } else {
            loadData();
        }
    }, [data]);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);
            const results = await searchCity(text);
            setSearchResults(results);
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const selectCity = (city: CitySearchResult) => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        const name = `${city.name}${city.admin1 ? `, ${city.admin1}` : ""}`;
        loadData({ lat: city.latitude, lon: city.longitude, name });
    };

    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return { bg: isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5", border: isDark ? "rgba(16, 185, 129, 0.3)" : "#A7F3D0", text: "#047857", val: "#065F46" }; // Good
        if (aqi <= 100) return { bg: isDark ? "rgba(245, 158, 11, 0.12)" : "#FFFBEB", border: isDark ? "rgba(245, 158, 11, 0.3)" : "#FDE68A", text: "#B45309", val: "#92400E" }; // Moderate
        if (aqi <= 150) return { bg: isDark ? "rgba(249, 115, 22, 0.12)" : "#FFF7ED", border: isDark ? "rgba(249, 115, 22, 0.3)" : "#FED7AA", text: "#C2410C", val: "#9A3412" }; // Unhealthy for sensitive groups
        if (aqi <= 200) return { bg: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2", border: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA", text: "#B91C1C", val: "#991B1B" }; // Unhealthy
        if (aqi <= 300) return { bg: isDark ? "rgba(168, 85, 247, 0.12)" : "#FAF5FF", border: isDark ? "rgba(168, 85, 247, 0.3)" : "#E9D5FF", text: "#7E22CE", val: "#6B21A8" }; // Very Unhealthy
        return { bg: isDark ? "rgba(153, 27, 27, 0.12)" : "#7F1D1D", border: isDark ? "rgba(153, 27, 27, 0.3)" : "#FCA5A5", text: "#FECACA", val: "#F87171" }; // Hazardous
    };

    const getAqiStatus = (aqi: number) => {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy (Sensitive)";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    };

    const getPollutantStatus = (val: number, type: 'pm25' | 'pm10' | 'o3') => {
        // Approximate status bands
        if (type === 'pm25') return val < 12 ? { text: "Good", color: "#10B981" } : val < 35.4 ? { text: "Moderate", color: "#F59E0B" } : { text: "High", color: "#EF4444" };
        if (type === 'pm10') return val < 54 ? { text: "Good", color: "#10B981" } : val < 154 ? { text: "Moderate", color: "#F59E0B" } : { text: "High", color: "#EF4444" };
        return val < 54 ? { text: "Good", color: "#10B981" } : val < 70 ? { text: "Moderate", color: "#F59E0B" } : { text: "High", color: "#EF4444" }; // O3 approx
    };

    const pollenLevels = data ? [
        { type: "Grass Pollen", level: data.pollen.grass, color: data.pollen.grass === "High" ? "#EF4444" : data.pollen.grass === "Moderate" ? "#F59E0B" : "#10B981" },
        { type: "Tree Pollen", level: data.pollen.tree, color: data.pollen.tree === "High" ? "#EF4444" : data.pollen.tree === "Moderate" ? "#F59E0B" : "#10B981" },
        { type: "Weed Pollen", level: data.pollen.weed, color: data.pollen.weed === "High" ? "#EF4444" : data.pollen.weed === "Moderate" ? "#F59E0B" : "#10B981" },
    ] : [];

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Environmental Tracker</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSearch(!showSearch)}>
                    <MaterialCommunityIcons name={showSearch ? "close" : "magnify"} size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search Bar Overlay */}
            {showSearch && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <MaterialCommunityIcons name="map-search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search city..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                        {isSearching && <ActivityIndicator size="small" color="#2563EB" />}
                    </View>
                    {searchResults.length > 0 && (
                        <View style={styles.searchResults}>
                            {searchResults.map((res) => (
                                <TouchableOpacity key={res.id} style={styles.searchResultItem} onPress={() => selectCity(res)}>
                                    <Text style={styles.searchResultText}>{res.name}{res.admin1 ? `, ${res.admin1}` : ""}</Text>
                                    <Text style={styles.searchResultCountry}>{res.country}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Fetching real-time data...</Text>
                </View>
            ) : (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} tintColor="#2563EB" />}
                >
                    {/* Location Bar */}
                    <View style={styles.locationBar}>
                        <MaterialCommunityIcons name="map-marker" size={18} color="#2563EB" />
                        <Text style={styles.locationText}>{data?.locationName}</Text>
                        <TouchableOpacity onPress={onRefresh} style={{ marginLeft: "auto" }}>
                            <MaterialCommunityIcons name="refresh" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {data && (
                        <>
                            {/* AQI Indicator Card */}
                            <View style={[styles.aqiCard, { backgroundColor: getAqiColor(data.airQuality.aqi).bg, borderColor: getAqiColor(data.airQuality.aqi).border }]}>
                                <View style={styles.aqiLeft}>
                                    <Text style={[styles.aqiLabel, { color: getAqiColor(data.airQuality.aqi).text }]}>Air Quality Index</Text>
                                    <Text style={[styles.aqiValue, { color: getAqiColor(data.airQuality.aqi).val }]}>{data.airQuality.aqi}</Text>
                                    <View style={[styles.aqiBadge, { backgroundColor: getAqiColor(data.airQuality.aqi).border }]}>
                                        <Text style={[styles.aqiBadgeText, { color: getAqiColor(data.airQuality.aqi).text }]}>{getAqiStatus(data.airQuality.aqi)}</Text>
                                    </View>
                                </View>

                                <View style={styles.aqiRadialMock}>
                                    <View style={[styles.radialRingOuter, { borderColor: getAqiColor(data.airQuality.aqi).border, borderTopColor: getAqiColor(data.airQuality.aqi).val }]}>
                                        <View style={styles.radialRingInner}>
                                            <MaterialCommunityIcons name={data.airQuality.aqi > 100 ? "weather-fog" : "weather-windy"} size={26} color={getAqiColor(data.airQuality.aqi).val} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* AI Tailored Health Warning Recommendations */}
                            {warnings.length > 0 && (
                                <View style={styles.aiWarningCard}>
                                    <View style={styles.aiWarningHeader}>
                                        <MaterialCommunityIcons name="robot-outline" size={20} color={isDark ? colors.secondary : "#1E3A8A"} />
                                        <Text style={styles.aiWarningTitle}>AI Personal Risk Warnings</Text>
                                    </View>
                                    <View style={styles.warningList}>
                                        {warnings.map((warn, idx) => (
                                            <View key={idx} style={styles.warningRow}>
                                                <MaterialCommunityIcons name={warn.icon as any || "alert-circle-outline"} size={18} color={warn.color || "#D97706"} style={{ marginTop: 2 }} />
                                                <Text style={styles.warningText}>
                                                    <Text style={{ fontWeight: "700" }}>{warn.title}</Text>: {warn.description}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Air Pollutants Breakdown */}
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Key Air Pollutants</Text>
                                <View style={styles.pollutantsGrid}>
                                    <View style={styles.pollutantCol}>
                                        <Text style={styles.pollutantName}>PM2.5</Text>
                                        <Text style={styles.pollutantVal}>{data.airQuality.pm2_5.toFixed(1)} µg/m³</Text>
                                        <Text style={[styles.pollutantStatus, { color: getPollutantStatus(data.airQuality.pm2_5, 'pm25').color }]}>{getPollutantStatus(data.airQuality.pm2_5, 'pm25').text}</Text>
                                    </View>
                                    <View style={styles.pollutantCol}>
                                        <Text style={styles.pollutantName}>PM10</Text>
                                        <Text style={styles.pollutantVal}>{data.airQuality.pm10.toFixed(1)} µg/m³</Text>
                                        <Text style={[styles.pollutantStatus, { color: getPollutantStatus(data.airQuality.pm10, 'pm10').color }]}>{getPollutantStatus(data.airQuality.pm10, 'pm10').text}</Text>
                                    </View>
                                    <View style={styles.pollutantCol}>
                                        <Text style={styles.pollutantName}>Ozone (O₃)</Text>
                                        <Text style={styles.pollutantVal}>{data.airQuality.ozone.toFixed(1)} µg/m³</Text>
                                        <Text style={[styles.pollutantStatus, { color: getPollutantStatus(data.airQuality.ozone, 'o3').color }]}>{getPollutantStatus(data.airQuality.ozone, 'o3').text}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Pollen Tracker */}
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Allergen & Pollen Count</Text>
                                {pollenLevels.map((pol, idx) => (
                                    <View key={idx} style={[styles.pollenRow, idx === pollenLevels.length - 1 && { borderBottomWidth: 0 }]}>
                                        <View style={styles.pollenLeft}>
                                            <MaterialCommunityIcons name="flower" size={16} color={colors.textSecondary} />
                                            <Text style={styles.pollenName}>{pol.type}</Text>
                                        </View>
                                        <View style={styles.pollenRight}>
                                            <Text style={[styles.pollenLevelVal, { color: pol.color }]}>{pol.level}</Text>
                                            <View style={[styles.statusDotMini, { backgroundColor: pol.color }]} />
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Weather & UV Index */}
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Weather & Sun Safety</Text>
                                <View style={styles.weatherRow}>
                                    <View style={styles.weatherItem}>
                                        <MaterialCommunityIcons name="thermometer" size={24} color="#EF4444" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.weatherLabel}>Temperature</Text>
                                            <Text style={styles.weatherVal}>{data.weather.temperature}°C</Text>
                                        </View>
                                    </View>
                                    <View style={styles.weatherItem}>
                                        <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#F59E0B" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.weatherLabel}>UV Index</Text>
                                            <Text style={styles.weatherVal}>{data.weather.uvIndex} ({data.weather.uvIndex > 7 ? "Very High" : data.weather.uvIndex > 5 ? "High" : data.weather.uvIndex > 2 ? "Moderate" : "Low"})</Text>
                                        </View>
                                    </View>
                                    <View style={styles.weatherItem}>
                                        <MaterialCommunityIcons name="water-percent" size={24} color="#3B82F6" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.weatherLabel}>Humidity</Text>
                                            <Text style={styles.weatherVal}>{data.weather.humidity}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        zIndex: 10,
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
        color: colors.text,
    },
    searchContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: colors.card,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        zIndex: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: colors.text,
        fontSize: 15,
    },
    searchResults: {
        marginTop: 12,
        backgroundColor: isDark ? "#334155" : "#FFFFFF",
        borderRadius: 12,
        overflow: 'hidden',
    },
    searchResultItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    searchResultText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
    searchResultCountry: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    locationBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    locationText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginLeft: 8,
    },
    aqiCard: {
        borderWidth: 1,
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    aqiLeft: {
        flex: 1,
    },
    aqiLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    aqiValue: {
        fontSize: 48,
        fontWeight: "900",
        marginVertical: 4,
    },
    aqiBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    aqiBadgeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    aqiRadialMock: {
        width: 90,
        height: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    radialRingOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    radialRingInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.card,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 14,
    },
    pollutantsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    pollutantCol: {
        flex: 1,
        alignItems: "center",
    },
    pollutantName: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "700",
    },
    pollutantVal: {
        fontSize: 14,
        fontWeight: "800",
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 4,
    },
    pollutantStatus: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    pollenRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    pollenLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    pollenName: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginLeft: 8,
    },
    pollenRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    pollenLevelVal: {
        fontSize: 12,
        fontWeight: "700",
        marginRight: 6,
    },
    statusDotMini: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    weatherRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    weatherItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    weatherLabel: {
        fontSize: 10,
        color: "#94A3B8",
        fontWeight: "600",
        textTransform: "uppercase",
    },
    weatherVal: {
        fontSize: 13,
        fontWeight: "700",
        color: isDark ? colors.textSecondary : "#334155",
        marginTop: 2,
    },
    aiWarningCard: {
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
    },
    aiWarningHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    aiWarningTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
        marginLeft: 8,
    },
    warningList: {},
    warningRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    warningText: {
        fontSize: 12,
        color: isDark ? colors.textSecondary : "#334155",
        lineHeight: 18,
        flex: 1,
        marginLeft: 8,
    },
});