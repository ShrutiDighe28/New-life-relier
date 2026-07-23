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
        text: "#071739",
        textSecondary: "#64748B",
        primary: "#2563EB",
        secondary: "#0062C4",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        divider: "#F1F5F9",
        badgeBg: "#EFF6FF",
        badgeText: "#2563EB",
        inputBg: "#F8FAFC",
        inputBorder: "#E2E8F0",
    },
    dark: {
        background: "#0F172A",
        backgroundSecondary: "#071739",
        card: "#1E293B",
        cardBorder: "#334155",
        text: "#FFFFFF",
        textSecondary: "#94A3B8",
        primary: "#3B82F6",
        secondary: "#60A5FA",
        success: "#34D399",
        error: "#F87171",
        warning: "#FBBF24",
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
