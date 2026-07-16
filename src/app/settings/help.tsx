import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface FAQItem {
    q: string;
    a: string;
}

const faqs: FAQItem[] = [
    {
        q: "How do I scan a PDF lab report?",
        a: "Navigate to the AI Health Hub tab, choose 'Report Explainer AI', click 'Scan or Upload PDF', select the document, and the AI will analyze parameters."
    },
    {
        q: "Is my personal medical data encrypted?",
        a: "Yes, LifeRelier encrypts all personal metadata locally and transits them through secure HTTPS SSL channels to maintain absolute confidentiality."
    },
    {
        q: "What does the Symptom Checker triage mean?",
        a: "It benchmarks symptoms against general clinical guidelines, triaging issues into Self-Care (Green), General Doctor consult (Orange), or Emergency Care (Red)."
    }
];

export default function HelpScreen() {
    const router = useRouter();

    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [msg, setMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleFAQ = (idx: number) => {
        setOpenIdx(openIdx === idx ? null : idx);
    };

    const handleSubmitTicket = () => {
        if (!subject.trim() || !msg.trim()) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            setSubject("");
            setMsg("");
            setTimeout(() => setSubmitted(false), 2000);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#071739" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Contact Hotline card */}
                <View style={styles.hotlineCard}>
                    <MaterialCommunityIcons name="phone-in-talk" size={28} color="#2563EB" />
                    <View style={styles.hotlineMeta}>
                        <Text style={styles.hotlineTitle}>Emergency Medical Support</Text>
                        <Text style={styles.hotlineNum}>+1 800 555 LIFE</Text>
                    </View>
                    <TouchableOpacity style={styles.callActionBtn}>
                        <Text style={styles.callActionBtnText}>Call</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ section */}
                <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
                <View style={styles.faqCard}>
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <View key={idx} style={[styles.faqRow, idx === faqs.length - 1 && { borderBottomWidth: 0 }]}>
                                <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFAQ(idx)}>
                                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                                    <MaterialCommunityIcons
                                        name={isOpen ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                                {isOpen && (
                                    <View style={styles.faqAnswerBox}>
                                        <Text style={styles.faqAnswerText}>{faq.a}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Ticket form */}
                <Text style={styles.sectionHeading}>Submit Support Ticket</Text>
                <View style={styles.formCard}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Subject / Inquiry Area</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Scanning issues, subscription status"
                            placeholderTextColor="#94A3B8"
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Inquiry Message Details</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe your issue or query details here..."
                            placeholderTextColor="#94A3B8"
                            value={msg}
                            onChangeText={setMsg}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!subject.trim() || !msg.trim()) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmitTicket}
                        disabled={!subject.trim() || !msg.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Toast success */}
            {submitted && (
                <View style={styles.toast}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>Support ticket generated! We will reply via email.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
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
        color: "#071739",
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    hotlineCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        borderRadius: 24,
        padding: 16,
        marginTop: 20,
        justifyContent: "space-between",
    },
    hotlineMeta: {
        flex: 1,
        marginLeft: 12,
        paddingRight: 10,
    },
    hotlineTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E3A8A",
    },
    hotlineNum: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2563EB",
        marginTop: 2,
    },
    callActionBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    callActionBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    sectionHeading: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 24,
        marginBottom: 10,
    },
    faqCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    faqRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingVertical: 14,
    },
    faqHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    faqQuestion: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        flex: 1,
        paddingRight: 10,
    },
    faqAnswerBox: {
        marginTop: 8,
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
    },
    faqAnswerText: {
        fontSize: 11,
        color: "#64748B",
        lineHeight: 16,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: "#334155",
        backgroundColor: "#F8FAFC",
    },
    textArea: {
        height: 90,
        textAlignVertical: "top",
    },
    submitBtn: {
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },
    submitBtnDisabled: {
        backgroundColor: "#94A3B8",
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});
