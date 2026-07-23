import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Role = "patient" | "doctor" | "admin";

interface Props {
    title: string;
    description: string;
    role: Role;
    selected: boolean;
    onPress: () => void;
}

export default function RoleCard({
    title,
    description,
    role,
    selected,
    onPress,
}: Props) {
    const getImage = () => {
        switch (role) {
            case "patient":
                return require("@/assets/images/roles/patient.png");

            case "doctor":
                return require("@/assets/images/roles/doctor.png");

            case "admin":
                return require("@/assets/images/roles/admin.png");
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[
                styles.card,
                selected && styles.selectedCard,
            ]}
            onPress={onPress}
        >
            {/* Left Image */}

            <Image
                source={getImage()}
                style={styles.image}
                resizeMode="contain"
            />

            {/* Text */}

            <View style={styles.content}>
                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.description}>
                    {description}
                </Text>
            </View>

            {/* Right Selection */}

            <View
                style={[
                    styles.circle,
                    selected && styles.selectedCircle,
                ]}
            >
                {selected && (
                    <MaterialCommunityIcons
                        name="check"
                        size={22}
                        color="#FFFFFF"
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        height: 132,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 24,

        backgroundColor: "#FFFFFF",

        borderRadius: 26,

        borderWidth: 1,
        borderColor: "#EEF2F7",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.08,
        shadowRadius: 16,

        elevation: 6,
    },

    selectedCard: {
        borderColor: "#2563EB",
        borderWidth: 2,
    },

    image: {
        width: 82,
        height: 82,
        borderRadius: 41,
        marginRight: 20,
    },

    content: {
        flex: 1,
        justifyContent: "center",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#091133",
        marginBottom: 6,
    },

    description: {
        fontSize: 15,
        color: "#64748B",
        lineHeight: 22,
    },

    circle: {
        width: 34,
        height: 34,
        borderRadius: 17,

        borderWidth: 2,
        borderColor: "#C7CED9",

        justifyContent: "center",
        alignItems: "center",
    },

    selectedCircle: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
});