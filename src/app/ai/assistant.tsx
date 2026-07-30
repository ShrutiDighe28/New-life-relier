import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
    Image, Alert, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@/utils/themeManager";
import {
    sendChatMessage,
    sendChatWithImage,
    ChatTurn,
} from "@/services/geminiService";

// ─── Types ────────────────────────────────────────────────────────────────────

type MsgStatus = "sending" | "delivered" | "error";

interface AttachedImage {
    uri: string;
    base64: string;
    mimeType: string;
    fileName: string;
}

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: string;
    status?: MsgStatus;
    image?: AttachedImage;
    isRetryable?: boolean;
    disclaimer?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCLAIMER =
    "⚕️ Medical Disclaimer: Responses are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.";

const WELCOME_MSG: Message = {
    id: "welcome",
    text: "Hello! I'm your LifeRelier AI Health Companion 👋\n\nI can help you with:\n• Understanding symptoms\n• Lab report explanations\n• Nutrition & diet advice\n• Medication information\n• General wellness tips\n\nYou can also attach a photo of a report, prescription, or skin condition for visual analysis.\n\nHow can I help you today?",
    sender: "ai",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    disclaimer: DISCLAIMER,
};

const PRESET_QUERIES = [
    { label: "Lower bad cholesterol?",   icon: "heart-outline" },
    { label: "Signs of iron deficiency", icon: "water-outline" },
    { label: "Normal blood pressure?",   icon: "pulse" },
    { label: "Improve sleep quality",    icon: "weather-night" },
    { label: "Diabetes blood sugar range", icon: "diabetes" },
    { label: "Headache remedies",        icon: "head-outline" },
];

// ─── Animated message bubble ──────────────────────────────────────────────────

function MessageBubble({
    message, colors, isDark, onRetry,
}: {
    message: Message; colors: any; isDark: boolean; onRetry: (m: Message) => void;
}) {
    const isUser = message.sender === "user";
    const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8,   useNativeDriver: true }),
        ]).start();
    }, []);

    const bubbleBg = isUser
        ? "#2563EB"
        : isDark ? "#1E293B" : "#F1F5F9";

    const textColor = isUser ? "#FFFFFF" : (isDark ? "#E2E8F0" : "#1E293B");
    const timeColor = isUser ? "#93C5FD" : "#94A3B8";

    return (
        <Animated.View style={[
            styles.msgRow,
            isUser ? styles.msgRowUser : styles.msgRowAI,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}>
            {!isUser && (
                <View style={[styles.avatarMini, {
                    backgroundColor: isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF",
                }]}>
                    <MaterialCommunityIcons name="robot-happy-outline" size={16} color="#2563EB" />
                </View>
            )}
            <View style={{ maxWidth: "80%", gap: 4 }}>
                {/* Attached image preview */}
                {message.image && (
                    <View style={[styles.imgPreviewWrap, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                        <Image source={{ uri: message.image.uri }} style={styles.imgPreview} />
                        <Text style={[styles.imgLabel, { color: colors.textSecondary }]}>
                            📎 {message.image.fileName}
                        </Text>
                    </View>
                )}
                {/* Text bubble */}
                {message.text ? (
                    <View style={[styles.bubble, { backgroundColor: bubbleBg },
                        isUser ? styles.bubbleUser : styles.bubbleAI,
                        message.status === "error" && styles.bubbleError,
                    ]}>
                        <Text style={[styles.msgText, { color: textColor }]}>
                            {message.text}
                        </Text>
                        <View style={styles.msgFooter}>
                            <Text style={[styles.timestamp, { color: timeColor }]}>
                                {message.timestamp}
                            </Text>
                            {isUser && message.status === "delivered" && (
                                <MaterialCommunityIcons name="check-all" size={12} color="#93C5FD" />
                            )}
                            {isUser && message.status === "error" && (
                                <MaterialCommunityIcons name="alert-circle-outline" size={12} color="#FCA5A5" />
                            )}
                        </View>
                    </View>
                ) : null}
                {/* Disclaimer below AI messages */}
                {!isUser && message.disclaimer && (
                    <View style={[styles.disclaimerRow, {
                        backgroundColor: isDark ? "rgba(234,179,8,0.08)" : "#FEFCE8",
                        borderColor: isDark ? "rgba(234,179,8,0.2)" : "#FEF08A",
                    }]}>
                        <MaterialCommunityIcons name="shield-check-outline" size={11} color="#CA8A04" />
                        <Text style={styles.disclaimerText}>{message.disclaimer}</Text>
                    </View>
                )}
                {/* Retry button on failed messages */}
                {message.status === "error" && message.isRetryable && (
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => onRetry(message)}
                        activeOpacity={0.75}
                    >
                        <MaterialCommunityIcons name="refresh" size={13} color="#EF4444" />
                        <Text style={styles.retryText}>Tap to retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ colors, isDark }: { colors: any; isDark: boolean }) {
    const dots = [useRef(new Animated.Value(0)).current,
                  useRef(new Animated.Value(0)).current,
                  useRef(new Animated.Value(0)).current];

    useEffect(() => {
        const anims = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 150),
                    Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
                ])
            )
        );
        anims.forEach(a => a.start());
        return () => anims.forEach(a => a.stop());
    }, []);

    return (
        <View style={[styles.msgRow, styles.msgRowAI]}>
            <View style={[styles.avatarMini, {
                backgroundColor: isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF",
            }]}>
                <MaterialCommunityIcons name="robot-happy-outline" size={16} color="#2563EB" />
            </View>
            <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble, {
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            }]}>
                <View style={styles.dotsRow}>
                    {dots.map((dot, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.dot, {
                                backgroundColor: "#2563EB",
                                transform: [{ translateY: dot }],
                            }]}
                        />
                    ))}
                </View>
                <Text style={[styles.typingLabel, { color: colors.textSecondary }]}>
                    AI is thinking…
                </Text>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AssistantScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const scrollRef   = useRef<ScrollView>(null);
    const inputRef    = useRef<TextInput>(null);

    const messagesRef = useRef<Message[]>([WELCOME_MSG]);

    // Keep ref in sync with state
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);
    const [inputText,    setInputText]    = useState("");
    const [isTyping,     setIsTyping]     = useState(false);
    const [attachment,   setAttachment]   = useState<AttachedImage | null>(null);
    const [showPresets,  setShowPresets]  = useState(true);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    // Build Gemini chat history from message list (exclude welcome + errors)
    const buildHistory = useCallback((msgs: Message[]): ChatTurn[] => {
        return msgs
            .filter(m => m.id !== "welcome" && m.status !== "error" && !m.image)
            .map(m => ({
                role: m.sender === "user" ? "user" : "model" as "user" | "model",
                text: m.text,
            }));
    }, []);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    }, []);

    // ── Pick image from library ───────────────────────────────────────────────
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please allow access to your photo library in Settings.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
            base64: true,
            allowsEditing: false,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        if (!asset.base64) {
            Alert.alert("Error", "Could not read image. Please try again.");
            return;
        }
        const fileName = asset.uri.split("/").pop() ?? "image.jpg";
        const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
        setAttachment({ uri: asset.uri, base64: asset.base64, mimeType, fileName });
    };

    // ── Pick document ─────────────────────────────────────────────────────────
    const handlePickDocument = async () => {
        try {
            const { default: DocumentPicker } = await import("expo-document-picker");
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.[0]) return;
            const asset = result.assets[0];
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const mimeType = asset.mimeType ?? "image/jpeg";
            const fileName = asset.name ?? "document";
            setAttachment({ uri: asset.uri, base64, mimeType, fileName });
        } catch {
            Alert.alert("Error", "Could not open the file picker. Please try again.");
        }
    };

    // ── Remove attachment ─────────────────────────────────────────────────────
    const removeAttachment = () => setAttachment(null);

    // ── Core send ─────────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (
        text: string,
        imageOverride?: AttachedImage | null,
        retryMsgId?: string,
    ) => {
        const trimmed = text.trim();
        const img = imageOverride !== undefined ? imageOverride : attachment;

        if (!trimmed && !img) return;
        if (isTyping) return;

        setShowPresets(false);
        setInputText("");
        setAttachment(null);

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const msgId = retryMsgId ?? Date.now().toString();

        // Add or update user message
        const userMsg: Message = {
            id: msgId,
            text: trimmed,
            sender: "user",
            timestamp: time,
            status: "sending",
            image: img ?? undefined,
        };

        setMessages(prev => {
            // Replace existing on retry, otherwise append
            if (retryMsgId) {
                return prev.map(m => m.id === retryMsgId
                    ? { ...userMsg, status: "sending" }
                    : m
                );
            }
            return [...prev, userMsg];
        });

        scrollToBottom();
        setIsTyping(true);

        try {
            let response;
            const history = buildHistory(messagesRef.current);

            if (img) {
                response = await sendChatWithImage(
                    trimmed || "Please analyze this image.",
                    img.base64,
                    img.mimeType,
                    history,
                );
            } else {
                response = await sendChatMessage(trimmed, history);
            }

            // Mark user message delivered
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, status: "delivered" } : m
            ));

            // Add AI response
            const aiMsg: Message = {
                id: `ai_${Date.now()}`,
                text: response.text,
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                disclaimer: response.disclaimer,
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (err: any) {
            const errText = err?.message ?? "Something went wrong. Please try again.";

            // Mark user message as error + retryable
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, status: "error", isRetryable: true } : m
            ));

            // Add AI error card
            const errMsg: Message = {
                id: `err_${Date.now()}`,
                text: `⚠️ ${errText}`,
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "error",
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    }, [attachment, isTyping, buildHistory, scrollToBottom]);

    // ── Retry handler ─────────────────────────────────────────────────────────
    const handleRetry = useCallback((msg: Message) => {
        // Remove the error AI card that followed this message
        setMessages(prev => {
            const idx = prev.findIndex(m => m.id === msg.id);
            if (idx === -1) return prev;
            return prev.filter((m, i) => !(i === idx + 1 && m.status === "error"));
        });
        sendMessage(msg.text, msg.image ?? null, msg.id);
    }, [sendMessage]);

    // ── Clear chat ────────────────────────────────────────────────────────────
    const handleClear = () => {
        Alert.alert("Clear Chat", "Remove all messages and start over?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: () => {
                setMessages([WELCOME_MSG]);
                setShowPresets(true);
                setShowDisclaimer(true);
                setAttachment(null);
            }},
        ]);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={["top"]}>

            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: colors.card,
                borderBottomColor: isDark ? colors.cardBorder : "#F1F5F9",
            }]}>
                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}
                    onPress={() => router.back()} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={[styles.aiBadge, { backgroundColor: isDark ? "rgba(37,99,235,0.15)" : "#EFF6FF" }]}>
                        <MaterialCommunityIcons name="robot-happy-outline" size={18} color="#2563EB" />
                    </View>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Health Assistant</Text>
                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={[styles.onlineText, { color: colors.textSecondary }]}>
                                Powered by Gemini
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}
                    onPress={handleClear} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="delete-sweep-outline" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Top disclaimer banner */}
            {showDisclaimer && (
                <View style={[styles.topDisclaimer, {
                    backgroundColor: isDark ? "rgba(234,179,8,0.08)" : "#FEFCE8",
                    borderBottomColor: isDark ? "rgba(234,179,8,0.15)" : "#FEF08A",
                }]}>
                    <MaterialCommunityIcons name="shield-check-outline" size={14} color="#CA8A04" />
                    <Text style={styles.topDisclaimerText} numberOfLines={2}>
                        For informational use only. Not a substitute for professional medical advice.
                    </Text>
                    <TouchableOpacity onPress={() => setShowDisclaimer(false)} hitSlop={8}>
                        <MaterialCommunityIcons name="close" size={14} color="#CA8A04" />
                    </TouchableOpacity>
                </View>
            )}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Chat list */}
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Preset query chips — only before user sends first message */}
                    {showPresets && (
                        <View style={styles.presetsSection}>
                            <Text style={[styles.presetsLabel, { color: colors.textSecondary }]}>
                                Quick Questions
                            </Text>
                            <View style={styles.presetsGrid}>
                                {PRESET_QUERIES.map((p, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.presetChip, {
                                            backgroundColor: isDark ? colors.card : "#F8FAFC",
                                            borderColor: isDark ? colors.cardBorder : "#E2E8F0",
                                        }]}
                                        onPress={() => sendMessage(p.label)}
                                        activeOpacity={0.75}
                                    >
                                        <MaterialCommunityIcons
                                            name={p.icon as any} size={14} color="#2563EB"
                                        />
                                        <Text style={[styles.presetText, { color: colors.text }]}>
                                            {p.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Messages */}
                    {messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            colors={colors}
                            isDark={isDark}
                            onRetry={handleRetry}
                        />
                    ))}

                    {/* Typing indicator */}
                    {isTyping && <TypingIndicator colors={colors} isDark={isDark} />}
                </ScrollView>

                {/* Attachment preview strip */}
                {attachment && (
                    <View style={[styles.attachStrip, {
                        backgroundColor: isDark ? colors.card : "#F0FDFA",
                        borderTopColor: isDark ? colors.cardBorder : "#CCFBF1",
                    }]}>
                        <Image source={{ uri: attachment.uri }} style={styles.attachThumb} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.attachName, { color: colors.text }]} numberOfLines={1}>
                                {attachment.fileName}
                            </Text>
                            <Text style={[styles.attachSize, { color: colors.textSecondary }]}>
                                Ready to send
                            </Text>
                        </View>
                        <TouchableOpacity onPress={removeAttachment} hitSlop={8}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input toolbar */}
                <View style={[styles.toolbar, {
                    backgroundColor: colors.card,
                    borderTopColor: isDark ? colors.cardBorder : "#F1F5F9",
                }]}>
                    {/* Attach image */}
                    <TouchableOpacity
                        style={[styles.toolbarBtn, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="image-outline" size={20} color="#2563EB" />
                    </TouchableOpacity>

                    {/* Attach document */}
                    <TouchableOpacity
                        style={[styles.toolbarBtn, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}
                        onPress={handlePickDocument}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="paperclip" size={20} color="#2563EB" />
                    </TouchableOpacity>

                    {/* Text input */}
                    <TextInput
                        ref={inputRef}
                        style={[styles.textInput, {
                            backgroundColor: isDark ? colors.background : "#F8FAFC",
                            borderColor: isDark ? colors.cardBorder : "#E2E8F0",
                            color: colors.text,
                        }]}
                        placeholder={attachment ? "Add a message with your image…" : "Ask a health question…"}
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        returnKeyType="send"
                        onSubmitEditing={() => sendMessage(inputText)}
                        blurOnSubmit={false}
                    />

                    {/* Send */}
                    <TouchableOpacity
                        style={[styles.sendBtn, {
                            backgroundColor: (inputText.trim() || attachment) && !isTyping
                                ? "#2563EB" : (isDark ? colors.background : "#EFF6FF"),
                        }]}
                        onPress={() => sendMessage(inputText)}
                        disabled={(!inputText.trim() && !attachment) || isTyping}
                        activeOpacity={0.85}
                    >
                        {isTyping
                            ? <ActivityIndicator size="small" color="#2563EB" />
                            : <MaterialCommunityIcons
                                name="send"
                                size={18}
                                color={(inputText.trim() || attachment) && !isTyping ? "#FFFFFF" : "#3B82F6"}
                              />
                        }
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root:   { flex: 1 },

    // Header
    header: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, paddingVertical: 10,
        borderBottomWidth: 1, gap: 10,
    },
    headerBtn: {
        width: 38, height: 38, borderRadius: 19,
        justifyContent: "center", alignItems: "center",
    },
    headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
    aiBadge: {
        width: 38, height: 38, borderRadius: 19,
        justifyContent: "center", alignItems: "center",
    },
    headerTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
    onlineRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
    onlineDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
    onlineText:  { fontSize: 10, fontWeight: "500" },

    // Top disclaimer
    topDisclaimer: {
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingHorizontal: 14, paddingVertical: 8,
        borderBottomWidth: 1,
    },
    topDisclaimerText: {
        flex: 1, fontSize: 11, color: "#854D0E",
        fontWeight: "500", lineHeight: 15,
    },

    // Chat
    chatContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20, gap: 4 },

    // Presets
    presetsSection: { marginBottom: 16, gap: 10 },
    presetsLabel:   { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
    presetsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    presetChip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
    },
    presetText: { fontSize: 12, fontWeight: "600" },

    // Messages
    msgRow:    { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
    msgRowUser:{ justifyContent: "flex-end" },
    msgRowAI:  { justifyContent: "flex-start" },
    avatarMini:{
        width: 28, height: 28, borderRadius: 14,
        justifyContent: "center", alignItems: "center",
        flexShrink: 0, marginBottom: 2,
    },
    bubble: {
        borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    },
    bubbleUser: { borderBottomRightRadius: 4 },
    bubbleAI:   { borderBottomLeftRadius: 4 },
    bubbleError:{ opacity: 0.75 },
    msgText:    { fontSize: 14, lineHeight: 21 },
    msgFooter:  { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 },
    timestamp:  { fontSize: 9, fontWeight: "500" },

    // Image
    imgPreviewWrap: {
        borderRadius: 14, overflow: "hidden",
        borderWidth: 1, marginBottom: 2,
    },
    imgPreview: { width: "100%", height: 160, resizeMode: "cover" },
    imgLabel:   { fontSize: 11, paddingHorizontal: 10, paddingVertical: 6 },

    // Disclaimer row
    disclaimerRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 6,
        borderRadius: 10, padding: 8, borderWidth: 1, marginTop: 2,
    },
    disclaimerText: { flex: 1, fontSize: 10, color: "#854D0E", lineHeight: 14 },

    // Retry
    retryBtn: {
        flexDirection: "row", alignItems: "center", gap: 4,
        alignSelf: "flex-end", paddingVertical: 4,
    },
    retryText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },

    // Typing
    typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
    dotsRow:      { flexDirection: "row", gap: 4 },
    dot:          { width: 7, height: 7, borderRadius: 4 },
    typingLabel:  { fontSize: 12, fontWeight: "500" },

    // Attachment strip
    attachStrip: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        borderTopWidth: 1,
    },
    attachThumb: { width: 44, height: 44, borderRadius: 10 },
    attachName:  { fontSize: 13, fontWeight: "600" },
    attachSize:  { fontSize: 11, marginTop: 2 },

    // Toolbar
    toolbar: {
        flexDirection: "row", alignItems: "flex-end", gap: 8,
        paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1,
    },
    toolbarBtn: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
    },
    textInput: {
        flex: 1, borderWidth: 1.5, borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 10,
        fontSize: 14, maxHeight: 120, minHeight: 40,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
    },
});
