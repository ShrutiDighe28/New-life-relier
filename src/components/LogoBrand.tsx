import { useTheme } from "@/utils/themeManager";
import { Text, View, ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

interface LogoBrandProps {
    size?: number;
    fontSize?: number;
    style?: ViewStyle;
    centered?: boolean;
    /**
     * "auto"   — adapts to current theme (default)
     * "light"  — forces light colours; use when sitting on a dark/gradient background
     * "dark"   — forces dark colours; use when always on a light background
     */
    variant?: "auto" | "light" | "dark";
}

const LogoIcon = ({ size, strokeColor }: { size: number; strokeColor: string }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Blue 'L' Shape */}
        <Path
            d="M 7 10 L 7 70 L 30 70"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="butt"
            strokeLinejoin="miter"
        />
        {/* Blue 'R' Shape */}
        <Path
            d="M 70 30 L 73 30 A 20 20 0 0 1 73 70 L 68 70 M 50.5 47 L 90 98"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="butt"
            strokeLinejoin="miter"
        />
        {/* Red Cross — always visible on any background */}
        <Rect x="38" y="10" width="24" height="80" rx="12" fill="#C8102E" />
        <Rect x="15" y="38" width="70" height="24" rx="12" fill="#C8102E" />
    </Svg>
);

export default function LogoBrand({
    size = 42,
    fontSize = 24,
    style,
    centered = false,
    variant = "auto",
}: LogoBrandProps) {
    const { isDark } = useTheme();

    // Resolve effective colour mode
    const isLight = variant === "light" || (variant === "auto" && isDark);

    // Stroke colour for SVG letterforms
    const strokeColor = isLight ? "#60A5FA" : "#005A9C";

    // Text colours — both words match for a uniform, professional look
    const textColor = isLight ? "#FFFFFF" : "#005A9C";

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
            <LogoIcon size={size} strokeColor={strokeColor} />
            <Text
                style={{
                    fontSize: fontSize,
                    fontWeight: "900",
                    fontFamily: "System",
                    letterSpacing: -0.5,
                    marginLeft: 6,
                    color: textColor,
                }}
            >
                Life Relier
            </Text>
        </View>
    );
}
