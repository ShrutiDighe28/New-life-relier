import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("@/assets/images/auth/welcomescreen.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Spacer pushes action buttons to bottom */}
                    <View style={styles.spacer} />

                    {/* Bottom Section */}
                    <View style={styles.actionContainer}>

                        {/* Get Started */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            activeOpacity={0.8}
                            onPress={() => router.push("/role-selection")}
                        >
                            <View style={styles.buttonPlaceholder} />

                            <Text style={styles.primaryButtonText}>
                                Get Started
                            </Text>

                            <View style={styles.arrowCircle}>
                                <Feather
                                    name="arrow-right"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Login */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            activeOpacity={0.8}
                            onPress={() => router.push("/login")}
                        >
                            <Feather
                                name="lock"
                                size={18}
                                color="#FFFFFF"
                            />

                            <Text style={styles.secondaryButtonText}>
                                Login / Sign In
                            </Text>
                        </TouchableOpacity>

                        {/* Footer */}
                        <Text style={styles.footerText}>
                            Powered by{" "}
                            <Text style={styles.footerBrand}>
                                Life Relier
                            </Text>
                        </Text>

                    </View>

                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAF9",
    },

    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    safeArea: {
        flex: 1,
        justifyContent: "space-between",
    },

    headerContainer: {
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 24,
    },

    logo: {
        width: 220,
        height: 60,
    },

    spacer: {
        flex: 1,
    },

    actionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        alignItems: "center",
    },

    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 60,
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        paddingHorizontal: 12,
        marginBottom: 16,
        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    buttonPlaceholder: {
        width: 44,
    },

    primaryButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2563EB",
    },

    arrowCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },

    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
        marginBottom: 24,
    },

    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },

    footerText: {
        fontSize: 14,
        color: "#E2E8F0",
        marginBottom: 10,
    },

    footerBrand: {
        fontWeight: "700",
        color: "#FFFFFF",
    },
});