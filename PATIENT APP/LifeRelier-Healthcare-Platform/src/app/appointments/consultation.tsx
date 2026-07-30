import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export default function ConsultationScreen() {
    const router = useRouter();

    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [seconds, setSeconds] = useState(0);

    // Call duration timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainSecs = secs % 60;
        return `${mins.toString().padStart(2, "0")}:${remainSecs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            {/* Full screen Doctor Video Feed Mock */}
            <View style={styles.fullScreenVideo}>
                <Image
                    source={require("@/assets/images/dashboard/doctor.png")}
                    style={styles.doctorVideoFrame}
                />
                
                {/* Visual Dark Overlay to simulate depth */}
                <View style={styles.videoGradientOverlay} />

                {/* Call Header Overlay */}
                <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
                    <View style={styles.headerInner}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.callMeta}>
                            <Text style={styles.doctorTitle}>Dr. James Anderson</Text>
                            <Text style={styles.connectionStatus}>Cardiology Consultation</Text>
                        </View>
                        <View style={styles.timerBadge}>
                            <View style={styles.redDot} />
                            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Picture in Picture (Patient Video Mock) */}
                <View style={styles.pipFrame}>
                    {isCamOff ? (
                        <View style={styles.pipCamOff}>
                            <MaterialCommunityIcons name={"video-off" as any} size={24} color="#64748B" />
                        </View>
                    ) : (
                        <Image
                            source={require("@/assets/images/dashboard/profile.png")}
                            style={styles.pipImage}
                        />
                    )}
                    <View style={styles.pipNameTag}>
                        <Text style={styles.pipNameText}>You</Text>
                    </View>
                </View>

                {/* Call Controls Floating Bar */}
                <View style={styles.controlsBar}>
                    <TouchableOpacity
                        style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        <MaterialCommunityIcons
                            name={isMuted ? "microphone-off" : "microphone"}
                            size={22}
                            color={isMuted ? "#FFFFFF" : "#475569"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlBtn, isCamOff && styles.controlBtnActive]}
                        onPress={() => setIsCamOff(!isCamOff)}
                    >
                        <MaterialCommunityIcons
                            name={isCamOff ? "camera-off" : "camera"}
                            size={22}
                            color={isCamOff ? "#FFFFFF" : "#475569"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlBtn}>
                        <MaterialCommunityIcons name="chat-outline" size={22} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlBtn, styles.endCallBtn]}
                        onPress={() => router.replace("/(tabs)/appointments")}
                    >
                        <MaterialCommunityIcons name="phone-hangup" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    fullScreenVideo: {
        flex: 1,
        position: "relative",
    },
    doctorVideoFrame: {
        width: width,
        height: height,
        resizeMode: "cover",
    },
    videoGradientOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.3)",
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    headerInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    callMeta: {
        flex: 1,
        marginLeft: 12,
    },
    doctorTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    connectionStatus: {
        fontSize: 11,
        color: "#E2E8F0",
        marginTop: 2,
    },
    timerBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.4)",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    redDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#EF4444",
        marginRight: 6,
    },
    timerText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    pipFrame: {
        position: "absolute",
        bottom: 110,
        right: 20,
        width: 100,
        height: 140,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        overflow: "hidden",
        backgroundColor: "#1E293B",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    pipImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    pipCamOff: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    pipNameTag: {
        position: "absolute",
        bottom: 6,
        left: 6,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    pipNameText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "600",
    },
    controlsBar: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    controlBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    controlBtnActive: {
        backgroundColor: "#EF4444",
    },
    endCallBtn: {
        backgroundColor: "#EF4444",
    },
});
