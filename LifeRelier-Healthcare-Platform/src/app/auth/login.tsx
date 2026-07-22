import React, { useState } from "react";
import { useThemed } from "../../utils/themeManager";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_BASE_URL } from "@/services/apiConfig";
import { useRouter } from "expo-router";

export default function Login() {
  const { colors, isDark } = useThemed();
  const styles = getStyles(colors);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const requestOtp = async () => {
    if (!email && !mobile) {
      Alert.alert("Validation", "Please provide an email or mobile number.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), mobile: mobile.trim() }),
      });
      const data = await resp.json();
      if (resp.ok) {
        Alert.alert("Success", data.message || "OTP sent successfully.");
        // Move to OTP verification screen, passing contact info
        router.push({ pathname: "/auth/verify-otp", params: { contact: email || mobile } });
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Network error – could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mobile (optional)"
        value={mobile}
        onChangeText={setMobile}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: "600" },
});