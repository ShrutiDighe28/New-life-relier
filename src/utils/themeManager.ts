import { useState, useEffect } from "react";

export type Theme = "light" | "dark";
type Listener = (theme: Theme) => void;

let currentTheme: Theme = "light";
const listeners = new Set<Listener>();

export const ThemeManager = {
    getTheme(): Theme {
        return currentTheme;
    },
    setTheme(theme: Theme) {
        currentTheme = theme;
        listeners.forEach((l) => l(theme));
    },
    toggleTheme() {
        this.setTheme(currentTheme === "light" ? "dark" : "light");
    },
    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
};

export function useThemeState(): Theme {
    const [theme, setTheme] = useState<Theme>(ThemeManager.getTheme());

    useEffect(() => {
        return ThemeManager.subscribe((newTheme) => {
            setTheme(newTheme);
        });
    }, []);

    return theme;
}

export const ThemeColors = {
    light: {
        background: "#FFFFFF",
        backgroundSecondary: "#F8FAFC",
        card: "#FFFFFF",
        cardBorder: "#E2E8F0",
        cardMuted: "#F1F5F9",
        text: "#0F172A",
        textSecondary: "#64748B",
        textMuted: "#94A3B8",
        primary: "#2563EB",
        primaryLight: "#DCEBFF",
        primaryDark: "#1D4ED8",
        secondary: "#0EA5E9",
        success: "#10B981",
        successBg: "#D1FAE5",
        error: "#EF4444",
        errorBg: "#FEE2E2",
        warning: "#F59E0B",
        warningBg: "#FEF3C7",
        info: "#3B82F6",
        infoBg: "#E0F2FE",
        divider: "#F1F5F9",
        badgeBg: "#EFF6FF",
        badgeText: "#2563EB",
        inputBg: "#F8FAFC",
        inputBorder: "#E2E8F0",
    },
    dark: {
        background: "#0F172A",
        backgroundSecondary: "#1E293B",
        card: "#1E293B",
        cardBorder: "#334155",
        cardMuted: "#0F172A",
        text: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",
        primary: "#3B82F6",
        primaryLight: "#1E3A8A",
        primaryDark: "#60A5FA",
        secondary: "#38BDF8",
        success: "#10B981",
        successBg: "#064E3B",
        error: "#F87171",
        errorBg: "#7F1D1D",
        warning: "#FBBF24",
        warningBg: "#78350F",
        info: "#38BDF8",
        infoBg: "#075985",
        divider: "#334155",
        badgeBg: "#1E293B",
        badgeText: "#3B82F6",
        inputBg: "#1E293B",
        inputBorder: "#334155",
    }
};

export type ThemeType = typeof ThemeColors.light;

export function useTheme() {
    const theme = useThemeState();
    const colors = ThemeColors[theme];
    const isDark = theme === "dark";

    return {
        theme,
        colors,
        isDark,
        toggleTheme: () => ThemeManager.toggleTheme(),
    };
}
