
/**
 * Parses a time string (e.g., "1h 30m") into total minutes.
 * @param timeString The string to parse.
 * @returns The total number of minutes.
 */
export function parseTime(timeString: string | number | undefined | null): number {
    if (typeof timeString === 'number') {
        return timeString;
    }
    if (!timeString || typeof timeString !== 'string') {
        return 0;
    }

    let totalMinutes = 0;
    const hoursMatch = timeString.match(/(\d+)\s*h/);
    const minutesMatch = timeString.match(/(\d+)\s*m/);

    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1], 10);
    }
    
    // If no units are found, assume the number is in minutes
    if (!hoursMatch && !minutesMatch && /^\d+$/.test(timeString)) {
        totalMinutes = parseInt(timeString, 10);
    }

    return totalMinutes;
}

/**
 * Formats a number of minutes into a string (e.g., "1h 30m").
 * @param minutes The total minutes.
 * @returns A formatted time string.
 */
export function formatTime(minutes: number | undefined | null): string {
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes === 0) {
        return '';
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hStr = h > 0 ? `${h}h` : '';
    const mStr = m > 0 ? `${m}m` : '';
    return `${hStr} ${mStr}`.trim();
}
