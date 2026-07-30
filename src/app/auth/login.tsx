import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../utils/themeManager";

export default function Login() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { login } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!userName.trim() || !password) {
      Alert.alert("Validation", "Please provide both username and password.");
      return;
    }
    setLoading(true);
    try {
      const success = await login(userName.trim(), password);
      if (success) {
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LogoBrand size={42} fontSize={24} centered style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
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
  logo: { marginBottom: 24 },
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