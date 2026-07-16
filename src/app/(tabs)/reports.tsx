import React, { useState, useMemo, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Animated,
    Modal,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { ReportData } from "@/utils/mockReportsData";
import { useTheme } from "@/utils/themeManager";
import { Header } from "@/components/dashboard";
import { useAuth } from "@/context/AuthContext";

// Reports are always per-user. New accounts start with an empty list.
// mockReports is NOT imported — only available through the demo path.
const emptyReports: ReportData[] = [];

const { width } = Dimensions.get("window");

export default function ReportsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { user } = useAuth();

    // Each user's reports are isolated — new accounts start empty
    // (In a real backend, these would be fetched from an API keyed by user ID)
    const userReports: ReportData[] = emptyReports;

    // Search and category states
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<"All" | "Pathology" | "Radiology" | "Cardiology">("All");

    // Sorting states
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical">("newest");
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);

    // Options menu states
    const [selectedReportForMenu, setSelectedReportForMenu] = useState<ReportData | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    // Download simulation states
    const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Animations
    const searchBarWidth = useRef(new Animated.Value(0)).current;

    // Toggle search bar
    const toggleSearch = () => {
        if (isSearchActive) {
            Animated.timing(searchBarWidth, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start(() => {
                setIsSearchActive(false);
                setSearchQuery("");
            });
        } else {
            setIsSearchActive(true);
            Animated.timing(searchBarWidth, {
                toValue: width * 0.55,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    };

    // Filter & Sort Reports
    const filteredReports = useMemo(() => {
        let reports = [...userReports];

        // Filter by Category
        if (selectedCategory !== "All") {
            reports = reports.filter((r) => r.type === selectedCategory);
        }

        // Filter by Search Query
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            reports = reports.filter(
                (r) =>
                    r.title.toLowerCase().includes(query) ||
                    r.labName.toLowerCase().includes(query) ||
                    r.status.toLowerCase().includes(query)
            );
        }

        // Sort reports
        if (sortBy === "newest") {
            reports.sort((a, b) => parseInt(b.day) - parseInt(a.day));
        } else if (sortBy === "oldest") {
            reports.sort((a, b) => parseInt(a.day) - parseInt(b.day));
        } else if (sortBy === "alphabetical") {
            reports.sort((a, b) => a.title.localeCompare(b.title));
        }

        return reports;
    }, [userReports, selectedCategory, searchQuery, sortBy]);

    // Handle report download simulation
    const handleDownload = (report: ReportData) => {
        setDownloadingReportId(report.id);
        setDownloadProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.25;
            setDownloadProgress(Math.min(progress, 1));
            if (progress >= 1) {
                clearInterval(interval);
                setTimeout(() => {
                    setDownloadingReportId(null);
                    showToast(`${report.title} downloaded successfully!`);
                }, 400);
            }
        }, 150);
    };

    // Toast visual indicator
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleOpenMenu = (report: ReportData) => {
        setSelectedReportForMenu(report);
        setIsMenuVisible(true);
    };

    const handleMenuOption = (option: "details" | "viewer" | "share" | "download") => {
        setIsMenuVisible(false);
        if (!selectedReportForMenu) return;

        setTimeout(() => {
            switch (option) {
                case "details":
                    router.push(`/reports/report-details?id=${selectedReportForMenu.id}`);
                    break;
                case "viewer":
                    router.push(`/reports/report-viewer?id=${selectedReportForMenu.id}`);
                    break;
                case "share":
                    router.push(`/reports/report-share?id=${selectedReportForMenu.id}`);
                    break;
                case "download":
                    handleDownload(selectedReportForMenu);
                    break;
            }
        }, 200);
    };

    // Category style helpers
    const getCategoryStyles = (categoryName: "All" | "Pathology" | "Radiology" | "Cardiology") => {
        const isSelected = selectedCategory === categoryName;
        return {
            container: [
                styles.categoryChip,
                isSelected 
                    ? styles.categoryChipActive 
                    : [styles.categoryChipInactive, { backgroundColor: colors.card, borderColor: colors.cardBorder }],
            ],
            text: [
                styles.categoryText,
                isSelected 
                    ? styles.categoryTextActive 
                    : [styles.categoryTextInactive, { color: colors.textSecondary }],
            ],
            iconColor: isSelected ? "#FFFFFF" : colors.textSecondary,
        };
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            {/* Reusable App Header */}
            <Header
                showSearchButton
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                showFilterButton
                onFilterPress={() => setIsSortModalVisible(true)}
            />

            <ScrollView
                style={{ backgroundColor: colors.background }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Titles */}
                <View style={styles.titleSection}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>Reports</Text>
                    <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>View, download and share your lab reports</Text>
                </View>

                {/* Primary Hero Banner */}
                <LinearGradient
                    colors={isDark ? ["#1E293B", "#0F172A"] : ["#EFF6FF", "#DBEAFE"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.heroBanner, isDark && { borderWidth: 1, borderColor: colors.cardBorder }]}
                >
                    <View style={styles.heroLeft}>
                        <Image
                            source={require("@/assets/images/dashboard/reports.png")}
                            style={styles.heroIcon}
                        />
                        <View style={styles.heroTextContainer}>
                            <Text style={[styles.heroTitle, { color: isDark ? colors.text : "#1E3A8A" }]}>All Your Health Reports</Text>
                            <Text style={[styles.heroSubtitle, { color: isDark ? colors.textSecondary : "#2563EB" }]}>
                                Access your test reports anytime, anywhere in one place.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.heroRight}>
                        <View style={[styles.shieldWrapper, { backgroundColor: colors.card }]}>
                            <MaterialCommunityIcons name="shield-check" size={24} color="#2563EB" />
                        </View>
                    </View>
                </LinearGradient>

                {/* Category Selection Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    <TouchableOpacity
                        style={getCategoryStyles("All").container}
                        onPress={() => setSelectedCategory("All")}
                    >
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={18}
                            color={getCategoryStyles("All").iconColor}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={getCategoryStyles("All").text}>All Reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getCategoryStyles("Pathology").container}
                        onPress={() => setSelectedCategory("Pathology")}
                    >
                        <MaterialCommunityIcons
                            name="flask-outline"
                            size={18}
                            color={getCategoryStyles("Pathology").iconColor}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={getCategoryStyles("Pathology").text}>Pathology</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getCategoryStyles("Radiology").container}
                        onPress={() => setSelectedCategory("Radiology")}
                    >
                        <MaterialCommunityIcons
                            name="image-filter-black-white"
                            size={18}
                            color={getCategoryStyles("Radiology").iconColor}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={getCategoryStyles("Radiology").text}>Radiology</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getCategoryStyles("Cardiology").container}
                        onPress={() => setSelectedCategory("Cardiology")}
                    >
                        <MaterialCommunityIcons
                            name="heart-outline"
                            size={18}
                            color={getCategoryStyles("Cardiology").iconColor}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={getCategoryStyles("Cardiology").text}>Cardiology</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* List Header */}
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>Recent Reports</Text>
                    <TouchableOpacity onPress={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Report Cards List */}
                <View style={styles.reportsList}>
                    {filteredReports.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="file-document-outline" size={56} color={colors.textSecondary} />
                            {userReports.length === 0 ? (
                                // New user — no reports at all
                                <>
                                    <Text style={[styles.emptyText, { color: colors.text, fontWeight: '600', fontSize: 16, marginTop: 12 }]}>
                                        No Reports Yet
                                    </Text>
                                    <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }]}>
                                        Your medical reports will appear here{"\n"}once your doctor uploads them.
                                    </Text>
                                </>
                            ) : (
                                // Reports exist but search/filter returned nothing
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No reports found matching your criteria
                                </Text>
                            )}
                        </View>
                    ) : (
                        filteredReports.map((report) => {
                            // Style settings based on category matching mockup
                            let iconBgColor = isDark ? "#1E293B" : "#EFF6FF";
                            let iconColor = "#2563EB";
                            if (report.type === "Radiology") {
                                iconBgColor = isDark ? "#2E1065" : "#F3E8FF";
                                iconColor = "#9333EA";
                            } else if (report.type === "Cardiology") {
                                iconBgColor = isDark ? "#451A03" : "#FEE2E2";
                                iconColor = "#DC2626";
                            } else if (report.id === "lft") {
                                iconBgColor = isDark ? "#064E3B" : "#E8F5E9";
                                iconColor = "#10B981";
                            }

                            // Dynamic Status Badge Colors
                            let statusBgColor = isDark ? "#064E3B" : "#E8F5E9";
                            let statusTextColor = isDark ? "#34D399" : "#2E7D32";
                            if (report.status === "Borderline") {
                                statusBgColor = isDark ? "#78350F" : "#FEF3C7";
                                statusTextColor = isDark ? "#FBBF24" : "#D97706";
                            } else if (report.status === "Review") {
                                statusBgColor = isDark ? "#7F1D1D" : "#FFEBEE";
                                statusTextColor = isDark ? "#F87171" : "#C62828";
                            }

                            const isDownloading = downloadingReportId === report.id;

                            return (
                                <TouchableOpacity
                                    key={report.id}
                                    style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    activeOpacity={0.9}
                                    onPress={() => router.push(`/reports/report-details?id=${report.id}`)}
                                >
                                    {/* Left Icon Container */}
                                    <View style={[styles.cardIconWrapper, { backgroundColor: iconBgColor }]}>
                                        {report.image ? (
                                            <Image source={report.image} style={styles.cardImage} />
                                        ) : (
                                            <MaterialCommunityIcons name={report.icon as any} size={28} color={iconColor} />
                                        )}
                                    </View>

                                    {/* Middle Content */}
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                                            {report.title}
                                        </Text>
                                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                                            {report.date} • {report.labName}
                                        </Text>

                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                                            <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
                                                {report.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Right Section: Exact 2x2 grid matching image */}
                                    {/* Col 1: Date Box (top) & Eye button (bottom) */}
                                    {/* Col 2: Three Dots menu (top) & Download button (bottom) */}
                                    <View style={styles.cardRightSection}>
                                        {/* Left Sub-Column */}
                                        <View style={styles.rightSubCol}>
                                            <View style={[styles.dateBox, { backgroundColor: isDark ? colors.backgroundSecondary : "#EFF6FF", borderColor: colors.cardBorder }]}>
                                                <Text style={[styles.dateDay, { color: colors.primary }]}>{report.day}</Text>
                                                <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>{report.month}</Text>
                                                <Text style={[styles.dateYear, { color: colors.textSecondary }]}>{report.year}</Text>
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.cardActionButton, { backgroundColor: isDark ? colors.backgroundSecondary : "#EFF6FF" }]}
                                                onPress={() => router.push(`/reports/report-viewer?id=${report.id}`)}
                                            >
                                                <MaterialCommunityIcons
                                                    name="eye-outline"
                                                    size={18}
                                                    color={colors.primary}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Right Sub-Column */}
                                        <View style={styles.rightSubCol}>
                                            <TouchableOpacity
                                                style={styles.menuDots}
                                                onPress={() => handleOpenMenu(report)}
                                            >
                                                <MaterialCommunityIcons
                                                    name="dots-vertical"
                                                    size={22}
                                                    color={colors.textSecondary}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.cardActionButton, { backgroundColor: isDark ? colors.backgroundSecondary : "#EFF6FF" }]}
                                                onPress={() => handleDownload(report)}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <View style={styles.progressCircle}>
                                                        <Text style={[styles.progressText, { color: colors.primary }]}>
                                                            {Math.round(downloadProgress * 100)}%
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <MaterialCommunityIcons
                                                        name="download-outline"
                                                        size={18}
                                                        color={colors.primary}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                {/* Secure & Private Banner */}
                <View style={[styles.secureBanner, { backgroundColor: isDark ? colors.card : "#EFF6FF", borderColor: colors.cardBorder }]}>
                    <View style={styles.secureLeft}>
                        <View style={styles.secureIconWrapper}>
                            <MaterialCommunityIcons name="shield-check" size={26} color="#FFFFFF" />
                        </View>
                        <View style={styles.secureTextWrapper}>
                            <Text style={[styles.secureTitle, { color: isDark ? colors.text : "#1E3A8A" }]}>Secure & Private</Text>
                            <Text style={[styles.secureSubtitle, { color: colors.textSecondary }]}>
                                Your reports are encrypted and stored securely.
                            </Text>
                        </View>
                    </View>
                    <Image
                        source={require("@/assets/images/dashboard/shield.png")}
                        style={styles.secureImage}
                    />
                </View>
            </ScrollView>

            {/* Custom Toast Alert */}
            {toastMessage && (
                <Animated.View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}

            {/* Sort Options Modal */}
            <Modal
                visible={isSortModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSortModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsSortModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Sort Reports By</Text>
                        <TouchableOpacity
                            style={[styles.modalOption, { borderBottomColor: colors.divider }]}
                            onPress={() => {
                                setSortBy("newest");
                                setIsSortModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: sortBy === "newest" ? colors.primary : colors.textSecondary }, sortBy === "newest" && styles.modalOptionTextSelected]}>
                                Date: Newest First
                            </Text>
                            {sortBy === "newest" && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalOption, { borderBottomColor: colors.divider }]}
                            onPress={() => {
                                setSortBy("oldest");
                                setIsSortModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: sortBy === "oldest" ? colors.primary : colors.textSecondary }, sortBy === "oldest" && styles.modalOptionTextSelected]}>
                                Date: Oldest First
                            </Text>
                            {sortBy === "oldest" && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalOption, { borderBottomColor: "transparent" }]}
                            onPress={() => {
                                setSortBy("alphabetical");
                                setIsSortModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: sortBy === "alphabetical" ? colors.primary : colors.textSecondary }, sortBy === "alphabetical" && styles.modalOptionTextSelected]}>
                                Test Name: A - Z
                            </Text>
                            {sortBy === "alphabetical" && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Three Dots Options Menu Bottom Sheet Modal */}
            <Modal
                visible={isMenuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View style={[styles.sheetContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.sheetDragBar, { backgroundColor: colors.divider }]} />
                        {selectedReportForMenu && (
                            <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
                                <Text style={[styles.sheetReportTitle, { color: colors.text }]} numberOfLines={1}>
                                    {selectedReportForMenu.title}
                                </Text>
                                <Text style={[styles.sheetReportSub, { color: colors.textSecondary }]}>
                                    {selectedReportForMenu.labName}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderBottomColor: colors.divider }]}
                            onPress={() => handleMenuOption("details")}
                        >
                            <MaterialCommunityIcons name="card-text-outline" size={22} color={colors.textSecondary} />
                            <Text style={[styles.sheetOptionText, { color: colors.text }]}>View Detailed Parameters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderBottomColor: colors.divider }]}
                            onPress={() => handleMenuOption("viewer")}
                        >
                            <MaterialCommunityIcons name="file-pdf-box" size={22} color={colors.textSecondary} />
                            <Text style={[styles.sheetOptionText, { color: colors.text }]}>View Printable Report (PDF)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderBottomColor: colors.divider }]}
                            onPress={() => handleMenuOption("share")}
                        >
                            <MaterialCommunityIcons name="share-variant-outline" size={22} color={colors.textSecondary} />
                            <Text style={[styles.sheetOptionText, { color: colors.text }]}>Share Securely</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderBottomColor: colors.divider }]}
                            onPress={() => handleMenuOption("download")}
                        >
                            <MaterialCommunityIcons name="download" size={22} color={colors.textSecondary} />
                            <Text style={[styles.sheetOptionText, { color: colors.text }]}>Download Original PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, { borderBottomWidth: 0 }]}
                            onPress={() => setIsMenuVisible(false)}
                        >
                            <MaterialCommunityIcons name="close" size={22} color="#EF4444" />
                            <Text style={[styles.sheetOptionText, { color: "#EF4444" }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: "#FFFFFF",
    },
    logo: {
        width: 140,
        height: 40,
        resizeMode: "contain",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchContainer: {
        height: 38,
        backgroundColor: "#F1F5F9",
        borderRadius: 20,
        paddingHorizontal: 12,
        justifyContent: "center",
        marginRight: 4,
    },
    searchInput: {
        fontSize: 14,
        color: "#0F172A",
        padding: 0,
    },
    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 4,
    },
    notificationWrapper: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "800",
    },
    scrollContent: {
        paddingBottom: 100,
    },
    titleSection: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#071739",
    },
    pageSubtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
    },
    heroBanner: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    heroIcon: {
        width: 54,
        height: 54,
        resizeMode: "contain",
        marginRight: 12,
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E3A8A",
    },
    heroSubtitle: {
        fontSize: 12,
        color: "#2563EB",
        marginTop: 2,
        lineHeight: 16,
    },
    heroRight: {
        marginLeft: 10,
    },
    shieldWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        marginVertical: 20,
        height: 42,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        height: 38,
        borderWidth: 1,
    },
    categoryChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    categoryChipInactive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "600",
    },
    categoryTextActive: {
        color: "#FFFFFF",
    },
    categoryTextInactive: {
        color: "#475569",
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563EB",
    },
    reportsList: {
        paddingHorizontal: 20,
    },
    reportCard: {
        flexDirection: "row",
        alignItems: "stretch",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        minHeight: 125, // adjusted min height to fit grid beautifully
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        alignSelf: "center",
    },
    cardImage: {
        width: 36,
        height: 36,
        resizeMode: "contain",
    },
    cardContent: {
        flex: 1,
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        lineHeight: 20,
    },
    cardSubtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
        marginTop: 8,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    cardRightSection: {
        flexDirection: "row", // Side-by-side columns
        alignItems: "stretch",
        justifyContent: "flex-end",
        paddingLeft: 8,
    },
    rightSubCol: {
        flexDirection: "column",
        justifyContent: "space-between", // Top item at top, bottom item at bottom
        alignItems: "center",
        marginLeft: 10,
        minHeight: 85,
    },
    dateBox: {
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: 60,
    },
    dateDay: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2563EB",
    },
    dateMonth: {
        fontSize: 8,
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
        marginTop: 1,
    },
    dateYear: {
        fontSize: 8,
        fontWeight: "500",
        color: "#64748B",
    },
    menuDots: {
        padding: 2,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    cardActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    progressCircle: {
        justifyContent: "center",
        alignItems: "center",
    },
    progressText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#2563EB",
    },
    secureBanner: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: "#EFF6FF",
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    secureLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    secureIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    secureTextWrapper: {
        flex: 1,
    },
    secureTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E3A8A",
    },
    secureSubtitle: {
        fontSize: 11,
        color: "#475569",
        marginTop: 2,
        lineHeight: 15,
    },
    secureImage: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginLeft: 10,
    },
    toast: {
        position: "absolute",
        bottom: 90,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(7, 23, 57, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        width: width * 0.85,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#071739",
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modalOptionSelected: {},
    modalOptionText: {
        fontSize: 15,
        color: "#475569",
        fontWeight: "500",
    },
    modalOptionTextSelected: {
        color: "#2563EB",
        fontWeight: "700",
    },
    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(7, 23, 57, 0.5)",
        justifyContent: "flex-end",
    },
    sheetContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingTop: 12,
        maxHeight: "80%",
    },
    sheetDragBar: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#E2E8F0",
        alignSelf: "center",
        marginBottom: 20,
    },
    sheetHeader: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 16,
    },
    sheetReportTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    sheetReportSub: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    },
    sheetOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    sheetOptionText: {
        fontSize: 15,
        color: "#334155",
        fontWeight: "600",
        marginLeft: 12,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 10,
    },
});