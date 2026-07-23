import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useReports, ReportData } from "@/context/ReportsContext";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

export default function ReportViewerScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [zoomLevel, setZoomLevel] = useState(100);
    const [isPrinting, setIsPrinting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [statusText, setStatusText] = useState<string | null>(null);

    const { reports } = useReports();

    // Find current report from the user's personal report store
    const report = useMemo(() => {
        return reports.find((r) => r.id === id) || null;
    }, [reports, id]);

    if (!report) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#525659', justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
                <MaterialCommunityIcons name="file-alert-outline" size={64} color="#94A3B8" />
                <Text style={{ color: '#CBD5E1', fontSize: 16, marginTop: 12, fontWeight: '600' }}>Report Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleZoomIn = () => {
        if (zoomLevel < 150) setZoomLevel((prev) => prev + 10);
    };

    const handleZoomOut = () => {
        if (zoomLevel > 70) setZoomLevel((prev) => prev - 10);
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setStatusText("Connecting to LifeRelier Cloud Printer...");
        setTimeout(() => {
            setStatusText("Sending print job (1 page)...");
            setTimeout(() => {
                setIsPrinting(false);
                setStatusText("Job sent successfully!");
                setTimeout(() => setStatusText(null), 3000);
            }, 1500);
        }, 1200);
    };

    const handleDownload = () => {
        setDownloading(true);
        setStatusText("Saving PDF to local storage...");
        setTimeout(() => {
            setDownloading(false);
            setStatusText("File saved in Downloads: LifeRelier_Report.pdf");
            setTimeout(() => setStatusText(null), 3500);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Top Toolbar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {report.title}
                </Text>
                <View style={styles.headerRightActions}>
                    <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
                        <MaterialCommunityIcons name="printer" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() => router.push(`/reports/report-share?id=${report.id}`)}
                    >
                        <MaterialCommunityIcons name="share-variant" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sub-toolbar with zoom & page info */}
            <View style={styles.subToolbar}>
                <View style={styles.zoomControls}>
                    <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
                        <MaterialCommunityIcons name="minus" size={18} color="#475569" />
                    </TouchableOpacity>
                    <Text style={styles.zoomText}>{zoomLevel}%</Text>
                    <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
                        <MaterialCommunityIcons name="plus" size={18} color="#475569" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.pageLabel}>Page 1 of 1</Text>
            </View>

            {/* Document Workspace */}
            <ScrollView
                horizontal
                contentContainerStyle={styles.horizontalScroll}
                showsHorizontalScrollIndicator={false}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.verticalScroll}
                >
                    {/* Simulated A4 Document Page */}
                    <View
                        style={[
                            styles.documentPage,
                            { transform: [{ scale: zoomLevel / 100 }] },
                        ]}
                    >
                        {/* Light grey diagonal watermark */}
                        <View style={styles.watermarkContainer}>
                            <Text style={styles.watermarkText}>LIFERELIER DIAGNOSTICS</Text>
                        </View>

                        {/* Letterhead Header */}
                        <View style={styles.letterhead}>
                            <View style={styles.letterheadLeft}>
                                <Text style={styles.labMainTitle}>LIFERELIER DIAGNOSTIC CENTER</Text>
                                <Text style={styles.labAddress}>
                                    12/B Metro Plaza, Sector-5, New Delhi - 110001
                                </Text>
                                <Text style={styles.labContact}>
                                    Phone: 011-4567890 | Email: diagnostics@liferelier.com
                                </Text>
                                <Text style={styles.labCredentials}>
                                    NABL Accredited Lab | ISO 9001:2015 Certified
                                </Text>
                            </View>

                            {/* Visually drawn barcode */}
                            <View style={styles.barcodeWrapper}>
                                <View style={styles.barcodeLines}>
                                    <View style={[styles.barcodeLine, { width: 3 }]} />
                                    <View style={[styles.barcodeLine, { width: 1 }]} />
                                    <View style={[styles.barcodeLine, { width: 4 }]} />
                                    <View style={[styles.barcodeLine, { width: 2 }]} />
                                    <View style={[styles.barcodeLine, { width: 1 }]} />
                                    <View style={[styles.barcodeLine, { width: 3 }]} />
                                    <View style={[styles.barcodeLine, { width: 2 }]} />
                                    <View style={[styles.barcodeLine, { width: 1 }]} />
                                    <View style={[styles.barcodeLine, { width: 4 }]} />
                                    <View style={[styles.barcodeLine, { width: 1 }]} />
                                    <View style={[styles.barcodeLine, { width: 2 }]} />
                                </View>
                                <Text style={styles.barcodeText}>*{report.patientInfo.id}*</Text>
                            </View>
                        </View>

                        <View style={styles.dividerDouble} />

                        {/* Patient info grid with formal borders */}
                        <View style={styles.patientInfoTable}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableLabelCell}>Patient Name:</Text>
                                <Text style={styles.tableValCell}>{user?.fullName || report.patientInfo.name}</Text>
                                <Text style={styles.tableLabelCell}>Registered ID:</Text>
                                <Text style={styles.tableValCell}>{report.patientInfo.id}</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableLabelCell}>Age / Gender:</Text>
                                <Text style={styles.tableValCell}>
                                    {user?.age || report.patientInfo.age} Yrs / {user?.gender || report.patientInfo.gender}
                                </Text>
                                <Text style={styles.tableLabelCell}>Referred By:</Text>
                                <Text style={styles.tableValCell}>{report.patientInfo.refDoctor}</Text>
                            </View>
                            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.tableLabelCell}>Collected Date:</Text>
                                <Text style={styles.tableValCell}>{report.patientInfo.collectionDate}</Text>
                                <Text style={styles.tableLabelCell}>Report Date:</Text>
                                <Text style={styles.tableValCell}>{report.patientInfo.reportDate}</Text>
                            </View>
                        </View>

                        <View style={styles.dividerSingle} />
                        <Text style={styles.reportDocTitle}>DEPARTMENT OF {report.type.toUpperCase()}</Text>
                        <Text style={styles.reportDocSubtitle}>Clinical Diagnostic Report</Text>
                        <View style={styles.dividerSingle} />

                        {/* Medical Parameters Grid (Pathology) */}
                        {report.parameters && report.parameters.length > 0 && (
                            <View style={styles.reportGrid}>
                                <View style={styles.gridHeaderRow}>
                                    <Text style={[styles.gridHeadCell, { flex: 2 }]}>Test Parameter</Text>
                                    <Text style={[styles.gridHeadCell, { flex: 1, textAlign: "right" }]}>Observed Value</Text>
                                    <Text style={[styles.gridHeadCell, { flex: 1 }]}>Unit</Text>
                                    <Text style={[styles.gridHeadCell, { flex: 1.5 }]}>Biological Reference Range</Text>
                                    <Text style={[styles.gridHeadCell, { flex: 0.8 }]}>Status</Text>
                                </View>

                                {report.parameters.map((param, index) => {
                                    const isAbnormal = param.status !== "Normal";
                                    return (
                                        <View key={index} style={styles.gridDataRow}>
                                            <Text style={[styles.gridDataCell, { flex: 2, fontWeight: "600" }]}>
                                                {param.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.gridDataCell,
                                                    {
                                                        flex: 1,
                                                        textAlign: "right",
                                                        fontWeight: "800",
                                                        color: isAbnormal ? "#B91C1C" : "#000000",
                                                    },
                                                ]}
                                            >
                                                {param.value}
                                            </Text>
                                            <Text style={[styles.gridDataCell, { flex: 1 }]}>{param.unit}</Text>
                                            <Text style={[styles.gridDataCell, { flex: 1.5 }]}>{param.refRange}</Text>
                                            <Text
                                                style={[
                                                    styles.gridDataCell,
                                                    {
                                                        flex: 0.8,
                                                        fontWeight: "800",
                                                        color: isAbnormal ? "#B91C1C" : "#047857",
                                                    },
                                                ]}
                                            >
                                                {param.status}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Clinical findings text (Radiology & Cardiology) */}
                        {report.findings && (
                            <View style={styles.findingsBlock}>
                                <Text style={styles.findingsHeading}>FINDINGS & DESCRIPTION:</Text>
                                <Text style={styles.findingsBody}>{report.findings}</Text>
                            </View>
                        )}

                        <View style={styles.docFooterSpace} />

                        {/* Signatures & Certification block at bottom of document */}
                        <View style={styles.signatureBlock}>
                            {/* Visual stamp on the left */}
                            <View style={styles.stampOutline}>
                                <Text style={styles.stampTextTitle}>LIFERELIER</Text>
                                <Text style={styles.stampTextSubtitle}>DIAGNOSTICS</Text>
                                <Text style={styles.stampTextValidated}>VALIDATED</Text>
                            </View>

                            <View style={styles.signatureCol}>
                                <Text style={styles.signatureScript}>Sandeep Kumar</Text>
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureDoctor}>Dr. Sandeep Kumar, MD</Text>
                                <Text style={styles.signatureCredentials}>
                                    Reg. No: 64921 | Chief Pathologist
                                </Text>
                            </View>
                        </View>

                        {/* Document Footer Warning */}
                        <View style={styles.documentPageFooter}>
                            <View style={styles.dividerSingle} />
                            <Text style={styles.confidentialNotice}>
                                *** End of Report. Confidential Document. For Clinical Correlation Only. ***
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </ScrollView>

            {/* Bottom Status Notifications & Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
                {statusText ? (
                    <View style={styles.statusToast}>
                        {isPrinting || downloading ? (
                            <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                        ) : (
                            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.statusToastText}>{statusText}</Text>
                    </View>
                ) : (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.bottomBtnOutline} onPress={handlePrint}>
                            <MaterialCommunityIcons name="printer" size={20} color="#2563EB" />
                            <Text style={styles.bottomBtnOutlineText}>Cloud Print</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bottomBtnSolid} onPress={handleDownload}>
                            <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
                            <Text style={styles.bottomBtnSolidText}>Save PDF File</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#525659", // dark PDF viewer grey background
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: "#1E293B", // deep grey/blue top toolbar
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
        color: "#FFFFFF",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 12,
    },
    headerRightActions: {
        flexDirection: "row",
    },
    subToolbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#334155",
        paddingHorizontal: 20,
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#475569",
    },
    zoomControls: {
        flexDirection: "row",
        alignItems: "center",
    },
    zoomBtn: {
        padding: 4,
        backgroundColor: "#F1F5F9",
        borderRadius: 4,
    },
    zoomText: {
        fontSize: 12,
        color: "#FFFFFF",
        marginHorizontal: 10,
        fontWeight: "700",
    },
    pageLabel: {
        fontSize: 12,
        color: "#CBD5E1",
        fontWeight: "500",
    },
    horizontalScroll: {
        justifyContent: "center",
        alignItems: "center",
    },
    verticalScroll: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    documentPage: {
        backgroundColor: "#FFFFFF",
        width: 400,
        minHeight: 560,
        padding: 20,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        position: "relative",
    },
    watermarkContainer: {
        position: "absolute",
        top: 240,
        left: -30,
        width: 460,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.04,
        transform: [{ rotate: "-28deg" }],
        zIndex: 0,
    },
    watermarkText: {
        fontSize: 32,
        fontWeight: "900",
        color: "#000000",
        letterSpacing: 2,
    },
    letterhead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        zIndex: 1,
    },
    letterheadLeft: {
        flex: 1,
    },
    labMainTitle: {
        fontSize: 13,
        fontWeight: "900",
        color: "#071739",
    },
    labAddress: {
        fontSize: 8,
        color: "#475569",
        marginTop: 2,
    },
    labContact: {
        fontSize: 8,
        color: "#475569",
    },
    labCredentials: {
        fontSize: 8,
        fontWeight: "700",
        color: "#2563EB",
        marginTop: 2,
    },
    barcodeWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    barcodeLines: {
        flexDirection: "row",
        height: 20,
        alignItems: "stretch",
    },
    barcodeLine: {
        backgroundColor: "#000000",
        marginRight: 1,
    },
    barcodeText: {
        fontSize: 7,
        color: "#64748B",
        marginTop: 2,
        letterSpacing: 1.5,
    },
    dividerDouble: {
        height: 4,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#071739",
        marginTop: 10,
        marginBottom: 10,
        zIndex: 1,
    },
    dividerSingle: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 8,
        zIndex: 1,
    },
    patientInfoTable: {
        borderWidth: 1,
        borderColor: "#94A3B8",
        borderRadius: 4,
        padding: 6,
        backgroundColor: "#F8FAFC",
        zIndex: 1,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingVertical: 4,
    },
    tableLabelCell: {
        flex: 1,
        fontSize: 8,
        fontWeight: "700",
        color: "#64748B",
    },
    tableValCell: {
        flex: 1.5,
        fontSize: 8,
        fontWeight: "700",
        color: "#0F172A",
    },
    reportDocTitle: {
        fontSize: 11,
        fontWeight: "900",
        color: "#071739",
        textAlign: "center",
        marginTop: 6,
        zIndex: 1,
    },
    reportDocSubtitle: {
        fontSize: 8,
        color: "#64748B",
        textAlign: "center",
        fontWeight: "600",
        zIndex: 1,
    },
    reportGrid: {
        width: "100%",
        marginTop: 8,
        zIndex: 1,
    },
    gridHeaderRow: {
        flexDirection: "row",
        borderBottomWidth: 1.5,
        borderBottomColor: "#000000",
        paddingBottom: 4,
        marginBottom: 4,
    },
    gridHeadCell: {
        fontSize: 8,
        fontWeight: "800",
        color: "#000000",
    },
    gridDataRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingVertical: 5,
    },
    gridDataCell: {
        fontSize: 8,
        color: "#334155",
    },
    findingsBlock: {
        marginTop: 10,
        paddingHorizontal: 4,
        zIndex: 1,
    },
    findingsHeading: {
        fontSize: 9,
        fontWeight: "900",
        color: "#000000",
        marginBottom: 6,
    },
    findingsBody: {
        fontSize: 8.5,
        color: "#334155",
        lineHeight: 14,
    },
    docFooterSpace: {
        height: 60,
    },
    signatureBlock: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 10,
        zIndex: 1,
    },
    stampOutline: {
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderRadius: 8,
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: "-10deg" }],
        opacity: 0.65,
    },
    stampTextTitle: {
        fontSize: 8,
        fontWeight: "900",
        color: "#3B82F6",
        letterSpacing: 1,
    },
    stampTextSubtitle: {
        fontSize: 6,
        fontWeight: "700",
        color: "#3B82F6",
    },
    stampTextValidated: {
        fontSize: 7,
        fontWeight: "900",
        color: "#10B981",
        marginTop: 1,
        letterSpacing: 0.5,
    },
    signatureCol: {
        alignItems: "center",
    },
    signatureScript: {
        fontSize: 16,
        fontWeight: "500",
        color: "#2563EB",
        fontFamily: "serif",
    },
    signatureLine: {
        width: 110,
        height: 1,
        backgroundColor: "#475569",
        marginVertical: 4,
    },
    signatureDoctor: {
        fontSize: 8,
        fontWeight: "700",
        color: "#0F172A",
    },
    signatureCredentials: {
        fontSize: 7,
        color: "#64748B",
    },
    documentPageFooter: {
        width: "100%",
        marginTop: 10,
    },
    confidentialNotice: {
        fontSize: 7,
        color: "#94A3B8",
        textAlign: "center",
        fontStyle: "italic",
    },
    bottomBar: {
        backgroundColor: "#1E293B",
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 72,
        borderTopWidth: 1,
        borderTopColor: "#334155",
        justifyContent: "center",
    },
    statusToast: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F172A",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: "center",
    },
    statusToastText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    bottomBtnOutline: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#3B82F6",
        borderRadius: 12,
        marginRight: 10,
        height: 48,
    },
    bottomBtnOutlineText: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "700",
        marginLeft: 6,
    },
    bottomBtnSolid: {
        flex: 1.2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2563EB",
        borderRadius: 12,
        height: 48,
    },
    bottomBtnSolidText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
        marginLeft: 6,
    },
});
