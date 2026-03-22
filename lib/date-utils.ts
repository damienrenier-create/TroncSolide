
import { startOfDay } from "date-fns";

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
