import React, { useState, useRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/utils/themeManager";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: string;
}

const presets = [
    { text: "How can I lower bad cholesterol?", key: "cholesterol" },
    { text: "Signs of iron deficiency?", key: "iron" },
    { text: "Normal blood pressure range?", key: "bp" },
];

export default function AssistantScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I am your LifeRelier AI Health Companion. Ask me anything about symptoms, diet, parameters, or general wellness. (Please note: I am an AI and do not replace professional medical diagnosis.)",
            sender: "ai",
            timestamp: "10:00 AM",
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const getMockResponse = (query: string): string => {
        const lower = query.toLowerCase();
        if (lower.includes("cholesterol")) {
            return "To lower LDL (bad) cholesterol, consider these dietary and lifestyle habits:\n\n• Eat Heart-Healthy Foods: Eliminate trans fats, reduce saturated fats, and increase soluble fibers (like oatmeal, kidney beans, Brussels sprouts).\n• Add Omega-3s: Incorporate salmon, walnuts, and flaxseeds.\n• Exercise regularly: Work up to at least 30 minutes of cardiovascular exercise 5 times a week.\n• Quit smoking and limit alcohol intake.";
        }
        if (lower.includes("iron") || lower.includes("anemia")) {
            return "Common signs of iron deficiency include:\n\n• Extreme fatigue & weakness\n• Pale skin\n• Cold hands and feet\n• Shortness of breath or chest pain\n• Brittle nails or tongue soreness\n\nDietary sources to boost iron include red meat, poultry, beans, spinach, and iron-fortified cereals. Pairing these with Vitamin C helps absorption.";
        }
        if (lower.includes("pressure") || lower.includes("bp") || lower.includes("hypertension")) {
            return "Blood pressure ranges typically categorized as:\n\n• Normal: Less than 120/80 mmHg\n• Elevated: Systolic between 120-129 AND diastolic less than 80 mmHg\n• Hypertension Stage 1: Systolic 130-139 OR diastolic 80-89 mmHg\n• Hypertension Stage 2: Systolic 140 or higher OR diastolic 90 mmHg or higher\n\nIf you have readings consistently above normal, please consult your physician.";
        }
        return "I understand your query. While maintaining proper hydration, getting 7-8 hours of sleep, and eating a balanced diet support general health, it is best to discuss specific symptoms or parameters with a healthcare provider. Is there a particular test parameter or symptom you would like general information about?";
    };

    const handleSend = (textToSend: string) => {
        if (!textToSend.trim()) return;

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: time,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        // Scroll to end
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        // Simulate AI response after a delay
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: getMockResponse(textToSend),
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Companion online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setMessages([messages[0]])}>
                    <MaterialCommunityIcons name="refresh" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.chatScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Card & Safety Banner */}
                    <View style={styles.welcomeBanner}>
                        <View style={styles.sparkleIcon}>
                            <MaterialCommunityIcons name={"sparkles" as any} size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.welcomeTitle}>LifeRelier Medical-AI</Text>
                        <Text style={styles.welcomeDesc}>
                            Get quick answers regarding symptoms, health score metrics, and lab report terms.
                        </Text>
                    </View>

                    {/* Preset query chips */}
                    <View style={styles.presetsContainer}>
                        {presets.map((preset, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.presetChip}
                                onPress={() => handleSend(preset.text)}
                            >
                                <Text style={styles.presetText}>{preset.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Messages list */}
                    {messages.map((message) => {
                        const isUser = message.sender === "user";
                        return (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageRow,
                                    isUser ? styles.messageRowUser : styles.messageRowAi,
                                ]}
                            >
                                {!isUser && (
                                    <View style={styles.avatarMini}>
                                        <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.bubble,
                                        isUser ? styles.bubbleUser : styles.bubbleAi,
                                    ]}
                                >
                                    <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAi]}>
                                        {message.text}
                                    </Text>
                                    <Text style={[styles.timestamp, isUser ? styles.timeUser : styles.timeAi]}>
                                        {message.timestamp}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {/* Typing state indicator */}
                    {isTyping && (
                        <View style={[styles.messageRow, styles.messageRowAi]}>
                            <View style={styles.avatarMini}>
                                <MaterialCommunityIcons name="robot" size={16} color="#2563EB" />
                            </View>
                            <View style={[styles.bubble, styles.bubbleAi, styles.typingBubble]}>
                                <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 6 }} />
                                <Text style={styles.typingText}>Thinking...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input Toolbar */}
                <View style={styles.inputToolbar}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message or symptom..."
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => handleSend(inputText)}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendBtn,
                            { backgroundColor: inputText.trim() ? "#2563EB" : "#EFF6FF" },
                        ]}
                        onPress={() => handleSend(inputText)}
                        disabled={!inputText.trim()}
                    >
                        <MaterialCommunityIcons
                            name="send"
                            size={18}
                            color={inputText.trim() ? "#FFFFFF" : "#3B82F6"}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.card,
    },
    keyboardContainer: {
        flex: 1,
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
    },
    headerBtn: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 19,
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
        marginRight: 4,
    },
    statusText: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    chatScroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
    },
    welcomeBanner: {
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    sparkleIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    welcomeTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: isDark ? colors.text : "#1E3A8A",
    },
    welcomeDesc: {
        fontSize: 11,
        color: "#2563EB",
        textAlign: "center",
        marginTop: 4,
        lineHeight: 16,
    },
    presetsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 20,
    },
    presetChip: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        margin: 4,
    },
    presetText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: "600",
    },
    messageRow: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    messageRowUser: {
        justifyContent: "flex-end",
    },
    messageRowAi: {
        justifyContent: "flex-start",
    },
    avatarMini: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        marginBottom: 4,
    },
    bubble: {
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "80%",
    },
    bubbleUser: {
        backgroundColor: "#2563EB",
        borderBottomRightRadius: 4,
    },
    bubbleAi: {
        backgroundColor: isDark ? colors.background : "#F1F5F9",
        borderBottomLeftRadius: 4,
    },
    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    textUser: {
        color: "#FFFFFF",
    },
    textAi: {
        color: isDark ? colors.textSecondary : "#334155",
    },
    timestamp: {
        fontSize: 9,
        marginTop: 4,
        alignSelf: "flex-end",
    },
    timeUser: {
        color: "#93C5FD",
    },
    timeAi: {
        color: "#94A3B8",
    },
    typingText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    inputToolbar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        backgroundColor: colors.card,
    },
    textInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.cardBorder,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        color: colors.text,
        marginRight: 10,
        maxHeight: 100,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});