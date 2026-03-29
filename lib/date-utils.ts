
import { startOfDay, endOfMonth, isSameDay } from "date-fns";

/**
 * Returns the current date shifted to Europe/Brussels timezone.
 * Useful for consistent "Today" calculations regardless of server location (UTC).
 */
export function getBrusselsDate(date: Date = new Date()): Date {
    // Offset calculation for Europe/Brussels
    // Note: This is a robust way to get the local YYYY-MM-DD for Brussels without date-fns-tz
    const brusselsStr = date.toLocaleString("en-US", { timeZone: "Europe/Brussels" });
    return new Date(brusselsStr);
}

export function getBrusselsToday(): Date {
    return startOfDay(getBrusselsDate());
}

export function getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

/**
 * Checks if a given date is the last day of the month.
 */
export function isLastDayOfMonth(date: Date): boolean {
    const lastDay = endOfMonth(date);
    return isSameDay(date, lastDay);
}
