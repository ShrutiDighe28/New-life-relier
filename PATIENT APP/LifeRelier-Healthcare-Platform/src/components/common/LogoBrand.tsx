import React from "react";
import { View, Text, ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@/utils/themeManager";

interface LogoBrandProps {
    size?: number;
    fontSize?: number;
    style?: ViewStyle;
    centered?: boolean;
}

const LogoIcon = ({ size }: { size: number }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* Blue 'L' Shape (Drawn first so it layers behind if necessary) */}
            <Path
                d="M 7 10 L 7 70 L 30 70"
                fill="none"
                stroke="#005A9C"
                strokeWidth="10"
                strokeLinecap="butt"
                strokeLinejoin="miter"
            />
            
            {/* Blue 'R' Shape (Drawn first so the diagonal leg is flawlessly hidden beneath the Red Cross until the exact 62,62 corner intersection) */}
            <Path
                d="M 70 30 L 73 30 A 20 20 0 0 1 73 70 L 68 70 M 50.5 47 L 90 98"
                fill="none"
                stroke="#005A9C"
                strokeWidth="10"
                strokeLinecap="butt"
                strokeLinejoin="miter"
            />

            {/* Red Cross - Thick medical cross drawn ON TOP to perfectly define the inner corner intersections */}
            <Rect x="38" y="10" width="24" height="80" rx="12" fill="#C8102E" />
            <Rect x="15" y="38" width="70" height="24" rx="12" fill="#C8102E" />
        </Svg>
    );
};

export default function LogoBrand({ size = 42, fontSize = 24, style, centered = false }: LogoBrandProps) {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: centered ? "center" : "flex-start",
                },
                style,
            ]}
        >
            <LogoIcon size={size} />

            <Text
                style={{
                    fontSize: fontSize,
                    fontWeight: "900",
                    fontFamily: "System",
                    letterSpacing: -0.5,
                    marginLeft: 6,
                }}
            >
                <Text style={{ color: "#005A9C" }}>Life</Text>
                <Text style={{ color: isDark ? "#FFFFFF" : "#005A9C" }}> Relier</Text>
            </Text>
        </View>
    );
}
