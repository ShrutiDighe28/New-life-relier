import { Appointment } from "@/context/AppointmentsContext";

/**
 * Returns the number of days in a given month of a year.
 * @param year - 4 digit year (e.g. 2026)
 * @param month - 0-indexed month (0 = Jan, 11 = Dec)
 */
export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * Returns the day of the week for the 1st of a given month (0 = Sun, 1 = Mon, ..., 6 = Sat).
 */
export const getStartDayOfWeek = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
};

/**
 * Formats a Date object as "Month Year" (e.g., "July 2026").
 */
export const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Formats a Date object as "MMM DD, YYYY" (e.g., "Jul 22, 2026").
 */
export const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Safely parses appointment date string like "Jul 22, 2026 • 10:30 AM" or "May 15, 2024" into a Date object.
 */
export const parseAppointmentDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const datePart = dateStr.split(" • ")[0].trim();
    const d = new Date(datePart);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Checks if two Date objects fall on the exact same day, month, and year.
 */
export const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

/**
 * Filters a list of Appointments for those matching a target date.
 */
export const getAppointmentsForDate = (appointments: Appointment[], targetDate: Date): Appointment[] => {
    return appointments.filter((app) => {
        const appDate = parseAppointmentDate(app.date);
        return appDate ? isSameDay(appDate, targetDate) : false;
    });
};

/**
 * Maps doctor specialty to standard brand accent color.
 */
export const getSpecialtyColor = (specialty?: string): string => {
    if (!specialty) return "#2563EB";
    const lower = specialty.toLowerCase();
    if (lower.includes("cardio")) return "#2563EB"; // Blue
    if (lower.includes("physician") || lower.includes("general")) return "#2563EB"; // Blue
    if (lower.includes("derm") || lower.includes("skin")) return "#F59E0B"; // Orange
    if (lower.includes("neuro")) return "#8B5CF6"; // Purple
    if (lower.includes("pediat")) return "#EC4899"; // Pink
    return "#2563EB";
};
