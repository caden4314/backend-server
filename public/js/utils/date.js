// Date formatting utilities
export function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

export function isWithinHours(date, hours) {
    const now = new Date();
    const diff = now - new Date(date);
    return diff <= hours * 60 * 60 * 1000;
}

export function isWithinDays(date, days) {
    const now = new Date();
    const diff = now - new Date(date);
    return diff <= days * 24 * 60 * 60 * 1000;
}