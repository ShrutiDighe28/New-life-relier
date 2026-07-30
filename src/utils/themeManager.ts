import { useState, useEffect } from "react";

export type Theme = "light" | "dark";
type Listener = (theme: Theme) => void;

let currentTheme: Theme = "light";
const listeners = new Set<Listener>();

export const ThemeManager = {
    getTheme(): Theme { return currentTheme; },
    setTheme(theme: Theme) { currentTheme = theme; listeners.forEach((l) => l(theme)); },
    toggleTheme() { this.setTheme(currentTheme === "light" ? "dark" : "light"); },
    subscribe(listener: Listener) { listeners.add(listener); return () => { listeners.delete(listener); }; }
};

export function useThemeState(): Theme {
    const [theme, setTheme] = useState<Theme>(ThemeManager.getTheme());
    useEffect(() => { return ThemeManager.subscribe((newTheme) => { setTheme(newTheme); }); }, []);
    return theme;
}

export const ThemeColors = {
    light: {
        background: "#F8FAFC", backgroundSecondary: "#F1F5F9", surface: "#FFFFFF", surfaceVariant: "#F8FAFC",
        card: "#FFFFFF", cardBorder: "#E2E8F0", cardMuted: "#F8FAFC",
        text: "#0F172A", textSecondary: "#475569", textMuted: "#94A3B8", onPrimary: "#FFFFFF",
        primary: "#2563EB", primaryLight: "#DBEAFE", primaryDark: "#1D4ED8",
        secondary: "#3B82F6", secondaryLight: "#EFF6FF",
        success: "#2563EB", successBg: "#DBEAFE", error: "#EF4444", errorBg: "#FEE2E2",
        warning: "#F59E0B", warningBg: "#FEF3C7", info: "#3B82F6", infoBg: "#EFF6FF",
        divider: "#E2E8F0", border: "#CBD5E1", inputBg: "#F8FAFC", inputBorder: "#E2E8F0",
        badgeBg: "#EFF6FF", badgeText: "#2563EB",
    },
    dark: {
        background: "#0F172A", backgroundSecondary: "#1E293B", surface: "#1E293B", surfaceVariant: "#0F172A",
        card: "#1E293B", cardBorder: "#334155", cardMuted: "#0F172A",
        text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B", onPrimary: "#FFFFFF",
        primary: "#3B82F6", primaryLight: "#1E3A8A", primaryDark: "#2563EB",
        secondary: "#60A5FA", secondaryLight: "#1E3A8A",
        success: "#3B82F6", successBg: "#1E3A8A", error: "#F87171", errorBg: "#7F1D1D",
        warning: "#FBBF24", warningBg: "#78350F", info: "#60A5FA", infoBg: "#1E3A8A",
        divider: "#334155", border: "#334155", inputBg: "#0F172A", inputBorder: "#334155",
        badgeBg: "rgba(59, 130, 246, 0.15)", badgeText: "#60A5FA",
    }
};

export type ThemeType = typeof ThemeColors.light;

export function useTheme() {
    const theme = useThemeState();
    const colors = ThemeColors[theme];
    const isDark = theme === "dark";
    return { theme, colors, isDark, toggleTheme: () => ThemeManager.toggleTheme() };
}
